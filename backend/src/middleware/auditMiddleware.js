const db = require("../config/db");

function auditLog(action, getDetails) {
  return (req, res, next) => {
    // Wrap original res.json to log upon successful response
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      try {
        if (body && body.success !== false) {
          const details = typeof getDetails === "function" ? getDetails(req, body) : (getDetails || {});
          const auditLogs = db.table("audit_logs");
          const logEntry = {
            id: auditLogs.length + 1,
            userId: req.user ? req.user.id : null,
            userName: req.user ? req.user.name : "Anonymous/System",
            role: req.user ? req.user.role : "GUEST",
            action,
            resource: req.originalUrl || req.url,
            method: req.method,
            details,
            ip: req.ip || req.connection?.remoteAddress || "127.0.0.1",
            timestamp: new Date().toISOString()
          };
          auditLogs.push(logEntry);
          db.save();
        }
      } catch (err) {
        console.error("Audit logging error:", err.message);
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = auditLog;
