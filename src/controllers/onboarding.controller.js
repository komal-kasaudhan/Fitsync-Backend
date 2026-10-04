const Onboarding = require("../models/onboarding.model");
const User = require("../models/user.model");
const nutritionCalculationService = require("../service/nutritionCalculationService");

const saveOnboarding = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const {
            gender,
            age,
            height,
            currentWeight: rawCurrentWeight,
            weight: rawWeight,
            targetWeight: rawTargetWeight,
            goal,
            activityLevel
        } = req.body;

        const errors = {};

        // 1. Age (10-100)
        const parsedAge = Number(age);
        if (age === undefined || age === null || age === "" || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 100) {
            errors.age = "Age is required and must be between 10 and 100";
        }

        // 2. Height (100-250 cm)
        const parsedHeight = Number(height);
        if (height === undefined || height === null || height === "" || isNaN(parsedHeight) || parsedHeight < 100 || parsedHeight > 250) {
            errors.height = "Height is required and must be between 100 and 250 cm";
        }

        // 3. Current Weight (25-300 kg)
        const weightVal = rawCurrentWeight !== undefined ? rawCurrentWeight : rawWeight;
        const parsedCurrentWeight = Number(weightVal);
        if (weightVal === undefined || weightVal === null || weightVal === "" || isNaN(parsedCurrentWeight) || parsedCurrentWeight < 25 || parsedCurrentWeight > 300) {
            errors.currentWeight = "Current weight is required and must be between 25 and 300 kg";
        }

        // 4. Target Weight (25-300 kg)
        const parsedTargetWeight = Number(rawTargetWeight);
        if (rawTargetWeight === undefined || rawTargetWeight === null || rawTargetWeight === "" || isNaN(parsedTargetWeight) || parsedTargetWeight < 25 || parsedTargetWeight > 300) {
            errors.targetWeight = "Target weight is required and must be between 25 and 300 kg";
        }

        // 5. Gender
        if (!gender || typeof gender !== 'string' || !gender.trim()) {
            errors.gender = "Gender is required";
        }

        // 6. Goal
        if (!goal || typeof goal !== 'string' || !goal.trim()) {
            errors.goal = "Goal is required";
        }

        // 7. Activity Level
        if (!activityLevel || typeof activityLevel !== 'string' || !activityLevel.trim()) {
            errors.activityLevel = "Activity level is required";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        // Normalize currentWeight and defaults if needed
        if (req.body.currentWeight === undefined && rawWeight !== undefined) {
            req.body.currentWeight = parsedCurrentWeight;
        }
        if (req.body.workoutLocation === undefined) {
            req.body.workoutLocation = "gym";
        }
        if (req.body.isHealthCleared === undefined) {
            req.body.isHealthCleared = true;
        }

        const onboardingData = { userId, ...req.body };

        const newProfile = await Onboarding.findOneAndUpdate(
            { userId },
            onboardingData,
            { new: true, upsert: true }
        );

        await User.findByIdAndUpdate(userId, { onboardingCompleted: true });

        // Calculate and save personalized Mifflin-St Jeor NutritionTarget
        const targets = await nutritionCalculationService.saveUserTargets(userId, req.body);

        return res.status(200).json({
            success: true,
            message: "Profile Calibrated & Saved Successfully!",
            data: {
                profile: newProfile,
                targets: targets
            }
        });

    } catch (error) {
        console.error("❌ Onboarding Save Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error: " + error.message
        });
    }
};

const getOnboardingProfile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const profile = await Onboarding.findOne({ userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "No onboarding profile found for this user"
            });
        }

        return res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error("❌ Get Onboarding Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { saveOnboarding, getOnboardingProfile };