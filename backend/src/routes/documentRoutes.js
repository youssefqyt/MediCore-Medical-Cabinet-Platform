const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const audit = require("../middleware/auditMiddleware");
const AppError = require("../utils/AppError");

const router = express.Router();
router.use(auth);

// GET /api/documents - List issued medical certificates and reports
router.get("/", async (req, res, next) => {
  try {
    const { patientId, type } = req.query;
    let list = db.table("documents");

    if (req.user.role === "PATIENT") {
      list = list.filter((d) => d.patientId === req.user.patientId);
    } else if (patientId) {
      list = list.filter((d) => d.patientId === patientId);
    }

    if (type) {
      list = list.filter((d) => d.type === type);
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/generate - Generate structured certificates & reports
router.post(
  "/generate",
  role("DOCTOR"),
  audit("DOCUMENT_GENERATE"),
  async (req, res, next) => {
    try {
      const {
        patientId,
        type, // "SICK_LEAVE", "MEDICAL_CERTIFICATE", "REFERRAL_LETTER", "CONSULTATION_SUMMARY"
        daysOfRest,
        startDate,
        referralSpecialty,
        contentNotes,
        title
      } = req.body;

      if (!patientId || !type) {
        throw new AppError("Patient ID and document type are required", 400);
      }

      const patients = db.table("patients");
      const patient = patients.find((p) => p.patientId === patientId || String(p.id) === String(patientId));
      if (!patient) throw new AppError("Patient not found", 404);

      const cabinet = db.getMemoryDb().cabinet_settings;
      const documents = db.table("documents");
      const nextId = documents.length + 1;
      const docRef = `DOC-2026-${String(nextId).padStart(3, "0")}`;

      // Build structured document content based on medical template
      let generatedContent = "";
      if (type === "SICK_LEAVE") {
        generatedContent = `I, the undersigned, ${req.user.name}, Doctor of Medicine, certify having examined patient ${patient.fullName} (DOB: ${patient.dateOfBirth}, ID: ${patient.patientId}) on this day. The patient's health condition requires a mandatory work interruption and complete rest of ${daysOfRest || 3} days, starting from ${startDate || new Date().toISOString().split("T")[0]}.`;
      } else if (type === "REFERRAL_LETTER") {
        generatedContent = `Dear Colleague (${referralSpecialty || "Specialist Consultant"}),\nI am referring patient ${patient.fullName} for specialized evaluation and management. Known conditions: ${(patient.chronicConditions || []).join(", ") || "None"}. Clinical notes: ${contentNotes || "Please evaluate ongoing symptoms."}`;
      } else {
        generatedContent = `Medical Certificate:\nPatient ${patient.fullName} is clinically evaluated and in sound physical condition for general activities. Clinical observations: ${contentNotes || "No clinical contraindication found."}`;
      }

      const newDoc = {
        id: nextId,
        documentReference: docRef,
        patientId: patient.patientId,
        patientName: patient.fullName,
        doctorId: req.user.id,
        doctorName: req.user.name,
        type,
        title: title || type.replace(/_/g, " "),
        date: new Date().toISOString().split("T")[0],
        content: generatedContent,
        metadata: {
          daysOfRest,
          startDate,
          referralSpecialty,
          cabinetName: cabinet.name
        },
        signature: `${req.user.name}, MD - Certified Official Document`,
        created_at: new Date().toISOString()
      };

      documents.push(newDoc);
      db.save();

      res.status(201).json({ success: true, data: newDoc });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
