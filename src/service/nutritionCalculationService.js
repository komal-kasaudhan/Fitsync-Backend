// 📄 Path: src/services/nutritionCalculationService.js
const DailyNutrition = require('../models/DailyNutrition');
const MealLog = require('../models/MealLog');

class NutritionCalculationService {
 
  async syncDailyNutrition(userId, date) {
    try {
      const meals = await MealLog.find({ userId, date });

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalFiber = 0;

      meals.forEach(meal => {
        if (meal.totalMealNutrition) {
          totalCalories += meal.totalMealNutrition.calories || 0;
          totalProtein += meal.totalMealNutrition.protein || 0;
          totalCarbs += meal.totalMealNutrition.carbs || 0;
          totalFat += meal.totalMealNutrition.fat || 0;
          totalFiber += meal.totalMealNutrition.fiber || 0;
        }
      });

      const dailyRecord = await DailyNutrition.findOneAndUpdate(
        { 
          $or: [{ userId: userId }, { user: userId }], 
          date 
        },
        {
          $set: {
            user: userId,
            userId: userId,
            consumedCalories: Math.round(totalCalories),
            consumedProtein: Math.round(totalProtein * 10) / 10,
            consumedCarbs: Math.round(totalCarbs * 10) / 10,
            consumedFat: Math.round(totalFat * 10) / 10,
            'consumed.calories': Math.round(totalCalories),
            'consumed.protein': Math.round(totalProtein * 10) / 10,
            'consumed.carbs': Math.round(totalCarbs * 10) / 10,
            'consumed.fat': Math.round(totalFat * 10) / 10,
            'consumed.fiber': Math.round(totalFiber * 10) / 10
          }
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      return dailyRecord;
    } catch (error) {
      console.error('❌ Error in syncDailyNutrition:', error.message);
      throw error;
    }
  }
}

module.exports = new NutritionCalculationService();