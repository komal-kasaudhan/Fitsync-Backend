const Onboarding = require("../models/onboarding.model");
const User = require("../models/user.model");

const saveOnboarding = async (req, res) => {
    try {
        const userId = req.user.id; 
        const onboardingData = { userId, ...req.body };

        const newProfile = await Onboarding.findOneAndUpdate(
            { userId },
            onboardingData,
            { new: true, upsert: true }
        );

        await User.findByIdAndUpdate(userId, { onboardingCompleted: true });

        return res.status(200).json({
            success: true,
            message: "Profile Calibrated & Saved Successfully!"
        });

    } catch (error) {
        console.error("Onboarding Save Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error: " + error.message
        });
    }
};

module.exports = { saveOnboarding };