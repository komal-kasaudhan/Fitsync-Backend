// 📄 Path: src/service/geocoderService.js
const GeoCache = require('../models/GeoCache');

// Rate limiter: Nominatim usage policy strictly requires max 1 request/second
let lastRequestTime = 0;

async function rateLimitNominatim() {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
    }
    lastRequestTime = Date.now();
}

/**
 * Forward Geocoding: address -> { lat, lng, formattedAddress }
 */
async function geocodeAddress(address) {
    if (!address || typeof address !== 'string' || !address.trim()) {
        throw new Error("Address is required");
    }

    const cleanAddress = address.trim().toLowerCase();
    const cacheKey = `geo:${cleanAddress}`;

    // 1. Check MongoDB Cache
    const cached = await GeoCache.findOne({ queryKey: cacheKey });
    if (cached) {
        return { ...cached.data, cached: true };
    }

    // 2. Rate limit and call Nominatim
    await rateLimitNominatim();

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanAddress)}&format=json&addressdetails=1&limit=1`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'FitSync-Backend/1.0 (contact@fitsync.com)'
        }
    });

    if (!response.ok) {
        throw new Error(`Nominatim geocoding failed with HTTP status ${response.status}`);
    }

    const results = await response.json();
    if (!results || results.length === 0) {
        throw new Error(`No location found for address: "${address}"`);
    }

    const first = results[0];
    const lat = parseFloat(first.lat);
    const lng = parseFloat(first.lon);

    const payload = {
        formattedAddress: first.display_name,
        location: {
            latitude: lat,
            longitude: lng,
            coordinates: [lng, lat]
        },
        addressDetails: first.address || {},
        provider: "nominatim"
    };

    // 3. Save to MongoDB Cache
    await GeoCache.create({
        queryKey: cacheKey,
        type: "geocode",
        data: payload
    });

    return { ...payload, cached: false };
}

/**
 * Reverse Geocoding: { lat, lng } -> formatted address
 */
async function reverseGeocode(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error("Invalid latitude (-90 to 90) or longitude (-180 to 180)");
    }

    // Round to 5 decimal places for caching (~1 meter precision)
    const roundedLat = latitude.toFixed(5);
    const roundedLng = longitude.toFixed(5);
    const cacheKey = `rev:${roundedLat},${roundedLng}`;

    // 1. Check MongoDB Cache
    const cached = await GeoCache.findOne({ queryKey: cacheKey });
    if (cached) {
        return { ...cached.data, cached: true };
    }

    // 2. Rate limit and call Nominatim
    await rateLimitNominatim();

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${roundedLat}&lon=${roundedLng}&format=json&addressdetails=1`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'FitSync-Backend/1.0 (contact@fitsync.com)'
        }
    });

    if (!response.ok) {
        throw new Error(`Nominatim reverse geocoding failed with HTTP status ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.display_name) {
        throw new Error(`No address found for coordinates: [${roundedLat}, ${roundedLng}]`);
    }

    const payload = {
        formattedAddress: data.display_name,
        location: {
            latitude: parseFloat(roundedLat),
            longitude: parseFloat(roundedLng),
            coordinates: [parseFloat(roundedLng), parseFloat(roundedLat)]
        },
        addressDetails: data.address || {},
        provider: "nominatim"
    };

    // 3. Save to MongoDB Cache
    await GeoCache.create({
        queryKey: cacheKey,
        type: "reverse",
        data: payload
    });

    return { ...payload, cached: false };
}

module.exports = {
    geocodeAddress,
    reverseGeocode
};
