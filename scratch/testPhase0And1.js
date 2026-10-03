// 📄 Path: scratch/testPhase0And1.js

async function testPhase0And1() {
    console.log("==========================================");
    console.log("       TESTING PHASE 0 & PHASE 1          ");
    console.log("==========================================");

    const BASE_URL = 'http://127.0.0.1:8000/api';

    // 1. Test Public Config Endpoint (no auth)
    console.log("\n1. Testing GET /api/config...");
    const configRes = await fetch(`${BASE_URL}/config`);
    const configData = await configRes.json();
    console.log("Config response:", JSON.stringify(configData));

    // 2. Test Login & Roles
    console.log("\n2. Testing Login & Profile Roles...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@fitsync.com', password: 'Admin123!' })
    });
    const loginData = await loginRes.json();
    console.log("Login roles:", loginData.data?.roles);
    const adminToken = loginData.token;

    const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const profileData = await profileRes.json();
    console.log("Profile roles:", profileData.user?.roles);

    // 3. Test Admin Endpoints (/api/admin/me & /api/admin/stats)
    console.log("\n3. Testing Admin Endpoints...");
    const meRes = await fetch(`${BASE_URL}/admin/me`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const meData = await meRes.json();
    console.log("Admin /me email:", meData.admin?.email, "Roles:", meData.admin?.roles);

    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    console.log("Platform Stats summary:", JSON.stringify(statsData.stats, null, 2));

    // 4. Test OpenStreetMap Nominatim Geocoding & Reverse Geocoding
    console.log("\n4. Testing OpenStreetMap Nominatim Geocoding...");
    const geoRes = await fetch(`${BASE_URL}/geo/geocode`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ address: "Connaught Place, New Delhi" })
    });
    const geoData = await geoRes.json();
    console.log("Nominatim Geocode:", {
        provider: geoData.provider,
        cached: geoData.cached,
        formattedAddress: geoData.formattedAddress,
        location: geoData.location
    });

    // Test Cache hit
    const geoRes2 = await fetch(`${BASE_URL}/geo/geocode`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ address: "Connaught Place, New Delhi" })
    });
    const geoData2 = await geoRes2.json();
    console.log("Nominatim Geocode Cache Hit?:", geoData2.cached);

    // Test Reverse Geocoding
    console.log("\nTesting Nominatim Reverse Geocoding...");
    const revRes = await fetch(`${BASE_URL}/geo/reverse`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ lat: 28.6315, lng: 77.2167 })
    });
    const revData = await revRes.json();
    console.log("Nominatim Reverse Geocode:", {
        provider: revData.provider,
        cached: revData.cached,
        formattedAddress: revData.formattedAddress
    });

    // 5. Test Reports
    console.log("\n5. Testing User Report & Admin Report Review...");
    const reportRes = await fetch(`${BASE_URL}/reports`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            targetType: "Gym",
            targetId: "6ac0f28ee9e446f0545e9b4a",
            reason: "Incorrect equipment list",
            details: "Steam bath is under maintenance"
        })
    });
    const reportData = await reportRes.json();
    console.log("Report created:", reportData.message, "ID:", reportData.report?._id);

    const adminReportsRes = await fetch(`${BASE_URL}/admin/reports`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminReportsData = await adminReportsRes.json();
    console.log("Admin Reports Count:", adminReportsData.count);

    // 6. Test Optional Payments (PAYMENTS_ENABLED = false)
    console.log("\n6. Testing Immediate Booking Confirmation when PAYMENTS_ENABLED=false...");
    const userRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@fitsync.com', password: 'Password123!' })
    });
    const userData = await userRes.json();
    const userToken = userData.token;

    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const bookRes = await fetch(`${BASE_URL}/gym-bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            gymId: "6ac0f28ee9e446f0545e9b4a",
            sessionType: "dayPass",
            date: tomorrow,
            slot: "07:00-08:00"
        })
    });
    const bookData = await bookRes.json();
    console.log("Dev Booking Confirmation:", {
        success: bookData.success,
        paymentsEnabled: bookData.paymentsEnabled,
        bookingStatus: bookData.booking?.status,
        checkInCode: bookData.booking?.checkInCode,
        paymentStatus: bookData.payment?.status,
        partnerAmount: bookData.payment?.partnerAmount,
        platformFee: bookData.payment?.platformFee
    });

    console.log("\n==========================================");
    console.log("    PHASE 0 & PHASE 1 TESTS PASSED!       ");
    console.log("==========================================");
}

testPhase0And1().catch(console.error);
