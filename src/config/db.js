const mongoose = require("mongoose");
const dns = require("dns");

// Ensure IPv4 is preferred over unreachable NAT64 IPv6 routes returned by some ISPs
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not defined in environment variables (.env).");
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (Database: ${conn.connection.name})`);
        return conn;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        diagnoseMongoError(error, mongoUri);
        throw error;
    }
};

function diagnoseMongoError(error, uri) {
    console.error("\n🔍 MongoDB Connection Diagnosis:");
    const msg = error.message || "";
    if (msg.includes("ENOTFOUND") || msg.includes("querySrv")) {
        console.error("   -> Cause: DNS resolution failed for MongoDB Atlas cluster.");
        console.error("   -> Fixes: 1. Change your network DNS to 8.8.8.8 and 8.8.4.4, then run 'ipconfig /flushdns'.");
        console.error("             2. Try a mobile hotspot if your ISP blocks SRV DNS lookups.");
        console.error("             3. Use standard 'mongodb://' seedlist URI instead of 'mongodb+srv://'.");
    } else if (msg.includes("Could not connect to any servers") || msg.includes("IP not whitelisted")) {
        console.error("   -> Cause: Your current IP address is likely not whitelisted in MongoDB Atlas.");
        console.error("   -> Fix: Go to MongoDB Atlas -> Network Access -> Add IP Address (Add current IP or 0.0.0.0/0 for dev).");
    } else if (msg.includes("Authentication failed") || msg.includes("bad auth")) {
        console.error("   -> Cause: Invalid MongoDB Atlas username or password.");
        console.error("   -> Fix: Check Atlas Database Users; ensure special characters in the password are URL-encoded.");
    } else if (msg.includes("ETIMEDOUT") || msg.includes("ECONNREFUSED")) {
        console.error("   -> Cause: Connection timed out or was refused.");
        console.error("   -> Fix: Check if Atlas cluster is paused, or if your local firewall/port 27017 is blocked.");
    } else {
        console.error("   -> General check: Ensure cluster is active in Atlas and credentials in .env are correct.");
    }
    console.error("=======================================================\n");
}

// Runtime connection events
mongoose.connection.on("error", (err) => {
    console.error("⚠️ MongoDB Runtime Error:", err.message);
});

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Disconnected.");
});

mongoose.connection.on("reconnected", () => {
    console.log("🔄 MongoDB Reconnected.");
});

module.exports = connectDB;