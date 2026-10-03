// 📄 Path: src/routes/home.routes.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const auth = require('../middleware/auth.middleware');

// Single-call Home Dashboard Data
router.get('/summary', auth, homeController.getHomeSummary);
router.get('/', auth, homeController.getHomeSummary); // Alias

module.exports = router;
