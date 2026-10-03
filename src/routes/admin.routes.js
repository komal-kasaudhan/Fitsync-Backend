// 📄 Path: src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth.middleware');

/**
 * PUT /api/admin/exercises/:id/image
 * Body: { imageUrl: string }
 */
router.put('/exercises/:id/image', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ success: false, message: "imageUrl is required" });
        }

        const updated = await Exercise.findOneAndUpdate(
            { $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
            { $set: { imageUrl } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: `Exercise ${id} not found` });
        }

        return res.status(200).json({
            success: true,
            message: `Image updated for exercise ${updated.id || updated.name}`,
            exercise: {
                id: updated.id,
                name: updated.name,
                imageUrl: updated.imageUrl
            }
        });
    } catch (error) {
        console.error("❌ Error in admin updateExerciseImage:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
