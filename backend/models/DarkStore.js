const mongoose = require("mongoose");

const darkStoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    // Embedded: a store's serviceable pincodes are always read with the store
    // itself (the nearest-store check needs the whole list in one document)
    // and are edited only by the same admin action that edits the store.
    serviceablePincodes: {
      type: [String],
      default: [],
    },
    location: {
      line1: { type: String, trim: true },
      city: { type: String, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

darkStoreSchema.index({ name: 1 }, { unique: true });
darkStoreSchema.index({ serviceablePincodes: 1 });

module.exports = mongoose.model("DarkStore", darkStoreSchema);
