const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');

router.post('/scan', verifyToken, uploadImage, aiController.scanFoodImage);
router.post('/ask', verifyToken, aiController.askAiCoach);
router.get('/insight', verifyToken, aiController.getSmartInsight);

module.exports = router;