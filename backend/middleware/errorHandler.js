// Centralised error handler (non-functional requirement) - guarantees every
// unhandled error, thrown or rejected, becomes a clean JSON response instead
// of crashing the process or leaking a stack trace to the client.
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message, errorCode: "VALIDATION_ERROR" });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
      errorCode: "DUPLICATE_KEY",
    });
  }

  if (err.name === "CastError") {
    return res.status(404).json({ success: false, message: "Resource not found", errorCode: "NOT_FOUND" });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    errorCode: err.errorCode || "SERVER_ERROR",
  });
};

module.exports = errorHandler;
