const express = require("express");
const router = express.Router();

const { signup,login } = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login",login);
const auth = require("../middleware/auth.middleware");
const User = require("../models/user.model");

router.get("/profile", auth, async (req, res) => {
    try {
        const userDoc = await User.findById(req.user.id).select("-password").lean();
        if (!userDoc) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success: true,
            user: {
                ...userDoc,
                roles: userDoc.roles || ["user"]
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
module.exports = router;