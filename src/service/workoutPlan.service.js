// 📄 Path: src/service/workoutPlan.service.js
const WorkoutPlan = require('../models/WorkoutPlan');
const Exercise = require('../models/Exercise');
const NutritionTarget = require('../models/NutritionTarget');
const Onboarding = require('../models/onboarding.model');
const WorkoutPreferences = require('../models/WorkoutPreferences');
const { optimizeWorkoutPlanWithGemini } = require('./geminiService');
const nutritionCalculationService = require('./nutritionCalculationService');
const { getTodayKolkata, getWeekdayKolkata, getLast7DaysKolkata } = require('../utils/dateUtils');

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

class WorkoutPlanService {

    /**
     * Map difficulty levels to numerical rank for filtering (difficulty <= userLevel)
     */
    getDifficultyRank(level) {
        const l = String(level || "beginner").toLowerCase();
        if (l.includes("expert") || l.includes("advanced")) return 3;
        if (l.includes("intermediate") || l.includes("medium")) return 2;
        return 1;
    }

    /**
     * Standardize user injuries / contraindication tags from onboarding strings
     */
    extractUserInjuries(onboarding) {
        const tags = new Set();
        const rawConditions = (onboarding?.selectedMedicalConditions || []).join(" ").toLowerCase();
        const rawLimitations = (onboarding?.physicalLimitations || "").toLowerCase();
        const combined = `${rawConditions} ${rawLimitations}`;

        if (combined.includes("knee") || combined.includes("acl") || combined.includes("patella") || combined.includes("meniscus")) tags.add("knee");
        if (combined.includes("back") || combined.includes("lumbar") || combined.includes("spine") || combined.includes("disc")) tags.add("lower_back");
        if (combined.includes("shoulder") || combined.includes("rotator")) tags.add("shoulder");
        if (combined.includes("wrist") || combined.includes("carpal")) tags.add("wrist");
        if (combined.includes("elbow") || combined.includes("tennis")) tags.add("elbow");
        if (combined.includes("ankle") || combined.includes("sprain")) tags.add("ankle");
        if (combined.includes("neck") || combined.includes("cervical")) tags.add("neck");

        return Array.from(tags);
    }

    /**
     * Standardize user equipment list
     */
    async getUserEquipment(userId) {
        const prefs = await WorkoutPreferences.findOne({ userId });
        if (prefs && prefs.equipmentAvailable && prefs.equipmentAvailable.length > 0) {
            return prefs.equipmentAvailable.map(e => e.toLowerCase().trim());
        }

        // Fallback to basic equipment
        return ["bodyweight", "none", "dumbbell"];
    }

