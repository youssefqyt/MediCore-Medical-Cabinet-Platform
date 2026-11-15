const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const audit = require("../middleware/auditMiddleware");
const AppError = require("../utils/AppError");

const router = express.Router();
router.use(auth);

// GET /api/laboratories - List examination requests
router.get("/", async (req, res, next) => {
  try {
    const { patientId, status } = req.query;
    let list = db.table("laboratories");

    if (req.user.role === "PATIENT") {
      list = list.filter((l) => l.patientId === req.user.patientId);
    } else if (patientId) {
      list = list.filter((l) => l.patientId === patientId);
    }

    if (status) {
      list = list.filter((l) => l.status?.toLowerCase() === status.toLowerCase());
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/laboratories - Create lab request
router.post(
  "/",
  role("DOCTOR", "ADMIN"),
  audit("LAB_REQUEST_CREATE"),
  async (req, res, next) => {
    try {
      const { patientId, examinationType, clinicalNotes } = req.body;
      if (!patientId || !examinationType) {
        throw new AppError("Patient ID and examination type are required", 400);
      }

      const patients = db.table("patients");
      const patient = patients.find((p) => p.patientId === patientId || String(p.id) === String(patientId));
      if (!patient) throw new AppError("Patient not found", 404);

      const laboratories = db.table("laboratories");
      const nextId = laboratories.length + 1;
      const requestNumber = `LAB-2026-${String(nextId).padStart(3, "0")}`;

      const newLab = {
        id: nextId,
        requestNumber,
        patientId: patient.patientId,
        patientName: patient.fullName,
        doctorName: req.user.name,
        examinationType: examinationType.trim(),
        clinicalNotes: clinicalNotes || "",
        requestDate: new Date().toISOString().split("T")[0],
        status: "Requested", // Requested, Sent, In Progress, Completed, Reviewed
        resultSummary: null,
        reviewedByDoctor: false,
        created_at: new Date().toISOString()
      };

      laboratories.push(newLab);
      db.save();

      res.status(201).json({ success: true, data: newLab });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/laboratories/:id/results - Attach laboratory results
router.patch(
  "/:id/results",
  role("DOCTOR", "NURSE", "ADMIN"),
  audit("LAB_RESULTS_ATTACH"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { resultSummary, status = "Completed", reviewedByDoctor = false } = req.body;
      if (!resultSummary) throw new AppError("Result summary content is required", 400);

      const laboratories = db.table("laboratories");
      const lab = laboratories.find((l) => String(l.id) === String(id) || l.requestNumber === id);
      if (!lab) throw new AppError("Laboratory request not found", 404);

      lab.resultSummary = resultSummary;
      lab.status = status;
      lab.reviewedByDoctor = req.user.role === "DOCTOR" ? true : Boolean(reviewedByDoctor);
      lab.receivedAt = new Date().toISOString();

      // If nurse attached results, notify doctor
      if (req.user.role !== "DOCTOR") {
        const notifications = db.table("notifications");
        notifications.push({
          id: notifications.length + 1,
          userId: 1, // Doctor
          title: "Laboratory Results Received",
          message: `Results attached for ${lab.patientName} (${lab.examinationType}). Pending review.`,
          type: "LAB_RESULT_RECEIVED",
          data: { labId: lab.id, patientId: lab.patientId },
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      db.save();
      res.json({ success: true, data: lab });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
