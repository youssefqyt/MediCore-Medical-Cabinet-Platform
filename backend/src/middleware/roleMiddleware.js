const AppError = require("../utils/AppError");

function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    const userRole = (req.user.role || "").toUpperCase();
    const upperAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!upperAllowed.includes(userRole)) {
      return next(
        new AppError(
          `Access forbidden: requires one of [${allowedRoles.join(", ")}], but user has [${userRole}]`,
          403
        )
      );
    }
    next();
  };
}

module.exports = roleMiddleware;
