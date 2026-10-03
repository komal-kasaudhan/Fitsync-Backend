// 📄 Path: scratch/testAllTasks.js
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');

const Exercise = require('../src/models/Exercise');
const User = require('../src/models/user.model');
const WorkoutPlan = require('../src/models/WorkoutPlan');

async function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, raw: data });
                }
            });
        });

        req.on('error', (err) => reject(err));

        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function run() {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB.");

    // 1. Proof of exercise count in database
    console.log("\n=======================================================");
    console.log("📊 PROOF 1: EXERCISE COUNTS IN DB BY CATEGORY");
    console.log("=======================================================");
    const mainCount = await Exercise.countDocuments({ category: 'main' });
    const warmupCount = await Exercise.countDocuments({ category: 'warmup' });
    const cooldownCount = await Exercise.countDocuments({ category: 'cooldown' });
    const totalCount = await Exercise.countDocuments({});

    console.log(`- Main Exercises:     ${mainCount} (Target: 60-70+)`);
    console.log(`- Warm-up Exercises:  ${warmupCount} (Target: 15+)`);
    console.log(`- Cool-down Exercises:${cooldownCount} (Target: 15+)`);
    console.log(`- Total in DB:        ${totalCount}`);

    // 2. Fetch a user to generate a valid JWT token
    const testUser = await User.findOne({});
    if (!testUser) {
        console.error("❌ No user found in database!");
        process.exit(1);
    }
    const token = jwt.sign(
        { id: testUser._id.toString(), email: testUser.email },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "7d" }
    );
    console.log(`\n🔑 Using Test User: ${testUser.name || testUser.email} (ID: ${testUser._id})`);

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 3. TASK 0 & 2: Generate Workout Plan and Get Current Plan
    console.log("\n=======================================================");
    console.log("🏋️ TASK 0 & 2: GENERATE AND GET CURRENT PLAN");
    console.log("=======================================================");

    console.log("Calling POST /api/workout/plan/generate...");
    const genRes = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: '/api/workout/plan/generate',
        method: 'POST',
        headers: authHeaders
    }, { goal: "Muscle Gain", level: "intermediate", daysPerWeek: 5 });

    console.log(`Response Status: ${genRes.statusCode}`);
    if (genRes.data?.plan) {
        console.log(`Plan generated! Total Routines: ${genRes.data.plan.routines?.length}`);
    }

    console.log("\nCalling GET /api/workout/plan/current...");
    const curRes = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: '/api/workout/plan/current',
        method: 'GET',
        headers: authHeaders
    });

    console.log(`GET /workout/plan/current Status: ${curRes.statusCode}`);
    const plan = curRes.data?.plan;
    if (plan && plan.routines) {
        console.log(`Total Days Returned: ${plan.routines.length} (Must be 7)`);
        plan.routines.forEach((r, idx) => {
            console.log(`  Day ${r.dayIndex} (${r.dayName}): Focus='${r.focus}', isRest=${r.isRestDay}, Warmups=${r.warmup?.length || 0}, Main=${r.exercises?.length || 0}, Cooldown=${r.cooldown?.length || 0}, Duration=${r.durationMin}m, EstCalories=${r.estimatedCalories}kcal, Equipment=[${(r.requiredEquipment || []).join(', ')}]`);
        });
    }

    // 4. TASK 3: Workout Detail & Feedback Endpoints
    console.log("\n=======================================================");
    console.log("📅 TASK 3: WORKOUT DETAIL (/api/workout/day/0 and /today)");
    console.log("=======================================================");

    console.log("Calling GET /api/workout/day/0...");
    const dayRes = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: '/api/workout/day/0',
        method: 'GET',
        headers: authHeaders
    });
    console.log(`GET /api/workout/day/0 Status: ${dayRes.statusCode}`);
    console.log(`Keys returned: ${Object.keys(dayRes.data).join(', ')}`);
    console.log(`Day Focus: ${dayRes.data.focus}, Warmups: ${dayRes.data.warmup?.length}, Main: ${dayRes.data.exercises?.length}, Cooldowns: ${dayRes.data.cooldown?.length}`);

    console.log("\nCalling GET /api/workout/today...");
    const todayRes = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: '/api/workout/today',
        method: 'GET',
        headers: authHeaders
    });
    console.log(`GET /api/workout/today Status: ${todayRes.statusCode}`);
    console.log(`Today DayName: ${todayRes.data.dayName}, isToday: ${todayRes.data.isToday}`);

    console.log("\nCalling POST /api/workout/session/feedback...");
    const feedbackRes = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: '/api/workout/session/feedback',
        method: 'POST',
        headers: authHeaders
    }, {
        dayIndex: 0,
        difficulty: "just_right",
        soreness: "mild",
        energy: "high",
        painAreas: ["shoulder"],
        notes: "Solid workout, feeling pump"
    });
    console.log(`POST /session/feedback Status: ${feedbackRes.statusCode}`, feedbackRes.data);

    // 5. TASK 4: Equipment endpoints (Fixed Shape)
    console.log("\n=======================================================");
    console.log("🛠️ TASK 4: EQUIPMENT ENDPOINTS (CONSISTENT ENVELOPE)");
    console.log("=======================================================");

    console.log("Calling GET /api/equipment/master...");
    const eqMasterRes = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: '/api/equipment/master',
        method: 'GET',
        headers: authHeaders
    });
    console.log(`GET /equipment/master Status: ${eqMasterRes.statusCode}`);
    console.log(`Master equipment JSON snippet:`, JSON.stringify(eqMasterRes.data).slice(0, 200) + "...");

    console.log("\nCalling GET /api/user/equipment...");
    const eqUserRes = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: '/api/user/equipment',
        method: 'GET',
        headers: authHeaders
    });
    console.log(`GET /user/equipment Status: ${eqUserRes.statusCode}`, eqUserRes.data);

    console.log("\nCalling PUT /api/user/equipment...");
    const eqPutRes = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: '/api/user/equipment',
        method: 'PUT',
        headers: authHeaders
    }, { equipment: ["dumbbell", "bench", "resistance_band"] });
    console.log(`PUT /user/equipment Status: ${eqPutRes.statusCode}`, eqPutRes.data);

    // 6. TASK 5: AI Insight from Yesterday's Feedback
    console.log("\n=======================================================");
    console.log("💡 TASK 5: AI NUTRITION INSIGHT");
    console.log("=======================================================");

    console.log("Calling GET /api/nutrition/insight?date=2026-10-02...");
    const insightRes = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: '/api/nutrition/insight?date=2026-10-02',
        method: 'GET',
        headers: authHeaders
    });
    console.log(`GET /nutrition/insight Status: ${insightRes.statusCode}`, insightRes.data);

    // 7. TASK 1: Admin Image Update & Static URL
    console.log("\n=======================================================");
    console.log("🖼️ TASK 1: ADMIN IMAGE UPDATE");
    console.log("=======================================================");
    const sampleEx = await Exercise.findOne({ category: 'main' });
    if (sampleEx) {
        console.log(`Updating image for exercise id: ${sampleEx.id}...`);
        const imgRes = await makeRequest({
            hostname: 'localhost',
            port: 8000,
            path: `/api/admin/exercises/${sampleEx.id}/image`,
            method: 'PUT',
            headers: authHeaders
        }, { imageUrl: `https://images.unsplash.com/sample-${sampleEx.id}.jpg` });
        console.log(`PUT /admin/exercises/:id/image Status: ${imgRes.statusCode}`, imgRes.data);
    }

    console.log("\n=======================================================");
    console.log("🎉 ALL AUTOMATED TESTS COMPLETED!");
    console.log("=======================================================");

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => {
    console.error("❌ Test script error:", err);
    process.exit(1);
});
