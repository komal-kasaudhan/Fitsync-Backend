// 📄 Path: src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');

// FEATURE I: Ask AI & History
router.post('/ask', auth, aiController.askAiCoach);
router.get('/history', auth, aiController.getChatHistory);

// AI Vision food scanner
router.post('/scan', auth, uploadImage, aiController.scanFoodImage);

// Smart insight
router.get('/insight', auth, aiController.getSmartInsight);

module.exports = router;