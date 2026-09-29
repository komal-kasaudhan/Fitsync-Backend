const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (Database: ${conn.connection.name})`);
        return conn;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        throw error;
    }
};

// Catch and log runtime mongoose connection errors without crashing Node
mongoose.connection.on("error", (err) => {
    console.error("⚠️ MongoDB Runtime Error:", err.message);
});

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Disconnected. Attempting auto-reconnection...");
});

mongoose.connection.on("reconnected", () => {
    console.log("🔄 MongoDB Reconnected Successfully.");
});

module.exports = connectDB;