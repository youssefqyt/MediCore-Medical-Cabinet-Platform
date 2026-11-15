const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const audit = require("../middleware/auditMiddleware");
const AppError = require("../utils/AppError");

const router = express.Router();
router.use(auth);

// GET /api/staff - List cabinet staff members
router.get("/", role("DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    const users = db.table("users");
    const staff = users
      .filter((u) => ["DOCTOR", "RECEPTIONIST", "NURSE", "ADMIN"].includes(u.role))
      .map((u) => {
        const safe = { ...u };
        delete safe.password_hash;
        return safe;
      });

    res.json({ success: true, count: staff.length, data: staff });
  } catch (err) {
    next(err);
  }
});

// GET /api/staff/audit-logs - Security and HIPAA/GDPR audit trail
router.get("/audit-logs", role("DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    const logs = db.table("audit_logs");
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
    res.json({ success: true, count: sorted.length, data: sorted });
  } catch (err) {
    next(err);
  }
});

// GET /api/staff/cabinet-settings - Cabinet profile and preferences
router.get("/cabinet-settings", async (req, res, next) => {
  try {
    const settings = db.getMemoryDb().cabinet_settings;
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/staff/cabinet-settings - Update cabinet configuration
router.patch("/cabinet-settings", role("DOCTOR", "ADMIN"), audit("CABINET_SETTINGS_UPDATE"), async (req, res, next) => {
  try {
    const current = db.getMemoryDb().cabinet_settings;
    Object.assign(current, req.body);
    db.save();
    res.json({ success: true, data: current });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
