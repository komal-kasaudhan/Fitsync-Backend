// 📄 Path: src/models/WorkoutPlan.js
const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    weekNumber: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Archived'],
        default: 'Active'
    },
    routines: [{
        day: { type: String, required: true },
        workoutName: { type: String, required: true },
        targetMuscles: [{ type: String }],
        duration: { type: Number, required: true },
        calories: { type: Number, required: true },
        difficulty: { type: String },
        exercises: [{
            exerciseId: { type: String, required: true },
            sets: { type: Number, required: true },
            reps: { type: String, required: true },
            restDuration: { type: String, required: true }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);