// 📄 Path: src/models/WeightLog.js
const mongoose = require('mongoose');

const WeightLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
            index: true
        },
        weightKg: {
            type: Number,
            required: true
        },
        date: {
            type: String,
            required: true,
            index: true
        }
    },
    { timestamps: true }
);

WeightLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WeightLog', WeightLogSchema);
