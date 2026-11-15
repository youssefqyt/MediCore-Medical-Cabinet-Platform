function errorMiddleware(err, req, res, next) {
  console.error("ERROR:", err.stack || err);

  const statusCode = err.statusCode || 500;
  const isSafeClientError = statusCode >= 400 && statusCode < 500;

  res.status(statusCode).json({
    success: false,
    message: isSafeClientError ? err.message : "The service is temporarily unavailable. Please try again shortly.",
    ...(err.code && isSafeClientError ? { code: err.code } : {}),
  });
}

module.exports = errorMiddleware;