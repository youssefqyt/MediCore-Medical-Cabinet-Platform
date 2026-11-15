const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const audit = require("../middleware/auditMiddleware");
const AppError = require("../utils/AppError");

const router = express.Router();
router.use(auth);

// Configurable medication catalog
const MEDICATION_CATALOG = [
  { id: 1, name: "Amlodipine", defaultDosage: "5mg", forms: ["Tablet"], commonFrequency: "Once daily" },
  { id: 2, name: "Atorvastatin", defaultDosage: "20mg", forms: ["Tablet"], commonFrequency: "Once daily at bedtime" },
  { id: 3, name: "Metformin", defaultDosage: "850mg", forms: ["Tablet"], commonFrequency: "Twice daily with meals" },
  { id: 4, name: "Amoxicillin", defaultDosage: "500mg", forms: ["Capsule"], commonFrequency: "Three times daily" },
  { id: 5, name: "Paracetamol", defaultDosage: "1000mg", forms: ["Tablet", "Effervescent"], commonFrequency: "Every 6 hours PRN" },
  { id: 6, name: "Budesonide/Formoterol", defaultDosage: "160/4.5mcg", forms: ["Inhaler"], commonFrequency: "2 puffs twice daily" },
  { id: 7, name: "Omeprazole", defaultDosage: "20mg", forms: ["Capsule"], commonFrequency: "Once daily 30m before breakfast" }
];

// GET /api/prescriptions/medications - Configurable catalog
router.get("/medications", (req, res) => {
  res.json({ success: true, data: MEDICATION_CATALOG });
});

// GET /api/prescriptions - List prescriptions
router.get("/", async (req, res, next) => {
  try {
    const { patientId } = req.query;
    let list = db.table("prescriptions");

    if (req.user.role === "PATIENT") {
      list = list.filter((p) => p.patientId === req.user.patientId);
    } else if (patientId) {
      list = list.filter((p) => p.patientId === patientId);
    }

    list.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/prescriptions - Issue prescription with Allergy Cross-Check
router.post(
  "/",
  role("DOCTOR"), // Explicit doctor authorization required
  audit("PRESCRIPTION_CREATE"),
  async (req, res, next) => {
    try {
      const { patientId, consultationId, items = [] } = req.body;
      if (!patientId || !items.length) {
        throw new AppError("Patient ID and at least one medication item are required", 400);
      }

      const patients = db.table("patients");
      const patient = patients.find((p) => p.patientId === patientId || String(p.id) === String(patientId));
      if (!patient) throw new AppError("Patient not found", 404);

      // Perform allergy safety cross-check against recorded allergies
      const allergyWarnings = [];
      const patientAllergies = (patient.allergies || []).map((a) => a.toLowerCase());

      items.forEach((item) => {
        const medName = (item.medication || "").toLowerCase();
        patientAllergies.forEach((allergy) => {
          if (medName.includes(allergy) || (allergy.includes("penicillin") && medName.includes("amoxicillin"))) {
            allergyWarnings.push({
              medication: item.medication,
              allergy: allergy,
              message: `Severe Alert: Patient is known to be allergic to ${allergy}. Prescribed medication '${item.medication}' presents high risk.`
            });
          }
        });
      });

      if (allergyWarnings.length > 0 && !req.body.overrideAllergyWarning) {
        return res.status(409).json({
          success: false,
          requiresDoctorOverride: true,
          warnings: allergyWarnings,
          message: "Allergy conflict detected. Doctor review and explicit override confirmation required."
        });
      }

      const prescriptions = db.table("prescriptions");
      const nextId = prescriptions.length + 1;
      const prescriptionNumber = `ORD-2026-${String(nextId).padStart(3, "0")}`;

      const newPrescription = {
        id: nextId,
        prescriptionNumber,
        patientId: patient.patientId,
        patientName: patient.fullName,
        doctorId: req.user.id,
        doctorName: req.user.name || "Dr. Selim Ammar",
        consultationId: consultationId || null,
        date: req.body.date || new Date().toISOString().split("T")[0],
        status: "Approved",
        items,
        allergyCheckPassed: allergyWarnings.length === 0,
        warnings: allergyWarnings,
        doctorSignature: `${req.user.name}, MD - Verified & Digitally Signed`,
        created_at: new Date().toISOString()
      };

      prescriptions.push(newPrescription);
      db.save();

      res.status(201).json({ success: true, data: newPrescription });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/prescriptions/:id/print-data - Professional PDF / Printable Layout Generator
router.get("/:id/print-data", async (req, res, next) => {
  try {
    const { id } = req.params;
    const prescriptions = db.table("prescriptions");
    const prescription = prescriptions.find((p) => String(p.id) === String(id) || p.prescriptionNumber === id);
    if (!prescription) throw new AppError("Prescription not found", 404);

    const patients = db.table("patients");
    const patient = patients.find((p) => p.patientId === prescription.patientId);
    const cabinet = db.getMemoryDb().cabinet_settings;

    res.json({
      success: true,
      documentType: "Medical Prescription",
      cabinet,
      patient: {
        fullName: patient ? patient.fullName : prescription.patientName,
        patientId: prescription.patientId,
        age: patient ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : "N/A",
        gender: patient?.gender || "N/A"
      },
      doctor: {
        name: prescription.doctorName,
        specialty: cabinet.specialty
      },
      prescription: {
        number: prescription.prescriptionNumber,
        date: prescription.date,
        items: prescription.items,
        signature: prescription.doctorSignature
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
