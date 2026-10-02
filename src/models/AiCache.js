// 📄 Path: src/models/AiCache.js
const mongoose = require('mongoose');

const AiCacheSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            index: true
        },
        date: {
            type: String,
            index: true
        },
        feature: {
            type: String,
            required: true,
            index: true
        },
        keyHash: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        response: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 } // TTL index
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('AiCache', AiCacheSchema);
