// 📄 Path: seedTrainers.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/user.model');
const TrainerProfile = require('./src/models/TrainerProfile');

const SAMPLE_TRAINERS = [
    // --- BOKARO (4) ---
    {
        name: "Vikramaditya Singh",
        email: "vikram.trainer@fitsync.com",
        type: "trainer",
        bio: "Former state powerlifting champion specializing in strength conditioning, hypertrophy, and posture correction.",
        specialties: ["muscle_building", "powerlifting", "rehab"],
        experienceYears: 7,
        languages: ["Hindi", "English"],
        mode: "both",
        city: "Bokaro",
        location: { type: "Point", coordinates: [86.1511, 23.6693] },
        pricing: { online: 500, offline: 800 },
        ratingAvg: 4.9,
        ratingCount: 32,
        isFeatured: true
    },
    {
        name: "Pooja Keshri",
        email: "pooja.nutri@fitsync.com",
        type: "nutritionist",
        bio: "Certified clinical nutritionist focused on PCOD/PCOS reversal, diabetic meal planning, and sustainable fat loss.",
        specialties: ["clinical_nutrition", "weight_loss", "pcod_reversal"],
        experienceYears: 5,
        languages: ["Hindi", "English"],
        mode: "online",
        city: "Bokaro",
        location: { type: "Point", coordinates: [86.1600, 23.6540] },
        pricing: { online: 600, offline: 0 },
        ratingAvg: 4.8,
        ratingCount: 28,
        isFeatured: false
    },
    {
        name: "Rohit Mahto",
        email: "rohit.fitness@fitsync.com",
        type: "trainer",
        bio: "High-intensity functional training coach with expertise in athletic conditioning and fat loss bootcamp.",
        specialties: ["weight_loss", "calisthenics", "hiit"],
        experienceYears: 4,
        languages: ["Hindi", "English"],
        mode: "both",
        city: "Bokaro",
        location: { type: "Point", coordinates: [86.1770, 23.6360] },
        pricing: { online: 450, offline: 700 },
        ratingAvg: 4.7,
        ratingCount: 19,
        isFeatured: false
    },
    {
        name: "Dr. Ananya Roy",
        email: "ananya.sports@fitsync.com",
        type: "both",
        bio: "Sports dietitian and strength coach assisting marathon runners and competitive athletes with macro planning.",
        specialties: ["sports_nutrition", "endurance", "muscle_building"],
        experienceYears: 8,
        languages: ["English", "Hindi", "Bengali"],
        mode: "both",
        city: "Bokaro",
        location: { type: "Point", coordinates: [86.1150, 23.6850] },
        pricing: { online: 750, offline: 1200 },
        ratingAvg: 5.0,
        ratingCount: 45,
        isFeatured: true
    },

    // --- RANCHI (4) ---
    {
        name: "Sameer Akhtar",
        email: "sameer.coach@fitsync.com",
        type: "trainer",
        bio: "Certified personal trainer with ACE credentials, dedicated to senior fitness, joint mobility, and bodybuilding.",
        specialties: ["muscle_building", "mobility", "posture_correction"],
        experienceYears: 6,
        languages: ["Hindi", "English", "Urdu"],
        mode: "both",
        city: "Ranchi",
        location: { type: "Point", coordinates: [85.3340, 23.3640] },
        pricing: { online: 550, offline: 900 },
        ratingAvg: 4.8,
        ratingCount: 27,
        isFeatured: true
    },
    {
        name: "Neha Sharma",
        email: "neha.dietitian@fitsync.com",
        type: "nutritionist",
        bio: "Holistic gut health specialist helping clients overcome IBS, bloating, and food intolerances through clean Indian diets.",
        specialties: ["gut_health", "weight_loss", "clinical_nutrition"],
        experienceYears: 6,
        languages: ["Hindi", "English"],
        mode: "online",
        city: "Ranchi",
        location: { type: "Point", coordinates: [85.3280, 23.3320] },
        pricing: { online: 650, offline: 0 },
        ratingAvg: 4.9,
        ratingCount: 36,
        isFeatured: false
    },
    {
        name: "Karan Verma",
        email: "karan.yoga@fitsync.com",
        type: "trainer",
        bio: "Traditional Hatha and Ashtanga yoga guru specializing in flexibility, pranayama breathwork, and mental relaxation.",
        specialties: ["yoga", "flexibility", "stress_relief"],
        experienceYears: 10,
        languages: ["Hindi", "English"],
        mode: "both",
        city: "Ranchi",
        location: { type: "Point", coordinates: [85.3190, 23.3950] },
        pricing: { online: 400, offline: 750 },
        ratingAvg: 4.9,
        ratingCount: 50,
        isFeatured: false
    },
    {
        name: "Sneha Tigga",
        email: "sneha.hybrid@fitsync.com",
        type: "both",
        bio: "Weight management and body transformation coach offering customized workout regimens and macro targets.",
        specialties: ["weight_loss", "muscle_building", "sports_nutrition"],
        experienceYears: 5,
        languages: ["Hindi", "English"],
        mode: "both",
        city: "Ranchi",
        location: { type: "Point", coordinates: [85.3050, 23.3510] },
        pricing: { online: 600, offline: 1000 },
        ratingAvg: 4.6,
        ratingCount: 21,
        isFeatured: false
    },

    // --- DELHI (4) ---
    {
        name: "Arjun Oberoi",
        email: "arjun.elite@fitsync.com",
        type: "trainer",
        bio: "Celebrity strength coach in South Delhi. Specializes in rapid transformations, hyper-targeted hypertrophy, and aesthetics.",
        specialties: ["muscle_building", "celebrity_fitness", "bodybuilding"],
        experienceYears: 9,
        languages: ["English", "Hindi"],
        mode: "both",
        city: "Delhi",
        location: { type: "Point", coordinates: [77.2167, 28.6315] },
        pricing: { online: 1000, offline: 2000 },
        ratingAvg: 5.0,
        ratingCount: 68,
        isFeatured: true
    },
    {
        name: "Ritika Malhotra",
        email: "ritika.clinical@fitsync.com",
        type: "nutritionist",
        bio: "Masters in Food & Nutrition with 8+ years clinical experience in thyroid, hormonal balance, and postpartum weight management.",
        specialties: ["clinical_nutrition", "postpartum", "thyroid_management"],
        experienceYears: 8,
        languages: ["English", "Hindi", "Punjabi"],
        mode: "online",
        city: "Delhi",
        location: { type: "Point", coordinates: [77.1900, 28.6520] },
        pricing: { online: 900, offline: 0 },
        ratingAvg: 4.9,
        ratingCount: 54,
        isFeatured: true
    },
    {
        name: "Devendra Rawat",
        email: "devendra.calisthenics@fitsync.com",
        type: "trainer",
        bio: "Gymnastics and bodyweight mastery coach. Learn handstands, muscle-ups, and core strength safely.",
        specialties: ["calisthenics", "mobility", "core_strength"],
        experienceYears: 5,
        languages: ["Hindi", "English"],
        mode: "both",
        city: "Delhi",
        location: { type: "Point", coordinates: [77.2300, 28.6505] },
        pricing: { online: 600, offline: 1100 },
        ratingAvg: 4.7,
        ratingCount: 23,
        isFeatured: false
    },
    {
        name: "Tanya Kapoor",
        email: "tanya.wellness@fitsync.com",
        type: "both",
        bio: "Certified fitness trainer and integrative nutrition health coach creating balanced lifestyle blueprints.",
        specialties: ["weight_loss", "wellness", "clinical_nutrition"],
        experienceYears: 7,
        languages: ["English", "Hindi"],
        mode: "both",
        city: "Delhi",
        location: { type: "Point", coordinates: [77.2001, 28.5494] },
        pricing: { online: 800, offline: 1500 },
        ratingAvg: 4.8,
        ratingCount: 39,
        isFeatured: false
    }
];

