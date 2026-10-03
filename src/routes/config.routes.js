// 📄 Path: src/routes/config.routes.js
const express = require('express');
const router = express.Router();

/**
 * GET /api/config
 * Public configuration endpoint for client apps (no auth required)
 */
router.get('/', (req, res) => {
    const paymentsEnabled = process.env.PAYMENTS_ENABLED === 'true';
    return res.status(200).json({
        success: true,
        paymentsEnabled: paymentsEnabled
    });
});

module.exports = router;
