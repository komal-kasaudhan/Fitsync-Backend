// 📄 Path: src/controllers/homeController.js
const User = require('../models/user.model');
const Onboarding = require('../models/onboarding.model');
const WeightLog = require('../models/WeightLog');
const DailyNutrition = require('../models/DailyNutrition');
const MealLog = require('../models/MealLog');
const NutritionTarget = require('../models/NutritionTarget');
const Recipe = require('../models/Recipe');
const WorkoutPlan = require('../models/WorkoutPlan');
const workoutPlanService = require('../service/workoutPlan.service');
const nutritionCalculationService = require('../service/nutritionCalculationService');
const {
    getTodayKolkata,
    getYesterdayKolkata,
    getWeekdayKolkata,
    getLast7DaysKolkata,
    getCurrentIndianSeason
} = require('../utils/dateUtils');

/**
 * ITEM 6: Single-call Home Dashboard Data
 * GET /api/home/summary?date=YYYY-MM-DD
 * Parallelized with try/catch per section
 */
exports.getHomeSummary = async (req, res) => {
    const userId = req.user?._id || req.user?.id || req.userId;
    const date = req.query.date || getTodayKolkata();

    const result = {
        success: true,
        date,
        hasPlan: false,
        days: [],
        user: null,
        weight: null,
        todayNutrition: null,
        todayWorkout: null,
        weeklyWorkout: null,
        last7DaysCalories: [],
        insight: null,
        recommendedMeals: []
    };

    // Run all sections in parallel with Promise.allSettled
    await Promise.allSettled([
        // SECTION 1: User Profile
        (async () => {
            try {
                const userDoc = await User.findById(userId).select('name email').lean();
                if (userDoc) {
                    result.user = {
                        name: userDoc.name || "Fitness Enthusiast",
                        email: userDoc.email || ""
                    };
                }
            } catch (err) {
                console.error("❌ [HomeSummary] User section error:", err.message);
            }
        })(),

        // SECTION 2: Current & Target Weight Progress
        (async () => {
            try {
                const [onboarding, latestWeightLog] = await Promise.all([
                    Onboarding.findOne({ userId }).lean(),
                    WeightLog.findOne({ userId }).sort({ date: -1 }).lean()
                ]);
                const currentWeightKg = latestWeightLog ? latestWeightLog.weightKg : (onboarding?.currentWeight || 70);
                const targetWeightKg = onboarding?.targetWeight || (currentWeightKg > 70 ? currentWeightKg - 5 : currentWeightKg);
                const startWeightKg = onboarding?.currentWeight || currentWeightKg;

                let weightProgressPercent = 0;
                if (startWeightKg !== targetWeightKg) {
                    const totalToChange = Math.abs(startWeightKg - targetWeightKg);
                    const changed = Math.abs(startWeightKg - currentWeightKg);
                    weightProgressPercent = Math.min(100, Math.max(0, Math.round((changed / totalToChange) * 100)));
                }

                result.weight = {
                    currentWeightKg: Number(currentWeightKg),
                    targetWeightKg: Number(targetWeightKg),
                    weightProgressPercent
                };
            } catch (err) {
                console.error("❌ [HomeSummary] Weight section error:", err.message);
            }
        })(),

        // SECTION 3: Today's Nutrition vs Targets
        (async () => {
            try {
                const [targetsDoc, daily, meals] = await Promise.all([
                    NutritionTarget.findOne({ $or: [{ userId }, { user: userId }] }).lean(),
                    DailyNutrition.findOne({ $or: [{ userId }, { user: userId }], date }).lean(),
                    MealLog.find({ userId, date }).lean()
                ]);

                let targets = targetsDoc;
                if (!targets) {
                    const onboarding = await Onboarding.findOne({ userId }).lean();
                    if (onboarding) {
                        targets = await nutritionCalculationService.saveUserTargets(userId, onboarding);
                    }
                }

                const targetCalories = targets?.targetCalories || 2000;
                const targetProtein = targets?.targetProtein || 100;
                const targetCarbs = targets?.targetCarbs || 250;
                const targetFat = targets?.targetFat || 65;
                const targetWaterLiters = targets?.targetWaterLiters || 3.0;

                let consumedCalories = daily?.consumedCalories || daily?.consumed?.calories || 0;
                let consumedProtein = daily?.consumedProtein || daily?.consumed?.protein || 0;
                let consumedCarbs = daily?.consumedCarbs || daily?.consumed?.carbs || 0;
                let consumedFat = daily?.consumedFat || daily?.consumed?.fat || 0;
                let consumedWater = parseFloat(((daily?.consumedWater || daily?.consumed?.waterMl || 0) / 1000).toFixed(1));

                if (meals && meals.length > 0) {
                    let mCal = 0, mProt = 0, mCarb = 0, mFat = 0;
                    meals.forEach(m => {
                        const nut = m.totalMealNutrition || {};
                        mCal += nut.calories || m.calories || 0;
                        mProt += nut.protein || m.protein || 0;
                        mCarb += nut.carbs || m.carbs || 0;
                        mFat += nut.fat || m.fat || 0;
                    });
                    if (mCal > 0) {
                        consumedCalories = Math.max(consumedCalories, mCal);
                        consumedProtein = Math.max(consumedProtein, mProt);
                        consumedCarbs = Math.max(consumedCarbs, mCarb);
                        consumedFat = Math.max(consumedFat, mFat);
                    }
                }

                result.todayNutrition = {
                    calories: {
                        consumed: Math.round(consumedCalories),
                        target: targetCalories,
                        remaining: Math.max(0, Math.round(targetCalories - consumedCalories))
                    },
                    protein: {
                        consumed: Math.round(consumedProtein * 10) / 10,
                        target: targetProtein,
                        remaining: Math.max(0, Math.round((targetProtein - consumedProtein) * 10) / 10)
                    },
                    carbs: {
                        consumed: Math.round(consumedCarbs * 10) / 10,
                        target: targetCarbs,
                        remaining: Math.max(0, Math.round((targetCarbs - consumedCarbs) * 10) / 10)
                    },
                    fat: {
                        consumed: Math.round(consumedFat * 10) / 10,
                        target: targetFat,
                        remaining: Math.max(0, Math.round((targetFat - consumedFat) * 10) / 10)
                    },
                    water: {
                        consumedLiters: consumedWater,
                        targetLiters: targetWaterLiters,
                        remainingLiters: Math.max(0, parseFloat((targetWaterLiters - consumedWater).toFixed(1)))
                    }
                };
            } catch (err) {
                console.error("❌ [HomeSummary] Nutrition section error:", err.message);
            }
        })(),

        // SECTION 4 & 5: Workout Plan (today + weekly stats)
        (async () => {
            try {
                const plan = await workoutPlanService.getCurrentPlan(userId);
                result.hasPlan = Boolean(plan && Array.isArray(plan.routines) && plan.routines.length > 0);
                result.days = result.hasPlan ? (plan.routines || []) : [];

                if (result.hasPlan) {
                    const todayWeekday = getWeekdayKolkata();
                    const routine = (plan?.routines || []).find(r => r.dayName === todayWeekday || r.day === todayWeekday) || (plan?.routines || [])[0];

                    if (routine) {
                        result.todayWorkout = {
                            dayIndex: routine.dayIndex !== undefined ? routine.dayIndex : 0,
                            dayName: routine.dayName || todayWeekday,
                            focus: routine.focus || "Daily Movement",
                            durationMin: Number(routine.durationMin || routine.estimatedMinutes || 45),
                            calories: Number(routine.estimatedCalories || routine.calories || 200),
                            isRestDay: Boolean(routine.isRestDay),
                            completed: Boolean(routine.completed)
                        };
                    }

                    const routines = plan?.routines || [];
                    const activeSessions = routines.filter(r => !r.isRestDay);
                    const sessionsPlanned = activeSessions.length || 4;
                    const sessionsCompleted = activeSessions.filter(r => r.completed).length;
                    const completionPercent = Math.round((sessionsCompleted / sessionsPlanned) * 100);

                    result.weeklyWorkout = {
                        sessionsPlanned,
                        sessionsCompleted,
                        completionPercent,
                        streakDays: sessionsCompleted
                    };
                } else {
                    result.todayWorkout = null;
                    result.weeklyWorkout = null;
                }
            } catch (err) {
                console.error("❌ [HomeSummary] Workout section error:", err.message);
            }
        })(),

        // SECTION 6: Last 7 Days Calories
        (async () => {
            try {
                const last7 = getLast7DaysKolkata(date);
                const dates = last7.map(d => d.date);

                const [records, targetDoc] = await Promise.all([
                    DailyNutrition.find({ $or: [{ userId }, { user: userId }], date: { $in: dates } }).lean(),
                    NutritionTarget.findOne({ $or: [{ userId }, { user: userId }] }).lean()
                ]);

                const recordMap = new Map();
                records.forEach(r => recordMap.set(r.date, r));
                const baseTarget = targetDoc?.targetCalories || 2000;

                result.last7DaysCalories = last7.map(day => {
                    const rec = recordMap.get(day.date);
                    const cal = Math.round(rec?.consumedCalories || rec?.consumed?.calories || 0);
                    const target = rec?.targetCalories || baseTarget;
                    const goalHit = cal > 0 && cal >= target * 0.9 && cal <= target * 1.15;
                    return {
                        date: day.date,
                        dayLabel: day.dayLabel,
                        caloriesConsumed: cal,
                        calorieTarget: target,
                        goalHit
                    };
                });
            } catch (err) {
                console.error("❌ [HomeSummary] 7 days error:", err.message);
                result.last7DaysCalories = [];
            }
        })(),

        // SECTION 7: Short Insight Line
        (async () => {
            try {
                const yesterday = getYesterdayKolkata(date);
                const yesterdayDaily = await DailyNutrition.findOne({
                    $or: [{ userId }, { user: userId }],
                    date: yesterday
                }).lean();

                if (yesterdayDaily) {
                    const yCal = yesterdayDaily.consumedCalories || yesterdayDaily.consumed?.calories || 0;
                    const yProt = yesterdayDaily.consumedProtein || yesterdayDaily.consumed?.protein || 0;
                    const yTargetProt = yesterdayDaily.targetProtein || 100;
                    const hit = yProt >= (yTargetProt * 0.9);
                    result.insight = {
                        message: hit
                            ? `Great job hitting protein yesterday (${yProt}g)! Maintain momentum today.`
                            : `You were slightly under protein yesterday (${yProt}g). Prioritize a high-protein meal today!`,
                        tone: hit ? "celebratory" : "corrective",
                        isFirstTime: false
                    };
                } else {
                    result.insight = {
                        message: "Consistency is what transforms average into excellence. Let's make today count towards your goal!",
                        tone: "encouraging",
                        isFirstTime: true
                    };
                }
            } catch (err) {
                console.error("❌ [HomeSummary] Insight error:", err.message);
                result.insight = {
                    message: "Fuel your body with nutrient-dense meals and stay hydrated today!",
                    tone: "encouraging",
                    isFirstTime: false
                };
            }
        })(),

        // SECTION 8: 1-2 Recommended Meals
        (async () => {
            try {
                const season = getCurrentIndianSeason(date);
                let recipes = await Recipe.find({
                    seasons: { $in: [season, "all"] }
                }).limit(2).lean();

                if (!recipes || recipes.length < 2) {
                    recipes = await Recipe.find({}).limit(2).lean();
                }

                result.recommendedMeals = recipes.slice(0, 2).map(r => ({
                    id: r._id,
                    name: r.name,
                    calories: Number(r.calories) || 300,
                    protein: Number(r.protein) || 20,
                    carbs: Number(r.carbs) || 30,
                    fat: Number(r.fat) || 10,
                    imageUrl: r.imageUrl || "",
                    mealType: r.mealType || "Lunch"
                }));
            } catch (err) {
                console.error("❌ [HomeSummary] Recommended meals error:", err.message);
                result.recommendedMeals = [];
            }
        })()
    ]);

    return res.status(200).json(result);
};
