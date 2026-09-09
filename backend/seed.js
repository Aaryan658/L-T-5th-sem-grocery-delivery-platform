// One-shot script that populates a fresh database with enough sample data to
// demo every module immediately after cloning. Safe to re-run - it wipes and
// recreates its own collections only.
//
// Usage: npm run seed   (after copying .env.example to .env)

const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const User = require("./models/User");
const DarkStore = require("./models/DarkStore");
const Product = require("./models/Product");
const StoreStock = require("./models/StoreStock");
const DeliveryPartner = require("./models/DeliveryPartner");
const Order = require("./models/Order");
const { hashPassword } = require("./utils/hash");

const run = async () => {
  await connectDB();

  console.log("Clearing existing demo collections...");
  await Promise.all([
    User.deleteMany({}),
    DarkStore.deleteMany({}),
    Product.deleteMany({}),
    StoreStock.deleteMany({}),
    DeliveryPartner.deleteMany({}),
    Order.deleteMany({}),
  ]);

  console.log("Creating dark-stores...");
  const stores = await DarkStore.create([
    {
      name: "Koramangala Dark Store",
      area: "Koramangala",
      serviceablePincodes: ["560034", "560095"],
      location: { line1: "80 Feet Road", city: "Bengaluru" },
    },
    {
      name: "Indiranagar Dark Store",
      area: "Indiranagar",
      serviceablePincodes: ["560038"],
      location: { line1: "100 Feet Road", city: "Bengaluru" },
    },
  ]);

  console.log("Creating products...");
  const products = await Product.create([
    { name: "Amul Toned Milk 1L", category: "Dairy", unit: "pack", price: 66 },
    { name: "Britannia Brown Bread", category: "Bakery", unit: "pack", price: 45 },
    { name: "Tata Salt 1kg", category: "Staples", unit: "pack", price: 28 },
    { name: "Fortune Sunflower Oil 1L", category: "Staples", unit: "bottle", price: 145 },
    { name: "Red Onion 1kg", category: "Vegetables", unit: "kg", price: 35 },
    { name: "Banana 1 Dozen", category: "Fruits", unit: "dozen", price: 60 },
  ]);

  console.log("Stocking both stores...");
  const stockDocs = [];
  stores.forEach((store) => {
    products.forEach((product, idx) => {
      stockDocs.push({
        storeId: store._id,
        productId: product._id,
        quantity: 50 - idx * 5,
        reorderPoint: 10,
      });
    });
  });
  await StoreStock.insertMany(stockDocs);

  console.log("Creating users (password for all demo accounts: Passw0rd!)...");
  const passwordHash = await hashPassword("Passw0rd!");

  const admin = await User.create({
    name: "Platform Admin",
    email: "admin@grocery.test",
    passwordHash,
    role: "admin",
  });

  const staff = await User.create({
    name: "Koramangala Staff",
    email: "staff@grocery.test",
    passwordHash,
    role: "storeStaff",
    storeId: stores[0]._id,
  });

  const customer = await User.create({
    name: "Asha Kumar",
    email: "customer@grocery.test",
    passwordHash,
    role: "customer",
    addresses: [{ label: "Home", line1: "12 MG Road", area: "Koramangala", pincode: "560034", isDefault: true }],
  });

  const partnerUser = await User.create({
    name: "Ravi Delivery",
    email: "partner@grocery.test",
    passwordHash,
    role: "deliveryPartner",
  });
  await DeliveryPartner.create({ userId: partnerUser._id, vehicleType: "bike", isAvailable: true });

  console.log("Seed complete.");
  console.log("  Admin:    admin@grocery.test / Passw0rd!");
  console.log("  Staff:    staff@grocery.test / Passw0rd!    (Koramangala Dark Store)");
  console.log("  Customer: customer@grocery.test / Passw0rd!");
  console.log("  Partner:  partner@grocery.test / Passw0rd!");
  console.log(`  Store IDs: Koramangala=${stores[0]._id}  Indiranagar=${stores[1]._id}`);

  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
