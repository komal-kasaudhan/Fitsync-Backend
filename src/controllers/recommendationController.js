// 📄 Path: src/controllers/recommendationController.js
const Recipe = require('../models/Recipe');
const Food = require('../models/Food');
const NutritionTarget = require('../models/NutritionTarget');
const DailyNutrition = require('../models/DailyNutrition');
const MealLog = require('../models/MealLog');
const Onboarding = require('../models/onboarding.model');
const nutritionCalculationService = require('../service/nutritionCalculationService');
const { getTodayKolkata } = require('../utils/dateUtils');
const crypto = require('crypto');

/**
 * Simple pseudo-random number generator using seed string
 */
function seededRandom(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    return function () {
        hash = (hash * 9301 + 49297) % 233280;
        return hash / 233280;
    };
}

/**
 * GET /api/nutrition/recommendations?date=YYYY-MM-DD
 */
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const date = req.query.date || getTodayKolkata();

        // 1. Fetch user targets and daily consumption
        let target = await NutritionTarget.findOne({
            $or: [{ userId }, { user: userId }]
        });

        if (!target) {
            const onboarding = await Onboarding.findOne({ userId });
            if (onboarding) {
                target = await nutritionCalculationService.saveUserTargets(userId, onboarding);
            } else {
                target = { targetCalories: 2000, targetProtein: 100, targetCarbs: 250, targetFat: 65 };
            }
        }

        const daily = await DailyNutrition.findOne({
            $or: [{ userId }, { user: userId }],
            date
        });

        const consumedProtein = daily?.consumedProtein || daily?.consumed?.protein || 0;
        const consumedCalories = daily?.consumedCalories || daily?.consumed?.calories || 0;

        const remainingProtein = Math.max(0, target.targetProtein - consumedProtein);
        const remainingCalories = Math.max(0, target.targetCalories - consumedCalories);

        // 2. Fetch user profile diet preferences & allergies
        const onboarding = await Onboarding.findOne({ userId });
        const rawDiet = (onboarding?.goal || "").toLowerCase();
        const physicalLimitations = (onboarding?.physicalLimitations || "").toLowerCase();
        const selectedMedical = (onboarding?.selectedMedicalConditions || []).map(c => c.toLowerCase());

        // Extract diet type (Veg / NonVeg / Eggitarian / Vegan)
        let allowedDietTypes = ['Veg', 'NonVeg', 'Eggitarian', 'Vegan'];
        if (rawDiet.includes("vegan") || physicalLimitations.includes("vegan")) {
            allowedDietTypes = ['Vegan'];
        } else if (rawDiet.includes("veg") && !rawDiet.includes("non-veg") && !rawDiet.includes("nonveg")) {
            allowedDietTypes = ['Veg', 'Vegan'];
        } else if (rawDiet.includes("egg") || rawDiet.includes("eggetarian")) {
            allowedDietTypes = ['Veg', 'Vegan', 'Eggitarian'];
        }

        // Detect allergies
        const detectedAllergies = [];
        if (physicalLimitations.includes("dairy") || physicalLimitations.includes("lactose")) detectedAllergies.push("dairy");
        if (physicalLimitations.includes("gluten") || physicalLimitations.includes("celiac")) detectedAllergies.push("gluten");
        if (physicalLimitations.includes("nut") || physicalLimitations.includes("peanut")) detectedAllergies.push("nuts");
        if (physicalLimitations.includes("seafood") || physicalLimitations.includes("fish")) detectedAllergies.push("seafood");
        if (physicalLimitations.includes("soy")) detectedAllergies.push("soy");

        // 3. Query candidate recipes
        const query = {
            dietType: { $in: allowedDietTypes }
        };
        if (detectedAllergies.length > 0) {
            query.allergies = { $nin: detectedAllergies };
        }

        let candidates = await Recipe.find(query).lean();
        if (candidates.length < 6) {
            // Fallback: relax diet if too few candidates
            candidates = await Recipe.find({}).lean();
        }

        // 4. Deterministic stable shuffle based on userId + date
        const seedStr = `${userId}_${date}`;
        const rng = seededRandom(seedStr);

        // Score candidates: prioritize higher protein and matching remaining macros
        const scoredCandidates = candidates.map(c => {
            // Closer to a single meal's portion of remaining protein (e.g. remainingProtein / 2 or 3)
            const proteinWeight = c.protein * 2;
            const randomFactor = rng() * 10;
            return {
                ...c,
                _score: proteinWeight + randomFactor
            };
        });

        scoredCandidates.sort((a, b) => b._score - a._score);

        // Pick 4-6 suggestions
        const selected = scoredCandidates.slice(0, 6).map(item => ({
            id: item._id,
            _id: item._id,
            name: item.name,
            imageUrl: item.imageUrl || "",
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber || 0,
            servingSize: item.servingSize,
            mealType: item.mealType,
            prepTimeMin: item.prepTimeMin,
            ingredients: item.ingredients || [],
            steps: item.steps || [],
            foodId: item.foodId || item._id
        }));

        res.status(200).json({
            success: true,
            date,
            remainingProtein: Math.round(remainingProtein * 10) / 10,
            remainingCalories: Math.round(remainingCalories),
            count: selected.length,
            recommendations: selected
        });
    } catch (error) {
        console.error("❌ Error in getRecommendations:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to load meal recommendations"
        });
    }
};

