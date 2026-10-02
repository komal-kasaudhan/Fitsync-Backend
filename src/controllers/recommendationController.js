// 📄 Path: src/controllers/recommendationController.js
const Recipe = require('../models/Recipe');
const Food = require('../models/Food');
const NutritionTarget = require('../models/NutritionTarget');
const DailyNutrition = require('../models/DailyNutrition');
const MealLog = require('../models/MealLog');
const Onboarding = require('../models/onboarding.model');
const AiCache = require('../models/AiCache');
const nutritionCalculationService = require('../service/nutritionCalculationService');
const geminiService = require('../service/geminiService');
const {
    getTodayKolkata,
    getCurrentIndianSeason,
    getTimeBucketKolkata,
    getKolkataHour
} = require('../utils/dateUtils');
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
 * Generate intelligent rule-based reason for a recommendation
 */
function generateRuleBasedReason(recipe, remainingProtein, currentSeason, timeBucket) {
    const seasons = recipe.seasons || ["all"];
    const tags = recipe.tags || ["high_protein"];
    const hasSeason = seasons.includes(currentSeason);
    const isWarming = tags.includes("warming") || tags.includes("comfort");
    const isCooling = tags.includes("cooling") || tags.includes("light");
    const seasonDisplay = currentSeason.replace("_", " ");

    if (hasSeason && currentSeason === "post_monsoon") {
        return `Festive ${recipe.mealType.toLowerCase()} with ${recipe.protein}g protein, perfect for post-monsoon dining.`;
    }
    if (hasSeason && currentSeason === "winter" && isWarming) {
        return `Warm, comforting winter meal packing ${recipe.protein}g protein for recovery.`;
    }
    if (hasSeason && currentSeason === "summer" && isCooling) {
        return `Light and cooling with ${recipe.protein}g clean protein, easy on hot-weather digestion.`;
    }
    if (hasSeason && currentSeason === "monsoon" && isWarming) {
        return `Hot, comforting monsoon option providing ${recipe.protein}g high-quality protein.`;
    }
    if (hasSeason && currentSeason === "spring") {
        return `Fresh, energizing spring choice delivering ${recipe.protein}g muscle-building protein.`;
    }
    if (remainingProtein > 0) {
        const pct = Math.min(100, Math.round((recipe.protein / remainingProtein) * 100));
        return `High-protein choice providing ${recipe.protein}g protein (${pct}% of today's remaining target).`;
    }
    return `Balanced ${recipe.mealType.toLowerCase()} option packing ${recipe.protein}g protein within your calorie target.`;
}

