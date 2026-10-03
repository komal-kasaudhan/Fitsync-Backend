// 📄 Path: src/models/Gym.js
const mongoose = require('mongoose');

const openingHourSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
    },
    open: {
        type: String, // HH:MM e.g. "06:00"
        default: "06:00"
    },
    close: {
        type: String, // HH:MM e.g. "22:00"
        default: "22:00"
    },
    isClosed: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const sessionTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["dayPass", "weekly", "monthly"],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        default: ""
    }
}, { _id: false });

const gymSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
        index: true
    },
    pincode: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    phone: {
        type: String,
        default: ""
    },
    photos: {
        type: [String],
        default: []
    },
    amenities: {
        type: [String],
        default: [] // e.g. ["ac", "shower", "parking", "steam_bath", "cardio", "weights", "lockers", "wifi"]
    },
    openingHours: {
        type: [openingHourSchema],
        default: []
    },
    sessionTypes: {
        type: [sessionTypeSchema],
        default: []
    },
    capacityPerSlot: {
        type: Number,
        default: 20
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "suspended"],
        default: "pending",
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

// Geospatial 2dsphere index for location queries ($geoNear)
gymSchema.index({ location: "2dsphere" });

const Gym = mongoose.model('Gym', gymSchema);
module.exports = Gym;
