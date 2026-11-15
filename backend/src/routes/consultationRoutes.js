const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const audit = require("../middleware/auditMiddleware");
const AppError = require("../utils/AppError");

const router = express.Router();
router.use(auth);

// GET /api/consultations - List consultations with filter
router.get(
  "/",
  role("DOCTOR", "ADMIN", "NURSE"),
  audit("CONSULTATIONS_LIST"),
  async (req, res, next) => {
    try {
      const { patientId, doctorId, date } = req.query;
      let list = db.table("consultations");

      if (patientId) {
        list = list.filter((c) => c.patientId === patientId);
      }
      if (date) {
        list = list.filter((c) => c.date === date);
      }

      list.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
      res.json({ success: true, count: list.length, data: list });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/consultations/:id - Single consultation detail
router.get(
  "/:id",
  role("DOCTOR", "ADMIN", "NURSE"),
  audit("CONSULTATION_VIEW", (req) => ({ consultationId: req.params.id })),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const consultations = db.table("consultations");
      const consultation = consultations.find((c) => String(c.id) === String(id) || c.consultationNumber === id);
      if (!consultation) throw new AppError("Consultation record not found", 404);

      res.json({ success: true, data: consultation });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/consultations - Start or create consultation
router.post(
  "/",
  role("DOCTOR", "ADMIN"),
  audit("CONSULTATION_CREATE"),
  async (req, res, next) => {
    try {
      const {
        patientId,
        appointmentId,
        reason,
        symptoms,
        clinicalObservations,
        vitalSigns,
        diagnosis,
        treatmentPlan,
        status = "Draft" // "Draft" or "Finalized"
      } = req.body;

      if (!patientId || !reason) {
        throw new AppError("Patient ID and consultation reason are required", 400);
      }

      const patients = db.table("patients");
      const patient = patients.find((p) => p.patientId === patientId || String(p.id) === String(patientId));
      if (!patient) throw new AppError("Patient not found", 404);

      const consultations = db.table("consultations");
      const nextId = consultations.length + 1;
      const consultationNumber = `CNS-2026-${String(nextId).padStart(3, "0")}`;

      const newConsultation = {
        id: nextId,
        consultationNumber,
        patientId: patient.patientId,
        patientName: patient.fullName,
        doctorId: req.user.id,
        doctorName: req.user.name || "Dr. Selim Ammar",
        appointmentId: appointmentId || null,
        date: req.body.date || new Date().toISOString().split("T")[0],
        reason: reason.trim(),
        symptoms: symptoms || "",
        clinicalObservations: clinicalObservations || "",
        vitalSigns: vitalSigns || {
          bloodPressure: "",
          heartRate: "",
          temperature: "",
          respiratoryRate: "",
          spO2: "",
          weight: "",
          height: "",
          bmi: ""
        },
        diagnosis: diagnosis || "",
        treatmentPlan: treatmentPlan || "",
        status, // Draft or Finalized
        amendments: [],
        created_at: new Date().toISOString()
      };

      consultations.push(newConsultation);

      // If associated with an appointment, update appointment status to Completed or In consultation
      if (appointmentId) {
        const appointments = db.table("appointments");
        const apt = appointments.find((a) => String(a.id) === String(appointmentId));
        if (apt) {
          apt.status = status === "Finalized" ? "Completed" : "In consultation";
        }
      }

      db.save();
      res.status(201).json({ success: true, data: newConsultation });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/consultations/:id - Update or amend consultation
router.patch(
  "/:id",
  role("DOCTOR", "ADMIN"),
  audit("CONSULTATION_UPDATE", (req) => ({ consultationId: req.params.id })),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const consultations = db.table("consultations");
      const consultation = consultations.find((c) => String(c.id) === String(id) || c.consultationNumber === id);
      if (!consultation) throw new AppError("Consultation not found", 404);

      // Critical Rule: Never silently overwrite finalized clinical records
      if (consultation.status === "Finalized") {
        if (!req.body.amendmentReason) {
          throw new AppError(
            "This consultation is finalized. Any modification requires an explicit amendment reason and will be tracked in audit logs.",
            400
          );
        }

        const amendmentRecord = {
          amendedAt: new Date().toISOString(),
          amendedBy: req.user.name,
          reason: req.body.amendmentReason,
          previousState: {
            diagnosis: consultation.diagnosis,
            treatmentPlan: consultation.treatmentPlan,
            clinicalObservations: consultation.clinicalObservations
          }
        };

        consultation.amendments = consultation.amendments || [];
        consultation.amendments.push(amendmentRecord);
      }

      // Update allowed clinical fields
      if (req.body.reason !== undefined) consultation.reason = req.body.reason;
      if (req.body.symptoms !== undefined) consultation.symptoms = req.body.symptoms;
      if (req.body.clinicalObservations !== undefined) consultation.clinicalObservations = req.body.clinicalObservations;
      if (req.body.vitalSigns !== undefined) consultation.vitalSigns = req.body.vitalSigns;
      if (req.body.diagnosis !== undefined) consultation.diagnosis = req.body.diagnosis;
      if (req.body.treatmentPlan !== undefined) consultation.treatmentPlan = req.body.treatmentPlan;
      if (req.body.status) consultation.status = req.body.status;
      consultation.updated_at = new Date().toISOString();

      db.save();
      res.json({ success: true, data: consultation });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
