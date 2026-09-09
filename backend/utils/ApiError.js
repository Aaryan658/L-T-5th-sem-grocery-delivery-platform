// A throwable error carrying an HTTP status + errorCode, so a helper function
// several layers below a controller can signal a clean 4xx without having to
// pass `res` down through every call. Caught by middleware/errorHandler.js.
class ApiError extends Error {
  constructor(statusCode, message, errorCode = "VALIDATION_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

module.exports = ApiError;
