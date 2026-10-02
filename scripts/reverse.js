const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function findAdb() {
    // 1. Try 'adb' directly
    try {
        execSync("adb version", { stdio: "ignore" });
        return { cmd: "adb", foundInPath: true };
    } catch {
        // Not in PATH
    }

    // 2. Search common Android SDK locations
    const localAppData = process.env.LOCALAPPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, "AppData", "Local") : "");
    const possiblePaths = [
        path.join(localAppData, "Android", "Sdk", "platform-tools", "adb.exe"),
        path.join("C:", "Android", "platform-tools", "adb.exe"),
        path.join("C:", "platform-tools", "adb.exe")
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            return { cmd: `"${p}"`, foundInPath: false, exactPath: p };
        }
    }

    return null;
}

const adbResult = findAdb();

if (!adbResult) {
    console.error("\n❌ [ADB Error] 'adb' was not found in system PATH or Android SDK directory.");
    console.error("👉 How to fix: Add Android platform-tools to your PATH:");
    console.error("   1. Locate your Android SDK platform-tools folder (typically %LOCALAPPDATA%\\Android\\Sdk\\platform-tools)");
    console.error("   2. Open Windows Environment Variables -> Edit User 'Path' -> Add that folder.");
    console.error("   3. Restart your terminal.\n");
    process.exit(1);
}

if (!adbResult.foundInPath) {
    console.log(`ℹ️  [ADB] 'adb' was not found in PATH, using detected SDK path: ${adbResult.exactPath}`);
    console.log(`   👉 Tip: Add %LOCALAPPDATA%\\Android\\Sdk\\platform-tools to your Windows PATH for global access.\n`);
}

try {
    const out = execSync(`${adbResult.cmd} reverse tcp:8000 tcp:8000`, { encoding: "utf8" });
    console.log("📱 [ADB Reverse] Port 8000 successfully forwarded to connected physical Android device!");
    console.log("   -> Phone can connect via: http://localhost:8000/api/");
    if (out && out.trim()) console.log("   " + out.trim());
} catch (err) {
    const msg = (err.stderr || err.message || "").toLowerCase();
    if (msg.includes("no devices") || msg.includes("device not found")) {
        console.log("ℹ️  [ADB] No USB devices connected (harmless if testing over Wi-Fi LAN).");
    } else {
        console.error("⚠️  [ADB Reverse Warning]:", err.message);
    }
}
