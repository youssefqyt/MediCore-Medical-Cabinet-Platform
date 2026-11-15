const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const audit = require("../middleware/auditMiddleware");
const AppError = require("../utils/AppError");

const router = express.Router();
router.use(auth);

// GET /api/patients - List, search, filter patients
router.get(
  "/",
  role("DOCTOR", "RECEPTIONIST", "NURSE", "ADMIN"),
  audit("PATIENTS_LIST_VIEW"),
  async (req, res, next) => {
    try {
      const { search, status } = req.query;
      let list = db.table("patients");

      if (status) {
        list = list.filter((p) => p.status?.toLowerCase() === status.toLowerCase());
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (p) =>
            p.fullName?.toLowerCase().includes(q) ||
            p.patientId?.toLowerCase().includes(q) ||
            p.phone?.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q)
        );
      }

      // Hide sensitive clinical notes from receptionist if not doctor/nurse
      const sanitized = list.map((p) => {
        if (req.user.role === "RECEPTIONIST") {
          const { medicalHistory, chronicConditions, currentMedications, allergies, ...rest } = p;
          return { ...rest, allergiesCount: allergies?.length || 0 };
        }
        return p;
      });

      res.json({ success: true, count: sanitized.length, data: sanitized });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/patients/:id - Detailed patient profile with timeline
router.get(
  "/:id",
  audit("PATIENT_RECORD_VIEW", (req) => ({ patientId: req.params.id })),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const patients = db.table("patients");
      const patient = patients.find((p) => String(p.id) === String(id) || p.patientId === id);
      if (!patient) throw new AppError("Patient not found", 404);

      // Patient Portal security check: Patients can only view their own profile
      if (req.user.role === "PATIENT" && patient.patientId !== req.user.patientId) {
        throw new AppError("Unauthorized: Patients can only access their own records", 403);
      }

      // Gather longitudinal timeline: appointments, consultations, prescriptions, labs, invoices
      const patientId = patient.patientId;
      const appointments = db.table("appointments").filter((a) => a.patientId === patientId);
      const consultations = db.table("consultations").filter((c) => c.patientId === patientId);
      const prescriptions = db.table("prescriptions").filter((pr) => pr.patientId === patientId);
      const laboratories = db.table("laboratories").filter((l) => l.patientId === patientId);
      const invoices = db.table("invoices").filter((i) => i.patientId === patientId);

      // Build chronologically sorted timeline
      const timeline = [
        ...consultations.map((c) => ({
          type: "CONSULTATION",
          date: c.date,
          id: c.id,
          title: `Consultation: ${c.reason}`,
          summary: c.diagnosis,
          doctorName: c.doctorName
        })),
        ...prescriptions.map((pr) => ({
          type: "PRESCRIPTION",
          date: pr.date,
          id: pr.id,
          title: `Prescription issued (${pr.items?.length || 0} items)`,
          summary: pr.items?.map((i) => i.medication).join(", "),
          doctorName: pr.doctorName
        })),
        ...laboratories.map((l) => ({
          type: "LABORATORY",
          date: l.requestDate,
          id: l.id,
          title: `Lab Exam: ${l.examinationType}`,
          summary: l.resultSummary || l.status,
          status: l.status
        })),
        ...appointments.map((a) => ({
          type: "APPOINTMENT",
          date: a.date,
          time: a.time,
          id: a.id,
          title: `Appointment (${a.type}): ${a.status}`,
          summary: a.reason,
          status: a.status
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      res.json({
        success: true,
        data: {
          ...patient,
          timeline,
          counts: {
            appointments: appointments.length,
            consultations: consultations.length,
            prescriptions: prescriptions.length,
            laboratories: laboratories.length,
            invoices: invoices.length
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/patients - Register new patient
router.post(
  "/",
  role("DOCTOR", "RECEPTIONIST", "ADMIN"),
  audit("PATIENT_CREATE"),
  async (req, res, next) => {
    try {
      const { fullName, dateOfBirth, phone, email, gender, address, emergencyContact, allergies, chronicConditions } = req.body;
      if (!fullName?.trim() || !phone?.trim()) {
        throw new AppError("Patient full name and phone number are required", 400);
      }

      const patients = db.table("patients");
      const nextNum = patients.length + 1;
      const patientId = `PAT-${String(nextNum).padStart(3, "0")}`;

      const newPatient = {
        id: nextNum,
        patientId,
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth || "1990-01-01",
        gender: gender || "Other",
        phone: phone.trim(),
        email: email?.trim().toLowerCase() || "",
        address: address?.trim() || "",
        emergencyContact: emergencyContact?.trim() || "",
        allergies: Array.isArray(allergies) ? allergies : (allergies ? [allergies] : []),
        chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : (chronicConditions ? [chronicConditions] : []),
        currentMedications: req.body.currentMedications || [],
        medicalHistory: req.body.medicalHistory || "Registered in cabinet.",
        bloodGroup: req.body.bloodGroup || "Unknown",
        status: "Active",
        created_at: new Date().toISOString()
      };

      patients.push(newPatient);
      db.save();

      res.status(201).json({ success: true, data: newPatient });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/patients/:id - Update patient profile
router.patch(
  "/:id",
  role("DOCTOR", "RECEPTIONIST", "ADMIN", "NURSE"),
  audit("PATIENT_UPDATE", (req) => ({ patientId: req.params.id })),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const patients = db.table("patients");
      const patient = patients.find((p) => String(p.id) === String(id) || p.patientId === id);
      if (!patient) throw new AppError("Patient not found", 404);

      // Role check: Receptionist cannot edit clinical history or allergies
      if (req.user.role === "RECEPTIONIST" && (req.body.allergies || req.body.chronicConditions || req.body.medicalHistory)) {
        throw new AppError("Receptionist cannot alter clinical medical history", 403);
      }

      Object.assign(patient, {
        fullName: req.body.fullName?.trim() || patient.fullName,
        dateOfBirth: req.body.dateOfBirth || patient.dateOfBirth,
        gender: req.body.gender || patient.gender,
        phone: req.body.phone?.trim() || patient.phone,
        email: req.body.email ? req.body.email.trim().toLowerCase() : patient.email,
        address: req.body.address !== undefined ? req.body.address : patient.address,
        emergencyContact: req.body.emergencyContact !== undefined ? req.body.emergencyContact : patient.emergencyContact,
        allergies: req.body.allergies !== undefined ? req.body.allergies : patient.allergies,
        chronicConditions: req.body.chronicConditions !== undefined ? req.body.chronicConditions : patient.chronicConditions,
        currentMedications: req.body.currentMedications !== undefined ? req.body.currentMedications : patient.currentMedications,
        medicalHistory: req.body.medicalHistory !== undefined ? req.body.medicalHistory : patient.medicalHistory,
        bloodGroup: req.body.bloodGroup || patient.bloodGroup,
        status: req.body.status || patient.status,
        updated_at: new Date().toISOString()
      });

      db.save();
      res.json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/patients/merge - Merge duplicate patient records with audit trail
router.post(
  "/merge",
  role("DOCTOR", "ADMIN"),
  audit("PATIENT_MERGE"),
  async (req, res, next) => {
    try {
      const { primaryPatientId, duplicatePatientId, reason } = req.body;
      if (!primaryPatientId || !duplicatePatientId || primaryPatientId === duplicatePatientId) {
        throw new AppError("Valid distinct primary and duplicate patient IDs are required", 400);
      }

      const patients = db.table("patients");
      const primary = patients.find((p) => p.patientId === primaryPatientId);
      const duplicate = patients.find((p) => p.patientId === duplicatePatientId);
      if (!primary || !duplicate) throw new AppError("One or both patient records not found", 404);

      // Merge allergies & conditions without duplicates
      primary.allergies = Array.from(new Set([...(primary.allergies || []), ...(duplicate.allergies || [])]));
      primary.chronicConditions = Array.from(new Set([...(primary.chronicConditions || []), ...(duplicate.chronicConditions || [])]));
      primary.medicalHistory += `\n[Merged with ${duplicatePatientId} on ${new Date().toISOString().split("T")[0]}]: ${reason || "Duplicate record resolution"}`;

      // Re-point related entities to primary
      const tablesToUpdate = ["appointments", "consultations", "prescriptions", "laboratories", "invoices", "payments"];
      tablesToUpdate.forEach((tbl) => {
        const records = db.table(tbl);
        records.forEach((r) => {
          if (r.patientId === duplicatePatientId) {
            r.patientId = primaryPatientId;
            r.patientName = primary.fullName;
          }
        });
      });

      // Mark duplicate as Merged / Archived
      duplicate.status = "Archived_Merged";
      duplicate.mergedInto = primaryPatientId;

      db.save();
      res.json({ success: true, message: "Patient records merged successfully", primaryPatient: primary });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
