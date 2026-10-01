// 📄 Path: src/service/nutritionCalculationService.js
const DailyNutrition = require('../models/DailyNutrition');
const MealLog = require('../models/MealLog');
const NutritionTarget = require('../models/NutritionTarget');

class NutritionCalculationService {

  /**
   * Calculate BMR, TDEE, Calorie/Macro Targets, and Water from user biometric profile
   * Formula: Mifflin-St Jeor Equation
   */
  calculateTargets({ gender, age, height, currentWeight, goal, activityLevel }) {
    const weightKg = Number(currentWeight) || 70;
    const heightCm = Number(height) || 170;
    const ageYears = Number(age) || 25;

    // 1. BMR (Mifflin-St Jeor)
    // Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
    // Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
    const isMale = String(gender || "").toUpperCase().startsWith("M");
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
    bmr = isMale ? Math.round(bmr + 5) : Math.round(bmr - 161);

    // 2. TDEE with Activity Multipliers
    const actStr = String(activityLevel || "").toUpperCase();
    let multiplier = 1.375; // Default lightly active
    if (actStr.includes("SEDENTARY")) multiplier = 1.2;
    else if (actStr.includes("LIGHT")) multiplier = 1.375;
    else if (actStr.includes("MODERATE")) multiplier = 1.55;
    else if (actStr.includes("VERY") || actStr.includes("HIGH") || actStr.includes("INTENSE")) multiplier = 1.725;
    else if (actStr.includes("EXTREME") || actStr.includes("EXTRA")) multiplier = 1.9;

    const tdee = Math.round(bmr * multiplier);

    // 3. Goal Adjustment
    const goalStr = String(goal || "").toUpperCase();
    let targetCalories = tdee;
    let goalType = "MAINTAIN";

    if (goalStr.includes("LOSE") || goalStr.includes("LOSS") || goalStr.includes("CUT")) {
      targetCalories = Math.max(1200, tdee - 500);
      goalType = "WEIGHT_LOSS";
    } else if (goalStr.includes("GAIN") || goalStr.includes("BULK") || goalStr.includes("BUILD")) {
      targetCalories = tdee + 400;
      goalType = "WEIGHT_GAIN";
    }

    // 4. Macronutrient Split
    // 30% Protein (4 kcal/g), 25% Fat (9 kcal/g), 45% Carbs (4 kcal/g)
    const targetProtein = Math.round((targetCalories * 0.30) / 4);
    const targetFat = Math.round((targetCalories * 0.25) / 9);
    const targetCarbs = Math.round((targetCalories - (targetProtein * 4) - (targetFat * 9)) / 4);

    // 5. Water: ~35 ml per kg of body weight
    const rawWaterMl = Math.round(weightKg * 35);
    const targetWaterMl = Math.max(2000, Math.min(6000, rawWaterMl));
    const targetWaterLiters = parseFloat((targetWaterMl / 1000).toFixed(1));

    return {
      bmr,
      tdee,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      targetWaterMl,
      targetWaterLiters,
      goalType
    };
  }

  /**
   * Save or update NutritionTarget for a user in MongoDB
   */
  async saveUserTargets(userId, profileData) {
    const calculated = this.calculateTargets(profileData);

    const targets = await NutritionTarget.findOneAndUpdate(
      { $or: [{ userId }, { user: userId }] },
      {
        $set: {
          userId,
          user: userId,
          ...calculated
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return targets;
  }

  /**
   * Sync DailyNutrition summary from meal logs for given date
   */
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