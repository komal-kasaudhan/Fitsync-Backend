const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/auth.middleware');

router.post('/scan', verifyToken, aiController.scanFoodImage);
router.post('/ask', verifyToken, aiController.askAiCoach);
router.get('/insight', verifyToken, aiController.getSmartInsight);

module.exports = router;