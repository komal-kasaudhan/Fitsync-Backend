const mongoose = require('mongoose');

const WorkoutPreferencesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, 
        index: true
    },
    daysPerWeek: {
        type: Number,
        required: true,
        min: 1,
        max: 7,
        default: 4
    },
    specificDays: {
        type: [String], 
        default: ["Monday", "Wednesday", "Friday", "Saturday"]
    },
    preferredDurationMinutes: {
        type: Number,
        required: true,
        default: 45
    },
    equipmentAvailable: {
        type: [String],
        default: ["bodyweight", "none", "dumbbell"]
    }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPreferences', WorkoutPreferencesSchema);