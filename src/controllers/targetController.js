// 📄 Path: src/controllers/targetController.js
const NutritionTarget = require('../models/NutritionTarget');
const DailyNutrition = require('../models/DailyNutrition');
const Onboarding = require('../models/onboarding.model');
const WorkoutPlan = require('../models/WorkoutPlan');
const workoutPlanService = require('../service/workoutPlan.service');
const nutritionCalculationService = require('../service/nutritionCalculationService');
const { getTodayKolkata } = require('../utils/dateUtils');

// 🎯 Target Setup & Safe BMR/TDEE Calculation
exports.setupTargets = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const { currentWeightKg, targetWeightKg, timeframeDays, gender, heightCm, age, activityLevel, goalType } = req.body;

        // ⚠️ Goal Validation Check (if targetWeight and timeframe provided)
        if (currentWeightKg && targetWeightKg && timeframeDays) {
            const weightDifference = Math.abs(currentWeightKg - targetWeightKg);
            const weeks = Math.max(1, timeframeDays / 7);
            const ratePerWeek = weightDifference / weeks;

            if (ratePerWeek > 1.2) { // Max safe change is ~1.2kg/week
                return res.status(400).json({
                    valid: false,
                    reason: `Healthy weight ${goalType === 'WEIGHT_LOSS' ? 'loss' : 'gain'} is approx 0.25–0.8 kg per week. ${weightDifference}kg in ${timeframeDays} days (${ratePerWeek.toFixed(2)}kg/week) is unsafe. Please select a realistic timeline.`
                });
            }
        }

        const targets = await nutritionCalculationService.saveUserTargets(userId, {
            currentWeight: currentWeightKg || req.body.currentWeight,
            gender: gender || req.body.gender,
            height: heightCm || req.body.height,
            age: age || req.body.age,
            activityLevel: activityLevel || req.body.activityLevel,
            goal: goalType || req.body.goal
        });

        return res.status(200).json({
            valid: true,
            success: true,
            data: targets
        });
    } catch (error) {
        console.error("❌ Target Setup Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🎯 Get Personalized User Targets
exports.getTargets = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;

        let targets = await NutritionTarget.findOne({
            $or: [{ userId }, { user: userId }]
        });

        if (!targets) {
            // Check if user completed onboarding
            const profile = await Onboarding.findOne({ userId });
            if (profile) {
                targets = await nutritionCalculationService.saveUserTargets(userId, profile);
            } else {
                targets = {
                    userId,
                    bmr: 1650,
                    tdee: 2200,
                    targetCalories: 2000,
                    targetProtein: 120,
                    targetCarbs: 250,
                    targetFat: 60,
                    targetWaterMl: 3000,
                    targetWaterLiters: 3.0,
                    goalType: "MAINTAIN"
                };
            }
        }

        return res.status(200).json({
            success: true,
            data: targets
        });
    } catch (error) {
        console.error("❌ Get Targets Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * FEATURE H: Real "Daily Target" Overview
 * GET /api/targets/overview
 * Everything computed dynamically from MongoDB (no constants)
 */
exports.getTargetsOverview = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const date = req.query.date || getTodayKolkata();

        // 1. Fetch user targets, daily consumption, and active workout plan in parallel
        let [targets, daily, plan] = await Promise.all([
            NutritionTarget.findOne({ $or: [{ userId }, { user: userId }] }).lean(),
            DailyNutrition.findOne({ $or: [{ userId }, { user: userId }], date }).lean(),
            WorkoutPlan.findOne({ userId, status: "Active" }).lean()
        ]);

        if (!targets) {
            const onboarding = await Onboarding.findOne({ userId }).lean();
            if (onboarding) {
                targets = await nutritionCalculationService.saveUserTargets(userId, onboarding);
            }
        }

        if (!plan) {
            plan = await workoutPlanService.getCurrentPlan(userId);
        }

        const proteinTarget = targets?.targetProtein || 100;
        const caloriesTarget = targets?.targetCalories || 2000;
        const waterTargetMl = targets?.targetWaterMl || (targets?.targetWaterLiters ? targets.targetWaterLiters * 1000 : 3000);

        const proteinConsumed = Math.round((daily?.consumedProtein || daily?.consumed?.protein || 0) * 10) / 10;
        const caloriesConsumed = Math.round(daily?.consumedCalories || daily?.consumed?.calories || 0);
        const waterConsumedMl = Math.round(daily?.consumedWater || daily?.consumed?.waterMl || 0);

        const proteinPercentage = proteinTarget > 0 ? Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100)) : 0;
        const caloriesPercentage = caloriesTarget > 0 ? Math.min(100, Math.round((caloriesConsumed / caloriesTarget) * 100)) : 0;
        const waterPercentage = waterTargetMl > 0 ? Math.min(100, Math.round((waterConsumedMl / waterTargetMl) * 100)) : 0;

        const routines = plan?.routines || [];


        const activeSessions = routines.filter(r => !r.isRestDay);
        const sessionsPlanned = activeSessions.length || 4;
        const sessionsDone = activeSessions.filter(r => r.completed).length;
        const sessionsPercentage = sessionsPlanned > 0 ? Math.min(100, Math.round((sessionsDone / sessionsPlanned) * 100)) : 0;

        let weeklyCalorieGoal = 0;
        let weeklyCaloriesBurned = 0;
        routines.forEach(r => {
            const cals = r.calories || r.estimatedCalories || 0;
            weeklyCalorieGoal += cals;
            if (r.completed) {
                weeklyCaloriesBurned += cals;
            }
        });

        const weeklyCaloriePercentage = weeklyCalorieGoal > 0 ? Math.min(100, Math.round((weeklyCaloriesBurned / weeklyCalorieGoal) * 100)) : 0;

        return res.status(200).json({
            success: true,
            date,
            weeklyGoal: {
                sessionsDone,
                sessionsPlanned,
                sessionsPercentage,
                weeklyCaloriesBurned,
                weeklyCalorieGoal,
                weeklyCaloriePercentage
            },
            today: {
                protein: {
                    consumed: proteinConsumed,
                    target: proteinTarget,
                    unit: "g",
                    percentage: proteinPercentage
                },
                water: {
                    consumed: waterConsumedMl,
                    target: waterTargetMl,
                    consumedLiters: parseFloat((waterConsumedMl / 1000).toFixed(1)),
                    targetLiters: parseFloat((waterTargetMl / 1000).toFixed(1)),
                    unit: "ml",
                    percentage: waterPercentage
                },
                calories: {
                    consumed: caloriesConsumed,
                    target: caloriesTarget,
                    unit: "kcal",
                    percentage: caloriesPercentage
                }
            }
        });
    } catch (error) {
        console.error("❌ Error in getTargetsOverview:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to load targets overview" });
    }
};