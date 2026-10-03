// 📄 Path: scratch/testPhase2.js

async function testPhase2() {
    console.log("==========================================");
    console.log("     TESTING PHASE 2: TRAINERS            ");
    console.log("==========================================");

    const BASE_URL = 'http://127.0.0.1:8000/api';

    // 1. Authenticate user and trainer
    const userRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@fitsync.com', password: 'Password123!' })
    });
    const userToken = (await userRes.json()).token;

    const trainerRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'arjun.elite@fitsync.com', password: 'Trainer123!' })
    });
    const trainerToken = (await trainerRes.json()).token;

    // 2. Discover Trainers & Nutritionists with disclaimer check
    console.log("\n1. Listing Nutritionists (checking disclaimer)...");
    const nutriRes = await fetch(`${BASE_URL}/trainers?type=nutritionist`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const nutriData = await nutriRes.json();
    console.log(`Found ${nutriData.count} nutritionists.`);
    console.log("Disclaimer included?", Boolean(nutriData.disclaimer));
    console.log("Sample Nutritionist:", nutriData.trainers[0]?.name, "-", nutriData.trainers[0]?.specialties);

    // 3. Nearby Trainers
    console.log("\n2. Nearby Trainers in Delhi (lat: 28.6315, lng: 77.2167)...");
    const nearbyRes = await fetch(`${BASE_URL}/trainers/nearby?lat=28.6315&lng=77.2167&radiusKm=15`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const nearbyData = await nearbyRes.json();
    console.log(`Found ${nearbyData.count} nearby trainers in Delhi:`);
    nearbyData.trainers.forEach(t => console.log(`   - ${t.name} (${t.distanceKm} km away)`));

    const selectedTrainer = nearbyData.trainers[0];
    const trainerId = selectedTrainer._id;

    // 4. Slots check
    console.log(`\n3. Fetching Slots for '${selectedTrainer.name}'...`);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const slotsRes = await fetch(`${BASE_URL}/trainers/${trainerId}/slots?date=${tomorrow}&mode=online`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const slotsData = await slotsRes.json();
    console.log(`Available slots for date ${slotsData.date}: ${slotsData.slots.length} slots generated`);
    const availableSlot = slotsData.slots.find(s => s.available);
    console.log("Selected slot:", availableSlot?.slot);

    // 5. Book Session (Atomic lock + Jitsi meeting link)
    console.log("\n4. Booking Online Session...");
    const bookRes = await fetch(`${BASE_URL}/trainer-bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            trainerId,
            date: tomorrow,
            slot: availableSlot.slot,
            mode: "online"
        })
    });
    const bookData = await bookRes.json();
    console.log("Booking created:", {
        status: bookData.booking?.status,
        meetingLink: bookData.booking?.meetingLink,
        checkInCode: bookData.booking?.checkInCode
    });
    const bookingId = bookData.booking._id;

    // 6. Test Double-booking prevention (Atomic lock)
    console.log("\n5. Testing Atomic Slot Lock (Attempting same slot)...");
    const conflictRes = await fetch(`${BASE_URL}/trainer-bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            trainerId,
            date: tomorrow,
            slot: availableSlot.slot,
            mode: "online"
        })
    });
    console.log(`Conflict attempt status: ${conflictRes.status} (Expected 409)`);

    // 7. Reschedule Session once
    console.log("\n6. Testing Session Reschedule...");
    const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    const reschedRes = await fetch(`${BASE_URL}/trainer-bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            newDate: dayAfter,
            newSlot: "17:00-18:00"
        })
    });
    const reschedData = await reschedRes.json();
    console.log("Reschedule response:", reschedData.message, "New Date:", reschedData.booking?.date, "Slot:", reschedData.booking?.slot);

    // 8. Complete Session (Trainer marks completed)
    console.log("\n7. Trainer Marking Session Completed...");
    const completeRes = await fetch(`${BASE_URL}/trainer-bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${trainerToken}` }
    });
    const completeData = await completeRes.json();
    console.log("Complete response:", completeData.message);

    // 9. Client Submits Review
    console.log("\n8. Client Submitting Review for Completed Session...");
    const reviewRes = await fetch(`${BASE_URL}/trainers/${trainerId}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            rating: 5,
            comment: "Exceptional training session! Very clear instructions on form and hypertrophy."
        })
    });
    const reviewData = await reviewRes.json();
    console.log("Review response:", reviewData.message, "Updated Trainer Rating:", reviewData.trainerRating);

    console.log("\n==========================================");
    console.log("       PHASE 2 TESTS COMPLETED!           ");
    console.log("==========================================");
}

testPhase2().catch(console.error);
