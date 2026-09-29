const DailyNutrition = require('../models/DailyNutrition');
const MealLog = require('../models/MealLog');
const NutritionTarget = require('../models/NutritionTarget');

exports.getTodayNutrition = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Fetch targets if model exists, else fallback to defaults
        let targets = await NutritionTarget.findOne({ userId });

        let dailyRecord = await DailyNutrition.findOne({ userId, date });
        const meals = await MealLog.find({ userId, date });

        let eatenCalories = dailyRecord?.consumed?.calories || dailyRecord?.consumedCalories || 0;
        let eatenProtein = dailyRecord?.consumed?.protein || dailyRecord?.consumedProtein || 0;
        let eatenCarbs = dailyRecord?.consumed?.carbs || dailyRecord?.consumedCarbs || 0;
        let eatenFat = dailyRecord?.consumed?.fat || dailyRecord?.consumedFat || 0;
        let waterMl = dailyRecord?.consumed?.waterMl || dailyRecord?.consumedWater || 0;

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
                eatenCalories: Math.round(eatenCalories),
                remainingCalories: Math.max(0, targetCalories - Math.round(eatenCalories)),
                targetCalories: targetCalories,
                protein: { 
                    current: Math.round(eatenProtein), 
                    target: targetProtein 
                },
                carbs: { 
                    current: Math.round(eatenCarbs), 
                    target: targetCarbs 
                },
                fat: { 
                    current: Math.round(eatenFat), 
                    target: targetFat 
                },
                water: { 
                    current: parseFloat((waterMl / 1000).toFixed(1)), 
                    target: parseFloat((targetWaterMl / 1000).toFixed(1)) 
                },
                mealsLogged: meals
            }
        });
    } catch (error) {
        console.error("❌ Error in getTodayNutrition:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
