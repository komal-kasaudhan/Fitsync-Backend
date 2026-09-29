const DailyNutrition = require('../models/DailyNutrition');
const NutritionTarget = require('../models/NutritionTarget');
const MealLog = require('../models/MealLog');
const mealService = require('../service/mealService');

exports.addMeal = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { date, mealType, foodId, quantity, unit } = req.body;

        if (!mealType || !foodId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'mealType, foodId, and quantity are required'
            });
        }

        const logDate = date || new Date().toISOString().split('T')[0];
        const updatedMealLog = await mealService.addMealItem(userId, {
            date: logDate,
            mealType,
            foodId,
            quantity: Number(quantity),
            unit
        });

        return res.status(200).json({
            success: true,
            message: 'Meal added successfully',
            data: updatedMealLog
        });
    } catch (error) {
        console.error('❌ Add Meal Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to add meal'
        });
    }
};

exports.deleteMealItem = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { date, mealType, itemId, foodId } = req.body;
        const logDate = date || req.query.date || new Date().toISOString().split('T')[0];

        const updatedMealLog = await mealService.deleteMealItem(userId, {
            date: logDate,
            mealType: mealType || req.query.mealType,
            itemId: itemId || req.query.itemId,
            foodId: foodId || req.query.foodId
        });

        return res.status(200).json({
            success: true,
            message: 'Meal item deleted successfully',
            data: updatedMealLog
        });
    } catch (error) {
        console.error('❌ Delete Meal Item Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to delete meal item'
        });
    }
};

exports.updateMealQuantity = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { date, mealType, itemId, foodId, quantity } = req.body;

        if (!quantity) {
            return res.status(400).json({
                success: false,
                message: 'quantity is required'
            });
        }

        const logDate = date || new Date().toISOString().split('T')[0];
        const updatedMealLog = await mealService.updateMealQuantity(userId, {
            date: logDate,
            mealType,
            itemId,
            foodId,
            quantity: Number(quantity)
        });

        return res.status(200).json({
            success: true,
            message: 'Meal item updated successfully',
            data: updatedMealLog
        });
    } catch (error) {
        console.error('❌ Update Meal Quantity Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to update meal quantity'
        });
    }
};

exports.getTodayNutrition = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // 1. Fetch user targets
        let targets = await NutritionTarget.findOne({ userId });

        if (!targets) {
            targets = {
                targetCalories: 2200,
                targetProtein: 120,
                targetCarbs: 260,
                targetFat: 70,
                targetWaterLiters: 3.0,
                targetWaterMl: 3000
            };
        }

        // 2. Fetch daily consumed record & meal logs
        const dailyLog = await DailyNutrition.findOne({ userId, date });
        const meals = await MealLog.find({ userId, date });

        let eatenCal = dailyLog?.consumed?.calories || dailyLog?.consumedCalories || 0;
        let eatenProt = dailyLog?.consumed?.protein || dailyLog?.consumedProtein || 0;
        let eatenCarbs = dailyLog?.consumed?.carbs || dailyLog?.consumedCarbs || 0;
        let eatenFat = dailyLog?.consumed?.fat || dailyLog?.consumedFat || 0;
        let eatenWaterMl = dailyLog?.consumed?.waterMl || dailyLog?.consumedWater || 0;

        // Recalculate from meals if dailyLog is zero but meals exist
        if (eatenCal === 0 && meals.length > 0) {
            meals.forEach(m => {
                if (m.totalMealNutrition) {
                    eatenCal += m.totalMealNutrition.calories || 0;
                    eatenProt += m.totalMealNutrition.protein || 0;
                    eatenCarbs += m.totalMealNutrition.carbs || 0;
                    eatenFat += m.totalMealNutrition.fat || 0;
                }
            });
        }

        const remCalories = Math.max(0, targets.targetCalories - eatenCal);
        const targetWaterL = targets.targetWaterLiters || (targets.targetWaterMl ? targets.targetWaterMl / 1000.0 : 3.0);

        return res.status(200).json({
            success: true,
            data: {
                eatenCalories: Math.round(eatenCal),
                remainingCalories: Math.round(remCalories),
                targetCalories: targets.targetCalories,
                protein: {
                    current: Math.round(eatenProt),
                    target: targets.targetProtein
                },
                carbs: {
                    current: Math.round(eatenCarbs),
                    target: targets.targetCarbs
                },
                fat: {
                    current: Math.round(eatenFat),
                    target: targets.targetFat
                },
                water: {
                    current: parseFloat((eatenWaterMl / 1000.0).toFixed(1)),
                    target: parseFloat(targetWaterL.toFixed(1))
                },
                mealsLogged: meals
            }
        });

    } catch (error) {
        console.error("❌ Get Today Nutrition Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch dashboard data"
        });
    }
};