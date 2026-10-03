// 📄 Path: seedGyms.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');
const Gym = require('./src/models/Gym');
const Settings = require('./src/models/Settings');

const DEFAULT_HOURS = [
    { day: "Monday", open: "06:00", close: "22:00", isClosed: false },
    { day: "Tuesday", open: "06:00", close: "22:00", isClosed: false },
    { day: "Wednesday", open: "06:00", close: "22:00", isClosed: false },
    { day: "Thursday", open: "06:00", close: "22:00", isClosed: false },
    { day: "Friday", open: "06:00", close: "22:00", isClosed: false },
    { day: "Saturday", open: "07:00", close: "21:00", isClosed: false },
    { day: "Sunday", open: "08:00", close: "18:00", isClosed: false }
];

const GYM_DATA = [
    // ---------------- BOKARO (5 Gyms) ----------------
    {
        name: "Iron Paradise Gym - City Center",
        description: "Premier fitness center in Bokaro featuring top-of-the-line strength machines, powerlifting platforms, and certified trainers.",
        address: "Plot 12, City Center, Sector 4",
        city: "Bokaro",
        pincode: "827004",
        phone: "+91 98351 11001",
        location: { type: "Point", coordinates: [86.1511, 23.6693] }, // Sector 4 center
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "steam_bath", "wifi"],
        capacityPerSlot: 25,
        ratingAvg: 4.8,
        ratingCount: 38,
        sessionTypes: [
            { type: "dayPass", name: "Single Day Workout", price: 200, description: "Full day pass with access to all gym equipment" },
            { type: "weekly", name: "Weekly Training Pass", price: 900, description: "7-day unlimited access" },
            { type: "monthly", name: "Monthly Elite Membership", price: 2500, description: "Full monthly pass including locker and steam" }
        ],
        photos: ["/uploads/gym_bokaro_1.jpg"]
    },
    {
        name: "Steel City Fitness Club",
        description: "High-energy training hub near Sector 1 with dedicated cardio deck, free weights section, and crossfit turf.",
        address: "Shopping Complex, Sector 1 Market",
        city: "Bokaro",
        pincode: "827001",
        phone: "+91 98351 11002",
        location: { type: "Point", coordinates: [86.1600, 23.6540] }, // ~2.0 km from Sec 4
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "wifi"],
        capacityPerSlot: 20,
        ratingAvg: 4.6,
        ratingCount: 24,
        sessionTypes: [
            { type: "dayPass", name: "Day Pass", price: 150, description: "1-day gym access" },
            { type: "weekly", name: "Weekly Pass", price: 750, description: "7-day access" },
            { type: "monthly", name: "Monthly Pass", price: 2000, description: "Standard monthly access" }
        ],
        photos: ["/uploads/gym_bokaro_2.jpg"]
    },
    {
        name: "Gold Standard Gym Chas",
        description: "Spacious multi-floor gym in Chas with modern selectorized machines and separate aerobics studio.",
        address: "Main Road, Near Bypass Chowk, Chas",
        city: "Bokaro",
        pincode: "827013",
        phone: "+91 98351 11003",
        location: { type: "Point", coordinates: [86.1770, 23.6360] }, // ~4.5 km from Sec 4
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "wifi"],
        capacityPerSlot: 25,
        ratingAvg: 4.5,
        ratingCount: 19,
        sessionTypes: [
            { type: "dayPass", name: "Day Pass", price: 180, description: "Full day access" },
            { type: "weekly", name: "Weekly Flex Pass", price: 850, description: "7-day pass" },
            { type: "monthly", name: "Monthly Strength", price: 2200, description: "Monthly gym pass" }
        ],
        photos: ["/uploads/gym_bokaro_3.jpg"]
    },
    {
        name: "FitZone Pro Sector 9",
        description: "Community-driven gym offering functional training, heavy barbells, and group HIIT classes.",
        address: "Street 15, Sector 9/B",
        city: "Bokaro",
        pincode: "827009",
        phone: "+91 98351 11004",
        location: { type: "Point", coordinates: [86.1150, 23.6850] }, // ~4.1 km from Sec 4
        amenities: ["cardio", "weights", "lockers", "parking"],
        capacityPerSlot: 18,
        ratingAvg: 4.4,
        ratingCount: 15,
        sessionTypes: [
            { type: "dayPass", name: "Day Pass", price: 140, description: "Access for 1 day" },
            { type: "weekly", name: "Weekly Pass", price: 700, description: "One week pass" },
            { type: "monthly", name: "Monthly Pass", price: 1800, description: "Monthly access" }
        ],
        photos: ["/uploads/gym_bokaro_4.jpg"]
    },
    {
        name: "Titan Heavyweights Gym Outer Chas",
        description: "Hardcore bodybuilding and powerlifting facility located on the Chas outskirts with calibrated plates and monolift.",
        address: "NH-32 Outer Bypass, Chas Outskirts",
        city: "Bokaro",
        pincode: "827013",
        phone: "+91 98351 11005",
        location: { type: "Point", coordinates: [86.2050, 23.6050] }, // ~8.8 km from Sec 4 (Ideal >5km filter test)
        amenities: ["weights", "parking", "shower"],
        capacityPerSlot: 20,
        ratingAvg: 4.7,
        ratingCount: 31,
        sessionTypes: [
            { type: "dayPass", name: "Heavy Lifter Day Pass", price: 250, description: "Full access to heavy lifting equipment" },
            { type: "weekly", name: "Weekly Power Pass", price: 1000, description: "7-day access" },
            { type: "monthly", name: "Monthly Iron Pass", price: 2600, description: "Full month pass" }
        ],
        photos: ["/uploads/gym_bokaro_5.jpg"]
    },

    // ---------------- RANCHI (5 Gyms) ----------------
    {
        name: "Ranchi Muscle Forge",
        description: "Top-tier health and fitness club in the heart of Lalpur with modern machines and nutrition bar.",
        address: "Circular Road, Lalpur",
        city: "Ranchi",
        pincode: "834001",
        phone: "+91 94311 22001",
        location: { type: "Point", coordinates: [85.3340, 23.3640] }, // Lalpur center
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "steam_bath", "wifi"],
        capacityPerSlot: 30,
        ratingAvg: 4.9,
        ratingCount: 52,
        sessionTypes: [
            { type: "dayPass", name: "Day Workout", price: 250, description: "1-day full access" },
            { type: "weekly", name: "Weekly Pass", price: 1100, description: "7-day access" },
            { type: "monthly", name: "Monthly Unlimited", price: 3000, description: "30-day premium membership" }
        ],
        photos: ["/uploads/gym_ranchi_1.jpg"]
    },
    {
        name: "Capital Fitness Arena Doranda",
        description: "Modern gym in Doranda featuring functional training zones, dumbbells up to 50kg, and certified personal trainers.",
        address: "AG Colony Gate, Doranda",
        city: "Ranchi",
        pincode: "834002",
        phone: "+91 94311 22002",
        location: { type: "Point", coordinates: [85.3280, 23.3320] }, // ~3.5 km from Lalpur
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "wifi"],
        capacityPerSlot: 22,
        ratingAvg: 4.7,
        ratingCount: 29,
        sessionTypes: [
            { type: "dayPass", name: "Day Pass", price: 200, description: "Day pass" },
            { type: "weekly", name: "Weekly Training", price: 950, description: "7 days access" },
            { type: "monthly", name: "Monthly Plan", price: 2400, description: "Monthly gym plan" }
        ],
        photos: ["/uploads/gym_ranchi_2.jpg"]
    },
    {
        name: "Oxygen Gym & Wellness Kanke",
        description: "Luxury wellness and gym destination on Kanke Road with steam room, sauna, and premium cardio gear.",
        address: "Near Rock Garden, Kanke Road",
        city: "Ranchi",
        pincode: "834008",
        phone: "+91 94311 22003",
        location: { type: "Point", coordinates: [85.3190, 23.3950] }, // ~4.0 km from Lalpur
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "steam_bath", "wifi"],
        capacityPerSlot: 25,
        ratingAvg: 4.8,
        ratingCount: 41,
        sessionTypes: [
            { type: "dayPass", name: "Wellness Day Pass", price: 300, description: "Gym + Steam/Sauna pass" },
            { type: "weekly", name: "Weekly Wellness", price: 1300, description: "1 week pass" },
            { type: "monthly", name: "Monthly VIP", price: 3500, description: "Full VIP month access" }
        ],
        photos: ["/uploads/gym_ranchi_3.jpg"]
    },
    {
        name: "PowerHouse Gym Harmu",
        description: "Energetic strength hub in Harmu Housing Colony equipped with Olympic barbells, squat racks, and cross-trainer machines.",
        address: "Harmu Bypass Road, Harmu",
        city: "Ranchi",
        pincode: "834012",
        phone: "+91 94311 22004",
        location: { type: "Point", coordinates: [85.3050, 23.3510] }, // ~3.2 km from Lalpur
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "wifi"],
        capacityPerSlot: 20,
        ratingAvg: 4.5,
        ratingCount: 18,
        sessionTypes: [
            { type: "dayPass", name: "Power Day Pass", price: 180, description: "Full day pass" },
            { type: "weekly", name: "Weekly Power", price: 800, description: "7 days access" },
            { type: "monthly", name: "Monthly Strength", price: 2100, description: "Standard month" }
        ],
        photos: ["/uploads/gym_ranchi_4.jpg"]
    },
    {
        name: "Apex Crossfit Hatia",
        description: "Expansive crossfit box and strength arena near Hatia station with climbing ropes, sled tracks, and rowers.",
        address: "Station Road, Hatia",
        city: "Ranchi",
        pincode: "834003",
        phone: "+91 94311 22005",
        location: { type: "Point", coordinates: [85.2950, 23.2980] }, // ~8.2 km from Lalpur (>5km test)
        amenities: ["weights", "lockers", "parking", "shower"],
        capacityPerSlot: 20,
        ratingAvg: 4.6,
        ratingCount: 22,
        sessionTypes: [
            { type: "dayPass", name: "Crossfit Day", price: 220, description: "1-day pass" },
            { type: "weekly", name: "Weekly WOD Pass", price: 990, description: "7-day crossfit" },
            { type: "monthly", name: "Monthly Athlete", price: 2700, description: "Monthly full access" }
        ],
        photos: ["/uploads/gym_ranchi_5.jpg"]
    },

    // ---------------- DELHI (5 Gyms) ----------------
    {
        name: "Empire Fitness Connaught Place",
        description: "State-of-the-art flagship fitness club in Inner Circle CP featuring Technogym equipment and biometric access.",
        address: "Block B, Inner Circle, Connaught Place",
        city: "Delhi",
        pincode: "110001",
        phone: "+91 98111 33001",
        location: { type: "Point", coordinates: [77.2167, 28.6315] }, // CP center
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "steam_bath", "wifi"],
        capacityPerSlot: 30,
        ratingAvg: 4.9,
        ratingCount: 65,
        sessionTypes: [
            { type: "dayPass", name: "Day Pass Central", price: 350, description: "Full day pass with towel and locker" },
            { type: "weekly", name: "Weekly Executive", price: 1500, description: "7-day executive workout pass" },
            { type: "monthly", name: "Monthly Premium", price: 4000, description: "Full month pass" }
        ],
        photos: ["/uploads/gym_delhi_1.jpg"]
    },
    {
        name: "Metro Flex Karol Bagh",
        description: "Popular gym in central West Delhi with heavy bodybuilding gear, spinning bikes, and crossfit rigs.",
        address: "Pusa Road, Near Karol Bagh Metro",
        city: "Delhi",
        pincode: "110005",
        phone: "+91 98111 33002",
        location: { type: "Point", coordinates: [77.1900, 28.6520] }, // ~3.5 km from CP
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "wifi"],
        capacityPerSlot: 25,
        ratingAvg: 4.7,
        ratingCount: 37,
        sessionTypes: [
            { type: "dayPass", name: "Day Pass", price: 250, description: "1-day gym pass" },
            { type: "weekly", name: "Weekly Flex", price: 1100, description: "7-day pass" },
            { type: "monthly", name: "Monthly Flex", price: 2800, description: "Standard month" }
        ],
        photos: ["/uploads/gym_delhi_2.jpg"]
    },
    {
        name: "Raw Fitness Old Delhi",
        description: "Energetic strength gym near Chandni Chowk with free weights and functional movement areas.",
        address: "Near Town Hall, Chandni Chowk",
        city: "Delhi",
        pincode: "110006",
        phone: "+91 98111 33003",
        location: { type: "Point", coordinates: [77.2300, 28.6505] }, // ~2.5 km from CP
        amenities: ["ac", "weights", "cardio", "lockers"],
        capacityPerSlot: 18,
        ratingAvg: 4.4,
        ratingCount: 16,
        sessionTypes: [
            { type: "dayPass", name: "Day Workout", price: 180, description: "Single session pass" },
            { type: "weekly", name: "Weekly Pass", price: 800, description: "7 days" },
            { type: "monthly", name: "Monthly Pass", price: 2000, description: "Monthly pass" }
        ],
        photos: ["/uploads/gym_delhi_3.jpg"]
    },
    {
        name: "South Delhi Strength Co Lajpat Nagar",
        description: "Upscale strength conditioning gym in South Delhi with turf tracks, bumper plates, and recovery zones.",
        address: "Ring Road, Lajpat Nagar IV",
        city: "Delhi",
        pincode: "110024",
        phone: "+91 98111 33004",
        location: { type: "Point", coordinates: [77.2400, 28.5700] }, // ~7.2 km from CP (>5km test)
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "steam_bath", "wifi"],
        capacityPerSlot: 25,
        ratingAvg: 4.8,
        ratingCount: 48,
        sessionTypes: [
            { type: "dayPass", name: "Elite Day Pass", price: 300, description: "Full day access" },
            { type: "weekly", name: "Weekly Elite", price: 1400, description: "1 week pass" },
            { type: "monthly", name: "Monthly Elite", price: 3800, description: "Monthly unlimited" }
        ],
        photos: ["/uploads/gym_delhi_4.jpg"]
    },
    {
        name: "Hauz Khas Elite Gym",
        description: "High-end fitness studio overlooking Hauz Khas Village with kettlebell training, pilates, and cardio cinema.",
        address: "Near Hauz Khas Metro, Outer Ring Road",
        city: "Delhi",
        pincode: "110016",
        phone: "+91 98111 33005",
        location: { type: "Point", coordinates: [77.2001, 28.5494] }, // ~9.3 km from CP (>5km test)
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "wifi"],
        capacityPerSlot: 22,
        ratingAvg: 4.8,
        ratingCount: 39,
        sessionTypes: [
            { type: "dayPass", name: "Studio Day Pass", price: 320, description: "Full gym access" },
            { type: "weekly", name: "Weekly Studio", price: 1450, description: "7-day access" },
            { type: "monthly", name: "Monthly Studio", price: 3600, description: "Monthly pass" }
        ],
        photos: ["/uploads/gym_delhi_5.jpg"]
    }
];

