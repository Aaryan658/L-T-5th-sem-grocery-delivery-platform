const mongoose = require("mongoose");
const dns = require("dns");

// mongodb+srv:// URIs resolve their host list via a DNS SRV lookup. Some
// Windows machines' default configured DNS server refuses/mishandles SRV
// queries, which surfaces as "querySrv ECONNREFUSED" even though the cluster
// and network access rules are fine. Pointing Node's resolver at public DNS
// servers sidesteps that - it only affects this process's own lookups, not
// the OS-wide DNS settings.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not set. Copy .env.example to .env first.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
