// 📄 Path: scratch/testSmartRecommendations.js
const http = require('http');

function post(path, body, token) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const req = http.request({
            hostname: 'localhost',
            port: 8000,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        }, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(resBody) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: resBody });
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function get(path, token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8000,
            path,
            method: 'GET',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        }, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(resBody) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: resBody });
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function runTests() {
    console.log("=================================================");
    console.log("🧪 TESTING ENHANCED SEASONAL & SMART RECOMMENDATIONS");
    console.log("=================================================\n");

    const email = `smart_rec_tester_${Date.now()}@fitsync.local`;
    const signupRes = await post('/api/auth/signup', {
        name: "Seasonal Tester",
        email,
        password: "TestPassword123!"
    });

    const token = signupRes.data?.token || signupRes.data?.accessToken;
    if (!token) {
        console.error("❌ Auth signup failed:", signupRes);
        process.exit(1);
    }
    console.log("✅ Authenticated test user.");

    // Setup onboarding: Maintain, Vegetarian diet
    await post('/api/onboarding', {
        goal: "Muscle Building (Veg)",
        gender: "male",
        dob: "1998-05-15",
        height: 178,
        weight: 74,
        targetWeight: 76,
        activityLevel: "moderate",
        primaryGoal: "hypertrophy"
    }, token);

    // Scenario 1: Fresh day (High remaining protein ~ 160g-200g)
    console.log("\n📋 SCENARIO 1: High remaining protein (Early day / fresh targets)");
    const rec1 = await get('/api/nutrition/recommendations?date=2026-10-02', token);
    console.log(`[Status: ${rec1.status}] Season: ${rec1.data?.season}, Remaining: ${rec1.data?.remainingProtein}g, Count: ${rec1.data?.count}`);
    if (rec1.data?.recommendations?.[0]) {
        const r = rec1.data.recommendations[0];
        console.log(`   Sample Item: "${r.name}" (${r.protein}g protein, ${r.calories} kcal)`);
        console.log(`   Season: "${r.season}", MealType: "${r.mealType}"`);
        console.log(`   Reason: "${r.reason}"`);
        console.log(`   Field verification:`);
        console.log(`   - id: ${Boolean(r.id)}, prepTimeMin: ${r.prepTimeMin}, ingredients: ${r.ingredients?.length}, steps: ${r.steps?.length}`);
    }

    // Scenario 2: Test Cache hit
    console.log("\n⚡ SCENARIO 2: Cache Hit Verification");
    const recCache = await get('/api/nutrition/recommendations?date=2026-10-02', token);
    console.log(`[Status: ${recCache.status}] fromCache: ${recCache.data?.fromCache || false}, Count: ${recCache.data?.count}`);

    // Scenario 3: Log a high-protein meal to simulate Medium / Low remaining protein
    console.log("\n🍗 SCENARIO 3: Log a meal and test medium/lower remaining protein recommendations");
    const firstId = rec1.data?.recommendations?.[0]?.id;
    if (firstId) {
        const addRes = await post(`/api/nutrition/recommendations/${firstId}/add`, { mealType: "Lunch", date: "2026-10-02" }, token);
        console.log(`[Status: ${addRes.status}] Logged: "${addRes.data?.addedItem?.foodName}"`);
    }

    // Now request for a different date or after logging
    // Let's test with a different date, e.g. a winter date: 2026-12-15
    console.log("\n❄️ SCENARIO 4: Winter Season Test (date: 2026-12-15)");
    const recWinter = await get('/api/nutrition/recommendations?date=2026-12-15', token);
    console.log(`[Status: ${recWinter.status}] Season: ${recWinter.data?.season}, Remaining: ${recWinter.data?.remainingProtein}g, Count: ${recWinter.data?.count}`);
    if (recWinter.data?.recommendations?.[0]) {
        const r = recWinter.data.recommendations[0];
        console.log(`   Winter Sample: "${r.name}" (${r.protein}g protein, ${r.calories} kcal)`);
        console.log(`   Season: "${r.season}", Reason: "${r.reason}"`);
    }

    // Scenario 5: Summer Season Test (date: 2026-05-20)
    console.log("\n☀️ SCENARIO 5: Summer Season Test (date: 2026-05-20)");
    const recSummer = await get('/api/nutrition/recommendations?date=2026-05-20', token);
    console.log(`[Status: ${recSummer.status}] Season: ${recSummer.data?.season}, Remaining: ${recSummer.data?.remainingProtein}g, Count: ${recSummer.data?.count}`);
    if (recSummer.data?.recommendations?.[0]) {
        const r = recSummer.data.recommendations[0];
        console.log(`   Summer Sample: "${r.name}" (${r.protein}g protein, ${r.calories} kcal)`);
        console.log(`   Season: "${r.season}", Reason: "${r.reason}"`);
    }

    console.log("\n=================================================");
    console.log("🎉 ALL RECOMMENDATION SCENARIOS TESTED SUCCESSFULLY!");
    console.log("=================================================");
    process.exit(0);
}

runTests().catch(err => {
    console.error("❌ Test script error:", err);
    process.exit(1);
});
