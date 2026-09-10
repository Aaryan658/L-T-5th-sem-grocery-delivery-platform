const mongoose = require("mongoose");

// Referenced against User rather than folding these fields into the user
// document: availability toggles constantly during a shift (independent
// write-hot field) and assignment queries ("find an available partner") scan
// this collection alone without ever needing the rest of the user profile.
const deliveryPartnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ["bike", "bicycle", "scooter", "van"],
      default: "bike",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Denormalised so "available partners near this store" never needs a
    // $lookup into orders to find where a partner last delivered.
    currentStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DarkStore",
      default: null,
    },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ userId: 1 }, { unique: true });
deliveryPartnerSchema.index({ isAvailable: 1, currentStoreId: 1 });

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
