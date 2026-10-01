// 📄 Path: src/models/WorkoutPlan.js
const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
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
    nutritionTarget: {
        targetCalories: { type: Number, default: 2000 },
        targetProtein: { type: Number, default: 100 },
        targetCarbs: { type: Number, default: 250 },
        targetFat: { type: Number, default: 65 },
        targetWaterLiters: { type: Number, default: 3.0 },
        goalType: { type: String, default: 'MAINTAIN' }
    },
    routines: [{
        day: { type: String, required: true },
        workoutName: { type: String, required: true },
        targetMuscles: [{ type: String }],
        duration: { type: Number, required: true },
        calories: { type: Number, required: true },
        difficulty: { type: String, default: 'Beginner' },
        exercises: [{
            exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
            exerciseName: { type: String },
            primaryTarget: { type: String },
            sets: { type: Number, required: true },
            reps: { type: String, required: true },
            restDuration: { type: String, required: true }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);