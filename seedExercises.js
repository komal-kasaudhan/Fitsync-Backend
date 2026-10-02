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
        console.log("🔄 Connecting to MongoDB to seed exercises...");
        await connectDB();

        console.log("🧹 Clearing old Exercise collection...");
        await Exercise.deleteMany({});

        // Map backward compatibility fields
        const formatted = exercisesData.map(ex => ({
            ...ex,
            targetArea: ex.primaryMuscle,
            primaryTarget: ex.primaryMuscle,
            secondaryTarget: ex.secondaryMuscles?.[0] || "",
            coachTips: ex.tips || [],
            stepsList: ex.instructions || []
        }));

        const inserted = await Exercise.insertMany(formatted);
        console.log(`✅ Successfully seeded ${inserted.length} comprehensive exercises into MongoDB!`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to seed exercises:", error);
        process.exit(1);
    }
}

seedExercises();
