const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    googleSignIn,
    forgotPassword,
    verifyOtp,
    resetPassword
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");
const User = require("../models/user.model");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleSignIn);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

router.get("/profile", auth, async (req, res) => {
    try {
        const userDoc = await User.findById(req.user.id).select("-password").lean();
        if (!userDoc) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const roles = userDoc.roles || ["user"];
        const nonOnboardingRoles = ["admin", "gym_owner", "trainer", "seller"];
        const needsOnboarding = roles.some(r => nonOnboardingRoles.includes(r)) ? false : !userDoc.onboardingCompleted;

        res.status(200).json({
            success: true,
            user: {
                ...userDoc,
                roles,
                needsOnboarding
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// User profile update - ROLES CAN NEVER BE EDITED THROUGH USER-FACING ENDPOINTS
router.put("/profile", auth, async (req, res) => {
    try {
        if (req.body.roles !== undefined) {
            return res.status(403).json({
                success: false,
                message: "Roles can never be edited through user-facing endpoints"
            });
        }
        delete req.body.roles;
        delete req.body.email; // email cannot be altered

        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select("-password").lean();

        const roles = updated.roles || ["user"];
        const nonOnboardingRoles = ["admin", "gym_owner", "trainer", "seller"];
        const needsOnboarding = roles.some(r => nonOnboardingRoles.includes(r)) ? false : !updated.onboardingCompleted;

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                ...updated,
                roles,
                needsOnboarding
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;