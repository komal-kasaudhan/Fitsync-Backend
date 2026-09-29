require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Food = require('./src/models/Food');

const dataDir = path.join(__dirname, 'src', 'data');

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log("🧹 Clearing old Food collection...");
        await Food.deleteMany({});

        // Read all json files inside src/data/
        const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json') && file !== 'package.json');
        
        let totalInserted = 0;

        for (const file of files) {
            const filePath = path.join(dataDir, file);
            const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            if (Array.isArray(fileData) && fileData.length > 0) {
                // Properly map to Mongoose nested nutritionPerServing structure
                const formattedFoods = fileData.map(item => {
                    const nutrition = item.nutritionPerServing || {};
                    
                    return {
                        name: item.name,
                        category: item.category || "General",
                        subCategory: item.subCategory || "",
                        servingType: item.servingType || "g",
                        servingSize: item.servingSize || "100g",
                        servingWeight: item.servingWeight || 100,
                        nutritionPerServing: {
                            calories: nutrition.calories !== undefined ? nutrition.calories : (item.calories || 0),
                            protein: nutrition.protein !== undefined ? nutrition.protein : (item.protein || 0),
                            carbs: nutrition.carbs !== undefined ? nutrition.carbs : (item.carbs || 0),
                            fat: nutrition.fat !== undefined ? nutrition.fat : (item.fat || 0),
                            fiber: nutrition.fiber || 0,
                            sugar: nutrition.sugar || 0,
                            sodium: nutrition.sodium || 0,
                            potassium: nutrition.potassium || 0
                        },
                        dietType: item.dietType || "Veg",
                        mealTypes: item.mealTypes || [],
                        aliases: item.aliases || [],
                        verified: item.verified !== undefined ? item.verified : true
                    };
                });

                await Food.insertMany(formattedFoods);
                console.log(`✅ Imported ${formattedFoods.length} items from ${file}`);
                totalInserted += formattedFoods.length;
            }
        }

        console.log(`\n🎉 SUCCESS! Total ${totalInserted} items successfully inserted into MongoDB!`);
        process.exit();

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
};

seedDatabase();