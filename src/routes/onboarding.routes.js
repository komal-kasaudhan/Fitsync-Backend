const express = require("express");
const router = express.Router();
const { saveOnboarding, getOnboardingProfile } = require("../controllers/onboarding.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, saveOnboarding);
router.get("/", auth, getOnboardingProfile);

module.exports = router;