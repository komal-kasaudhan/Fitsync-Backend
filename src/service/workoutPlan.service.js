const WorkoutPlan = require('../models/WorkoutPlan');
const Exercise = require('../models/Exercise');
const NutritionTarget = require('../models/NutritionTarget');
const Onboarding = require('../models/onboarding.model');
const nutritionCalculationService = require('./nutritionCalculationService');

class WorkoutPlanService {

    /**
     * Generate dynamic weekly workout plan customized to user's onboarding telemetry & nutrition target
     */
    async generateAndSaveWorkoutPlan(userId, compiledContext) {
        try {
            const { bottomSheetCurrentConstraints = {}, userOnboardingTelemetry = {} } = compiledContext;
            const targetDays = bottomSheetCurrentConstraints.weeklyActiveDays || ["Monday", "Wednesday", "Friday"];
            const duration = Number(bottomSheetCurrentConstraints.durationPerSession) || 45;

            // 1. Fetch user's NutritionTarget (Calories & Macros)
            let userTarget = await NutritionTarget.findOne({
                $or: [{ userId }, { user: userId }]
            });

            if (!userTarget) {
                // Attempt to generate from onboarding telemetry if available
                const onboarding = await Onboarding.findOne({ userId });
                if (onboarding) {
                    userTarget = await nutritionCalculationService.saveUserTargets(userId, onboarding);
                } else {
                    userTarget = {
                        targetCalories: 2000,
                        targetProtein: 120,
                        targetCarbs: 250,
                        targetFat: 60,
                        targetWaterLiters: 3.0,
                        goalType: userOnboardingTelemetry.fitnessGoal || "MAINTAIN"
                    };
                }
            }

            // 2. Fetch real exercises from MongoDB
            const dbExercises = await Exercise.find({});

            // Group exercises by target
            const chestExercises = dbExercises.filter(e => e.primaryTarget?.includes("Chest") || e.primaryTarget?.includes("Upper Chest"));
            const backExercises = dbExercises.filter(e => e.primaryTarget?.includes("Lat") || e.primaryTarget?.includes("Back"));
            const legExercises = dbExercises.filter(e => e.primaryTarget?.includes("Quad") || e.primaryTarget?.includes("Hamstring") || e.targetArea?.includes("Lower"));
            const armShoulderExercises = dbExercises.filter(e => e.primaryTarget?.includes("Shoulder") || e.primaryTarget?.includes("Bicep") || e.primaryTarget?.includes("Tricep"));
            const coreExercises = dbExercises.filter(e => e.targetArea?.includes("Core") || e.primaryTarget?.includes("Ab"));

            // 3. Build intelligent routines for each active day
            const workoutTemplates = [
                {
                    name: "Upper Body Power: Chest & Triceps",
                    muscles: ["Chest", "Triceps"],
                    pool: [...chestExercises, ...armShoulderExercises]
                },
                {
                    name: "Posterior Chain: Back & Biceps",
                    muscles: ["Back", "Biceps"],
                    pool: [...backExercises, ...armShoulderExercises]
                },
                {
                    name: "Lower Body Foundation: Quads & Glutes",
                    muscles: ["Quadriceps", "Glutes", "Hamstrings"],
                    pool: [...legExercises, ...coreExercises]
                },
                {
                    name: "Full Body Functional Conditioning",
                    muscles: ["Full Body", "Core"],
                    pool: [...dbExercises]
                }
            ];

            const userWeight = Number(userOnboardingTelemetry.currentWeight) || 70;
            // Estimated calorie burn: ~0.08 kcal / kg / minute of resistance training
            const estimatedCaloriesBurned = Math.round(duration * (userWeight * 0.08));

            const difficultyLevel = (userOnboardingTelemetry.fitnessGoal === "Muscle Gain" || userOnboardingTelemetry.activityLevel?.includes("VERY"))
                ? "Intermediate"
                : "Beginner";

            const generatedRoutines = targetDays.map((day, idx) => {
                const template = workoutTemplates[idx % workoutTemplates.length];
                const selectedExercises = (template.pool.length >= 2 ? template.pool : dbExercises).slice(0, 4);

                return {
                    day,
                    workoutName: template.name,
                    targetMuscles: template.muscles,
                    duration,
                    calories: estimatedCaloriesBurned,
                    difficulty: difficultyLevel,
                    exercises: selectedExercises.map(ex => ({
                        exerciseId: ex._id,
                        exerciseName: ex.name,
                        primaryTarget: ex.primaryTarget,
                        sets: 3,
                        reps: userOnboardingTelemetry.fitnessGoal === "Muscle Gain" ? "8-10" : "12-15",
                        restDuration: "60s"
                    }))
                };
            });

            // 4. Save into MongoDB Atlas per user
            const savedPlan = await WorkoutPlan.findOneAndUpdate(
                { userId, status: "Active" },
                {
                    userId,
                    weekNumber: 1,
                    status: "Active",
                    nutritionTarget: {
                        targetCalories: userTarget.targetCalories,
                        targetProtein: userTarget.targetProtein,
                        targetCarbs: userTarget.targetCarbs,
                        targetFat: userTarget.targetFat,
                        targetWaterLiters: userTarget.targetWaterLiters || 3.0,
                        goalType: userTarget.goalType || "MAINTAIN"
                    },
                    routines: generatedRoutines
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            return savedPlan;
        } catch (error) {
            console.error("❌ WorkoutPlanService Error:", error);
            throw new Error(`[WorkoutPlanService Error]: ${error.message}`);
        }
    }

    /**
     * Retrieve active workout plan for given user
     */
    async getUserWorkoutPlan(userId) {
        let plan = await WorkoutPlan.findOne({ userId, status: "Active" })
            .populate('routines.exercises.exerciseId');

        return plan;
    }
}

module.exports = new WorkoutPlanService();