/**
 * POST /api/nutrition/recommendations/:id/add
 * Logs the recommended recipe directly into DailyNutrition and MealLog
 */
exports.addRecommendationToLog = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const { id } = req.params;
        const date = req.body.date || getTodayKolkata();

        const recipe = await Recipe.findById(id);
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recommendation recipe not found"
            });
        }

        const mealType = req.body.mealType || recipe.mealType || "Lunch";

        // Find or create food item for MealLog reference
        let foodDoc = null;
        if (recipe.foodId) {
            foodDoc = await Food.findById(recipe.foodId);
        }
        if (!foodDoc) {
            foodDoc = await Food.findOne({ name: recipe.name });
        }
        if (!foodDoc) {
            // Create a matching Food entry
            foodDoc = await Food.create({
                name: recipe.name,
                category: "Recipe",
                servingType: "serving",
                servingSize: recipe.servingSize,
                servingWeight: 200,
                nutritionPerServing: {
                    calories: recipe.calories,
                    protein: recipe.protein,
                    carbs: recipe.carbs,
                    fat: recipe.fat,
                    fiber: recipe.fiber || 0
                },
                dietType: recipe.dietType || "Veg",
                verified: true
            });
        }

        // 1. Add to MealLog
        let mealLog = await MealLog.findOne({
            userId,
            date,
            mealType: { $regex: new RegExp(`^${mealType}$`, "i") }
        });

        const newItem = {
            foodId: foodDoc._id,
            foodName: recipe.name,
            quantity: 1,
            unit: recipe.servingSize,
            calculatedNutrition: {
                calories: recipe.calories,
                protein: recipe.protein,
                carbs: recipe.carbs,
                fat: recipe.fat,
                fiber: recipe.fiber || 0
            }
        };

        if (!mealLog) {
            mealLog = new MealLog({
                userId,
                date,
                mealType,
                items: [newItem],
                totalMealNutrition: {
                    calories: recipe.calories,
                    protein: recipe.protein,
                    carbs: recipe.carbs,
                    fat: recipe.fat,
                    fiber: recipe.fiber || 0
                }
            });
        } else {
            mealLog.items.push(newItem);
            mealLog.totalMealNutrition.calories += recipe.calories;
            mealLog.totalMealNutrition.protein += recipe.protein;
            mealLog.totalMealNutrition.carbs += recipe.carbs;
            mealLog.totalMealNutrition.fat += recipe.fat;
            mealLog.totalMealNutrition.fiber += (recipe.fiber || 0);
        }

        await mealLog.save();

        // 2. Also log inside DailyNutrition.loggedMeals array
        await DailyNutrition.findOneAndUpdate(
            { $or: [{ userId }, { user: userId }], date },
            {
                $push: {
                    loggedMeals: {
                        foodId: foodDoc._id.toString(),
                        foodName: recipe.name,
                        mealType,
                        servingType: recipe.servingSize,
                        quantity: 1,
                        calories: recipe.calories,
                        protein: recipe.protein,
                        carbs: recipe.carbs,
                        fat: recipe.fat,
                        fiber: recipe.fiber || 0,
                        loggedAt: new Date()
                    }
                }
            },
            { upsert: true, new: true }
        );

        // 3. Sync totals across DailyNutrition
        const updatedDaily = await nutritionCalculationService.syncDailyNutrition(userId, date);

        res.status(200).json({
            success: true,
            message: `Successfully logged '${recipe.name}' to ${mealType}`,
            mealType,
            addedItem: newItem,
            dailyNutrition: updatedDaily
        });
    } catch (error) {
        console.error("❌ Error in addRecommendationToLog:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to log recommended meal"
        });
    }
};
