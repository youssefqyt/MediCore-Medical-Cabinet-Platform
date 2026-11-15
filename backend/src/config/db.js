const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

// Configuration from environment
const USE_PG = process.env.DB_CLIENT === "pg" || (process.env.DB_HOST && !process.env.USE_FILE_DB);
const DB_FILE = process.env.MEDICORE_DB_FILE || path.join(__dirname, "../../../medicore_data.json");

let memoryDb = null;
let pgPool = null;

// Initialize file/memory DB schema
function getInitialDbState() {
  return {
    users: [],
    patients: [],
    appointments: [],
    consultations: [],
    prescriptions: [],
    documents: [],
    invoices: [],
    payments: [],
    expenses: [],
    staff: [],
    laboratories: [],
    inventory: [],
    inventory_movements: [],
    notifications: [],
    audit_logs: [],
    ai_runs: [],
    ai_tool_calls: [],
    workflow_jobs: [],
    cabinet_settings: {
      name: "MediCore Medical Cabinet",
      doctorName: "Dr. Selim Ammar, MD",
      specialty: "General Medicine & Cardiology",
      address: "14 Avenue Habib Bourguiba, Tunis 1001, Tunisia",
      phone: "+216 71 889 000",
      email: "contact@medicore.cabinet.tn",
      currency: "TND",
      consultationFee: 70.0,
      workingHours: "08:30 - 18:00",
      taxNumber: "MF-8492048-A"
    }
  };
}

function loadFileDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      memoryDb = JSON.parse(raw);
    } else {
      memoryDb = getInitialDbState();
      saveFileDb();
    }
  } catch (err) {
    console.warn("Could not read DB_FILE, initializing fresh in-memory storage:", err.message);
    memoryDb = getInitialDbState();
  }
}

function saveFileDb() {
  try {
    if (memoryDb) {
      fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Error saving DB file:", err.message);
  }
}

// Ensure loaded immediately
loadFileDb();

// Generic query interface compatible with pg query: { rows, rowCount }
const db = {
  isPg: false,
  getMemoryDb() {
    if (!memoryDb) loadFileDb();
    return memoryDb;
  },
  save() {
    saveFileDb();
  },
  // Table helpers
  table(name) {
    if (!memoryDb[name]) {
      memoryDb[name] = [];
    }
    return memoryDb[name];
  },
  // Simple transaction runner
  async transaction(fn) {
    try {
      const res = await fn(this);
      this.save();
      return res;
    } catch (err) {
      // Re-read from disk on rollback
      loadFileDb();
      throw err;
    }
  },
  // Postgres fallback compatibility
  async query(text, params = []) {
    if (this.isPg && pgPool) {
      return pgPool.query(text, params);
    }
    // Simple mock execution or pass through
    return { rows: [], rowCount: 0 };
  }
};

module.exports = db;
