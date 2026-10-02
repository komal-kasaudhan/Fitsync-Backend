// 📄 Path: seedRecipes.js
require('dotenv').config();
const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const connectDB = require('./src/config/db');
const Recipe = require('./src/models/Recipe');
const Food = require('./src/models/Food');
const recipesData = require('./src/data/seedRecipesData');

async function seedRecipes() {
    try {
        console.log("🔄 Connecting to MongoDB to seed recipes...");
        await connectDB();

        console.log("🧹 Clearing existing Recipe collection...");
        await Recipe.deleteMany({});

        // Fetch existing foods to link matching foodId if found
        const foods = await Food.find({}, '_id name');
        const foodMap = new Map();
        foods.forEach(f => foodMap.set(f.name.toLowerCase().trim(), f._id));

        const formattedRecipes = recipesData.map(r => {
            const lowerName = r.name.toLowerCase();
            let matchedFoodId = null;
            for (const [foodName, id] of foodMap.entries()) {
                if (lowerName.includes(foodName) || foodName.includes(lowerName)) {
                    matchedFoodId = id;
                    break;
                }
            }

            return {
                ...r,
                foodId: matchedFoodId || undefined
            };
        });

        const inserted = await Recipe.insertMany(formattedRecipes);
        console.log(`✅ Successfully seeded ${inserted.length} high-protein recipes into MongoDB!`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to seed recipes:", error);
        process.exit(1);
    }
}

seedRecipes();
