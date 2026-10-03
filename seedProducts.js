// 📄 Path: seedProducts.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/user.model');
const Seller = require('./src/models/Seller');
const Product = require('./src/models/Product');

const SAMPLE_SELLERS = [
    {
        name: "FitSync Official Store",
        email: "store@fitsync.com",
        businessName: "FitSync Retail & Nutrition LLP",
        gstin: "07AAAAA0000A1Z5",
        fssai: "10020011000456", // Valid FSSAI
        pickupAddress: {
            street: "Plot 45, Okhla Industrial Area Phase III",
            city: "New Delhi",
            state: "Delhi",
            pincode: "110020",
            phone: "+91 98110 99881"
        }
    },
    {
        name: "Steel & Iron Gear Co",
        email: "gear@fitsync.com",
        businessName: "IronForge Fitness Equipments Pvt Ltd",
        gstin: "20BBBBB1111B2Z6",
        fssai: "",
        pickupAddress: {
            street: "Sector 5 Industrial Estate",
            city: "Bokaro",
            state: "Jharkhand",
            pincode: "827005",
            phone: "+91 98350 44552"
        }
    }
];

const PRODUCTS_DATA = [
    // --- SUPPLEMENTS (7) ---
    {
        title: "Gold Standard 100% Whey Protein Isolate",
        description: "Premium microfiltered whey isolate delivering 25g ultra-pure protein per scoop with 5.5g BCAAs for optimal muscle recovery.",
        category: "supplements",
        brand: "Optimum Nutrition",
        price: 3299,
        mrp: 3999,
        stock: 50,
        variants: [{ name: "Flavor", options: ["Double Rich Chocolate", "Vanilla Ice Cream", "Mocha Cappuccino"] }],
        nutritionFacts: { protein: "25g", bcaa: "5.5g", carbs: "2g", calories: "120 kcal" },
        ingredients: ["Whey Protein Isolate", "Cocoa Powder", "Natural Flavors", "Soy Lecithin"],
        expiryDate: "2027-12-31",
        tags: ["whey", "protein", "isolate", "muscle_building"],
        ratingAvg: 4.9,
        ratingCount: 84,
        soldCount: 312,
        isFeatured: true
    },
    {
        title: "Micronized Creatine Monohydrate 250g",
        description: "100% pure pharmaceutical grade creatine monohydrate to supercharge ATP production and explosive muscle power.",
        category: "supplements",
        brand: "MuscleBlaze",
        price: 699,
        mrp: 999,
        stock: 75,
        variants: [{ name: "Size", options: ["100g", "250g", "400g"] }],
        nutritionFacts: { creatine: "3g", calories: "0 kcal" },
        ingredients: ["100% Micronized Creatine Monohydrate"],
        expiryDate: "2028-06-30",
        tags: ["creatine", "strength", "power", "unflavored"],
        ratingAvg: 4.8,
        ratingCount: 62,
        soldCount: 420
    },
    {
        title: "Plant Protein Pea & Brown Rice Blend 1kg",
        description: "100% vegan allergen-free protein providing 24g clean protein enriched with digestive enzymes and zero added sugar.",
        category: "supplements",
        brand: "Cosmix",
        price: 2199,
        mrp: 2599,
        stock: 40,
        variants: [{ name: "Flavor", options: ["Rich Cocoa", "Café Mocha"] }],
        nutritionFacts: { protein: "24g", fiber: "3g", carbs: "4g", calories: "135 kcal" },
        ingredients: ["Yellow Pea Protein Isolate", "Organic Brown Rice Protein", "Digestive Enzyme Blend"],
        expiryDate: "2027-08-31",
        tags: ["vegan", "plant_protein", "dairy_free"],
        ratingAvg: 4.7,
        ratingCount: 39,
        soldCount: 180
    },
    {
        title: "Pre-Workout Ignition High Stimulant 300g",
        description: "Intense pre-workout formula with 300mg caffeine, 3.2g Beta-Alanine, and 6g L-Citrulline for skin-splitting pumps and laser focus.",
        category: "supplements",
        brand: "Cellucor C4",
        price: 1899,
        mrp: 2399,
        stock: 35,
        variants: [{ name: "Flavor", options: ["Blue Razz", "Fruit Punch", "Green Apple"] }],
        nutritionFacts: { caffeine: "300mg", citrulline: "6000mg", betaAlanine: "3200mg" },
        ingredients: ["L-Citrulline Malate", "Beta Alanine", "Anhydrous Caffeine", "Taurine"],
        expiryDate: "2027-10-15",
        tags: ["pre_workout", "energy", "pump", "caffeine"],
        ratingAvg: 4.6,
        ratingCount: 47,
        soldCount: 210
    },
    {
        title: "BCAA 2:1:1 Intra-Workout Recovery Drink",
        description: "Instantized Branched Chain Amino Acids with added electrolytes and coconut water powder to prevent muscle fatigue during grueling workouts.",
        category: "supplements",
        brand: "Scivation Xtend",
        price: 1749,
        mrp: 2199,
        stock: 45,
        variants: [{ name: "Flavor", options: ["Watermelon", "Mango Madness"] }],
        nutritionFacts: { bcaa: "7g", electrolytes: "1140mg" },
        ingredients: ["L-Leucine", "L-Isoleucine", "L-Valine", "Electrolyte Blend"],
        expiryDate: "2027-11-20",
        tags: ["bcaa", "intra_workout", "recovery", "hydration"],
        ratingAvg: 4.8,
        ratingCount: 33,
        soldCount: 165
    },
    {
        title: "Omega-3 Triple Strength Fish Oil 1000mg (60 Softgels)",
        description: "Purified deep-sea fish oil providing 560mg EPA and 400mg DHA per softgel with enteric coating to prevent fishy aftertaste.",
        category: "supplements",
        brand: "TrueBasics",
        price: 799,
        mrp: 1199,
        stock: 90,
        variants: [{ name: "Pack", options: ["60 Capsules", "120 Capsules"] }],
        nutritionFacts: { epa: "560mg", dha: "400mg", omega3: "1000mg" },
        ingredients: ["Concentrated Fish Oil", "Gelatin", "Glycerin", "Purified Water"],
        expiryDate: "2028-03-31",
        tags: ["omega3", "fish_oil", "joint_health", "heart"],
        ratingAvg: 4.9,
        ratingCount: 71,
        soldCount: 510
    },
    {
        title: "Daily Multi-Vitamin & Mineral Sports Formula (60 Tabs)",
        description: "Comprehensive multivitamin with 45 essential nutrients, botanical extracts, and immunity boosters tailored for fitness enthusiasts.",
        category: "supplements",
        brand: "MuscleTech",
        price: 649,
        mrp: 899,
        stock: 80,
        variants: [{ name: "Pack", options: ["60 Tablets"] }],
        nutritionFacts: { vitamins: "100% RDA", minerals: "100% RDA" },
        ingredients: ["Vitamins A-Z", "Zinc", "Magnesium", "Ginseng Extract"],
        expiryDate: "2028-05-15",
        tags: ["multivitamin", "immunity", "health"],
        ratingAvg: 4.7,
        ratingCount: 42,
        soldCount: 290
    },

    // --- NUTRITION & FOOD (5) ---
    {
        title: "All-Natural High Protein Peanut Butter (Crunchy) 1kg",
        description: "100% roasted slow-ground peanuts with 30g protein per 100g. Zero hydrogenated oils, zero salt, and zero added sugar.",
        category: "nutrition_food",
        brand: "Pintola",
        price: 449,
        mrp: 549,
        stock: 60,
        variants: [{ name: "Texture", options: ["Crunchy", "Creamy"] }],
        nutritionFacts: { protein: "30g", healthyFats: "50g", carbs: "18g", calories: "625 kcal" },
        ingredients: ["100% Roasted Peanuts"],
        expiryDate: "2027-09-30",
        tags: ["peanut_butter", "healthy_fats", "clean_eating"],
        ratingAvg: 4.9,
        ratingCount: 110,
        soldCount: 780,
        isFeatured: true
    },
    {
        title: "Rolled Wholegrain Jumbo Oats 1kg",
        description: "Gluten-free premium Australian jumbo oats packed with beta-glucan soluble fiber to sustain morning energy and keep cholesterol in check.",
        category: "nutrition_food",
        brand: "True Elements",
        price: 299,
        mrp: 399,
        stock: 85,
        variants: [{ name: "Weight", options: ["1kg", "2kg"] }],
        nutritionFacts: { protein: "13g", fiber: "11g", carbs: "67g", calories: "389 kcal" },
        ingredients: ["100% Wholegrain Rolled Oats"],
        expiryDate: "2027-10-31",
        tags: ["oats", "breakfast", "fiber", "complex_carbs"],
        ratingAvg: 4.8,
        ratingCount: 54,
        soldCount: 360
    },
    {
        title: "High Protein Chocolate Energy Bars (Box of 6)",
        description: "Delicious on-the-go snack offering 20g protein per bar, packed with nuts, seeds, whey crispies, and dark chocolate chunks.",
        category: "nutrition_food",
        brand: "RiteBite Max Protein",
        price: 540,
        mrp: 660,
        stock: 50,
        variants: [{ name: "Pack", options: ["Box of 6", "Box of 12"] }],
        nutritionFacts: { protein: "20g", fiber: "5g", carbs: "22g", calories: "240 kcal" },
        ingredients: ["Protein Blend", "Dark Chocolate", "Almonds", "Oats"],
        expiryDate: "2027-06-30",
        tags: ["protein_bar", "snack", "chocolate"],
        ratingAvg: 4.6,
        ratingCount: 48,
        soldCount: 275
    },
    {
        title: "Cold-Pressed Virgin Coconut Oil 500ml",
        description: "100% raw unrefined organic coconut oil rich in Medium Chain Triglycerides (MCTs) ideal for keto diets and high-smoke cooking.",
        category: "nutrition_food",
        brand: "Nutriorg",
        price: 380,
        mrp: 450,
        stock: 40,
        variants: [{ name: "Volume", options: ["500ml", "1000ml"] }],
        nutritionFacts: { mct: "65%", healthyFats: "100%" },
        ingredients: ["100% Organic Virgin Coconut Oil"],
        expiryDate: "2028-02-28",
        tags: ["mct", "coconut_oil", "keto"],
        ratingAvg: 4.7,
        ratingCount: 26,
        soldCount: 140
    },
    {
        title: "Raw Certified Organic Chia Seeds 250g",
        description: "Superfood rich in plant omega-3 fatty acids, calcium, and dietary fiber. Ideal for smoothies, yogurt bowls, and hydration pudding.",
        category: "nutrition_food",
        brand: "Urban Platter",
        price: 249,
        mrp: 320,
        stock: 70,
        variants: [{ name: "Weight", options: ["250g", "500g"] }],
        nutritionFacts: { fiber: "34g", omega3: "17g", protein: "16g" },
        ingredients: ["100% Raw Black Chia Seeds"],
        expiryDate: "2028-01-31",
        tags: ["superfood", "chia", "fiber"],
        ratingAvg: 4.8,
        ratingCount: 38,
        soldCount: 220
    },

    // --- GYM WEAR (5) ---
    {
        title: "Dry-Fit Performance Compression T-Shirt",
        description: "4-way stretch moisture-wicking fabric that accelerates blood circulation and keeps you cool during intense lifts.",
        category: "gym_wear",
        brand: "Under Armour Style",
        price: 899,
        mrp: 1499,
        stock: 65,
        variants: [{ name: "Size", options: ["S", "M", "L", "XL"] }, { name: "Color", options: ["Stealth Black", "Navy Blue", "Army Green"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["gym_tshirt", "compression", "dry_fit"],
        ratingAvg: 4.7,
        ratingCount: 52,
        soldCount: 310
    },
    {
        title: "Pro Flex Training Shorts with Phone Pocket",
        description: "Breathable 2-in-1 shorts with supportive compression inner liner, zipper pockets, and towel holder loop.",
        category: "gym_wear",
        brand: "FitSync Athletics",
        price: 799,
        mrp: 1299,
        stock: 55,
        variants: [{ name: "Size", options: ["M", "L", "XL"] }, { name: "Color", options: ["Charcoal Grey", "Jet Black"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["shorts", "running", "training"],
        ratingAvg: 4.8,
        ratingCount: 46,
        soldCount: 260
    },
    {
        title: "High-Waisted Seamless Squat-Proof Leggings",
        description: "Non-see-through butter-soft compressive leggings designed with butt-contouring ribbed waistband for zero slip.",
        category: "gym_wear",
        brand: "Gymshark Style",
        price: 1199,
        mrp: 1899,
        stock: 45,
        variants: [{ name: "Size", options: ["XS", "S", "M", "L"] }, { name: "Color", options: ["Midnight Black", "Burgundy", "Teal"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["leggings", "women_fitness", "squat_proof"],
        ratingAvg: 4.9,
        ratingCount: 65,
        soldCount: 340,
        isFeatured: true
    },
    {
        title: "Drop Armhole Gym Stringer Vest",
        description: "Deep cut armholes for full range of motion on shoulder and back days. Ultra-breathable combed cotton blend.",
        category: "gym_wear",
        brand: "FitSync Bodybuilding",
        price: 499,
        mrp: 899,
        stock: 70,
        variants: [{ name: "Size", options: ["M", "L", "XL"] }, { name: "Color", options: ["Black", "White", "Red"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["stringer", "tank_top", "bodybuilding"],
        ratingAvg: 4.5,
        ratingCount: 31,
        soldCount: 195
    },
    {
        title: "Anti-Skid Crew Workout Socks (Pack of 3)",
        description: "Cushioned arch-support athletic socks with breathable mesh venting to eliminate moisture and blisters.",
        category: "gym_wear",
        brand: "Nike Style Fit",
        price: 399,
        mrp: 599,
        stock: 80,
        variants: [{ name: "Color", options: ["Black", "White", "Grey"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["socks", "cushioned", "training"],
        ratingAvg: 4.6,
        ratingCount: 29,
        soldCount: 180
    },

    // --- ACCESSORIES (5) ---
    {
        title: "Heavy Duty Padded Lifting Straps (Pair)",
        description: "Industrial strength cotton canvas with thick neoprene wrist padding to maximize grip endurance on heavy deadlifts and shrugs.",
        category: "accessories",
        brand: "Harbinger",
        price: 399,
        mrp: 699,
        stock: 100,
        variants: [{ name: "Color", options: ["All Black", "Camo"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["lifting_straps", "deadlift", "grip"],
        ratingAvg: 4.9,
        ratingCount: 78,
        soldCount: 610
    },
    {
        title: "10mm Lever Buckle Leather Weightlifting Belt",
        description: "Top-grain genuine cowhide powerlifting belt with quick-release steel lever buckle for maximum intra-abdominal pressure.",
        category: "accessories",
        brand: "SBD Style Heavy",
        price: 2499,
        mrp: 3499,
        stock: 30,
        variants: [{ name: "Size", options: ["M (28-34)", "L (34-38)", "XL (38-44)"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["weightlifting_belt", "powerlifting", "lever_belt"],
        ratingAvg: 5.0,
        ratingCount: 41,
        soldCount: 175,
        isFeatured: true
    },
    {
        title: "Elastic Heavy Wrist Wraps with Thumb Loop (18 inch)",
        description: "Competition-grade elastic wrist wraps providing rock-solid stability during heavy overhead presses and bench presses.",
        category: "accessories",
        brand: "FitSync Pro",
        price: 349,
        mrp: 599,
        stock: 85,
        variants: [{ name: "Color", options: ["Black/Red", "Black/White"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["wrist_wraps", "bench_press", "support"],
        ratingAvg: 4.7,
        ratingCount: 39,
        soldCount: 240
    },
    {
        title: "7mm Neoprene Compression Knee Sleeves (Pair)",
        description: "Contoured anatomical fit knee sleeves for superior warmth, compression, and patellar tendon protection on heavy squat sessions.",
        category: "accessories",
        brand: "Rehob Style",
        price: 1299,
        mrp: 1899,
        stock: 40,
        variants: [{ name: "Size", options: ["S", "M", "L", "XL"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["knee_sleeves", "squats", "rehab"],
        ratingAvg: 4.8,
        ratingCount: 36,
        soldCount: 190
    },
    {
        title: "Gym Chalk Block 100% Magnesium Carbonate (56g)",
        description: "Zero-dust sweat-resistant grip chalk providing dry, friction-packed hold on barbells, gymnastics rings, and kettlebells.",
        category: "accessories",
        brand: "Camp Chalk",
        price: 199,
        mrp: 299,
        stock: 90,
        variants: [],
        ingredients: [],
        expiryDate: "",
        tags: ["gym_chalk", "grip", "powerlifting"],
        ratingAvg: 4.8,
        ratingCount: 22,
        soldCount: 150
    },

    // --- EQUIPMENT (4) ---
    {
        title: "Latex Resistance Bands Set with Handles & Door Anchor",
        description: "Complete home gym stack of 5 stackable resistance tubes ranging from 10 lbs to 50 lbs with ankle straps and carry bag.",
        category: "equipment",
        brand: "Boldfit",
        price: 999,
        mrp: 1599,
        stock: 45,
        variants: [],
        ingredients: [],
        expiryDate: "",
        tags: ["resistance_bands", "home_workout", "rehab"],
        ratingAvg: 4.7,
        ratingCount: 56,
        soldCount: 320
    },
    {
        title: "High-Density Foam Roller with Trigger Point Grid 45cm",
        description: "Multi-density EVA foam roller engineered for deep-tissue myofascial release, soothing sore muscles, and accelerating recovery.",
        category: "equipment",
        brand: "TriggerPoint Style",
        price: 799,
        mrp: 1299,
        stock: 50,
        variants: [{ name: "Color", options: ["Electric Blue", "Matte Black", "Orange"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["foam_roller", "recovery", "mobility"],
        ratingAvg: 4.8,
        ratingCount: 43,
        soldCount: 215
    },
    {
        title: "High-Speed Steel Cable Jump Rope with Ball Bearings",
        description: "Tangle-free 360-degree ball bearing speed rope with adjustable lightweight aluminum handles for double-unders and cardio burn.",
        category: "equipment",
        brand: "FitSync Speed",
        price: 399,
        mrp: 699,
        stock: 75,
        variants: [{ name: "Color", options: ["Black", "Red", "Silver"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["jump_rope", "cardio", "boxing"],
        ratingAvg: 4.6,
        ratingCount: 37,
        soldCount: 280
    },
    {
        title: "Cast Iron Kettlebell with Wide Ergonomic Handle 16kg",
        description: "Solid cast-iron bell with no welds, machined flat bottom for easy storage, and powder-coated finish for optimal grip retention.",
        category: "equipment",
        brand: "IronForge",
        price: 2699,
        mrp: 3499,
        stock: 25,
        variants: [{ name: "Weight", options: ["12kg", "16kg", "20kg"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["kettlebell", "strength", "crossfit"],
        ratingAvg: 4.9,
        ratingCount: 28,
        soldCount: 110,
        isFeatured: true
    },

    // --- BOTTLES & SHAKERS (4) ---
    {
        title: "Pro 28oz Leakproof Blender Shaker Bottle with Wire Whisk",
        description: "BPA-free phthalate-free shaker featuring surgical-grade stainless steel BlenderBall wire whisk for lump-free protein shakes.",
        category: "bottles_shakers",
        brand: "BlenderBottle Classic",
        price: 499,
        mrp: 799,
        stock: 80,
        variants: [{ name: "Color", options: ["Onyx Black", "Ocean Blue", "Coral Pink"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["shaker", "blender_bottle", "protein_shake"],
        ratingAvg: 4.9,
        ratingCount: 88,
        soldCount: 540
    },
    {
        title: "Stainless Steel Double-Wall Vacuum Insulated Shaker 750ml",
        description: "Keeps protein shakes ice cold for 24 hours. Odor-resistant food-grade stainless steel with leak-proof flip cap.",
        category: "bottles_shakers",
        brand: "IceShaker Style",
        price: 1199,
        mrp: 1699,
        stock: 35,
        variants: [{ name: "Color", options: ["Brushed Steel", "Matte Black"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["insulated_shaker", "stainless_steel", "cold_beverage"],
        ratingAvg: 4.8,
        ratingCount: 34,
        soldCount: 160
    },
    {
        title: "Daily Motivational Half-Gallon Water Jug 2.2L",
        description: "Large 2200ml capacity jug with hourly time markers and motivational quotes to effortlessly hit your daily hydration targets.",
        category: "bottles_shakers",
        brand: "HydraCoach",
        price: 599,
        mrp: 899,
        stock: 60,
        variants: [{ name: "Color", options: ["Gradient Purple/Cyan", "Smoky Grey"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["water_bottle", "hydration", "gallon_jug"],
        ratingAvg: 4.7,
        ratingCount: 49,
        soldCount: 310
    },
    {
        title: "Compartment Storage Protein Shaker 600ml",
        description: "3-in-1 shaker bottle with detachable pill organizer and dual powder storage jars for pre-workout and post-workout whey.",
        category: "bottles_shakers",
        brand: "SmartShake Style",
        price: 449,
        mrp: 699,
        stock: 70,
        variants: [{ name: "Color", options: ["Black/Neon", "All Black"] }],
        ingredients: [],
        expiryDate: "",
        tags: ["shaker", "storage", "smart_shake"],
        ratingAvg: 4.6,
        ratingCount: 31,
        soldCount: 195
    }
];

async function seedProducts() {
    try {
        console.log("Connecting to MongoDB for Marketplace Products seed...");
        await connectDB();

        console.log("Setting up verified sellers...");
        const hashedPassword = await bcrypt.hash("Seller123!", 10);
        const sellerDocs = [];

        for (const s of SAMPLE_SELLERS) {
            let user = await User.findOne({ email: s.email });
            if (!user) {
                user = await User.create({
                    name: s.name,
                    email: s.email,
                    password: hashedPassword,
                    roles: ["user", "seller"],
                    onboardingCompleted: true
                });
            } else {
                if (!user.roles.includes("seller")) {
                    user.roles.push("seller");
                    await user.save();
                }
            }

            const seller = await Seller.findOneAndUpdate(
                { userId: user._id },
                {
                    userId: user._id,
                    businessName: s.businessName,
                    gstin: s.gstin,
                    fssai: s.fssai,
                    pickupAddress: s.pickupAddress,
                    status: "approved"
                },
                { upsert: true, new: true }
            );
            sellerDocs.push(seller);
        }

        console.log(`Clearing previous seed products for sellers...`);
        const sellerIds = sellerDocs.map(s => s._id);
        await Product.deleteMany({ sellerId: { $in: sellerIds } });

        console.log(`Seeding ${PRODUCTS_DATA.length} products across all categories...`);

        const productsToInsert = PRODUCTS_DATA.map((p, idx) => {
            // Assign supplements and food to FitSync Official Store (has FSSAI), others distributed
            const isFood = ["supplements", "nutrition_food"].includes(p.category);
            const seller = isFood ? sellerDocs[0] : sellerDocs[idx % sellerDocs.length];

            return {
                ...p,
                sellerId: seller._id,
                status: "approved",
                flaggedForAdminReview: false,
                flagReason: ""
            };
        });

        await Product.insertMany(productsToInsert);
        console.log(`✅ Successfully seeded ${productsToInsert.length} marketplace products!`);

        const count = await Product.countDocuments({ status: "approved" });
        console.log(`Total approved products in DB: ${count}`);

        await mongoose.disconnect();
        console.log("✅ Database disconnected. Seed complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seedProducts();
