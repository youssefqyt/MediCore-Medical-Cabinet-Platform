const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const audit = require("../middleware/auditMiddleware");
const AppError = require("../utils/AppError");

const router = express.Router();
router.use(auth);

// Helper: Conflict & double booking detection
function checkConflict(doctorId, date, time, durationMinutes, excludeId = null) {
  const appointments = db.table("appointments");
  const newStart = parseTimeToMinutes(time);
  const newEnd = newStart + Number(durationMinutes || 30);

  return appointments.find((a) => {
    if (excludeId && String(a.id) === String(excludeId)) return false;
    if (a.date !== date) return false;
    if (["Cancelled", "No-show"].includes(a.status)) return false;
    if (a.doctorId && doctorId && Number(a.doctorId) !== Number(doctorId)) return false;

    const existingStart = parseTimeToMinutes(a.time);
    const existingEnd = existingStart + Number(a.durationMinutes || 30);

    // Overlap condition: startA < endB && endA > startB
    return newStart < existingEnd && newEnd > existingStart;
  });
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

// GET /api/appointments - List appointments by date / range / patient
router.get("/", async (req, res, next) => {
  try {
    const { date, patientId, status, view } = req.query;
    let list = db.table("appointments");

    // If patient user role, restrict to own appointments
    if (req.user.role === "PATIENT") {
      list = list.filter((a) => a.patientId === req.user.patientId);
    } else if (patientId) {
      list = list.filter((a) => a.patientId === patientId);
    }

    if (date) {
      list = list.filter((a) => a.date === date);
    }

    if (status) {
      list = list.filter((a) => a.status?.toLowerCase() === status.toLowerCase());
    }

    list.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time || "").localeCompare(b.time || "");
    });

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments - Create appointment with conflict validation
router.post(
  "/",
  audit("APPOINTMENT_CREATE"),
  async (req, res, next) => {
    try {
      const { patientId, doctorId = 1, date, time, durationMinutes = 30, type = "Consultation", reason, priority = "Normal" } = req.body;
      if (!patientId || !date || !time) {
        throw new AppError("Patient ID, date, and time are required for scheduling", 400);
      }

      // Check double booking
      const conflict = checkConflict(doctorId, date, time, durationMinutes);
      if (conflict) {
        throw new AppError(
          `Schedule conflict detected: Doctor already has an appointment (${conflict.appointmentNumber} - ${conflict.time}) overlapping this slot`,
          409
        );
      }

      const patients = db.table("patients");
      const patient = patients.find((p) => p.patientId === patientId || String(p.id) === String(patientId));
      const patientName = patient ? patient.fullName : req.body.patientName || "Walk-in Patient";

      const appointments = db.table("appointments");
      const nextId = appointments.length + 1;
      const appointmentNumber = `APT-2026-${String(nextId).padStart(3, "0")}`;

      const newAppointment = {
        id: nextId,
        appointmentNumber,
        patientId: patient ? patient.patientId : patientId,
        patientName,
        doctorId: Number(doctorId),
        doctorName: req.body.doctorName || "Dr. Selim Ammar",
        date,
        time,
        durationMinutes: Number(durationMinutes),
        type,
        status: req.user.role === "PATIENT" ? "Pending" : "Confirmed",
        reason: reason || "General Consultation",
        priority,
        created_at: new Date().toISOString()
      };

      appointments.push(newAppointment);

      // Create notification for cabinet staff
      const notifications = db.table("notifications");
      notifications.push({
        id: notifications.length + 1,
        userId: 1, // Doctor
        title: "New Appointment Booked",
        message: `${patientName} booked a ${type} for ${date} at ${time}.`,
        type: "APPOINTMENT_CONFIRMATION",
        data: { appointmentId: nextId, appointmentNumber },
        is_read: false,
        created_at: new Date().toISOString()
      });

      db.save();
      res.status(201).json({ success: true, data: newAppointment });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/appointments/:id/status - Update status (Pending, Confirmed, Arrived, In consultation, Completed, Cancelled, No-show)
router.patch(
  "/:id/status",
  role("DOCTOR", "RECEPTIONIST", "NURSE", "ADMIN"),
  audit("APPOINTMENT_STATUS_UPDATE", (req) => ({ appointmentId: req.params.id, status: req.body.status })),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const validStatuses = ["Pending", "Confirmed", "Arrived", "In consultation", "Completed", "Cancelled", "No-show"];
      if (!validStatuses.includes(status)) {
        throw new AppError(`Invalid status. Allowed: ${validStatuses.join(", ")}`, 400);
      }

      const appointments = db.table("appointments");
      const appointment = appointments.find((a) => String(a.id) === String(id) || a.appointmentNumber === id);
      if (!appointment) throw new AppError("Appointment not found", 404);

      appointment.status = status;
      appointment.updated_at = new Date().toISOString();

      // Trigger automatic workflow notifications based on status
      const notifications = db.table("notifications");
      if (status === "Arrived") {
        notifications.push({
          id: notifications.length + 1,
          userId: appointment.doctorId || 1,
          title: "Patient Arrived in Waiting Room",
          message: `${appointment.patientName} (${appointment.patientId}) has arrived for the ${appointment.time} appointment.`,
          type: "PATIENT_ARRIVAL",
          data: { appointmentId: appointment.id, patientId: appointment.patientId },
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      db.save();
      res.json({ success: true, data: appointment });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/appointments/intelligent-suggestions - Intelligent Scheduling Engine
router.post(
  "/intelligent-suggestions",
  async (req, res, next) => {
    try {
      const { date = new Date().toISOString().split("T")[0], durationMinutes = 30, doctorId = 1, preferredPeriod = "any" } = req.body;
      const appointments = db.table("appointments").filter(
        (a) => a.date === date && !["Cancelled", "No-show"].includes(a.status)
      );

      // Standard cabinet schedule: 08:30 to 18:00 with lunch break 12:30 - 14:00
      const slots = [];
      const startMin = 8 * 60 + 30; // 08:30
      const endMin = 18 * 60; // 18:00
      const breakStart = 12 * 60 + 30;
      const breakEnd = 14 * 60;
      const slotDuration = Number(durationMinutes);

      for (let timeMin = startMin; timeMin + slotDuration <= endMin; timeMin += 30) {
        // Skip lunch break
        if (timeMin < breakEnd && timeMin + slotDuration > breakStart) continue;

        const timeStr = `${String(Math.floor(timeMin / 60)).padStart(2, "0")}:${String(timeMin % 60).padStart(2, "0")}`;
        const conflict = appointments.find((a) => {
          const aStart = parseTimeToMinutes(a.time);
          const aEnd = aStart + Number(a.durationMinutes || 30);
          return timeMin < aEnd && timeMin + slotDuration > aStart;
        });

        if (!conflict) {
          const isMorning = timeMin < breakStart;
          if (preferredPeriod === "morning" && !isMorning) continue;
          if (preferredPeriod === "afternoon" && isMorning) continue;

          slots.push({
            date,
            time: timeStr,
            durationMinutes: slotDuration,
            period: isMorning ? "Morning" : "Afternoon",
            recommended: timeMin === 9 * 60 || timeMin === 14 * 60 + 30 // Optimal recommended slots
          });
        }
      }

      res.json({
        success: true,
        date,
        availableSlotsCount: slots.length,
        suggestions: slots.slice(0, 8)
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
