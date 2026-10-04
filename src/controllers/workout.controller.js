// 📄 Path: src/controllers/workout.controller.js
const Exercise = require('../models/Exercise');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutPreferences = require('../models/WorkoutPreferences');
const Onboarding = require('../models/onboarding.model');
const WeightLog = require('../models/WeightLog');
const workoutPlanService = require('../service/workoutPlan.service');
const nutritionCalculationService = require('../service/nutritionCalculationService');
const { getTodayKolkata, getLast7DaysKolkata } = require('../utils/dateUtils');

/**
 * FEATURE D: Browse Exercise Library
 * GET /api/workout/exercises?muscle=&equipment=&location=&level=
 */
exports.getExercises = async (req, res) => {
    try {
        const { muscle, equipment, location, level, search } = req.query;
        const filter = {};

        if (muscle) {
            filter.$or = [
                { primaryMuscle: { $regex: new RegExp(muscle, "i") } },
                { secondaryMuscles: { $regex: new RegExp(muscle, "i") } }
            ];
        }

        if (equipment) {
            filter.equipment = { $regex: new RegExp(equipment, "i") };
        }

        if (location) {
            filter.locations = { $regex: new RegExp(location, "i") };
        }

        if (level) {
            filter.difficulty = { $regex: new RegExp(level, "i") };
        }

        if (search) {
            filter.name = { $regex: new RegExp(search, "i") };
        }

        const exercises = await Exercise.find(filter).sort({ primaryMuscle: 1, name: 1 }).lean();

        return res.status(200).json({
            success: true,
            count: exercises.length,
            exercises
        });
    } catch (error) {
        console.error("❌ Error in getExercises:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to load exercises" });
    }
};

/**
 * FEATURE E: Generate or regenerate workout plan
 * POST /api/workout/plan/generate
 * POST /api/workout/plan/regenerate
 */
exports.generateWorkoutPlan = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const options = req.body || {};

        const plan = await workoutPlanService.generatePlan(userId, options);

        return res.status(200).json({
            success: true,
            message: "Weekly workout plan generated successfully!",
            plan
        });
    } catch (error) {
        console.error("❌ Error in generateWorkoutPlan:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to generate workout plan" });
    }
};

/**
 * FEATURE E: Get current 7-day plan
 * GET /api/workout/plan/current
 * GET /api/workout/plan
 */
exports.getCurrentPlan = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const plan = await workoutPlanService.getCurrentPlan(userId);

        if (!plan) {
            return res.status(200).json({
                success: true,
                hasPlan: false,
                days: [],
                plan: null
            });
        }

        return res.status(200).json({
            success: true,
            hasPlan: true,
            plan,
            days: plan.routines || []
        });
    } catch (error) {
        console.error("❌ Error in getCurrentPlan:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to load current workout plan" });
    }
};

/**
 * TASK 3: Get workout for a specific day index (0..6)
 * GET /api/workout/day/:dayIndex
 */
exports.getDayWorkout = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const { dayIndex } = req.params;
        const dayWorkout = await workoutPlanService.getDayWorkout(userId, dayIndex);

        if (!dayWorkout) {
            return res.status(200).json({
                success: true,
                hasPlan: false,
                days: [],
                dayWorkout: null,
                message: "No active workout plan found"
            });
        }

        return res.status(200).json({
            success: true,
            hasPlan: true,
            ...dayWorkout
        });
    } catch (error) {
        console.error("❌ Error in getDayWorkout:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to load day workout" });
    }
};

/**
 * TASK 3: Get today's scheduled workout
 * GET /api/workout/today
 */
exports.getTodayWorkout = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const todayWorkout = await workoutPlanService.getTodayWorkout(userId);

        if (!todayWorkout) {
            return res.status(200).json({
                success: true,
                hasPlan: false,
                days: [],
                todayWorkout: null,
                message: "No active workout plan found"
            });
        }

        return res.status(200).json({
            success: true,
            hasPlan: true,
            ...todayWorkout
        });
    } catch (error) {
        console.error("❌ Error in getTodayWorkout:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to load today's workout" });
    }
};


/**
 * FEATURE E: Complete a session
 * POST /api/workout/session/complete
 */
