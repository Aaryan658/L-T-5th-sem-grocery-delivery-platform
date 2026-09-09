// Catches any request that matched no route and turns it into a clean 404
// JSON response instead of Express's default HTML error page.
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errorCode: "ROUTE_NOT_FOUND",
  });
};

module.exports = notFound;