    /**
     * STEP 1: Determine 7-day split structure
     */
    determineSplit(daysPerWeek, fitnessLevel, goal) {
        const numDays = Math.max(1, Math.min(7, Number(daysPerWeek) || 4));

        let splitPattern = [];
        if (numDays <= 3) {
            // Full Body 3 days: Mon, Wed, Fri
            splitPattern = [
                { dayIndex: 0, focus: "Full Body A", isRestDay: false, muscles: ["Chest", "Back", "Quads", "Core"] },
                { dayIndex: 1, focus: "Rest & Active Recovery", isRestDay: true, muscles: [] },
                { dayIndex: 2, focus: "Full Body B", isRestDay: false, muscles: ["Shoulders", "Hamstrings", "Glutes", "Biceps", "Triceps"] },
                { dayIndex: 3, focus: "Rest Day", isRestDay: true, muscles: [] },
                { dayIndex: 4, focus: "Full Body C", isRestDay: false, muscles: ["Quads", "Back", "Chest", "Core"] },
                { dayIndex: 5, focus: "Light Mobility & Walking", isRestDay: true, muscles: [] },
                { dayIndex: 6, focus: "Rest Day", isRestDay: true, muscles: [] }
            ];
        } else if (numDays === 4) {
            // Upper / Lower 4 days: Mon, Tue, Thu, Fri
            splitPattern = [
                { dayIndex: 0, focus: "Upper Body Power", isRestDay: false, muscles: ["Chest", "Back", "Shoulders", "Triceps"] },
                { dayIndex: 1, focus: "Lower Body Foundation", isRestDay: false, muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
                { dayIndex: 2, focus: "Rest & Recovery", isRestDay: true, muscles: [] },
                { dayIndex: 3, focus: "Upper Body Hypertrophy", isRestDay: false, muscles: ["Back", "Chest", "Biceps", "Shoulders"] },
                { dayIndex: 4, focus: "Lower Body & Core Burn", isRestDay: false, muscles: ["Glutes", "Hamstrings", "Quads", "Core"] },
                { dayIndex: 5, focus: "Rest Day", isRestDay: true, muscles: [] },
                { dayIndex: 6, focus: "Rest Day", isRestDay: true, muscles: [] }
            ];
        } else if (numDays === 5) {
            // Push / Pull / Legs / Upper / Lower
            splitPattern = [
                { dayIndex: 0, focus: "Push (Chest, Shoulders, Triceps)", isRestDay: false, muscles: ["Chest", "Shoulders", "Triceps"] },
                { dayIndex: 1, focus: "Pull (Back & Biceps)", isRestDay: false, muscles: ["Back", "Biceps"] },
                { dayIndex: 2, focus: "Legs & Core", isRestDay: false, muscles: ["Quads", "Hamstrings", "Glutes", "Core"] },
                { dayIndex: 3, focus: "Rest & Mobility", isRestDay: true, muscles: [] },
                { dayIndex: 4, focus: "Upper Body Strength", isRestDay: false, muscles: ["Chest", "Back", "Shoulders"] },
                { dayIndex: 5, focus: "Lower Body & Conditioning", isRestDay: false, muscles: ["Glutes", "Quads", "Hamstrings", "Calves"] },
                { dayIndex: 6, focus: "Rest Day", isRestDay: true, muscles: [] }
            ];
        } else {
            // 6 days Push / Pull / Legs x 2
            splitPattern = [
                { dayIndex: 0, focus: "Push Day A", isRestDay: false, muscles: ["Chest", "Shoulders", "Triceps"] },
                { dayIndex: 1, focus: "Pull Day A", isRestDay: false, muscles: ["Back", "Biceps"] },
                { dayIndex: 2, focus: "Legs Day A", isRestDay: false, muscles: ["Quads", "Hamstrings", "Glutes"] },
                { dayIndex: 3, focus: "Push Day B", isRestDay: false, muscles: ["Chest", "Shoulders", "Triceps"] },
                { dayIndex: 4, focus: "Pull Day B", isRestDay: false, muscles: ["Back", "Biceps"] },
                { dayIndex: 5, focus: "Legs Day B & Core", isRestDay: false, muscles: ["Quads", "Glutes", "Core"] },
                { dayIndex: 6, focus: "Rest Day", isRestDay: true, muscles: [] }
            ];
        }

        return splitPattern;
    }

    /**
     * Filter exercises from library strictly checking location, equipment, level, and injuries
     */
    filterExercisePool(allExercises, { location, userEquipment, userLevelRank, injuries }) {
        const loc = (location || "gym").toLowerCase();

        return allExercises.filter(ex => {
            // 1. Location check (gym vs home)
            const exLocations = (ex.locations || []).map(l => l.toLowerCase());
            if (!exLocations.includes(loc)) {
                // If user is at home, exercise must support home
                if (loc === "home") return false;
            }

            // 2. Equipment check
            const neededEq = (ex.equipment || []).map(e => e.toLowerCase());
            const hasEquipment = neededEq.some(e => e === "none" || e === "bodyweight" || userEquipment.includes(e));
            if (!hasEquipment) return false;

            // 3. Difficulty rank check
            const exRank = this.getDifficultyRank(ex.difficulty);
            if (exRank > userLevelRank) return false;

            // 4. Contraindications / Injury exclusion (CRITICAL SAFETY)
            const exInjuries = (ex.contraindications || []).map(i => i.toLowerCase());
            const hasConflict = exInjuries.some(ci => injuries.includes(ci));
            if (hasConflict) return false;

            return true;
        });
    }

    /**
     * Generate complete 7-day plan
     */
    async generatePlan(userId, options = {}) {
        try {
            // 1. Gather all user telemetry
            const onboarding = await Onboarding.findOne({ userId });
            const userTarget = await NutritionTarget.findOne({ $or: [{ userId }, { user: userId }] });
            const userPrefs = await WorkoutPreferences.findOne({ userId });

            const goal = options.goal || onboarding?.goal || "Maintain";
            const level = options.level || (onboarding?.activityLevel?.includes("VERY") ? "Intermediate" : "Beginner");
            const location = (options.location || onboarding?.workoutLocation || "gym").toLowerCase();
            const duration = Number(options.duration || userPrefs?.preferredDurationMinutes || 45);
            const daysPerWeek = Number(options.daysPerWeek || userPrefs?.daysPerWeek || 4);
            const userWeight = Number(onboarding?.currentWeight || 70);

            const userEquipment = await this.getUserEquipment(userId);
            const userInjuries = this.extractUserInjuries(onboarding);
            const userLevelRank = this.getDifficultyRank(level);

            // 2. Fetch full library of exercises
            const allExercises = await Exercise.find({}).lean();
            const validPool = this.filterExercisePool(allExercises, {
                location,
                userEquipment,
                userLevelRank,
                injuries: userInjuries
            });

            // 3. Split selection
            const splitPattern = this.determineSplit(daysPerWeek, level, goal);

            // Goal-specific sets, reps, rest
            const isGoalMuscleGain = goal.toLowerCase().includes("gain") || goal.toLowerCase().includes("build");
            const isGoalFatLoss = goal.toLowerCase().includes("loss") || goal.toLowerCase().includes("cut");

            const defaultSets = userLevelRank === 1 ? 3 : (isGoalMuscleGain ? 4 : 3);
            const defaultReps = isGoalMuscleGain ? "8-10" : (isGoalFatLoss ? "12-15" : "10-12");
            const defaultRestSec = isGoalFatLoss ? 45 : (isGoalMuscleGain ? 75 : 60);

            // Calorie burn estimation per session
            const intensityMultiplier = isGoalFatLoss ? 0.09 : (isGoalMuscleGain ? 0.08 : 0.075);
            const estimatedSessionCalories = Math.round(duration * userWeight * intensityMultiplier);

            // Warmup and cooldown pools
            const mobilityPool = validPool.filter(e => e.movementType === "mobility");
            const cardioPool = validPool.filter(e => e.movementType === "cardio");

            // 4. Build routines for all 7 days
            const routines = splitPattern.map(dayPattern => {
                const dayName = WEEKDAY_NAMES[dayPattern.dayIndex];

                if (dayPattern.isRestDay) {
                    return {
                        dayIndex: dayPattern.dayIndex,
                        dayName,
                        day: dayName,
                        focus: dayPattern.focus,
                        workoutName: dayPattern.focus,
                        isRestDay: true,
                        estimatedMinutes: 20,
                        duration: 20,
                        estimatedCalories: 60,
                        calories: 60,
                        difficulty: "Beginner",
                        exercises: mobilityPool.slice(0, 2).map(ex => ({
                            exerciseId: ex._id,
                            name: ex.name,
                            exerciseName: ex.name,
                            primaryTarget: ex.primaryMuscle,
                            sets: 2,
                            reps: "30-45s",
                            restSec: 30,
                            restDuration: "30s",
                            imageUrl: ex.imageUrl || "",
                            completed: false
                        })),
                        coachNote: "Rest, hydrate, and stretch. Muscles grow during recovery!",
                        completed: false
                    };
                }

                // Training Day: Select matching exercises
                const dayMuscles = dayPattern.muscles;
                const matchedExercises = validPool.filter(e =>
                    dayMuscles.some(m => e.primaryMuscle.toLowerCase().includes(m.toLowerCase()))
                );

                // Ensure at least 4 exercises; fallback to general pool if needed
                const selectedMain = (matchedExercises.length >= 4 ? matchedExercises : validPool)
                    .filter(e => e.movementType !== "mobility")
                    .slice(0, 4);

                // Assemble exercises: 1 Warmup + Main + 1 Cooldown (+ Cardio finisher if fat_loss)
                const dayExercises = [];

                // Warmup
                const warmup = mobilityPool[0] || allExercises.find(e => e.name.includes("Cat-Cow")) || validPool[0];
                if (warmup) {
                    dayExercises.push({
                        exerciseId: warmup._id,
                        name: `Warm-Up: ${warmup.name}`,
                        exerciseName: warmup.name,
                        primaryTarget: warmup.primaryMuscle,
                        sets: 2,
                        reps: "10-12",
                        restSec: 30,
                        restDuration: "30s",
                        imageUrl: warmup.imageUrl || "",
                        completed: false
                    });
                }

                // Main lifts
                selectedMain.forEach(ex => {
                    dayExercises.push({
                        exerciseId: ex._id,
                        name: ex.name,
                        exerciseName: ex.name,
                        primaryTarget: ex.primaryMuscle,
                        sets: defaultSets,
                        reps: defaultReps,
                        restSec: ex.restSec || defaultRestSec,
                        restDuration: `${ex.restSec || defaultRestSec}s`,
                        imageUrl: ex.imageUrl || "",
                        completed: false
                    });
                });

                // Cardio finisher if fat loss
                if (isGoalFatLoss && cardioPool.length > 0) {
                    const cardio = cardioPool[dayPattern.dayIndex % cardioPool.length];
                    dayExercises.push({
                        exerciseId: cardio._id,
                        name: `Finisher: ${cardio.name}`,
                        exerciseName: cardio.name,
                        primaryTarget: cardio.primaryMuscle,
                        sets: 3,
                        reps: "45s",
                        restSec: 30,
                        restDuration: "30s",
                        imageUrl: cardio.imageUrl || "",
                        completed: false
                    });
                }

                // Cooldown
                const cooldown = mobilityPool[1] || allExercises.find(e => e.name.includes("Child's Pose")) || validPool[1];
                if (cooldown) {
                    dayExercises.push({
                        exerciseId: cooldown._id,
                        name: `Cool-Down: ${cooldown.name}`,
                        exerciseName: cooldown.name,
                        primaryTarget: cooldown.primaryMuscle,
                        sets: 2,
                        reps: "30-45s",
                        restSec: 30,
                        restDuration: "30s",
                        imageUrl: cooldown.imageUrl || "",
                        completed: false
                    });
                }

                return {
                    dayIndex: dayPattern.dayIndex,
                    dayName,
                    day: dayName,
                    focus: dayPattern.focus,
                    workoutName: dayPattern.focus,
                    isRestDay: false,
                    estimatedMinutes: duration,
                    duration,
                    estimatedCalories: estimatedSessionCalories,
                    calories: estimatedSessionCalories,
                    difficulty: level,
                    exercises: dayExercises,
                    coachNote: isGoalFatLoss ? "Keep rest periods brief to maximize metabolic burn." : "Focus on form and deep mind-muscle connection.",
                    completed: false
                };
            });

            // STEP 4: Optional Gemini step for fine-tuning
            try {
                const geminiOptimized = await optimizeWorkoutPlanWithGemini(routines, {
                    goal,
                    level,
                    duration,
                    location
                });

                if (Array.isArray(geminiOptimized)) {
                    geminiOptimized.forEach(opt => {
                        const routine = routines.find(r => r.dayIndex === opt.dayIndex);
                        if (routine && opt.coachNote) {
                            routine.coachNote = opt.coachNote.slice(0, 150);
                        }
                    });
                }
            } catch (err) {
                console.warn("⚠️ Gemini optimization skipped:", err.message);
            }

            // 5. Deactivate previous active plans (versioning: single active plan)
            await WorkoutPlan.updateMany({ userId, status: "Active" }, { status: "Archived" });

            // Create new versioned Active plan
            const planDoc = await WorkoutPlan.create({
                userId,
                weekNumber: 1,
                version: Date.now(),
                status: "Active",
                planStale: false,
                adaptationStatus: {
                    deloadApplied: false,
                    progressiveOverloadApplied: false,
                    rescheduledDays: []
                },
                nutritionTarget: {
                    targetCalories: userTarget?.targetCalories || 2000,
                    targetProtein: userTarget?.targetProtein || 100,
                    targetCarbs: userTarget?.targetCarbs || 250,
                    targetFat: userTarget?.targetFat || 65,
                    targetWaterLiters: userTarget?.targetWaterLiters || 3.0,
                    goalType: goal
                },
                routines
            });

            return planDoc;
        } catch (error) {
            console.error("❌ WorkoutPlanService Error:", error);
            throw error;
        }
    }

    /**
     * Retrieve active workout plan
     */
    async getCurrentPlan(userId) {
        let plan = await WorkoutPlan.findOne({ userId, status: "Active" });
        if (!plan) {
            // Generate initial plan
            plan = await this.generatePlan(userId);
        }
        return plan;
    }

    /**
     * Retrieve today's workout based on real Kolkata weekday
     */
    async getTodayWorkout(userId) {
        const plan = await this.getCurrentPlan(userId);
        const todayWeekday = getWeekdayKolkata(); // e.g. "Monday"

        const todayIndex = WEEKDAY_NAMES.indexOf(todayWeekday);
        const routine = plan.routines.find(r => r.dayIndex === (todayIndex >= 0 ? todayIndex : 0)) || plan.routines[0];

        return {
            date: getTodayKolkata(),
            dayName: todayWeekday,
            dayIndex: routine.dayIndex,
            focus: routine.focus,
            isRestDay: routine.isRestDay,
            duration: routine.duration || routine.estimatedMinutes,
            calories: routine.calories || routine.estimatedCalories,
            completed: routine.completed || false,
            coachNote: routine.coachNote || "",
            exercises: routine.exercises || []
        };
    }

    /**
     * Mark session completed and update adherence/streak
     */
    async completeSession(userId, { dayIndex, exercisesCompleted = [], durationMin = 45 }) {
        const plan = await this.getCurrentPlan(userId);
        const idx = Number(dayIndex);

        const routine = plan.routines.find(r => r.dayIndex === idx);
        if (!routine) {
            throw new Error(`Routine for dayIndex ${dayIndex} not found`);
        }

        routine.completed = true;
        routine.completedAt = new Date();
        routine.durationMinActual = durationMin;

        // Mark individual exercises
        if (Array.isArray(exercisesCompleted) && exercisesCompleted.length > 0) {
            routine.exercises.forEach(ex => {
                const isDone = exercisesCompleted.some(id => String(id) === String(ex.exerciseId) || id === ex.name);
                if (isDone) ex.completed = true;
            });
        } else {
            // Mark all exercises completed if full session done
            routine.exercises.forEach(ex => { ex.completed = true; });
        }

        // STEP 5 Adaptation: check if progressive overload applies for next week
        const allCompleted = plan.routines.filter(r => !r.isRestDay).every(r => r.completed);
        if (allCompleted) {
            plan.adaptationStatus.progressiveOverloadApplied = true;
        }

        await plan.save();
        return { success: true, message: `Day ${dayIndex} session completed!`, routine };
    }

    /**
     * Skip session and apply adaptation rules:
     * Reschedule missed session to next free day without doubling volume.
     * 2+ missed days -> deload trigger (~20% volume reduction).
     */
    async skipSession(userId, { dayIndex, reason = "Busy" }) {
        const plan = await this.getCurrentPlan(userId);
        const idx = Number(dayIndex);

        const routine = plan.routines.find(r => r.dayIndex === idx);
        if (!routine) {
            throw new Error(`Routine for dayIndex ${dayIndex} not found`);
        }

        routine.skipped = true;
        routine.skipReason = reason;

        // 1. Find next free rest day to reschedule
        const futureRestDay = plan.routines.find(r => r.dayIndex > idx && r.isRestDay);
        if (futureRestDay) {
            // Move routine focus and exercises to rest day without doubling volume
            futureRestDay.focus = `Rescheduled: ${routine.focus}`;
            futureRestDay.isRestDay = false;
            futureRestDay.exercises = routine.exercises;
            futureRestDay.duration = routine.duration;
            futureRestDay.calories = routine.calories;
            futureRestDay.coachNote = `Rescheduled from ${routine.dayName}. Stay consistent!`;

            plan.adaptationStatus.rescheduledDays.push({
                fromDay: idx,
                toDay: futureRestDay.dayIndex,
                reason
            });
        }

        // 2. Count total missed/skipped days
        const skippedCount = plan.routines.filter(r => r.skipped).length;
        if (skippedCount >= 2 && !plan.adaptationStatus.deloadApplied) {
            // Trigger 20% deload reduction on remaining workouts
            plan.adaptationStatus.deloadApplied = true;
            plan.routines.forEach(r => {
                if (!r.isRestDay && !r.completed) {
                    r.exercises.forEach(ex => {
                        ex.sets = Math.max(2, ex.sets - 1);
                    });
                    r.coachNote = "Deload adjustment applied (-20% volume) to facilitate active recovery.";
                }
            });
        }

        await plan.save();
        return {
            success: true,
            message: futureRestDay ? `Session rescheduled to ${futureRestDay.dayName}` : `Session marked as skipped`,
            adaptation: plan.adaptationStatus
        };
    }
}

module.exports = new WorkoutPlanService();