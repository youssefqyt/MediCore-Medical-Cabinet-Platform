const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const AppError = require("../utils/AppError");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const hashPassword = (password) =>
  new Promise((resolve, reject) =>
    crypto.scrypt(password, "medicore_salt_2026", 64, (err, val) =>
      err ? reject(err) : resolve(val.toString("hex"))
    )
  );

const tokenFor = (user) => {
  const secret = process.env.JWT_SECRET || "medicore-secure-development-secret-2026";
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name, patientId: user.patientId },
    secret,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role = "PATIENT", specialty, phone } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      throw new AppError("Name, a valid email, and a password of at least 8 characters are required", 400);
    }
    const users = db.table("users");
    const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      throw new AppError("An account already exists for this email address", 409);
    }

    const passwordHash = await hashPassword(password);
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

    let assignedPatientId = null;
    if (role.toUpperCase() === "PATIENT") {
      assignedPatientId = `PAT-${String(newId).padStart(3, "0")}`;
    }

    const newUser = {
      id: newId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash: passwordHash,
      role: role.toUpperCase(),
      specialty: specialty || null,
      phone: phone || null,
      patientId: assignedPatientId,
      created_at: new Date().toISOString()
    };

    users.push(newUser);

    // If patient, register in patients table as well
    if (role.toUpperCase() === "PATIENT") {
      const patients = db.table("patients");
      patients.push({
        id: patients.length + 1,
        patientId: assignedPatientId,
        fullName: name.trim(),
        dateOfBirth: req.body.dateOfBirth || "1990-01-01",
        gender: req.body.gender || "Other",
        phone: phone || "",
        email: email.trim().toLowerCase(),
        address: req.body.address || "",
        emergencyContact: req.body.emergencyContact || "",
        allergies: [],
        chronicConditions: [],
        currentMedications: [],
        medicalHistory: "Registered online via patient portal.",
        bloodGroup: req.body.bloodGroup || "Unknown",
        status: "Active",
        created_at: new Date().toISOString()
      });
    }

    db.save();

    const safeUser = { ...newUser };
    delete safeUser.password_hash;

    res.status(201).json({ success: true, user: safeUser, token: tokenFor(safeUser) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError("Email and password are required", 400);

    const users = db.table("users");
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) throw new AppError("Invalid email or password", 401);

    const calculatedHash = await hashPassword(password);
    if (user.password_hash !== calculatedHash) {
      throw new AppError("Invalid email or password", 401);
    }

    const safeUser = { ...user };
    delete safeUser.password_hash;

    res.json({ success: true, user: safeUser, token: tokenFor(safeUser) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res, next) => {
  try {
    const users = db.table("users");
    const user = users.find((u) => u.id === req.user.id);
    if (!user) throw new AppError("User not found", 404);

    const safeUser = { ...user };
    delete safeUser.password_hash;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
