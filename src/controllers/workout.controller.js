const WorkoutPreferences = require('../models/WorkoutPreferences');
const Onboarding = require('../models/onboarding.model');
const WorkoutPlanService = require('../service/workoutPlan.service');

const savePreferencesAndQueueGeneration = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.body.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Authentication or userId is required."
            });
        }

        const daysPerWeek = Number(req.body.daysPerWeek) || (req.body.specificDays?.length ? req.body.specificDays.length : 3);
        const specificDays = req.body.specificDays || ["Monday", "Wednesday", "Friday"];
        const preferredDurationMinutes = Number(req.body.preferredDurationMinutes) || 45;
        const equipmentAvailable = req.body.equipmentAvailable || [];

        const synchronizedPreferences = await WorkoutPreferences.findOneAndUpdate(
            { userId },
            {
                userId,
                daysPerWeek,
                specificDays,
                preferredDurationMinutes,
                equipmentAvailable
            },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        let coreUserProfile = await Onboarding.findOne({ userId });
        if (!coreUserProfile) {
            coreUserProfile = {
                age: 25,
                gender: "Male",
                height: 175,
                currentWeight: 70,
                targetWeight: 70,
                goal: "Fitness",
                activityLevel: "MODERATE",
                workoutLocation: "Gym",
                selectedMedicalConditions: [],
                physicalLimitations: "None"
            };
        }

        const compiledWorkoutContextPayload = {
            userOnboardingTelemetry: {
                age: coreUserProfile.age,
                gender: coreUserProfile.gender,
                height: coreUserProfile.height,
                currentWeight: coreUserProfile.currentWeight,
                targetWeight: coreUserProfile.targetWeight,
                fitnessGoal: coreUserProfile.goal,
                activityLevel: coreUserProfile.activityLevel,
                workoutLocation: coreUserProfile.workoutLocation,
                medicalConditions: coreUserProfile.selectedMedicalConditions || [],
                physicalLimitations: coreUserProfile.physicalLimitations || "None"
            },
            bottomSheetCurrentConstraints: {
                targetDaysCount: synchronizedPreferences.daysPerWeek,
                weeklyActiveDays: synchronizedPreferences.specificDays,
                durationPerSession: synchronizedPreferences.preferredDurationMinutes,
                hardwareInventory: synchronizedPreferences.equipmentAvailable
            }
        };

        const plan = await WorkoutPlanService.generateAndSaveWorkoutPlan(userId, compiledWorkoutContextPayload);

        return res.status(200).json({
            success: true,
            message: "Workout plan generated successfully and saved to MongoDB Atlas.",
            preferenceId: synchronizedPreferences._id,
            data: plan
        });

    } catch (error) {
        console.error("❌ Workout Generation Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Runtime Processing Pipeline Failure.",
            error: error.message
        });
    }
};

const getWorkoutPlan = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Authentication or userId is required."
            });
        }

        let plan = await WorkoutPlanService.getUserWorkoutPlan(userId);

        if (!plan) {
            const coreUserProfile = await Onboarding.findOne({ userId });
            const prefs = await WorkoutPreferences.findOne({ userId });

            const defaultContext = {
                userOnboardingTelemetry: coreUserProfile || { currentWeight: 70, fitnessGoal: "Fitness" },
                bottomSheetCurrentConstraints: {
                    targetDaysCount: prefs?.daysPerWeek || 3,
                    weeklyActiveDays: prefs?.specificDays || ["Monday", "Wednesday", "Friday"],
                    durationPerSession: prefs?.preferredDurationMinutes || 45,
                    hardwareInventory: prefs?.equipmentAvailable || []
                }
            };
            plan = await WorkoutPlanService.generateAndSaveWorkoutPlan(userId, defaultContext);
        }

        return res.status(200).json({
            success: true,
            data: plan
        });
    } catch (error) {
        console.error("❌ Get Workout Plan Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    savePreferencesAndQueueGeneration,
    getWorkoutPlan
};