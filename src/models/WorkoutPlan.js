// 📄 Path: src/models/WorkoutPlan.js
const mongoose = require('mongoose');

const ExerciseItemSchema = new mongoose.Schema(
    {
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise'
        },
        name: { type: String, required: true },
        exerciseName: { type: String }, // alias for backward compatibility
        primaryTarget: { type: String },
        sets: { type: Number, required: true, default: 3 },
        reps: { type: String, required: true, default: "10-12" },
        restSec: { type: Number, default: 60 },
        restDuration: { type: String, default: "60s" },
        imageUrl: { type: String, default: "" },
        completed: { type: Boolean, default: false }
    },
    { _id: false }
);

const DayRoutineSchema = new mongoose.Schema(
    {
        dayIndex: { type: Number, required: true }, // 0 = Mon, 6 = Sun
        dayName: { type: String, required: true }, // e.g. "Monday", "Tuesday"
        day: { type: String }, // alias for backward compatibility
        dateOfWeek: { type: String }, // YYYY-MM-DD
        focus: { type: String, required: true }, // e.g. "Upper Body", "Rest Day"
        workoutName: { type: String }, // alias
        targetMuscles: [{ type: String }],
        isRestDay: { type: Boolean, default: false },
        estimatedMinutes: { type: Number, default: 45 },
        duration: { type: Number, default: 45 }, // alias
        estimatedCalories: { type: Number, default: 250 },
        calories: { type: Number, default: 250 }, // alias
        difficulty: { type: String, default: "Beginner" },
        exercises: [ExerciseItemSchema],
        coachNote: { type: String, default: "" },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        durationMinActual: { type: Number },
        skipped: { type: Boolean, default: false },
        skipReason: { type: String, default: "" }
    },
    { _id: false }
);

const WorkoutPlanSchema = new mongoose.Schema(
    {
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
        version: {
            type: Number,
            default: 1
        },
        status: {
            type: String,
            enum: ['Active', 'Completed', 'Archived'],
            default: 'Active',
            index: true
        },
        planStale: {
            type: Boolean,
            default: false
        },
        adaptationStatus: {
            deloadApplied: { type: Boolean, default: false },
            progressiveOverloadApplied: { type: Boolean, default: false },
            rescheduledDays: [{ fromDay: Number, toDay: Number, reason: String }]
        },
        nutritionTarget: {
            targetCalories: { type: Number, default: 2000 },
            targetProtein: { type: Number, default: 100 },
            targetCarbs: { type: Number, default: 250 },
            targetFat: { type: Number, default: 65 },
            targetWaterLiters: { type: Number, default: 3.0 },
            goalType: { type: String, default: 'MAINTAIN' }
        },
        routines: [DayRoutineSchema]
    },
    { timestamps: true }
);

WorkoutPlanSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);