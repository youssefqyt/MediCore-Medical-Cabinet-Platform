const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const audit = require("../middleware/auditMiddleware");
const AppError = require("../utils/AppError");

const router = express.Router();
router.use(auth);

// GET /api/inventory - List inventory items with stock status
router.get("/", async (req, res, next) => {
  try {
    const { category, alert } = req.query;
    let list = db.table("inventory");

    if (category) {
      list = list.filter((i) => i.category?.toLowerCase() === category.toLowerCase());
    }

    if (alert) {
      list = list.filter((i) => i.alert === alert);
    }

    // Refresh alert status based on current stock vs minimum stock
    list.forEach((i) => {
      if (Number(i.currentStock) <= Number(i.minimumStock)) {
        i.alert = "LOW_STOCK";
      } else {
        i.alert = "NORMAL";
      }
    });

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory - Add new inventory supply
router.post(
  "/",
  role("DOCTOR", "ADMIN", "NURSE"),
  audit("INVENTORY_CREATE"),
  async (req, res, next) => {
    try {
      const { name, category, currentStock, minimumStock, unit, supplier, costPerUnit, expirationDate } = req.body;
      if (!name || currentStock === undefined || minimumStock === undefined) {
        throw new AppError("Name, currentStock, and minimumStock are required", 400);
      }

      const inventory = db.table("inventory");
      const nextId = inventory.length + 1;
      const code = `MED-${String(nextId).padStart(3, "0")}`;

      const stockNum = Number(currentStock);
      const minNum = Number(minimumStock);

      const newItem = {
        id: nextId,
        code,
        name: name.trim(),
        category: category || "Consumables",
        currentStock: stockNum,
        minimumStock: minNum,
        unit: unit || "Units",
        supplier: supplier || "Local Medical Supplier",
        costPerUnit: Number(costPerUnit || 0),
        expirationDate: expirationDate || "2028-12-31",
        alert: stockNum <= minNum ? "LOW_STOCK" : "NORMAL",
        created_at: new Date().toISOString()
      };

      inventory.push(newItem);
      db.save();

      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/inventory/:id/movement - Record stock movement (IN / OUT / ADJUSTMENT)
router.post(
  "/:id/movement",
  role("DOCTOR", "ADMIN", "NURSE"),
  audit("INVENTORY_MOVEMENT"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { type, quantity, reason } = req.body; // type: "IN" (restock) or "OUT" (consumption)
      const qty = Number(quantity);

      if (!type || !qty || qty <= 0) {
        throw new AppError("Movement type (IN or OUT) and positive quantity are required", 400);
      }

      const inventory = db.table("inventory");
      const item = inventory.find((i) => String(i.id) === String(id) || i.code === id);
      if (!item) throw new AppError("Inventory item not found", 404);

      if (type === "OUT" && item.currentStock < qty) {
        throw new AppError(
          `Insufficient stock: Cannot consume ${qty} ${item.unit}. Only ${item.currentStock} available in inventory.`,
          400
        );
      }

      const previousStock = item.currentStock;
      item.currentStock = type === "IN" ? previousStock + qty : previousStock - qty;
      item.alert = item.currentStock <= item.minimumStock ? "LOW_STOCK" : "NORMAL";

      const movements = db.table("inventory_movements");
      const movementRecord = {
        id: movements.length + 1,
        inventoryId: item.id,
        itemCode: item.code,
        itemName: item.name,
        type,
        quantity: qty,
        previousStock,
        newStock: item.currentStock,
        reason: reason || (type === "IN" ? "Restock from supplier" : "Clinical cabinet use"),
        recordedBy: req.user.name,
        timestamp: new Date().toISOString()
      };
      movements.push(movementRecord);

      // Low stock notification if stock is now <= minimum
      if (item.alert === "LOW_STOCK") {
        const notifications = db.table("notifications");
        notifications.push({
          id: notifications.length + 1,
          userId: 1, // Doctor
          title: "Low Inventory Alert",
          message: `${item.name} (${item.code}) is running low: only ${item.currentStock} ${item.unit} remaining (minimum: ${item.minimumStock}).`,
          type: "LOW_INVENTORY",
          data: { inventoryId: item.id, code: item.code },
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      db.save();
      res.json({ success: true, updatedItem: item, movement: movementRecord });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
