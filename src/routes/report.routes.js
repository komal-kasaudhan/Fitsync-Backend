// 📄 Path: src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Report = require('../models/Report');

router.use(auth);

/**
 * POST /api/reports
 * Submit a report for a gym, trainer, product, or review
 */
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetType, targetId, reason, details = "" } = req.body;

        if (!targetType || !targetId || !reason) {
            return res.status(400).json({
                success: false,
                message: "targetType, targetId, and reason are required"
            });
        }

        const validTypes = ["Gym", "TrainerProfile", "Product", "Review"];
        if (!validTypes.includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: `targetType must be one of: ${validTypes.join(', ')}`
            });
        }

        const report = await Report.create({
            targetType,
            targetId,
            userId,
            reason: reason.trim(),
            details: details.trim(),
            status: "pending"
        });

        return res.status(201).json({
            success: true,
            message: "Report submitted successfully for admin review",
            report
        });
    } catch (error) {
        console.error("❌ Error submitting report:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
