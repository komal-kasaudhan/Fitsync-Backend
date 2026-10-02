// 📄 Path: src/routes/equipment.routes.js
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const auth = require('../middleware/auth.middleware');

// FEATURE G: Master equipment list
router.get('/master', auth, equipmentController.getMasterEquipment);

module.exports = router;