exports.completeSession = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const { dayIndex, exercisesCompleted, durationMin } = req.body;

        if (dayIndex === undefined) {
            return res.status(400).json({ success: false, message: "dayIndex is required" });
        }

        const result = await workoutPlanService.completeSession(userId, {
            dayIndex,
            exercisesCompleted,
            durationMin: Number(durationMin) || 45
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error in completeSession:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to complete session" });
    }
};

/**
 * FEATURE E: Skip a session with adaptation
 * POST /api/workout/session/skip
 */
exports.skipSession = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const { dayIndex, reason } = req.body;

        if (dayIndex === undefined) {
            return res.status(400).json({ success: false, message: "dayIndex is required" });
        }

        const result = await workoutPlanService.skipSession(userId, {
            dayIndex,
            reason: reason || "Busy"
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error in skipSession:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to skip session" });
    }
};

/**
 * TASK 3: Record workout session feedback
 * POST /api/workout/session/feedback
 * Body: { dayIndex, difficulty, soreness, energy, painAreas, notes }
 */
exports.saveSessionFeedback = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const { dayIndex, difficulty, soreness, energy, painAreas, notes } = req.body;

        if (dayIndex === undefined) {
            return res.status(400).json({ success: false, message: "dayIndex is required" });
        }

        const result = await workoutPlanService.saveSessionFeedback(userId, {
            dayIndex,
            difficulty,
            soreness,
            energy,
            painAreas,
            notes
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error in saveSessionFeedback:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to save session feedback" });
    }
};

/**
 * TASK 1: Set exercise image URL manually
 * PUT /api/workout/exercises/:id/image
 */
exports.updateExerciseImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ success: false, message: "imageUrl is required" });
        }

        const updated = await Exercise.findOneAndUpdate(
            { $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
            { $set: { imageUrl } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: `Exercise ${id} not found` });
        }

        return res.status(200).json({
            success: true,
            message: `Image updated for exercise ${updated.id || updated.name}`,
            exercise: {
                id: updated.id,
                name: updated.name,
                imageUrl: updated.imageUrl
            }
        });
    } catch (error) {
        console.error("❌ Error in updateExerciseImage:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * FEATURE F: Workout Stats (No hardcoded values)
 * GET /api/workout/stats
 */
exports.getWorkoutStats = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;

        // 1. Fetch user onboarding profile & weight logs
        const onboarding = await Onboarding.findOne({ userId });
        const weightLogs = await WeightLog.find({ userId }).sort({ date: -1 }).lean();

        const startWeight = onboarding?.currentWeight || (weightLogs[weightLogs.length - 1]?.weightKg) || 70;
        const targetWeight = onboarding?.targetWeight || (startWeight - 5);
        const currentWeight = weightLogs.length > 0 ? weightLogs[0].weightKg : startWeight;

        // Weight progress percentage
        let weightProgressPercent = 0;
        if (startWeight !== targetWeight) {
            const totalToChange = Math.abs(startWeight - targetWeight);
            const changed = Math.abs(startWeight - currentWeight);
            weightProgressPercent = Math.min(100, Math.max(0, Math.round((changed / totalToChange) * 100)));
        }

        // 2. Fetch workout plan and routines
        const plan = await workoutPlanService.getCurrentPlan(userId);
        const hasPlan = Boolean(plan && Array.isArray(plan.routines) && plan.routines.length > 0);
        const routines = plan?.routines || [];

        const activeSessions = routines.filter(r => !r.isRestDay);
        const weeklySessionsPlanned = activeSessions.length || 4;
        const weeklySessionsCompleted = activeSessions.filter(r => r.completed).length;
        const weekCompletionPercent = Math.round((weeklySessionsCompleted / weeklySessionsPlanned) * 100);

        // Calories burned this week
        let caloriesBurnedThisWeek = 0;
        routines.forEach(r => {
            if (r.completed) {
                caloriesBurnedThisWeek += (r.calories || r.estimatedCalories || 0);
            }
        });

        // 3. Last 7 days completion tracking
        const last7 = getLast7DaysKolkata();
        const completedDatesSet = new Set();
        routines.forEach(r => {
            if (r.completed && r.completedAt) {
                completedDatesSet.add(new Date(r.completedAt).toISOString().split('T')[0]);
            }
        });

        const last7Days = last7.map(d => ({
            date: d.date,
            dayLabel: d.dayLabel,
            completed: completedDatesSet.has(d.date)
        }));

        // Calculate streak days (consecutive completed days or active routine count)
        const currentStreakDays = weeklySessionsCompleted;

        return res.status(200).json({
            success: true,
            hasPlan,
            currentWeight,
            startWeight,
            targetWeight,
            weightProgressPercent,
            weeklyStreak: {
                currentStreakDays,
                weeklySessionsCompleted,
                weeklySessionsPlanned
            },
            weekCompletionPercent,
            caloriesBurnedThisWeek,
            last7Days
        });
    } catch (error) {
        console.error("❌ Error in getWorkoutStats:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to load workout stats" });
    }
};

