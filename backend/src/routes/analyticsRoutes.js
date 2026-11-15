const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(auth);

// GET /api/analytics/dashboard - Real-time medical cabinet dashboard metrics
router.get("/dashboard", role("DOCTOR", "ADMIN", "RECEPTIONIST"), async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = today.slice(0, 7);

    const appointments = db.table("appointments");
    const consultations = db.table("consultations");
    const patients = db.table("patients");
    const inventory = db.table("inventory");
    const invoices = db.table("invoices");
    const payments = db.table("payments");

    // Today's appointments
    const todayAppointments = appointments.filter((a) => a.date === today);
    const waitingPatients = todayAppointments.filter((a) => a.status === "Arrived");
    const activeConsultations = todayAppointments.filter((a) => a.status === "In consultation");
    const completedToday = todayAppointments.filter((a) => a.status === "Completed");

    // Monthly & Daily Revenue from real payments
    const todayRevenue = payments
      .filter((p) => p.date === today)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const monthlyRevenue = payments
      .filter((p) => p.date && p.date.startsWith(currentMonth))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Unpaid Invoices
    const unpaidInvoices = invoices.filter((i) => i.balance > 0);
    const outstandingTotal = unpaidInvoices.reduce((sum, i) => sum + Number(i.balance || 0), 0);

    // Inventory Alerts
    const lowStockItems = inventory.filter((i) => Number(i.currentStock) <= Number(i.minimumStock));

    // Consultation categories distribution
    const diagnosisCategories = {};
    consultations.forEach((c) => {
      const diag = c.diagnosis ? c.diagnosis.split(" ")[0] : "General";
      diagnosisCategories[diag] = (diagnosisCategories[diag] || 0) + 1;
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      cabinet: db.getMemoryDb().cabinet_settings,
      summary: {
        todayAppointmentsCount: todayAppointments.length,
        waitingPatientsCount: waitingPatients.length,
        activeConsultationsCount: activeConsultations.length,
        completedTodayCount: completedToday.length,
        totalActivePatients: patients.filter((p) => p.status === "Active").length,
        todayRevenue: Number(todayRevenue.toFixed(2)),
        monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
        unpaidInvoicesCount: unpaidInvoices.length,
        outstandingTotal: Number(outstandingTotal.toFixed(2)),
        lowStockItemsCount: lowStockItems.length,
        currency: "TND"
      },
      todaySchedule: todayAppointments.map((a) => ({
        id: a.id,
        appointmentNumber: a.appointmentNumber,
        patientName: a.patientName,
        time: a.time,
        type: a.type,
        status: a.status,
        reason: a.reason
      })),
      lowStockAlerts: lowStockItems.map((i) => ({
        code: i.code,
        name: i.name,
        currentStock: i.currentStock,
        minimumStock: i.minimumStock,
        unit: i.unit
      })),
      consultationCategories: diagnosisCategories
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
