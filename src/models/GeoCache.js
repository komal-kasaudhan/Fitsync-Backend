// 📄 Path: src/models/GeoCache.js
const mongoose = require('mongoose');

const geoCacheSchema = new mongoose.Schema({
    queryKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    type: {
        type: String,
        enum: ["geocode", "reverse"],
        required: true
    },
    data: {
        type: Object,
        required: true
    }
}, {
    timestamps: true
});

const GeoCache = mongoose.model('GeoCache', geoCacheSchema);
module.exports = GeoCache;
