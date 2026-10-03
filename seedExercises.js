// 📄 Path: seedExercises.js
require('dotenv').config();
const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const connectDB = require('./src/config/db');
const Exercise = require('./src/models/Exercise');
const exercisesData = require('./src/data/seedExercisesData');

async function seedExercises() {
    try {
        console.log("🔄 Connecting to MongoDB to seed exercises from data/exercises/...");
        await connectDB();

        console.log("🧹 Cleaning legacy exercises without slug id...");
        await Exercise.deleteMany({ id: { $exists: false } });

        console.log(`📦 Found ${exercisesData.length} exercises in data/exercises/. Upserting by slug id...`);

        let upsertedCount = 0;
        for (const ex of exercisesData) {
            await Exercise.findOneAndUpdate(
                { $or: [{ id: ex.id }, { name: ex.name }] },
                {
                    $set: {
                        ...ex,
                        id: ex.id,
                        targetArea: ex.primaryMuscle,
                        primaryTarget: ex.primaryMuscle,
                        secondaryTarget: ex.secondaryMuscles?.[0] || "",
                        coachTips: ex.coachTips || ex.tips || [],
                        tips: ex.tips || ex.coachTips || [],
                        stepsList: ex.instructions || [],
                        mistakesList: ex.commonMistakes || []
                    }
                },
                { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
            );
            upsertedCount++;
        }

        console.log(`✅ Successfully upserted ${upsertedCount} exercises into MongoDB!`);

        // Print category breakdown
        const mainCount = await Exercise.countDocuments({ category: 'main' });
        const warmupCount = await Exercise.countDocuments({ category: 'warmup' });
        const cooldownCount = await Exercise.countDocuments({ category: 'cooldown' });
        console.log(`📊 Breakdown in DB: Main: ${mainCount}, Warm-up: ${warmupCount}, Cool-down: ${cooldownCount}, Total: ${mainCount + warmupCount + cooldownCount}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to seed exercises:", error);
        process.exit(1);
    }
}

seedExercises();
