// 📄 Path: src/routes/target.routes.js
const express = require('express');
const router = express.Router();
const targetController = require('../controllers/targetController');
const auth = require('../middleware/auth.middleware');

// FEATURE H: Real "Daily Target" overview
router.get('/overview', auth, targetController.getTargetsOverview);

// Target setup & query
router.post('/setup', auth, targetController.setupTargets);
router.get('/', auth, targetController.getTargets);

module.exports = router;
