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

// Helper to get physical Wi-Fi/Ethernet LAN IPv4 address, filtering out virtual adapters
function getPhysicalLanAddress() {
    const interfaces = os.networkInterfaces();
    const virtualFilter = /(virtualbox|vmware|vbox|wsl|hyper-v|vethernet|docker|loopback|pseudo|tunnel|tap|teredo)/i;
    const candidates = [];

    for (const [name, ifaceList] of Object.entries(interfaces)) {
        if (virtualFilter.test(name)) continue;
        for (const iface of ifaceList) {
            // Must be IPv4, non-internal, and not APIPA (169.254.x.x)
            if (iface.family === "IPv4" && !iface.internal && !iface.address.startsWith("169.254.")) {
                candidates.push({ name, address: iface.address });
            }
        }
    }

    // Prioritize Wi-Fi/WLAN first, then Ethernet
    candidates.sort((a, b) => {
        const aIsWifi = /wi-fi|wifi|wlan/i.test(a.name);
        const bIsWifi = /wi-fi|wifi|wlan/i.test(b.name);
        if (aIsWifi && !bIsWifi) return -1;
        if (!aIsWifi && bIsWifi) return 1;
        const aIsEth = /ethernet|eth/i.test(a.name);
        const bIsEth = /ethernet|eth/i.test(b.name);
        if (aIsEth && !bIsEth) return -1;
        if (!aIsEth && bIsEth) return 1;
        return 0;
    });

    return candidates[0] || null;
}

// Find ADB executable path or report if missing
function getAdbInfo() {
    const localAppData = process.env.LOCALAPPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, "AppData", "Local") : "");
    const possiblePaths = [
        path.join(localAppData, "Android", "Sdk", "platform-tools", "adb.exe"),
        path.join("C:", "Android", "platform-tools", "adb.exe"),
        path.join("C:", "platform-tools", "adb.exe")
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            return { path: `"${p}"`, inPath: true };
        }
    }
    return { path: "adb", inPath: false };
}

// Automatically setup and keep alive ADB reverse port forwarding for USB-connected Android physical devices
let adbActive = false;
let adbReportedNoDevice = false;

function setupAdbReverse(port) {
    const adbInfo = getAdbInfo();
    const cmd = `${adbInfo.path} reverse tcp:${port} tcp:${port}`;
    exec(cmd, (err, stdout, stderr) => {
        if (!err) {
            if (!adbActive) {
                console.log(`📱 [ADB Reverse] Port ${port} forwarded to connected physical Android device!`);
                console.log(`   -> USB phone base URL: http://localhost:${port}/api/`);
                adbActive = true;
                adbReportedNoDevice = false;
            }
        } else {
            adbActive = false;
            const rawMsg = (stderr || err.message || "").toLowerCase();
            if (rawMsg.includes("no devices") || rawMsg.includes("device not found")) {
                if (!adbReportedNoDevice) {
                    console.log(`ℹ️  [ADB] No USB devices connected (harmless if testing over Wi-Fi LAN).`);
                    adbReportedNoDevice = true;
                }
            } else if (rawMsg.includes("not recognized") || rawMsg.includes("not found") || rawMsg.includes("enoent")) {
                console.log(`ℹ️  [ADB] 'adb' was not found in your system PATH.`);
                console.log(`   👉 How to fix: Add Android platform-tools to PATH:`);
                console.log(`      %LOCALAPPDATA%\\Android\\Sdk\\platform-tools`);
            } else {
                console.log(`ℹ️  [ADB Info]: ${(stderr || err.message).trim()}`);
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

    // Listen on all network interfaces (0.0.0.0) with PORT from .env (default 8000)
    const server = app.listen(PORT, "0.0.0.0", () => {
        const lanInfo = getPhysicalLanAddress();
        console.log("\n=======================================================");
        console.log(`🚀 FitSync Backend Server is RUNNING on PORT ${PORT}`);
        console.log(`📡 Database Status: ${isConnected ? "Connected (Atlas)" : "Degraded (Offline)"}`);
        console.log("=======================================================");
        if (lanInfo) {
            console.log(`🌐 Physical Device (Wi-Fi LAN): http://${lanInfo.address}:${PORT}`);
        } else {
            console.log(`🌐 Physical Device (Wi-Fi LAN): No active Wi-Fi adapter detected`);
        }
        console.log(`🔌 Physical Device (USB Mode):   http://localhost:${PORT} (needs adb reverse)`);
        console.log("=======================================================\n");

        // Maintain ADB reverse for USB devices automatically
        setupAdbReverse(PORT);
        setInterval(() => setupAdbReverse(PORT), 4000);
    });

    // Server/request timeout of at least 90 seconds so AI calls do not drop
    server.setTimeout(90000);
    server.keepAliveTimeout = 95000;
    server.headersTimeout = 96000;
}

startServer();