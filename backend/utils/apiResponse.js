// Every route replies through one of these two helpers so the success/error
// envelope shown in the API docs is guaranteed to be consistent everywhere.

const success = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, statusCode, message, errorCode = "VALIDATION_ERROR") => {
  return res.status(statusCode).json({ success: false, message, errorCode });
};

module.exports = { success, error };