/**
 * FEATURE F: Log Weight and update calorie/macro targets
 * POST /api/workout/weight
 * Body: { weightKg, date }
 */
exports.logWeight = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const { weightKg, date } = req.body;

        if (!weightKg || isNaN(weightKg)) {
            return res.status(400).json({ success: false, message: "Valid weightKg is required" });
        }

        const weightDate = date || getTodayKolkata();

        // 1. Record in WeightLog
        const log = await WeightLog.findOneAndUpdate(
            { userId, date: weightDate },
            { userId, weightKg: Number(weightKg), date: weightDate },
            { upsert: true, new: true }
        );

        // 2. Update currentWeight in Onboarding profile
        const onboarding = await Onboarding.findOneAndUpdate(
            { userId },
            { $set: { currentWeight: Number(weightKg) } },
            { new: true }
        );

        // 3. Recalculate targets based on new weight
        let updatedTargets = null;
        if (onboarding) {
            updatedTargets = await nutritionCalculationService.saveUserTargets(userId, onboarding);
        }

        return res.status(200).json({
            success: true,
            message: `Weight logged: ${weightKg} kg for ${weightDate}`,
            weightLog: log,
            updatedTargets
        });
    } catch (error) {
        console.error("❌ Error in logWeight:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to log weight" });
    }
};

/**
 * Workout Preferences Management
 * POST /api/workout/preferences
 * PUT /api/workout/preferences
 * Takes user strictly from JWT (ignores req.body.userId and dummy id 64b1f1c2d3e4f5a6b7c8d901).
 * NEVER creates a workout plan.
 */
exports.saveWorkoutPreferences = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User ID missing from token" });
        }

        const {
            daysPerWeek,
            specificDays,
            preferredDurationMinutes,
            durationMinutes,
            equipmentAvailable,
            equipment
        } = req.body;

        const existing = await WorkoutPreferences.findOne({ userId });

        const updateData = {
            userId,
            daysPerWeek: daysPerWeek !== undefined
                ? Math.max(1, Math.min(7, Number(daysPerWeek) || 4))
                : (existing?.daysPerWeek || 4),
            specificDays: Array.isArray(specificDays) && specificDays.length > 0
                ? specificDays
                : (existing?.specificDays?.length ? existing.specificDays : ["Monday", "Wednesday", "Friday", "Saturday"]),
            preferredDurationMinutes: (preferredDurationMinutes !== undefined || durationMinutes !== undefined)
                ? (Number(preferredDurationMinutes || durationMinutes) || 45)
                : (existing?.preferredDurationMinutes || 45),
            equipmentAvailable: Array.isArray(equipmentAvailable)
                ? equipmentAvailable
                : (Array.isArray(equipment) ? equipment : (existing?.equipmentAvailable?.length ? existing.equipmentAvailable : ["bodyweight", "none", "dumbbell"]))
        };

        const preferences = await WorkoutPreferences.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Workout preferences saved successfully",
            preferenceId: preferences._id,
            preferences
        });
    } catch (error) {
        console.error("❌ Error in saveWorkoutPreferences:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to save workout preferences"
        });
    }
};

// Legacy backward-compatibility alias
exports.savePreferencesAndQueueGeneration = exports.saveWorkoutPreferences;

/**
 * GET /api/workout/preferences
 */
exports.getWorkoutPreferences = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const preferences = await WorkoutPreferences.findOne({ userId });

        return res.status(200).json({
            success: true,
            preferences: preferences || null
        });
    } catch (error) {
        console.error("❌ Error in getWorkoutPreferences:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to load preferences"
        });
    }
};