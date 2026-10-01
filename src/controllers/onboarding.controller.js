const Onboarding = require("../models/onboarding.model");
const User = require("../models/user.model");
const nutritionCalculationService = require("../service/nutritionCalculationService");

const saveOnboarding = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
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