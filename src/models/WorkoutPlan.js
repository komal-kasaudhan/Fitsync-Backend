// 📄 Path: src/models/WorkoutPlan.js
const mongoose = require('mongoose');

const ExerciseItemSchema = new mongoose.Schema(
    {
        exerciseId: { type: String, required: true }, // stable slug id or ObjectId string
        name: { type: String, required: true },
        exerciseName: { type: String }, // alias
        primaryTarget: { type: String },
        targetMuscles: { type: String, default: "" },
        equipment: [{ type: String }],
        sets: { type: Number, required: true, default: 3 },
        reps: { type: String, default: "10-12" },
        durationSec: { type: Number, default: 0 },
        isTimed: { type: Boolean, default: false },
        restSec: { type: Number, default: 60 },
        restDuration: { type: String, default: "60s" },
        imageUrl: { type: String, default: null },
        instructions: [{ type: String }],
        coachTips: [{ type: String }],
        completed: { type: Boolean, default: false }
    },
    { _id: false }
);

const DayRoutineSchema = new mongoose.Schema(
    {
        dayIndex: { type: Number, required: true }, // 0 = Mon, 6 = Sun
        dayName: { type: String, required: true }, // e.g. "Monday", "Tuesday"
        day: { type: String }, // alias
        dateOfWeek: { type: String }, // YYYY-MM-DD
        focus: { type: String, required: true }, // e.g. "Upper Body", "Rest Day"
        workoutName: { type: String }, // alias
        targetMuscles: [{ type: String }],
        isRestDay: { type: Boolean, default: false },
        durationMin: { type: Number, default: 45 },
        estimatedMinutes: { type: Number, default: 45 },
        duration: { type: Number, default: 45 }, // alias
        intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        estimatedCalories: { type: Number, default: 250 },
        calories: { type: Number, default: 250 }, // alias
        requiredEquipment: [{ type: String }],
        heroImageUrl: { type: String, default: "" },
        difficulty: { type: String, default: "beginner" },
        coachNote: { type: String, default: "" },
        warmup: [ExerciseItemSchema],
        exercises: [ExerciseItemSchema],
        cooldown: [ExerciseItemSchema],
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        durationMinActual: { type: Number },
        skipped: { type: Boolean, default: false },
        skipReason: { type: String, default: "" },
        feedback: {
            difficulty: { type: String, enum: ['too_easy', 'just_right', 'too_hard'] },
            soreness: { type: String },
            energy: { type: String },
            painAreas: [{ type: String }],
            notes: { type: String },
            submittedAt: { type: Date }
        }
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