const WorkoutPreferences = require('../models/WorkoutPreferences');
const Onboarding = require('../models/onboarding.model'); 
const WorkoutPlanService = require('../service/workoutPlan.service'); 

const savePreferencesAndQueueGeneration = async (req, res) => {
    try {
        const { userId, daysPerWeek, specificDays, preferredDurationMinutes, equipmentAvailable } = req.body;
        
        if (!userId || !daysPerWeek || !specificDays || !preferredDurationMinutes) {
            return res.status(400).json({
                success: false,
                message: "Validation Error: Missing execution parameters context tokens."
            });
        }

        const synchronizedPreferences = await WorkoutPreferences.findOneAndUpdate(
            { userId },
            { 
                daysPerWeek, 
                specificDays, 
                preferredDurationMinutes, 
                equipmentAvailable: equipmentAvailable || [] 
            },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        const coreUserProfile = await Onboarding.findOne({ userId });
        if (!coreUserProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile Sync Exception: Target onboarding metrics not found for this user."
            });
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

        console.log("------------------------------------------------------------");
        console.log("🔥 FITSYNC SYSTEM: TRIGGERING ASYNC ENGINE FOR DYNAMIC PLAN");
        console.log("------------------------------------------------------------");

        await WorkoutPlanService.generateAndSaveWorkoutPlan(userId, compiledWorkoutContextPayload);

        return res.status(200).json({
            success: true,
            message: "Preferences synchronized perfectly. Workout plan populated inside MongoDB Atlas.",
            preferenceId: synchronizedPreferences._id,
            compilationTargetTimeSeconds: 6 
        });

    } catch (error) {
        console.error(`[FitSync Core Controller Matrix Exception]: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Runtime Processing Pipeline Failure.",
            error: error.message
        });
    }
};

module.exports = {
    savePreferencesAndQueueGeneration
};