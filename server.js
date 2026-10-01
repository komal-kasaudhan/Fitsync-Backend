require("dotenv").config();
const dns = require("dns");
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const os = require("os");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 8000;

// Prevent process crash on transient unhandled errors/rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("⚠️ Uncaught Exception:", error);
});

// Helper to get local network IPv4 address
function getLocalIpAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                addresses.push({ name, address: iface.address });
            }
        }
    }
    return addresses;
}

// Find ADB executable path
function getAdbPath() {
    const localAppData = process.env.LOCALAPPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, "AppData", "Local") : "");
    const possiblePaths = [
        path.join(localAppData, "Android", "Sdk", "platform-tools", "adb.exe"),
        path.join("C:", "Android", "platform-tools", "adb.exe"),
        path.join("C:", "platform-tools", "adb.exe"),
        "adb"
    ];

    for (const p of possiblePaths) {
        if (p !== "adb" && fs.existsSync(p)) {
            return p;
        }
    }
    return "adb";
}

// Automatically setup ADB reverse port forwarding for USB-connected Android physical devices
function setupAdbReverse(port) {
    const adb = getAdbPath();
    const cmd = `"${adb}" reverse tcp:${port} tcp:${port}`;
    exec(cmd, (err, stdout, stderr) => {
        if (!err) {
            console.log(`📱 [ADB Reverse] Port ${port} forwarded to connected physical Android device!`);
            console.log(`   -> Physical device can use: http://localhost:${port}/api/`);
        } else {
            const rawMsg = (stderr || err.message || "").toLowerCase();
            if (rawMsg.includes("no devices") || rawMsg.includes("device not found")) {
                console.log(`ℹ️  [ADB] No USB Android device connected (harmless if using Android Emulator or Wi-Fi).`);
            } else {
                console.log(`ℹ️  [ADB Status]: ${stderr || err.message}`);
            }
        }
    });
}

async function startServer() {
    let isConnected = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!isConnected && attempts < maxAttempts) {
        attempts++;
        try {
            console.log(`🔄 Connecting to MongoDB Atlas (Attempt ${attempts}/${maxAttempts})...`);
            await connectDB();
            isConnected = true;
        } catch (error) {
            console.error(`❌ MongoDB connection attempt ${attempts} failed:`, error.message);
            if (attempts < maxAttempts) {
                console.log("⏳ Retrying connection in 2 seconds...");
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }

    // Listen on all network interfaces (0.0.0.0)
    app.listen(PORT, "0.0.0.0", () => {
        const localIps = getLocalIpAddresses();
        console.log("\n=======================================================");
        console.log(`🚀 FitSync Backend Server is RUNNING on PORT ${PORT}`);
        console.log(`📡 Database Status: ${isConnected ? "Connected (Atlas)" : "Degraded (Offline)"}`);
        console.log("=======================================================");
        console.log(`💻 Local Machine:       http://localhost:${PORT}`);
        console.log(`📱 Android Emulator:    http://10.0.2.2:${PORT}`);
        localIps.forEach(ip => {
            console.log(`🌐 Physical Device (Wi-Fi LAN): http://${ip.address}:${PORT} (${ip.name})`);
        });
        console.log(`🔌 Physical Device (USB Cable): http://localhost:${PORT} (via adb reverse)`);
        console.log("=======================================================\n");

        // Attempt ADB reverse
        setupAdbReverse(PORT);
    });
}

startServer();