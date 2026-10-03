// 📄 Path: src/routes/geo.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const geocoderService = require('../service/geocoderService');

router.use(auth);

/**
 * POST /api/geo/geocode
 * Geocode an address to coordinates using OpenStreetMap Nominatim
 * Body: { address: string }
 */
router.post('/geocode', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({
                success: false,
                message: "address field is required"
            });
        }

        const result = await geocoderService.geocodeAddress(address);
        return res.status(200).json({
            success: true,
            provider: "nominatim",
            ...result
        });
    } catch (error) {
        console.error("❌ Geocoding error:", error.message);
        return res.status(400).json({
            success: false,
            message: error.message || "Geocoding failed"
        });
    }
});

/**
 * POST /api/geo/reverse
 * Reverse geocode coordinates to formatted address
 * Body: { lat: number, lng: number }
 */
router.post('/reverse', async (req, res) => {
    try {
        const { lat, lng } = req.body;
        if (lat === undefined || lng === undefined) {
            return res.status(400).json({
                success: false,
                message: "lat and lng fields are required"
            });
        }

        const result = await geocoderService.reverseGeocode(lat, lng);
        return res.status(200).json({
            success: true,
            provider: "nominatim",
            ...result
        });
    } catch (error) {
        console.error("❌ Reverse geocoding error:", error.message);
        return res.status(400).json({
            success: false,
            message: error.message || "Reverse geocoding failed"
        });
    }
});

module.exports = router;
