// 📄 Path: scratch/reliabilityCheck.js
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');

const User = require('../src/models/user.model');

function makeRequest(options, postData = null) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                const duration = Date.now() - start;
                let parsed;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    parsed = data;
                }
                resolve({
                    statusCode: res.statusCode,
                    duration,
                    data: parsed
                });
            });
        });

        req.on('error', (err) => {
            const duration = Date.now() - start;
            reject({ error: err.message, duration });
        });

        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function run() {
    console.log("🔍 Connecting to DB for test user token...");
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({});
    if (!user) {
        console.error("No user in DB");
        process.exit(1);
    }

    const token = jwt.sign(
        { id: user._id.toString(), email: user.email },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "7d" }
    );
    await mongoose.disconnect();

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log(`\n=======================================================`);
    console.log(`🚀 RELIABILITY TEST (3 Consecutive Calls Per Endpoint)`);
    console.log(`=======================================================\n`);

    const endpointsToTest = [
        { name: "Health Check", method: "GET", path: "/api/health", headers: {} },
        { name: "Current Workout Plan", method: "GET", path: "/api/workout/plan/current", headers },
        { name: "Workout Day 0 (Monday)", method: "GET", path: "/api/workout/day/0", headers },
        { name: "Workout Day 1 (Tuesday)", method: "GET", path: "/api/workout/day/1", headers },
        { name: "Workout Day 2 (Wednesday)", method: "GET", path: "/api/workout/day/2", headers },
        { name: "Workout Day 3 (Thursday)", method: "GET", path: "/api/workout/day/3", headers },
        { name: "Workout Day 4 (Friday)", method: "GET", path: "/api/workout/day/4", headers },
        { name: "Workout Day 5 (Saturday)", method: "GET", path: "/api/workout/day/5", headers },
        { name: "Workout Day 6 (Sunday)", method: "GET", path: "/api/workout/day/6", headers },
        { name: "Today Workout", method: "GET", path: "/api/workout/today", headers },
        { name: "Workout Stats", method: "GET", path: "/api/workout/stats", headers },
        { name: "Master Equipment", method: "GET", path: "/api/equipment/master", headers },
        { name: "User Equipment", method: "GET", path: "/api/user/equipment", headers },
        { name: "Weekly Nutrition", method: "GET", path: "/api/nutrition/weekly", headers },
        { name: "Nutrition Insight", method: "GET", path: "/api/nutrition/insight", headers },
        { name: "Nutrition Recommendations", method: "GET", path: "/api/nutrition/recommendations", headers },
        { name: "Targets Overview", method: "GET", path: "/api/targets/overview", headers },
        { name: "Home Summary (Single-Call)", method: "GET", path: "/api/home/summary", headers },
        {
            name: "Food Scan (Non-food / No image)",
            method: "POST",
            path: "/api/nutrition/scan",
            headers,
            body: { imageBase64: "" }
        },
        {
            name: "Food Scan (Sample Food Image)",
            method: "POST",
            path: "/api/nutrition/scan",
            headers,
            // 1x1 transparent png base64 for vision fallback test
            body: { imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" }
        }
    ];

    const results = [];

    for (const ep of endpointsToTest) {
        console.log(`\n--- Testing ${ep.name}: [${ep.method} ${ep.path}] ---`);
        const callResults = [];

        for (let i = 1; i <= 3; i++) {
            try {
                const res = await makeRequest({
                    hostname: 'localhost',
                    port: 8000,
                    path: ep.path,
                    method: ep.method,
                    headers: ep.headers
                }, ep.body);

                callResults.push(res);
                console.log(`  Call #${i}: HTTP ${res.statusCode} | Duration: ${res.duration}ms | Type: ${Array.isArray(res.data) ? 'Array [' + res.data.length + ']' : typeof res.data}`);
            } catch (err) {
                console.error(`  Call #${i}: FAILED - ${err.error} (${err.duration}ms)`);
                callResults.push({ statusCode: 500, duration: err.duration, error: err.error });
            }
        }

        // Shape consistency check
        const firstType = Array.isArray(callResults[0]?.data) ? 'array' : typeof callResults[0]?.data;
        const allSameType = callResults.every(c => (Array.isArray(c.data) ? 'array' : typeof c.data) === firstType);
        const maxDuration = Math.max(...callResults.map(c => c.duration || 0));
        const all200 = callResults.every(c => c.statusCode === 200);

        results.push({
            name: ep.name,
            path: ep.path,
            all200,
            allSameType,
            type: firstType,
            maxDuration,
            sampleData: callResults[0]?.data
        });
    }

    console.log("\n=======================================================");
    console.log("📊 RELIABILITY REPORT SUMMARY");
    console.log("=======================================================");

    let anySlow = false;
    let anyFailed = false;
    let anyInconsistent = false;

    results.forEach(r => {
        const slowBadge = r.maxDuration > 5000 ? "⚠️ SLOW (>5s)" : "⚡ FAST";
        const statusBadge = r.all200 ? "✅ 200 OK" : "❌ FAIL";
        const shapeBadge = r.allSameType ? `✅ STABLE (${r.type})` : "❌ INCONSISTENT";

        if (r.maxDuration > 5000) anySlow = true;
        if (!r.all200) anyFailed = true;
        if (!r.allSameType) anyInconsistent = true;

        console.log(`[${statusBadge}] [${shapeBadge}] [${slowBadge}: max ${r.maxDuration}ms] - ${r.path}`);
    });

    console.log("\nOverall Health:");
    console.log(`- Failures: ${anyFailed ? "YES (INVESTIGATE)" : "NONE (100% Passed)"}`);
    console.log(`- Shape Inconsistencies: ${anyInconsistent ? "YES (INVESTIGATE)" : "NONE (Consistent)"}`);
    console.log(`- Slow (>5s): ${anySlow ? "YES (Check AI caching)" : "NONE (Under 5s)"}`);

    process.exit(0);
}

run().catch(err => {
    console.error("Test runner error:", err);
    process.exit(1);
});
