const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const storeRoutes = require("./routes/storeRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const deliveryPartnerRoutes = require("./routes/deliveryPartnerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const slotRoutes = require("./routes/slotRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve the optional demo frontend (module: Postman-only is acceptable, but a
// working UI makes the live demo easier to follow).
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Grocery Delivery Platform API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery-partners", deliveryPartnerRoutes);
app.use("/api/admin", reportRoutes);
app.use("/api/slots", slotRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

module.exports = app;
