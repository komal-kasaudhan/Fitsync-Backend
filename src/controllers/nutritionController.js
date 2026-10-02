// 📄 Path: src/controllers/nutritionController.js
const DailyNutrition = require('../models/DailyNutrition');
const MealLog = require('../models/MealLog');
const NutritionTarget = require('../models/NutritionTarget');
const Onboarding = require('../models/onboarding.model');
const AiCache = require('../models/AiCache');
const { generateDynamicNutritionInsight } = require('../service/geminiService');
const nutritionCalculationService = require('../service/nutritionCalculationService');
const {
    getTodayKolkata,
    getLast7DaysKolkata,
    getTimeBucketKolkata
} = require('../utils/dateUtils');
const crypto = require('crypto');

/**
 * GET /api/nutrition/today?date=YYYY-MM-DD
 */
exports.getTodayNutrition = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const date = req.query.date || getTodayKolkata();

        // 1. Fetch user targets
        let targets = await NutritionTarget.findOne({
            $or: [{ userId }, { user: userId }]
        });

        if (!targets) {
            const onboarding = await Onboarding.findOne({ userId });
            if (onboarding) {
                targets = await nutritionCalculationService.saveUserTargets(userId, onboarding);
            }
        }

        // 2. Fetch daily record & meal logs
        let dailyRecord = await DailyNutrition.findOne({
            $or: [{ userId }, { user: userId }],
            date
        });
        const meals = await MealLog.find({ userId, date });

        let eatenCalories = dailyRecord?.consumedCalories || dailyRecord?.consumed?.calories || 0;
        let eatenProtein = dailyRecord?.consumedProtein || dailyRecord?.consumed?.protein || 0;
        let eatenCarbs = dailyRecord?.consumedCarbs || dailyRecord?.consumed?.carbs || 0;
        let eatenFat = dailyRecord?.consumedFat || dailyRecord?.consumed?.fat || 0;
        let waterMl = dailyRecord?.consumedWater || dailyRecord?.consumed?.waterMl || 0;

        if (meals && meals.length > 0) {
            let mealsCal = 0;
            let mealsProt = 0;
            let mealsCarbs = 0;
            let mealsFat = 0;
            meals.forEach(m => {
                const nut = m.totalMealNutrition || {};
                mealsCal += nut.calories || m.calories || 0;
                mealsProt += nut.protein || m.protein || 0;
                mealsCarbs += nut.carbs || m.carbs || 0;
                mealsFat += nut.fat || m.fat || 0;
            });
            if (mealsCal > 0) {
                eatenCalories = mealsCal;
                eatenProtein = mealsProt;
                eatenCarbs = mealsCarbs;
                eatenFat = mealsFat;
            }
        }

        const targetCalories = targets?.targetCalories || 2200;
        const targetProtein = targets?.targetProtein || 120;
        const targetCarbs = targets?.targetCarbs || 260;
        const targetFat = targets?.targetFat || 70;
        const targetWaterMl = targets?.targetWaterMl || (targets?.targetWaterLiters ? targets.targetWaterLiters * 1000 : 3000);

        return res.status(200).json({
            success: true,
            data: {
                date,
                eatenCalories: Math.round(eatenCalories),
                remainingCalories: Math.max(0, targetCalories - Math.round(eatenCalories)),
                targetCalories,
                protein: {
                    current: Math.round(eatenProtein * 10) / 10,
                    target: targetProtein,
                    remaining: Math.max(0, Math.round((targetProtein - eatenProtein) * 10) / 10)
                },
                carbs: {
                    current: Math.round(eatenCarbs * 10) / 10,
                    target: targetCarbs,
                    remaining: Math.max(0, Math.round((targetCarbs - eatenCarbs) * 10) / 10)
                },
                fat: {
                    current: Math.round(eatenFat * 10) / 10,
                    target: targetFat,
                    remaining: Math.max(0, Math.round((targetFat - eatenFat) * 10) / 10)
                },
                water: {
                    current: parseFloat((waterMl / 1000).toFixed(1)),
                    target: parseFloat((targetWaterMl / 1000).toFixed(1)),
                    remaining: Math.max(0, parseFloat(((targetWaterMl - waterMl) / 1000).toFixed(1)))
                },
                mealsLogged: meals
            }
        });
    } catch (error) {
        console.error("❌ Error in getTodayNutrition:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * FEATURE B: Weekly calorie bar graph
 * GET /api/nutrition/weekly?endDate=YYYY-MM-DD
 * Response: [{ date, dayLabel, caloriesConsumed, calorieTarget, protein, carbs, fat, water, goalHit }]
 * Days with no data return zeros, never missing entries.
 */
exports.getWeeklyNutrition = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const endDateStr = req.query.endDate || getTodayKolkata();

        // 1. Get exact last 7 days ending at endDateStr
        const last7Days = getLast7DaysKolkata(endDateStr);
        const datesList = last7Days.map(d => d.date);

        // 2. Fetch targets
        let targets = await NutritionTarget.findOne({
            $or: [{ userId }, { user: userId }]
        });
        const calorieTarget = targets?.targetCalories || 2000;

        // 3. Fetch all daily nutrition records for these 7 days
        const records = await DailyNutrition.find({
            $or: [{ userId }, { user: userId }],
            date: { $in: datesList }
        }).lean();

        const recordMap = new Map();
        records.forEach(r => recordMap.set(r.date, r));

        // Also check MealLogs for any days where DailyNutrition was not synced
        const mealLogs = await MealLog.find({
            userId,
            date: { $in: datesList }
        }).lean();

        const mealMap = new Map();
        mealLogs.forEach(m => {
            const current = mealMap.get(m.date) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
            const nut = m.totalMealNutrition || {};
            current.calories += (nut.calories || 0);
            current.protein += (nut.protein || 0);
            current.carbs += (nut.carbs || 0);
            current.fat += (nut.fat || 0);
            mealMap.set(m.date, current);
        });

        // 4. Map each day guaranteed
        const weeklyData = last7Days.map(day => {
            const rec = recordMap.get(day.date);
            const m = mealMap.get(day.date);

            const cal = Math.round(rec?.consumedCalories || rec?.consumed?.calories || m?.calories || 0);
            const prot = Math.round((rec?.consumedProtein || rec?.consumed?.protein || m?.protein || 0) * 10) / 10;
            const carb = Math.round((rec?.consumedCarbs || rec?.consumed?.carbs || m?.carbs || 0) * 10) / 10;
            const fatVal = Math.round((rec?.consumedFat || rec?.consumed?.fat || m?.fat || 0) * 10) / 10;
            const waterVal = parseFloat(((rec?.consumedWater || rec?.consumed?.waterMl || 0) / 1000).toFixed(1));

            // Goal hit condition: within 10% range of target or >= 90%
            const target = rec?.targetCalories || calorieTarget;
            const goalHit = cal > 0 && (cal >= target * 0.9 && cal <= target * 1.15);

            return {
                date: day.date,
                dayLabel: day.dayLabel,
                caloriesConsumed: cal,
                calorieTarget: target,
                protein: prot,
                carbs: carb,
                fat: fatVal,
                water: waterVal,
                goalHit
            };
        });

        return res.status(200).json(weeklyData);
    } catch (error) {
        console.error("❌ Error in getWeeklyNutrition:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * FEATURE C: Dynamic AI nutrition insight
 * GET /api/nutrition/insight?date=YYYY-MM-DD
 * Returns { message, remainingProtein, remainingCalories, suggestedFoods[] }
 */
exports.getDynamicInsight = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const date = req.query.date || getTodayKolkata();

        // 1. Fetch user targets and onboarding profile
        let targets = await NutritionTarget.findOne({
            $or: [{ userId }, { user: userId }]
        });

        const onboarding = await Onboarding.findOne({ userId });
        if (!targets && onboarding) {
            targets = await nutritionCalculationService.saveUserTargets(userId, onboarding);
        }

        const targetCalories = targets?.targetCalories || 2000;
        const targetProtein = targets?.targetProtein || 100;
        const targetCarbs = targets?.targetCarbs || 250;
        const targetFat = targets?.targetFat || 65;
        const targetWaterLiters = targets?.targetWaterLiters || 3.0;

        // 2. Fetch daily consumption
        const daily = await DailyNutrition.findOne({
            $or: [{ userId }, { user: userId }],
            date
        });

        const consumedCalories = daily?.consumedCalories || daily?.consumed?.calories || 0;
        const consumedProtein = daily?.consumedProtein || daily?.consumed?.protein || 0;
        const consumedCarbs = daily?.consumedCarbs || daily?.consumed?.carbs || 0;
        const consumedFat = daily?.consumedFat || daily?.consumed?.fat || 0;
        const consumedWater = parseFloat(((daily?.consumedWater || daily?.consumed?.waterMl || 0) / 1000).toFixed(1));

        const remainingProtein = Math.max(0, Math.round((targetProtein - consumedProtein) * 10) / 10);
        const remainingCalories = Math.max(0, Math.round(targetCalories - consumedCalories));
        const remainingCarbs = Math.max(0, Math.round(targetCarbs - consumedCarbs));
        const remainingFat = Math.max(0, Math.round(targetFat - consumedFat));
        const remainingWater = Math.max(0, parseFloat((targetWaterLiters - consumedWater).toFixed(1)));

        // 3. Time bucket (morning, afternoon, evening, night in Asia/Kolkata)
        const timeBucket = getTimeBucketKolkata();
        const roundedProtein = Math.round(remainingProtein / 5) * 5;
        const roundedCalories = Math.round(remainingCalories / 50) * 50;

        // 4. Cache key (user + date + rounded remaining macros + time bucket)
        const cacheHash = crypto
            .createHash('md5')
            .update(`insight_${userId}_${date}_${roundedProtein}_${roundedCalories}_${timeBucket}`)
            .digest('hex');

        const cached = await AiCache.findOne({ keyHash: cacheHash });
        if (cached && cached.response) {
            return res.status(200).json({
                message: cached.response.message,
                remainingProtein,
                remainingCalories,
                suggestedFoods: cached.response.suggestedFoods || []
            });
        }

        // 5. Generate fresh insight (with strict Gemini JSON + fallback)
        const rawDiet = (onboarding?.goal || "").toLowerCase();
        const dietType = rawDiet.includes("non") ? "NonVeg" : rawDiet.includes("egg") ? "Eggitarian" : "Veg";

        const insightData = await generateDynamicNutritionInsight({
            remainingProtein,
            remainingCalories,
            remainingCarbs,
            remainingFat,
            remainingWater,
            targetProtein,
            targetCalories,
            dietType,
            timeBucket,
            goal: onboarding?.goal || "Maintain"
        });

        // 6. Save in AiCache with 24 hours TTL
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await AiCache.findOneAndUpdate(
            { keyHash: cacheHash },
            {
                userId,
                date,
                feature: "insight",
                keyHash: cacheHash,
                response: insightData,
                expiresAt
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            message: insightData.message,
            remainingProtein,
            remainingCalories,
            suggestedFoods: insightData.suggestedFoods
        });
    } catch (error) {
        console.error("❌ Error in getDynamicInsight:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate dynamic nutrition insight"
        });
    }
};
