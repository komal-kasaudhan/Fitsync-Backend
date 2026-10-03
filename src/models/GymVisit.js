// 📄 Path: src/models/GymVisit.js
const mongoose = require('mongoose');

const gymVisitSchema = new mongoose.Schema({
    membershipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GymMembership',
        required: true,
        index: true
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    memberCode: {
        type: String,
        required: true,
        index: true
    },
    checkInTime: {
        type: Date,
        default: Date.now,
        index: true
    },
    notes: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const GymVisit = mongoose.model('GymVisit', gymVisitSchema);
module.exports = GymVisit;
