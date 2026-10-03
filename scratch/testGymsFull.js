// 📄 Path: scratch/testGymsFull.js
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:8000/api';

async function runTests() {
    console.log("=================================================");
    console.log("   FitSync Gyms & Booking Feature Test Suite     ");
    console.log("=================================================");

    // 1. Authenticate users
    console.log("\n1. Authenticating Users...");
    
    // User 1: Regular User / Member
    const userRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@fitsync.com', password: 'Password123!' })
    });
    let userData = await userRes.json();
    if (!userData.token) {
        // Register if not existing
        const regRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: "Regular Member", email: 'user@fitsync.com', password: 'Password123!' })
        });
        userData = await regRes.json();
    }
    const userToken = userData.token;
    console.log("✅ Member Authenticated");

    // User 2: Gym Owner
    const ownerRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'gymowner@fitsync.com', password: 'Password123!' })
    });
    const ownerData = await ownerRes.json();
    const ownerToken = ownerData.token;
    console.log("✅ Gym Owner Authenticated");

    // User 3: Admin
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@fitsync.com', password: 'Admin123!' })
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.token;
    console.log("✅ Admin Authenticated");

    // 2. Test Nearby Gyms with Distance Filter (3 km vs 8 km with radius 5)
    console.log("\n2. Testing Nearby Gyms with Distance Filter...");
    // Bokaro Sector 4 coordinates: lat 23.6693, lng 86.1511
    // Radius 5 km
    const nearby5Res = await fetch(`${BASE_URL}/gyms/nearby?lat=23.6693&lng=86.1511&radiusKm=5`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const nearby5 = await nearby5Res.json();
    console.log(`Radius 5 km returned ${nearby5.count} gym(s):`);
    nearby5.gyms.forEach(g => console.log(`   - ${g.name} (${g.distanceKm} km away)`));

    const titanIn5 = nearby5.gyms.find(g => g.name.includes("Titan Heavyweights"));
    console.log(`Titan Heavyweights (~8.8 km) in 5km radius? ${titanIn5 ? "YES (FAIL)" : "NO (PASS - EXCLUDED)"}`);

    // Radius 10 km
    const nearby10Res = await fetch(`${BASE_URL}/gyms/nearby?lat=23.6693&lng=86.1511&radiusKm=10`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const nearby10 = await nearby10Res.json();
    console.log(`\nRadius 10 km returned ${nearby10.count} gym(s):`);
    nearby10.gyms.forEach(g => console.log(`   - ${g.name} (${g.distanceKm} km away)`));
    const titanIn10 = nearby10.gyms.find(g => g.name.includes("Titan Heavyweights"));
    console.log(`Titan Heavyweights (~8.8 km) in 10km radius? ${titanIn10 ? "YES (PASS - INCLUDED)" : "NO (FAIL)"}`);

    // 3. Test Gym Slots
    const targetGym = nearby5.gyms[0];
    console.log(`\n3. Fetching Slots for '${targetGym.name}'...`);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const slotsRes = await fetch(`${BASE_URL}/gyms/${targetGym._id}/slots?date=${tomorrow}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const slotsData = await slotsRes.json();
    console.log(`Available slots for date ${slotsData.date} (${slotsData.day}): ${slotsData.slots.length} slots generated`);
    console.log(`Sample Slot:`, JSON.stringify(slotsData.slots[0]));

    // 4. Test Booking Creation
    console.log("\n4. Creating Gym Booking...");
    const bookRes = await fetch(`${BASE_URL}/gym-bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            gymId: targetGym._id,
            sessionType: 'dayPass',
            date: tomorrow,
            slot: slotsData.slots[0].slot
        })
    });
    const bookData = await bookRes.json();
    console.log("Booking created response:", JSON.stringify(bookData, null, 2));

    const bookingId = bookData.booking._id;
    const checkInCode = bookData.booking.checkInCode;

    // 5. Test Payment Verification
    console.log("\n5. Verifying Razorpay Payment...");
    const verifyRes = await fetch(`${BASE_URL}/gym-bookings/${bookingId}/verify-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            razorpay_order_id: bookData.razorpayOrder.orderId,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: "test_verified_signature"
        })
    });
    const verifyData = await verifyRes.json();
    console.log("Payment verification response:", JSON.stringify(verifyData, null, 2));

    // 6. Test Review Requirement: User CANNOT review if session is not attended
    console.log("\n6. Testing Review Protection (Session not attended yet)...");
    const unauthReviewRes = await fetch(`${BASE_URL}/gyms/${targetGym._id}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            rating: 5,
            comment: "Trying to review before attending"
        })
    });
    console.log(`Status: ${unauthReviewRes.status}`);
    const unauthReviewData = await unauthReviewRes.json();
    console.log("Response:", JSON.stringify(unauthReviewData));

    // 7. Gym Owner Check-In with 6-digit Code
    console.log(`\n7. Gym Owner Checking In Code '${checkInCode}'...`);
    const checkInRes = await fetch(`${BASE_URL}/gyms/${targetGym._id}/check-in`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ownerToken}`
        },
        body: JSON.stringify({ checkInCode })
    });
    const checkInData = await checkInRes.json();
    console.log("Check-in response:", JSON.stringify(checkInData, null, 2));

    // 8. Test Review Submission (NOW ATTENDED)
    console.log("\n8. Testing Review Submission (Session is now attended)...");
    const reviewRes = await fetch(`${BASE_URL}/gyms/${targetGym._id}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            rating: 5,
            comment: "Phenomenal facility! Clean, top tier equipment, highly recommended!"
        })
    });
    const reviewData = await reviewRes.json();
    console.log("Review submission response:", JSON.stringify(reviewData, null, 2));

    // 9. Owner Earnings & Bookings List
    console.log("\n9. Fetching Owner Earnings Summary...");
    const earningsRes = await fetch(`${BASE_URL}/gyms/${targetGym._id}/earnings`, {
        headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const earningsData = await earningsRes.json();
    console.log("Earnings summary:", JSON.stringify(earningsData, null, 2));

    // 10. Cancellation & Refund Rules
    console.log("\n10. Testing Booking Cancellation & Settings-driven Refund...");
    // Create another booking far in advance (> 12 hours)
    const futureDate = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
    const book2Res = await fetch(`${BASE_URL}/gym-bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            gymId: targetGym._id,
            sessionType: 'dayPass',
            date: futureDate,
            slot: "10:00-11:00"
        })
    });
    const book2Data = await book2Res.json();
    // Confirm payment for booking 2
    await fetch(`${BASE_URL}/gym-bookings/${book2Data.booking._id}/verify-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            razorpay_order_id: book2Data.razorpayOrder.orderId,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: "test_sig"
        })
    });

    // Cancel booking 2 (>12h before slot)
    const cancelRes = await fetch(`${BASE_URL}/gym-bookings/${book2Data.booking._id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const cancelData = await cancelRes.json();
    console.log("Cancellation response (>12h before slot):", JSON.stringify(cancelData, null, 2));

    // 11. Admin Endpoints: Settings & Gym Approval
    console.log("\n11. Testing Admin Endpoints...");
    // Non-admin user tries to access admin settings -> 403
    const forbiddenRes = await fetch(`${BASE_URL}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    console.log(`Member access to /api/admin/settings status: ${forbiddenRes.status} (Expected 403)`);

    // Admin accesses settings
    const adminSettingsRes = await fetch(`${BASE_URL}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminSettings = await adminSettingsRes.json();
    console.log("Admin Settings:", JSON.stringify(adminSettings, null, 2));

    // Create a new pending gym
    console.log("\nRegistering new gym (pending approval)...");
    const newGymRes = await fetch(`${BASE_URL}/gyms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ownerToken}`
        },
        body: JSON.stringify({
            name: "Phoenix Fitness Lounge",
            description: "New upcoming boutique gym",
            address: "Main Road, Sector 3",
            city: "Bokaro",
            pincode: "827003",
            location: { type: "Point", coordinates: [86.1450, 23.6720] },
            phone: "+91 99999 88888",
            sessionTypes: [{ type: "dayPass", name: "Day Pass", price: 200 }],
            openingHours: [{ day: "Monday", open: "06:00", close: "22:00", isClosed: false }]
        })
    });
    const newGymData = await newGymRes.json();
    const newGymId = newGymData.gym._id;
    console.log(`Created gym ${newGymId} with status: ${newGymData.gym.status}`);

    // Admin lists pending gyms
    const pendingRes = await fetch(`${BASE_URL}/admin/gyms/pending`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const pendingData = await pendingRes.json();
    console.log(`Admin pending gyms count: ${pendingData.count}`);

    // Admin approves gym
    const approveRes = await fetch(`${BASE_URL}/admin/gyms/${newGymId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: "approved" })
    });
    const approveData = await approveRes.json();
    console.log("Admin approval response:", JSON.stringify(approveData, null, 2));

    // 12. Geocoding
    console.log("\n12. Testing Geocoding Endpoint...");
    const geoRes = await fetch(`${BASE_URL}/geo/geocode`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ address: "City Center, Sector 4, Bokaro" })
    });
    const geoData = await geoRes.json();
    console.log("Geocoding response:", JSON.stringify(geoData, null, 2));

    // 13. Notifications
    console.log("\n13. Fetching User Notifications...");
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const notifData = await notifRes.json();
    console.log(`User Notifications count: ${notifData.count} (Unread: ${notifData.unreadCount})`);
    console.log("Latest notification:", JSON.stringify(notifData.notifications[0], null, 2));

    console.log("\n=================================================");
    console.log("       ALL INTEGRATION TESTS COMPLETED!          ");
    console.log("=================================================");
}

runTests().catch(err => {
    console.error("❌ Test suite encountered error:", err);
    process.exit(1);
});