const DEFAULT_WEEKLY = [
    { day: "Monday", slots: ["07:00-08:00", "08:00-09:00", "17:00-18:00", "18:00-19:00"], isDayOff: false },
    { day: "Tuesday", slots: ["07:00-08:00", "08:00-09:00", "17:00-18:00", "18:00-19:00"], isDayOff: false },
    { day: "Wednesday", slots: ["07:00-08:00", "08:00-09:00", "17:00-18:00", "18:00-19:00"], isDayOff: false },
    { day: "Thursday", slots: ["07:00-08:00", "08:00-09:00", "17:00-18:00", "18:00-19:00"], isDayOff: false },
    { day: "Friday", slots: ["07:00-08:00", "08:00-09:00", "17:00-18:00", "18:00-19:00"], isDayOff: false },
    { day: "Saturday", slots: ["08:00-09:00", "09:00-10:00", "16:00-17:00"], isDayOff: false },
    { day: "Sunday", slots: [], isDayOff: true }
];

async function seedTrainers() {
    try {
        console.log("Connecting to MongoDB for Trainer seed...");
        await connectDB();

        console.log(`Seeding ${SAMPLE_TRAINERS.length} trainers & nutritionists...`);
        const hashedPassword = await bcrypt.hash("Trainer123!", 10);

        for (const data of SAMPLE_TRAINERS) {
            // 1. Create or find user account
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create({
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    roles: ["user", "trainer"],
                    onboardingCompleted: true
                });
            } else {
                if (!user.roles.includes("trainer")) {
                    user.roles.push("trainer");
                    await user.save();
                }
            }

            // 2. Upsert TrainerProfile
            await TrainerProfile.findOneAndUpdate(
                { userId: user._id },
                {
                    userId: user._id,
                    type: data.type,
                    bio: data.bio,
                    specialties: data.specialties,
                    certifications: [`https://fitsync.com/certs/${data.name.toLowerCase().replace(/\s+/g, '_')}_cert.pdf`],
                    experienceYears: data.experienceYears,
                    languages: data.languages,
                    mode: data.mode,
                    city: data.city,
                    location: data.location,
                    serviceRadiusKm: 15,
                    pricing: {
                        sessionOnline: data.pricing.online,
                        sessionOffline: data.pricing.offline,
                        online: data.pricing.online,
                        offline: data.pricing.offline,
                        packages: [
                            { name: "5 Sessions Starter Pack", sessions: 5, sessionsCount: 5, price: Math.round(data.pricing.online * 4.5), validityDays: 30, description: "5 personalized sessions" },
                            { name: "12 Sessions Transformation", sessions: 12, sessionsCount: 12, price: Math.round(data.pricing.online * 10), validityDays: 60, description: "Comprehensive coaching" }
                        ]
                    },
                    weeklyAvailability: DEFAULT_WEEKLY,
                    status: "approved", // approved so they show in searches
                    ratingAvg: data.ratingAvg,
                    ratingCount: data.ratingCount,
                    isFeatured: data.isFeatured
                },
                { upsert: true, new: true }
            );
        }

        // Ensure 2dsphere index on location
        await TrainerProfile.collection.createIndex({ location: "2dsphere" });
        console.log("✅ 2dsphere index ensured on TrainerProfile location");

        const count = await TrainerProfile.countDocuments({ status: "approved" });
        console.log(`✅ Successfully seeded ${count} approved Trainer & Nutritionist profiles!`);

        await mongoose.disconnect();
        console.log("✅ Database disconnected. Seed complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seedTrainers();
