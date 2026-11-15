const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const audit = require("../middleware/auditMiddleware");
const AppError = require("../utils/AppError");

const router = express.Router();
router.use(auth);

// GET /api/patient-portal/overview - Longitudinal portal view for the logged-in patient
router.get("/overview", role("PATIENT"), async (req, res, next) => {
  try {
    const patientId = req.user.patientId;
    if (!patientId) throw new AppError("No patient record linked to current user account", 404);

    const patients = db.table("patients");
    const patient = patients.find((p) => p.patientId === patientId);
    if (!patient) throw new AppError("Patient profile not found", 404);

    const appointments = db.table("appointments").filter((a) => a.patientId === patientId);
    const prescriptions = db.table("prescriptions").filter((pr) => pr.patientId === patientId);
    const laboratories = db.table("laboratories").filter((l) => l.patientId === patientId);
    const invoices = db.table("invoices").filter((i) => i.patientId === patientId);
    const documents = db.table("documents").filter((d) => d.patientId === patientId);

    res.json({
      success: true,
      patient: {
        fullName: patient.fullName,
        patientId: patient.patientId,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        bloodGroup: patient.bloodGroup
      },
      upcomingAppointments: appointments.filter((a) => a.date >= new Date().toISOString().split("T")[0] && a.status !== "Cancelled"),
      prescriptions: prescriptions.map((p) => ({
        id: p.id,
        prescriptionNumber: p.prescriptionNumber,
        date: p.date,
        doctorName: p.doctorName,
        items: p.items
      })),
      sharedDocuments: documents.map((d) => ({
        id: d.id,
        reference: d.documentReference,
        title: d.title,
        date: d.date,
        content: d.content
      })),
      invoices: invoices.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        date: i.date,
        amount: i.amount,
        paidAmount: i.paidAmount,
        balance: i.balance,
        status: i.status
      })),
      laboratorySummaries: laboratories.map((l) => ({
        id: l.id,
        requestNumber: l.requestNumber,
        examinationType: l.examinationType,
        requestDate: l.requestDate,
        status: l.status,
        resultSummary: l.reviewedByDoctor ? l.resultSummary : "Pending doctor review"
      }))
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/patient-portal/request-appointment - Patient requests appointment online
router.post("/request-appointment", role("PATIENT"), audit("PATIENT_PORTAL_APPT_REQUEST"), async (req, res, next) => {
  try {
    const { date, time, reason } = req.body;
    if (!date || !time) throw new AppError("Date and time are required", 400);

    const appointments = db.table("appointments");
    const nextId = appointments.length + 1;
    const appointmentNumber = `APT-2026-${String(nextId).padStart(3, "0")}`;

    const newApt = {
      id: nextId,
      appointmentNumber,
      patientId: req.user.patientId,
      patientName: req.user.name,
      doctorId: 1,
      doctorName: "Dr. Selim Ammar",
      date,
      time,
      durationMinutes: 30,
      type: "Online Request",
      status: "Pending", // Requires receptionist confirmation
      reason: reason || "Routine Consultation",
      priority: "Normal",
      created_at: new Date().toISOString()
    };

    appointments.push(newApt);

    // Notify receptionist
    const notifications = db.table("notifications");
    notifications.push({
      id: notifications.length + 1,
      userId: 2, // Receptionist
      title: "New Online Appointment Request",
      message: `${req.user.name} requested an appointment on ${date} at ${time}.`,
      type: "APPOINTMENT_REQUEST",
      data: { appointmentId: nextId },
      is_read: false,
      created_at: new Date().toISOString()
    });

    db.save();
    res.status(201).json({ success: true, data: newApt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
