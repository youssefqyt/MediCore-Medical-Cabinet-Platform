const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

module.exports = function authMiddleware(req, res, next) {
  const header = req.get("authorization");
  if (!header?.startsWith("Bearer ")) return next(new AppError("Authentication required", 401));
  const secret = process.env.JWT_SECRET || "medicore-secure-development-secret-2026";
  try {
    const payload = jwt.verify(header.slice(7), secret);
    const id = payload.id ?? payload.userId ?? payload.sub;
    if (!Number.isInteger(Number(id)) || Number(id) < 1) throw new Error();
    req.user = { ...payload, id: Number(id) };
    next();
  } catch {
    next(new AppError("Invalid or expired access token", 401));
  }
};
