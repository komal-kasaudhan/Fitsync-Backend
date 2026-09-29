const NutritionTarget = require('../models/NutritionTarget');

// 🎯 Target Setup & Safe BMR/TDEE Calculation
exports.setupTargets = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { currentWeightKg, targetWeightKg, timeframeDays, gender, heightCm, age, activityLevel, goalType } = req.body;

        // ⚠️ Strict Goal Validation Check
        const weightDifference = Math.abs(currentWeightKg - targetWeightKg);
        const weeks = timeframeDays / 7;
        const ratePerWeek = weightDifference / weeks;

        if (ratePerWeek > 1.0) { // Max safe change is 1kg/week
            return res.status(400).json({
                valid: false,
                reason: `Healthy weight ${goalType === 'WEIGHT_LOSS' ? 'loss' : 'gain'} is approx 0.25–0.8 kg per week. ${weightDifference}kg in ${timeframeDays} days (${ratePerWeek.toFixed(2)}kg/week) is unsafe. Please select a realistic timeline.`
            });
        }

        // BMR & TDEE Calculations
        let bmr = (10 * currentWeightKg) + (6.25 * heightCm) - (5 * age);
        bmr = gender === 'MALE' ? bmr + 5 : bmr - 161;

        const multipliers = { SEDENTARY: 1.2, LIGHTLY_ACTIVE: 1.375, MODERATELY_ACTIVE: 1.55, VERY_ACTIVE: 1.725 };
        const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.2));

        let targetCalories = tdee;
        if (goalType === 'WEIGHT_LOSS') targetCalories -= 400;
        if (goalType === 'WEIGHT_GAIN') targetCalories += 400;

        const targetProtein = Math.round((targetCalories * 0.30) / 4);
        const targetCarbs = Math.round((targetCalories * 0.50) / 4);
        const targetFat = Math.round((targetCalories * 0.20) / 9);

        const targets = await NutritionTarget.findOneAndUpdate(
            { userId: userId },
            {
                userId: userId,
                bmr,
                tdee,
                targetCalories,
                targetProtein,
                targetCarbs,
                targetFat,
                targetWaterMl: 3000,
                targetWaterLiters: 3.0,
                goalType
            },
            { upsert: true, returnDocument: 'after' }
        );

        return res.status(200).json({
            valid: true,
            data: targets
        });
    } catch (error) {
        console.error("❌ Target Setup Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};