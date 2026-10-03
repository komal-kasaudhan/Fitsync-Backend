// 📄 Path: src/models/Gym.js
const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    open: {
        type: String, // HH:MM e.g. "06:00"
        required: true,
        trim: true
    },
    close: {
        type: String, // HH:MM e.g. "10:00"
        required: true,
        trim: true
    }
}, { _id: false });

const openingHourSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    shifts: {
        type: [shiftSchema],
        default: []
    },
    // Backward compatibility for single open/close
    open: {
        type: String,
        default: "06:00"
    },
    close: {
        type: String,
        default: "22:00"
    }
}, { _id: false });

const planSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["day_pass", "weekly", "monthly", "quarterly", "half_yearly", "yearly", "custom"],
        required: true
    },
    durationDays: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    mrp: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: ""
    },
    inclusions: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    maxFreezeDays: {
        type: Number,
        default: 0
    }
}, { _id: false });

// Preserved for legacy compatibility
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

const holidaySchema = new mongoose.Schema({
    date: {
        type: String, // "YYYY-MM-DD"
        required: true
    },
    reason: {
        type: String,
        default: "Public Holiday"
    }
}, { _id: false });

const womenOnlyShiftSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
    },
    open: {
        type: String,
        required: true
    },
    close: {
        type: String,
        required: true
    }
}, { _id: false });

const womenOnlyHoursSchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: false
    },
    shifts: {
        type: [womenOnlyShiftSchema],
        default: []
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
        default: []
    },
    openingHours: {
        type: [openingHourSchema],
        required: true,
        default: []
    },
    holidays: {
        type: [holidaySchema],
        default: []
    },
    womenOnlyHours: {
        type: womenOnlyHoursSchema,
        default: () => ({ enabled: false, shifts: [] })
    },
    plans: {
        type: [planSchema],
        default: []
    },
    enableSlots: {
        type: Boolean,
        default: false
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

/**
 * Helper to normalize and ensure plans are populated from legacy sessionTypes if empty
 */
gymSchema.methods.getNormalizedPlans = function() {
    if (Array.isArray(this.plans) && this.plans.length > 0) {
        return this.plans;
    }
    if (Array.isArray(this.sessionTypes) && this.sessionTypes.length > 0) {
        return this.sessionTypes.map((st, i) => ({
            id: `legacy_${st.type || i}`,
            name: st.name || (st.type === "dayPass" ? "Day Pass" : st.type === "weekly" ? "Weekly Pass" : "Monthly Membership"),
            type: st.type === "dayPass" ? "day_pass" : (st.type || "custom"),
            durationDays: st.type === "dayPass" ? 1 : st.type === "weekly" ? 7 : 30,
            price: Number(st.price) || 0,
            mrp: Number(st.price) ? Math.round(st.price * 1.2) : null,
            description: st.description || "",
            inclusions: ["Full Gym Access"],
            isActive: true,
            maxFreezeDays: st.type === "monthly" ? 7 : 0
        }));
    }
    return [];
};

const Gym = mongoose.model('Gym', gymSchema);
module.exports = Gym;
