const AppError = require("../utils/AppError");
module.exports = (req, res, next) => req.user?.role === "admin" ? next() : next(new AppError("Administrator access required", 403));
