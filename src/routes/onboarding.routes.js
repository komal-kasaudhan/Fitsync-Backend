const express = require("express");
const router = express.Router();
const { saveOnboarding } = require("../controllers/onboarding.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, saveOnboarding);

module.exports = router;