require("dotenv").config();
const dns = require("dns");
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const os = require("os");
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
        }
        console.log("=======================================================\n");
    });

    // Server/request timeout of at least 90 seconds so AI calls do not drop
    server.setTimeout(90000);
    server.keepAliveTimeout = 95000;
    server.headersTimeout = 96000;
}

startServer();