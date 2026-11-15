const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const audit = require("../middleware/auditMiddleware");
const AppError = require("../utils/AppError");

const router = express.Router();
router.use(auth);

// GET /api/billing/invoices - List invoices
router.get("/invoices", async (req, res, next) => {
  try {
    const { patientId, status } = req.query;
    let list = db.table("invoices");

    if (req.user.role === "PATIENT") {
      list = list.filter((i) => i.patientId === req.user.patientId);
    } else if (patientId) {
      list = list.filter((i) => i.patientId === patientId);
    }

    if (status) {
      list = list.filter((i) => i.status?.toLowerCase() === status.toLowerCase());
    }

    list.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/billing/invoices - Create invoice
router.post(
  "/invoices",
  role("DOCTOR", "RECEPTIONIST", "ADMIN"),
  audit("INVOICE_CREATE"),
  async (req, res, next) => {
    try {
      const { patientId, items = [], consultationId, paymentMethod = "Cash", initialPayment = 0 } = req.body;
      if (!patientId || !items.length) {
        throw new AppError("Patient ID and at least one billing item are required", 400);
      }

      const patients = db.table("patients");
      const patient = patients.find((p) => p.patientId === patientId || String(p.id) === String(patientId));
      if (!patient) throw new AppError("Patient not found", 404);

      const totalAmount = items.reduce((sum, item) => sum + Number(item.fee || 0), 0);
      const paid = Math.min(Number(initialPayment || 0), totalAmount);
      const balance = totalAmount - paid;
      const status = balance <= 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid";

      const invoices = db.table("invoices");
      const nextId = invoices.length + 1;
      const invoiceNumber = `INV-2026-${String(nextId).padStart(3, "0")}`;

      const newInvoice = {
        id: nextId,
        invoiceNumber,
        patientId: patient.patientId,
        patientName: patient.fullName,
        consultationId: consultationId || null,
        date: new Date().toISOString().split("T")[0],
        amount: totalAmount,
        paidAmount: paid,
        balance,
        status,
        paymentMethod,
        currency: "TND",
        items,
        created_at: new Date().toISOString()
      };

      invoices.push(newInvoice);

      // If initial payment was made, record payment entry
      if (paid > 0) {
        const payments = db.table("payments");
        payments.push({
          id: payments.length + 1,
          invoiceId: nextId,
          invoiceNumber,
          patientId: patient.patientId,
          amount: paid,
          method: paymentMethod,
          date: new Date().toISOString().split("T")[0],
          recordedBy: req.user.name,
          created_at: new Date().toISOString()
        });
      }

      db.save();
      res.status(201).json({ success: true, data: newInvoice });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/billing/payments - Register payment against invoice
router.post(
  "/payments",
  role("DOCTOR", "RECEPTIONIST", "ADMIN"),
  audit("PAYMENT_CREATE"),
  async (req, res, next) => {
    try {
      const { invoiceId, amount, method = "Cash" } = req.body;
      const payAmt = Number(amount);
      if (!invoiceId || !payAmt || payAmt <= 0) {
        throw new AppError("Valid invoice ID and positive payment amount are required", 400);
      }

      const invoices = db.table("invoices");
      const invoice = invoices.find((i) => String(i.id) === String(invoiceId) || i.invoiceNumber === invoiceId);
      if (!invoice) throw new AppError("Invoice not found", 404);

      if (invoice.balance <= 0) {
        throw new AppError("Invoice is already fully paid", 400);
      }

      if (payAmt > invoice.balance) {
        throw new AppError(`Payment amount (${payAmt} TND) exceeds outstanding balance (${invoice.balance} TND)`, 400);
      }

      invoice.paidAmount += payAmt;
      invoice.balance = Number((invoice.amount - invoice.paidAmount).toFixed(2));
      invoice.status = invoice.balance <= 0 ? "Paid" : "Partially Paid";
      invoice.updated_at = new Date().toISOString();

      const payments = db.table("payments");
      const nextPayId = payments.length + 1;
      const newPayment = {
        id: nextPayId,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId,
        amount: payAmt,
        method,
        date: new Date().toISOString().split("T")[0],
        recordedBy: req.user.name,
        created_at: new Date().toISOString()
      };
      payments.push(newPayment);

      db.save();
      res.status(201).json({ success: true, payment: newPayment, updatedInvoice: invoice });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/billing/stats - Cabinet Financial Analytics
router.get("/stats", role("DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    const invoices = db.table("invoices");
    const payments = db.table("payments");
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = today.slice(0, 7);

    // Today's Revenue (from actual payment records)
    const todayRevenue = payments
      .filter((p) => p.date === today)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Monthly Revenue
    const monthlyRevenue = payments
      .filter((p) => p.date && p.date.startsWith(currentMonth))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Outstanding Invoices & Balances
    const unpaidInvoices = invoices.filter((i) => i.balance > 0);
    const totalOutstandingBalance = unpaidInvoices.reduce((sum, i) => sum + Number(i.balance || 0), 0);

    // Consultations & Average fee
    const consultations = db.table("consultations");
    const averageFee = consultations.length > 0 ? (monthlyRevenue / consultations.length).toFixed(2) : 70.0;

    res.json({
      success: true,
      currency: "TND",
      todayRevenue: Number(todayRevenue.toFixed(2)),
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      unpaidInvoicesCount: unpaidInvoices.length,
      totalOutstandingBalance: Number(totalOutstandingBalance.toFixed(2)),
      totalConsultationsCount: consultations.length,
      averageConsultationRevenue: Number(averageFee)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