const connectDB = require('./src/config/db');

async function seedGyms() {
    try {
        console.log("Connecting to MongoDB for gym seed...");
        await connectDB();

        // Ensure default settings exist
        await Settings.getSettings();
        console.log("✅ Platform settings verified");

        // Find or create default gym owner user
        let owner = await User.findOne({ email: "gymowner@fitsync.com" });
        if (!owner) {
            const hashedPassword = await bcrypt.hash("Password123!", 10);
            owner = await User.create({
                name: "FitSync Gym Partner",
                email: "gymowner@fitsync.com",
                password: hashedPassword,
                roles: ["user", "gym_owner"],
                onboardingCompleted: true
            });
            console.log("✅ Created default gym owner user: gymowner@fitsync.com");
        } else {
            if (!owner.roles.includes("gym_owner")) {
                owner.roles.push("gym_owner");
                await owner.save();
            }
        }

        // Also ensure an admin user exists for testing
        let adminUser = await User.findOne({ email: "admin@fitsync.com" });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash("Admin123!", 10);
            adminUser = await User.create({
                name: "FitSync Administrator",
                email: "admin@fitsync.com",
                password: hashedPassword,
                roles: ["user", "admin"],
                onboardingCompleted: true
            });
            console.log("✅ Created default admin user: admin@fitsync.com");
        } else {
            if (!adminUser.roles.includes("admin")) {
                adminUser.roles.push("admin");
                await adminUser.save();
            }
        }

        console.log("Clearing previous seed gyms...");
        await Gym.deleteMany({ ownerId: owner._id });

        console.log(`Seeding ${GYM_DATA.length} gyms across Bokaro, Ranchi, and Delhi...`);

        const gymsToInsert = GYM_DATA.map(g => ({
            ...g,
            ownerId: owner._id,
            status: "approved", // Seeded gyms are approved so they appear publicly
            openingHours: DEFAULT_HOURS,
            isFeatured: false
        }));

        await Gym.insertMany(gymsToInsert);
        console.log(`✅ Successfully inserted ${gymsToInsert.length} gyms!`);

        // Ensure 2dsphere index is built
        await Gym.collection.createIndex({ location: "2dsphere" });
        console.log("✅ 2dsphere index ensured on Gym location");

        console.log("\nSummary by city:");
        const bokaroCount = await Gym.countDocuments({ city: "Bokaro" });
        const ranchiCount = await Gym.countDocuments({ city: "Ranchi" });
        const delhiCount = await Gym.countDocuments({ city: "Delhi" });
        console.log(`- Bokaro: ${bokaroCount} gyms`);
        console.log(`- Ranchi: ${ranchiCount} gyms`);
        console.log(`- Delhi:  ${delhiCount} gyms`);

        await mongoose.disconnect();
        console.log("✅ Database disconnected. Seed complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seedGyms();
