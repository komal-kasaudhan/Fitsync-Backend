// 📄 Path: src/models/TrainerProfile.js
const mongoose = require('mongoose');
const { getInitialPartnerStatus } = require('../utils/partnerUtils');

const packagePricingSchema = new mongoose.Schema({
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    sessions: { type: Number, default: 1, min: 1 },
    sessionsCount: { type: Number, default: 1, min: 1 },
    price: { type: Number, required: true, min: 0 },
    validityDays: { type: Number, default: 30 },
    description: { type: String, default: "" }
}, { _id: false });

const dayAvailabilitySchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
    },
    slots: {
        type: [String], // e.g. ["06:00-07:00", "07:00-08:00", "18:00-19:00"]
        default: []
    },
    isDayOff: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const dateExceptionSchema = new mongoose.Schema({
    date: { type: String, required: true }, // YYYY-MM-DD
    isUnavailable: { type: Boolean, default: true },
    customSlots: { type: [String], default: [] }
}, { _id: false });

const trainerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true,
        index: true
    },
    type: {
        type: String,
        enum: ["trainer", "nutritionist", "both"],
        required: true,
        index: true
    },
    bio: {
        type: String,
        default: ""
    },
    specialties: {
        type: [String],
        default: [],
        index: true
    },
    certifications: {
        type: [String],
        default: []
    },
    experienceYears: {
        type: Number,
        default: 1,
        min: 0
    },
    languages: {
        type: [String],
        default: ["English", "Hindi"]
    },
    mode: {
        type: String,
        enum: ["online", "offline", "both"],
        default: "both",
        index: true
    },
    city: {
        type: String,
        default: "",
        index: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [77.2090, 28.6139]
        }
    },
    serviceRadiusKm: {
        type: Number,
        default: 10
    },
    pricing: {
        sessionOnline: { type: Number, min: 0 },
        sessionOffline: { type: Number, min: 0 },
        online: { type: Number, default: 500, min: 0 },
        offline: { type: Number, default: 800, min: 0 },
        packages: { type: [packagePricingSchema], default: [] }
    },
    currency: {
        type: String,
        default: "INR"
    },
    timezone: {
        type: String,
        default: "Asia/Kolkata"
    },
    weeklyAvailability: {
        type: [dayAvailabilitySchema],
        default: []
    },
    dateExceptions: {
        type: [dateExceptionSchema],
        default: []
    },
    photos: {
        type: [String],
        default: []
    },
    introVideoUrl: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "suspended"],
        default: getInitialPartnerStatus,
        index: true
    },
    rejectionReason: {
        type: String,
        default: ""
    },
    ratingAvg: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },
    featuredUntil: {
        type: Date
    }
}, {
    timestamps: true
});

// 2dsphere index for nearby trainer search
trainerProfileSchema.index({ location: "2dsphere" });

const TrainerProfile = mongoose.model('TrainerProfile', trainerProfileSchema);
module.exports = TrainerProfile;