/**
 * GET /api/nutrition/recommendations?date=YYYY-MM-DD
 */
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const date = req.query.date || getTodayKolkata();

        const currentSeason = getCurrentIndianSeason(date);
        const timeBucket = getTimeBucketKolkata();
        const currentHour = getKolkataHour();

        // Target meal type based on current time
        let targetMealType = "Breakfast";
        if (currentHour >= 12 && currentHour < 17) {
            targetMealType = "Lunch";
        } else if (currentHour >= 17 && currentHour < 21) {
            targetMealType = "Snack";
        } else if (currentHour >= 21 || currentHour < 5) {
            targetMealType = "Dinner";
        }

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

        // 2. Identify items already eaten today to exclude duplicates
        const eatenFoodNames = new Set();
        (daily?.loggedMeals || []).forEach(m => {
            if (m.foodName) eatenFoodNames.add(m.foodName.toLowerCase().trim());
        });

        const todayMealLogs = await MealLog.find({ userId, date }).lean();
        const loggedMealTypes = new Set();
        todayMealLogs.forEach(ml => {
            if (ml.mealType) loggedMealTypes.add(ml.mealType.toLowerCase());
            (ml.items || []).forEach(it => {
                if (it.foodName) eatenFoodNames.add(it.foodName.toLowerCase().trim());
            });
        });

        // Remaining meals count (clamp between 1 and 4)
        const remainingMealsCount = Math.max(1, 4 - loggedMealTypes.size);
        const targetMealProtein = remainingProtein > 0 ? (remainingProtein / remainingMealsCount) : 25;

        // 3. Cache check in DB (user + date + rounded remaining protein + season + targetMealType)
        const roundedProtein = Math.round(remainingProtein / 5) * 5;
        const cacheKey = crypto
            .createHash('sha256')
            .update(`rec_${userId}_${date}_${roundedProtein}_${currentSeason}_${targetMealType}`)
            .digest('hex');

        const cached = await AiCache.findOne({ keyHash: cacheKey });
        if (cached && Array.isArray(cached.response) && cached.response.length > 0) {
            return res.status(200).json({
                success: true,
                date,
                season: currentSeason,
                remainingProtein: Math.round(remainingProtein * 10) / 10,
                remainingCalories: Math.round(remainingCalories),
                count: cached.response.length,
                recommendations: cached.response,
                fromCache: true
            });
        }

        // 4. Fetch user profile diet preferences & allergies
        const onboarding = await Onboarding.findOne({ userId });
        const rawDiet = (onboarding?.goal || "").toLowerCase();
        const physicalLimitations = (onboarding?.physicalLimitations || "").toLowerCase();

        let allowedDietTypes = ['Veg', 'NonVeg', 'Eggitarian', 'Vegan'];
        if (rawDiet.includes("vegan") || physicalLimitations.includes("vegan")) {
            allowedDietTypes = ['Vegan'];
        } else if (rawDiet.includes("veg") && !rawDiet.includes("non-veg") && !rawDiet.includes("nonveg")) {
            allowedDietTypes = ['Veg', 'Vegan'];
        } else if (rawDiet.includes("egg") || rawDiet.includes("eggetarian")) {
            allowedDietTypes = ['Veg', 'Vegan', 'Eggitarian'];
        }

        const detectedAllergies = [];
        if (physicalLimitations.includes("dairy") || physicalLimitations.includes("lactose")) detectedAllergies.push("dairy");
        if (physicalLimitations.includes("gluten") || physicalLimitations.includes("celiac")) detectedAllergies.push("gluten");
        if (physicalLimitations.includes("nut") || physicalLimitations.includes("peanut")) detectedAllergies.push("nuts");
        if (physicalLimitations.includes("seafood") || physicalLimitations.includes("fish")) detectedAllergies.push("seafood");
        if (physicalLimitations.includes("soy")) detectedAllergies.push("soy");

        // 5. Query candidate recipes with progressive fallback relaxation
        // Pool 1: Strict Diet + Strict Allergies + In-Season / All + Not Eaten
        const baseQuery = {
            dietType: { $in: allowedDietTypes }
        };
        if (detectedAllergies.length > 0) {
            baseQuery.allergies = { $nin: detectedAllergies };
        }

        let candidates = await Recipe.find({
            ...baseQuery,
            seasons: { $in: [currentSeason, 'all'] }
        }).lean();

        // Filter out already eaten
        candidates = candidates.filter(c => !eatenFoodNames.has(c.name.toLowerCase().trim()));

        // Pool 2: If < 6, relax season filter
        if (candidates.length < 6) {
            const extra = await Recipe.find(baseQuery).lean();
            const filteredExtra = extra.filter(c => !eatenFoodNames.has(c.name.toLowerCase().trim()));
            candidates = filteredExtra;
        }

        // Pool 3: If still < 6, relax diet filter (keep allergies strictly)
        if (candidates.length < 6) {
            const allergyOnlyQuery = detectedAllergies.length > 0 ? { allergies: { $nin: detectedAllergies } } : {};
            const extra = await Recipe.find(allergyOnlyQuery).lean();
            candidates = extra.filter(c => !eatenFoodNames.has(c.name.toLowerCase().trim()));
        }

        // Pool 4: If still < 6, include all recipes (never return empty list)
        if (candidates.length < 6) {
            candidates = await Recipe.find({}).lean();
        }

        // 6. Score candidates
        const seedStr = `${userId}_${date}`;
        const rng = seededRandom(seedStr);

        const scoredCandidates = candidates.map(c => {
            let score = 100;

            // Closeness of protein to targetMealProtein
            const proteinDiff = Math.abs(c.protein - targetMealProtein);
            score += Math.max(0, 35 - proteinDiff * 1.5);

            // Protein density bonus
            score += (c.protein / (Math.max(100, c.calories) / 100)) * 2;

            // Calorie fit
            if (remainingCalories > 0) {
                if (c.calories <= remainingCalories + 100) {
                    score += 20;
                } else {
                    score -= Math.min(30, ((c.calories - remainingCalories) / 50) * 5);
                }
            }

            // Seasonal match
            const seasons = c.seasons || ["all"];
            if (seasons.includes(currentSeason)) {
                score += 25;
            } else if (seasons.includes("all")) {
                score += 12;
            }

            // MealType match
            if (c.mealType.toLowerCase() === targetMealType.toLowerCase()) {
                score += 20;
            } else if (timeBucket === "evening" && (c.mealType === "Snack" || c.mealType === "Dinner")) {
                score += 10;
            }

            // Daily stable random factor
            score += rng() * 15;

            return {
                ...c,
                _score: score
            };
        });

        scoredCandidates.sort((a, b) => b._score - a._score);
        const topCandidates = scoredCandidates.slice(0, 8);

        // 7. Optional Gemini step: rank top 5 and write one-line reason
        let geminiPicks = null;
        try {
            geminiPicks = await geminiService.rankAndReasonMealRecommendations({
                candidates: topCandidates,
                userContext: {
                    goal: onboarding?.goal || "Maintain",
                    dietType: allowedDietTypes.join("/")
                },
                currentSeason,
                remainingProtein: Math.round(remainingProtein),
                remainingCalories: Math.round(remainingCalories),
                timeBucket
            });
        } catch (geminiErr) {
            console.warn("⚠️ Gemini recommendation optimizer failed, using rule-based fallback:", geminiErr.message);
        }

        const candidateMap = new Map();
        topCandidates.forEach(c => candidateMap.set(c._id.toString(), c));

        let finalSelected = [];
        if (Array.isArray(geminiPicks) && geminiPicks.length >= 3) {
            const allValid = geminiPicks.every(p => p && candidateMap.has(p.id));
            if (allValid) {
                finalSelected = geminiPicks.slice(0, 5).map(p => ({
                    item: candidateMap.get(p.id),
                    reason: p.reason
                }));
            }
        }

        // Rule-based fallback if Gemini not available or returned invalid IDs
        if (finalSelected.length === 0) {
            finalSelected = topCandidates.slice(0, 5).map(item => ({
                item,
                reason: generateRuleBasedReason(item, remainingProtein, currentSeason, timeBucket)
            }));
        }

        // 8. Format response items
        const responseItems = finalSelected.map(({ item, reason }) => {
            const seasons = item.seasons || ["all"];
            const matchedSeason = seasons.includes(currentSeason) ? currentSeason : (seasons[0] || "all");
            return {
                id: item._id,
                _id: item._id,
                name: item.name,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
                fiber: item.fiber || 0,
                servingSize: item.servingSize,
                mealType: item.mealType,
                season: matchedSeason,
                reason: reason,
                prepTimeMin: item.prepTimeMin,
                ingredients: item.ingredients || [],
                steps: item.steps || [],
                imageUrl: item.imageUrl || "",
                foodId: item.foodId || item._id
            };
        });

        // Cache in DB for 24 hours
        try {
            await AiCache.findOneAndUpdate(
                { keyHash: cacheKey },
                {
                    userId,
                    date,
                    feature: "meal_recommendations",
                    keyHash: cacheKey,
                    response: responseItems,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                },
                { upsert: true }
            );
        } catch (cacheErr) {
            console.warn("⚠️ Failed to cache meal recommendations:", cacheErr.message);
        }

        res.status(200).json({
            success: true,
            date,
            season: currentSeason,
            remainingProtein: Math.round(remainingProtein * 10) / 10,
            remainingCalories: Math.round(remainingCalories),
            count: responseItems.length,
            recommendations: responseItems
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
            { userId, date },
            {
                $setOnInsert: { user: userId },
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
            { upsert: true, returnDocument: 'after' }
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
