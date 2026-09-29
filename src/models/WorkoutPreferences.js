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
        max: 7
    },
    specificDays: [{
        type: String, 
        required: true
    }],
    preferredDurationMinutes: {
        type: Number,
        required: true 
    },
    equipmentAvailable: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPreferences', WorkoutPreferencesSchema);