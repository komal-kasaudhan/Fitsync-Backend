const NutritionTarget = require('../models/NutritionTarget');
const Onboarding = require('../models/onboarding.model');
const nutritionCalculationService = require('../service/nutritionCalculationService');

// 🎯 Target Setup & Safe BMR/TDEE Calculation
exports.setupTargets = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
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
        const userId = req.user?._id || req.user?.id;

        let targets = await NutritionTarget.findOne({
            $or: [{ userId }, { user: userId }]
        });

        if (!targets) {
            // Check if user completed onboarding
            const profile = await Onboarding.findOne({ userId });
            if (profile) {
                targets = await nutritionCalculationService.saveUserTargets(userId, profile);
            } else {
                // Return standard default targets
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