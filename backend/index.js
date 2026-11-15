require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const db = require("./src/config/db");
const { seedInitialData } = require("./src/db/seed");

// Import all MediCore Routes
const authRoutes = require("./src/routes/authRoutes");
const patientRoutes = require("./src/routes/patientRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const consultationRoutes = require("./src/routes/consultationRoutes");
const prescriptionRoutes = require("./src/routes/prescriptionRoutes");
const documentRoutes = require("./src/routes/documentRoutes");
const billingRoutes = require("./src/routes/billingRoutes");
const inventoryRoutes = require("./src/routes/inventoryRoutes");
const laboratoryRoutes = require("./src/routes/laboratoryRoutes");
const staffRoutes = require("./src/routes/staffRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const patientPortalRoutes = require("./src/routes/patientPortalRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const deviceRoutes = require("./src/routes/deviceRoutes");

const errorMiddleware = require("./src/middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// System & Health Endpoints
app.get("/api/health", (req, res) =>
  res.json({
    success: true,
    platform: "MediCore Intelligent Medical Cabinet Platform",
    status: "HEALTHY",
    timestamp: new Date().toISOString()
  })
);

// Mount MediCore Domain Modules
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/laboratories", laboratoryRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/patient-portal", patientPortalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/devices", deviceRoutes);

// Serve Mobile Web Application Static Distribution
const mobileDistPath = path.join(__dirname, "../mobile/dist");
app.use(express.static(mobileDistPath));
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    return res.sendFile(path.join(mobileDistPath, "index.html"));
  }
  next();
});

// Global Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Real-time WebSockets with Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
app.set("io", io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    const secret = process.env.JWT_SECRET || "medicore-secure-development-secret-2026";
    const payload = jwt.verify(token, secret);
    const userId = Number(payload.id ?? payload.userId ?? payload.sub);
    if (!Number.isInteger(userId) || userId < 1) throw new Error("Invalid user id");
    socket.userId = userId;
    socket.userRole = payload.role;
    next();
  } catch {
    next(new Error("Authentication required"));
  }
});

io.on("connection", (socket) => {
  console.log(`[MediCore Socket] Client connected: ${socket.id} (User ID: ${socket.userId}, Role: ${socket.userRole})`);
  socket.join(`user:${socket.userId}`);
  if (socket.userRole) {
    socket.join(`role:${socket.userRole.toUpperCase()}`);
  }
  socket.on("disconnect", () => {
    console.log(`[MediCore Socket] Client disconnected: ${socket.id}`);
  });
});

async function start() {
  await seedInitialData();
  const HOST = process.env.HOST || "0.0.0.0";
  server.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`  MediCore Platform Running Successfully!`);
    console.log(`  Local Access:      http://localhost:${PORT}`);
    console.log(`  Network Access:    http://${HOST}:${PORT}`);
    console.log(`  API Health Status: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

// Auto-seed and export for testing and programmatic invocation
seedInitialData().catch((err) => console.error("Seed error:", err));

if (require.main === module) {
  start().catch((error) => {
    console.error("Unable to start MediCore server:", error.message);
    process.exit(1);
  });
}

module.exports = { app, server, io };
