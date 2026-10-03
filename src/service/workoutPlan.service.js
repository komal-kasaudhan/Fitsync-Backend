// 📄 Path: src/service/workoutPlan.service.js
const WorkoutPlan = require('../models/WorkoutPlan');
const Exercise = require('../models/Exercise');
const NutritionTarget = require('../models/NutritionTarget');
const Onboarding = require('../models/onboarding.model');
const WorkoutPreferences = require('../models/WorkoutPreferences');
const { optimizeWorkoutPlanWithGemini } = require('./geminiService');
const { resolveExerciseImageUrl } = require('../utils/exerciseImageHelper');
const { getTodayKolkata, getWeekdayKolkata, getLast7DaysKolkata } = require('../utils/dateUtils');

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const HERO_IMAGES = {
    chest: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
    push: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
    back: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800",
    pull: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800",
    legs: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800",
    lower: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800",
    upper: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800",
    full_body: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    rest: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800"
};

function getHeroImageForFocus(focus) {
    const f = (focus || "").toLowerCase();
    if (f.includes("push") || f.includes("chest")) return HERO_IMAGES.push;
    if (f.includes("pull") || f.includes("back")) return HERO_IMAGES.pull;
    if (f.includes("leg") || f.includes("lower")) return HERO_IMAGES.legs;
    if (f.includes("upper")) return HERO_IMAGES.upper;
    if (f.includes("rest") || f.includes("mobility")) return HERO_IMAGES.rest;
    return HERO_IMAGES.full_body;
}

class WorkoutPlanService {

    getDifficultyRank(level) {
        const l = String(level || "beginner").toLowerCase();
        if (l.includes("expert") || l.includes("advanced")) return 3;
        if (l.includes("intermediate") || l.includes("medium")) return 2;
        return 1;
    }

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

    async getUserEquipment(userId) {
        const prefs = await WorkoutPreferences.findOne({ userId });
        if (prefs && prefs.equipmentAvailable && prefs.equipmentAvailable.length > 0) {
            return prefs.equipmentAvailable.map(e => e.toLowerCase().trim());
        }
        return ["bodyweight", "none", "dumbbell"];
    }

    determineSplit(daysPerWeek, fitnessLevel, goal) {
        const numDays = Math.max(1, Math.min(7, Number(daysPerWeek) || 4));

        let splitPattern = [];
        if (numDays <= 3) {
            splitPattern = [
                { dayIndex: 0, focus: "Full Body Power", isRestDay: false, muscles: ["Chest", "Back", "Quads", "Core"] },
                { dayIndex: 1, focus: "Rest & Active Recovery", isRestDay: true, muscles: [] },
                { dayIndex: 2, focus: "Full Body Hypertrophy", isRestDay: false, muscles: ["Shoulders", "Hamstrings", "Glutes", "Biceps", "Triceps"] },
                { dayIndex: 3, focus: "Rest Day", isRestDay: true, muscles: [] },
                { dayIndex: 4, focus: "Full Body Endurance & Core", isRestDay: false, muscles: ["Quads", "Back", "Chest", "Core"] },
                { dayIndex: 5, focus: "Light Mobility & Walking", isRestDay: true, muscles: [] },
                { dayIndex: 6, focus: "Rest & Recovery", isRestDay: true, muscles: [] }
            ];
        } else if (numDays === 4) {
            splitPattern = [
                { dayIndex: 0, focus: "Upper Body Power", isRestDay: false, muscles: ["Chest", "Back", "Shoulders", "Triceps"] },
                { dayIndex: 1, focus: "Lower Body Foundation", isRestDay: false, muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
                { dayIndex: 2, focus: "Rest & Active Recovery", isRestDay: true, muscles: [] },
                { dayIndex: 3, focus: "Upper Body Hypertrophy", isRestDay: false, muscles: ["Back", "Chest", "Biceps", "Shoulders"] },
                { dayIndex: 4, focus: "Lower Body & Core Burn", isRestDay: false, muscles: ["Glutes", "Hamstrings", "Quads", "Core"] },
                { dayIndex: 5, focus: "Rest Day", isRestDay: true, muscles: [] },
                { dayIndex: 6, focus: "Rest & Stretch", isRestDay: true, muscles: [] }
            ];
        } else if (numDays === 5) {
            splitPattern = [
                { dayIndex: 0, focus: "Push (Chest, Shoulders, Triceps)", isRestDay: false, muscles: ["Chest", "Shoulders", "Triceps"] },
                { dayIndex: 1, focus: "Pull (Back & Biceps)", isRestDay: false, muscles: ["Back", "Biceps"] },
                { dayIndex: 2, focus: "Legs & Core", isRestDay: false, muscles: ["Quads", "Hamstrings", "Glutes", "Core"] },
                { dayIndex: 3, focus: "Rest & Mobility Flow", isRestDay: true, muscles: [] },
                { dayIndex: 4, focus: "Upper Body Strength", isRestDay: false, muscles: ["Chest", "Back", "Shoulders"] },
                { dayIndex: 5, focus: "Lower Body Conditioning", isRestDay: false, muscles: ["Glutes", "Quads", "Hamstrings", "Calves"] },
                { dayIndex: 6, focus: "Rest Day", isRestDay: true, muscles: [] }
            ];
        } else {
            splitPattern = [
                { dayIndex: 0, focus: "Push Day A", isRestDay: false, muscles: ["Chest", "Shoulders", "Triceps"] },
                { dayIndex: 1, focus: "Pull Day A", isRestDay: false, muscles: ["Back", "Biceps"] },
                { dayIndex: 2, focus: "Legs Day A", isRestDay: false, muscles: ["Quads", "Hamstrings", "Glutes"] },
                { dayIndex: 3, focus: "Push Day B", isRestDay: false, muscles: ["Chest", "Shoulders", "Triceps"] },
                { dayIndex: 4, focus: "Pull Day B", isRestDay: false, muscles: ["Back", "Biceps"] },
                { dayIndex: 5, focus: "Legs Day B & Core", isRestDay: false, muscles: ["Quads", "Glutes", "Core"] },
                { dayIndex: 6, focus: "Rest & Full Body Mobility", isRestDay: true, muscles: [] }
            ];
        }

        return splitPattern;
    }

    filterExercisePool(allExercises, { location, userEquipment, userLevelRank, injuries }) {
        const loc = (location || "gym").toLowerCase();

        return allExercises.filter(ex => {
            const exLocations = (ex.locations || []).map(l => l.toLowerCase());
            if (!exLocations.includes(loc) && loc === "home") return false;

            const neededEq = (ex.equipment || []).map(e => e.toLowerCase());
            const hasEquipment = neededEq.some(e => e === "none" || e === "bodyweight" || userEquipment.includes(e));
            if (!hasEquipment) return false;

            const exRank = this.getDifficultyRank(ex.difficulty);
            if (exRank > userLevelRank) return false;

            const exInjuries = (ex.contraindications || []).map(i => i.toLowerCase());
            const hasConflict = exInjuries.some(ci => injuries.includes(ci));
            if (hasConflict) return false;

            return true;
        });
    }

    /**
     * Generate complete 7-day plan with 6-7 main exercises, 4-5 warmups, 4-5 cooldowns
     */
    async generatePlan(userId, options = {}) {
        try {
            const onboarding = await Onboarding.findOne({ userId });
            const userTarget = await NutritionTarget.findOne({
                $or: [{ userId }, { user: userId }]
            });

            // Fetch previous active plan to inspect yesterday's feedback
            const prevPlan = await WorkoutPlan.findOne({ userId, status: "Active" }).sort({ createdAt: -1 });
            const recentFeedback = prevPlan?.adaptationStatus?.recentFeedback || null;

            const goal = options.goal || onboarding?.goal || "Maintain";
            const level = options.level || onboarding?.fitnessLevel || "beginner";
            const location = options.location || onboarding?.workoutLocation || "gym";
            const daysPerWeek = options.daysPerWeek || onboarding?.daysPerWeek || 4;
            const duration = options.duration || onboarding?.duration || 45;
            const userWeightKg = onboarding?.weight || 70;

            const userEquipment = await this.getUserEquipment(userId);
            const userLevelRank = this.getDifficultyRank(level);
            
            // Extract injuries and append any pain areas reported in recent feedback
            const reportedPain = recentFeedback?.painAreas || [];
            const userInjuries = Array.from(new Set([
                ...this.extractUserInjuries(onboarding),
                ...reportedPain.map(p => p.toLowerCase().trim())
            ]));

            const allExercises = await Exercise.find({}).lean();

            // Separate pools by category
            const mainCandidates = allExercises.filter(e => e.category === "main" || (!e.category && e.movementType !== "mobility"));
            const warmupCandidates = allExercises.filter(e => e.category === "warmup" || (e.movementType === "mobility" && e.intensity === "low"));
            const cooldownCandidates = allExercises.filter(e => e.category === "cooldown" || (e.movementType === "mobility" && e.intensity === "low"));

            const validMainPool = this.filterExercisePool(mainCandidates, {
                location,
                userEquipment,
                userLevelRank,
                injuries: userInjuries
            });

            const validWarmupPool = this.filterExercisePool(warmupCandidates, {
                location,
                userEquipment,
                userLevelRank,
                injuries: userInjuries
            });

            const validCooldownPool = this.filterExercisePool(cooldownCandidates, {
                location,
                userEquipment,
                userLevelRank,
                injuries: userInjuries
            });

            // Determine volume & rest parameters
            const isGoalMuscleGain = goal.toLowerCase().includes("gain") || goal.toLowerCase().includes("muscle") || goal.toLowerCase().includes("hypertrophy");
            const isGoalStrength = goal.toLowerCase().includes("strength");
            const isGoalFatLoss = goal.toLowerCase().includes("loss") || goal.toLowerCase().includes("fat") || goal.toLowerCase().includes("cut");

            let defaultSets = 3;
            let defaultReps = "10-12";
            let defaultRestSec = 60;
            let sessionIntensity = "medium";

            if (isGoalMuscleGain) {
                defaultSets = userLevelRank >= 2 ? 4 : 3;
                defaultReps = "8-12";
                defaultRestSec = 75;
                sessionIntensity = "high";
            } else if (isGoalStrength) {
                defaultSets = userLevelRank >= 2 ? 4 : 3;
                defaultReps = "4-6";
                defaultRestSec = 120;
                sessionIntensity = "high";
            } else if (isGoalFatLoss) {
                defaultSets = 3;
                defaultReps = "12-15";
                defaultRestSec = 45;
                sessionIntensity = "medium";
            }

            // Adapt if yesterday's feedback was too_hard or fatigued
            if (recentFeedback?.difficulty === "too_hard" || recentFeedback?.energy === "low") {
                defaultSets = Math.max(2, defaultSets - 1);
                defaultRestSec += 15;
            }

            const splitSchedule = this.determineSplit(daysPerWeek, level, goal);

            // Track recent warmups and cooldowns to vary across sessions (avoid repeating previous 2)
            const usedWarmupSlugs = [];
            const usedCooldownSlugs = [];

            const routines = splitSchedule.map(dayPattern => {
                const dayName = WEEKDAY_NAMES[dayPattern.dayIndex];
                const heroImageUrl = getHeroImageForFocus(dayPattern.focus);

                // --- Rest Day Routine ---
                if (dayPattern.isRestDay) {
                    const restStretches = (validCooldownPool.length >= 4 ? validCooldownPool : cooldownCandidates)
                        .slice(0, 4)
                        .map(ex => ({
                            exerciseId: ex.id || ex._id.toString(),
                            name: ex.name,
                            exerciseName: ex.name,
                            primaryTarget: ex.primaryMuscle,
                            targetMuscles: ex.targetMuscles || ex.primaryMuscle,
                            equipment: ex.equipment || ["bodyweight"],
                            sets: 2,
                            reps: "30-45s",
                            durationSec: 45,
                            isTimed: true,
                            restSec: 15,
                            restDuration: "15s",
                            imageUrl: resolveExerciseImageUrl(ex),
                            instructions: ex.instructions || [],
                            coachTips: ex.coachTips || ex.tips || [],
                            completed: false
                        }));

                    return {
                        dayIndex: dayPattern.dayIndex,
                        dayName,
                        day: dayName,
                        focus: dayPattern.focus,
                        workoutName: dayPattern.focus,
                        isRestDay: true,
                        durationMin: 20,
                        estimatedMinutes: 20,
                        duration: 20,
                        intensity: "low",
                        estimatedCalories: 60,
                        calories: 60,
                        requiredEquipment: ["none"],
                        heroImageUrl,
                        difficulty: "beginner",
                        coachNote: "Rest, hydrate, and stretch. Muscle recovery and connective tissue repair happen today!",
                        warmup: [],
                        exercises: restStretches,
                        cooldown: restStretches,
                        completed: false
                    };
                }

                // --- Training Day Routine ---
                const dayMuscles = dayPattern.muscles;

                // 1. Pick 6-7 Main Exercises
                const matchedMain = validMainPool.filter(e =>
                    dayMuscles.some(m => e.primaryMuscle.toLowerCase().includes(m.toLowerCase()))
                );

                // If not enough direct matches, fill with other valid compound exercises
                let selectedMainRaw = [...matchedMain];
                if (selectedMainRaw.length < 6) {
                    const extraFillers = validMainPool.filter(e => !selectedMainRaw.some(s => (s.id || s._id) === (e.id || e._id)));
                    selectedMainRaw.push(...extraFillers);
                }
                const selectedMain = selectedMainRaw.slice(0, 7);

                const dayMainItems = selectedMain.map(ex => {
                    const sets = ex.defaultSets || defaultSets;
                    const reps = ex.defaultReps ? `${ex.defaultReps.min}-${ex.defaultReps.max}` : defaultReps;
                    const rest = ex.restSec || defaultRestSec;

                    return {
                        exerciseId: ex.id || ex._id.toString(),
                        name: ex.name,
                        exerciseName: ex.name,
                        primaryTarget: ex.primaryMuscle,
                        targetMuscles: ex.targetMuscles || ex.primaryMuscle,
                        equipment: ex.equipment || ["bodyweight"],
                        sets,
                        reps,
                        durationSec: ex.durationSec || 0,
                        isTimed: ex.isTimed || false,
                        restSec: rest,
                        restDuration: `${rest}s`,
                        imageUrl: resolveExerciseImageUrl(ex),
                        instructions: ex.instructions || [],
                        coachTips: ex.coachTips || ex.tips || [],
                        completed: false
                    };
                });

                // 2. Pick 4-5 Warmup Exercises (matching muscles & varying from recent 2 sessions)
                const warmupPoolFiltered = validWarmupPool.length >= 8 ? validWarmupPool : warmupCandidates;
                const availableWarmups = warmupPoolFiltered.filter(w => !usedWarmupSlugs.slice(-8).includes(w.id));
                const chosenWarmups = (availableWarmups.length >= 4 ? availableWarmups : warmupPoolFiltered).slice(0, 4);
                chosenWarmups.forEach(w => usedWarmupSlugs.push(w.id));

                const dayWarmupItems = chosenWarmups.map(w => ({
                    exerciseId: w.id || w._id.toString(),
                    name: w.name,
                    exerciseName: w.name,
                    primaryTarget: w.primaryMuscle,
                    targetMuscles: w.targetMuscles || w.primaryMuscle,
                    equipment: w.equipment || ["bodyweight"],
                    sets: 2,
                    reps: w.defaultReps ? `${w.defaultReps.min}-${w.defaultReps.max}` : "12-15",
                    durationSec: w.durationSec || 30,
                    isTimed: w.isTimed || false,
                    restSec: 15,
                    restDuration: "15s",
                    imageUrl: resolveExerciseImageUrl(w),
                    instructions: w.instructions || [],
                    coachTips: w.coachTips || w.tips || [],
                    completed: false
                }));

                // 3. Pick 4-5 Cooldown Exercises (matching muscles & varying)
                const cooldownPoolFiltered = validCooldownPool.length >= 8 ? validCooldownPool : cooldownCandidates;
                const availableCooldowns = cooldownPoolFiltered.filter(c => !usedCooldownSlugs.slice(-8).includes(c.id));
                const chosenCooldowns = (availableCooldowns.length >= 4 ? availableCooldowns : cooldownPoolFiltered).slice(0, 4);
                chosenCooldowns.forEach(c => usedCooldownSlugs.push(c.id));

                const dayCooldownItems = chosenCooldowns.map(c => ({
                    exerciseId: c.id || c._id.toString(),
                    name: c.name,
                    exerciseName: c.name,
                    primaryTarget: c.primaryMuscle,
                    targetMuscles: c.targetMuscles || c.primaryMuscle,
                    equipment: c.equipment || ["bodyweight"],
                    sets: 1,
                    reps: "30-45s",
                    durationSec: 45,
                    isTimed: true,
                    restSec: 15,
                    restDuration: "15s",
                    imageUrl: resolveExerciseImageUrl(c),
                    instructions: c.instructions || [],
                    coachTips: c.coachTips || c.tips || [],
                    completed: false
                }));

                // 4. Calculate total estimated duration & real calories
                const totalMinutes = Math.min(65, Math.max(35, duration));
                const weightFactor = userWeightKg / 70;

                let totalCalories = 0;
                // Main exercises MET calories
                selectedMain.forEach(ex => {
                    const calPerMin = ex.caloriesPerMinute || 6.5;
                    totalCalories += calPerMin * (totalMinutes * 0.65 / selectedMain.length) * weightFactor;
                });
                // Warmup & Cooldown calories (~3.5 kcal/min)
                totalCalories += 3.5 * (totalMinutes * 0.35) * weightFactor;
                const estimatedCalories = Math.round(totalCalories);

                // 5. Union of required equipment
                const eqSet = new Set();
                [...chosenWarmups, ...selectedMain, ...chosenCooldowns].forEach(ex => {
                    (ex.equipment || []).forEach(eq => {
                        const clean = eq.toLowerCase().trim();
                        if (clean && clean !== "none" && clean !== "bodyweight") {
                            eqSet.add(clean);
                        }
                    });
                });
                const requiredEquipment = eqSet.size > 0 ? Array.from(eqSet) : ["bodyweight"];

                return {
                    dayIndex: dayPattern.dayIndex,
                    dayName,
                    day: dayName,
                    focus: dayPattern.focus,
                    workoutName: dayPattern.focus,
                    isRestDay: false,
                    durationMin: totalMinutes,
                    estimatedMinutes: totalMinutes,
                    duration: totalMinutes,
                    intensity: sessionIntensity,
                    estimatedCalories,
                    calories: estimatedCalories,
                    requiredEquipment,
                    heroImageUrl,
                    difficulty: level,
                    coachNote: isGoalFatLoss ? "Keep rest periods brief to maximize metabolic burn." : "Prioritize controlled eccentrics and deep mind-muscle connection.",
                    warmup: dayWarmupItems,
                    exercises: dayMainItems,
                    cooldown: dayCooldownItems,
                    completed: false
                };
            });

            // STEP 4: Optional Gemini fine-tuning step
            try {
                const geminiOptimized = await optimizeWorkoutPlanWithGemini(routines, {
                    goal,
                    level,
                    duration,
                    location
                }, recentFeedback);

                if (Array.isArray(geminiOptimized)) {
                    geminiOptimized.forEach(opt => {
                        const routine = routines.find(r => r.dayIndex === opt.dayIndex);
                        if (routine) {
                            if (opt.coachNote) {
                                routine.coachNote = opt.coachNote.slice(0, 150);
                            }
                            // Validate and update main exercises
                            if (Array.isArray(opt.exercises) && opt.exercises.length > 0) {
                                const validCandidateMap = new Map();
                                routine.exercises.forEach(e => validCandidateMap.set(String(e.exerciseId), e));

                                const validatedList = [];
                                for (const optEx of opt.exercises) {
                                    const candidateId = String(optEx.exerciseId);
                                    if (validCandidateMap.has(candidateId)) {
                                        const orig = validCandidateMap.get(candidateId);
                                        validatedList.push({
                                            ...orig,
                                            sets: Number(optEx.sets) || orig.sets,
                                            reps: String(optEx.reps || orig.reps),
                                            restSec: Number(optEx.restSec) || orig.restSec,
                                            restDuration: `${Number(optEx.restSec) || orig.restSec}s`
                                        });
                                    }
                                }

                                if (validatedList.length >= 5) {
                                    routine.exercises = validatedList;
                                }
                            }
                        }
                    });
                }
            } catch (err) {
                console.warn("⚠️ Gemini workout optimization skipped:", err.message);
            }

            // Deactivate previous active plans
            await WorkoutPlan.updateMany({ userId, status: "Active" }, { status: "Archived" });

            // Create new active plan
            const planDoc = await WorkoutPlan.create({
                userId,
                weekNumber: 1,
                version: Date.now(),
                status: "Active",
                planStale: false,
                adaptationStatus: {
                    deloadApplied: false,
                    progressiveOverloadApplied: false,
                    rescheduledDays: [],
                    recentFeedback: recentFeedback || undefined
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
            console.error("❌ WorkoutPlanService.generatePlan Error:", error);
            throw error;
        }
    }

    /**
     * Retrieve active workout plan (ALWAYS returns all 7 days; auto-generates if empty or missing)
     */
    async getCurrentPlan(userId) {
        let plan = await WorkoutPlan.findOne({ userId, status: "Active" });

        // Auto-generate if plan does not exist or has fewer than 7 routines
        if (!plan || !Array.isArray(plan.routines) || plan.routines.length < 7) {
            console.log(`ℹ️ [WorkoutPlan] No complete active plan for user ${userId}. Auto-generating 7-day plan...`);
            plan = await this.generatePlan(userId);
        }

        return plan;
    }

    /**
     * Retrieve detailed routine for a specific dayIndex (0..6)
     */
    async getDayWorkout(userId, dayIndex) {
        const plan = await this.getCurrentPlan(userId);
        const idx = Number(dayIndex);
        let routine = plan.routines.find(r => Number(r.dayIndex) === idx);
        if (!routine && !isNaN(idx) && plan.routines[idx]) {
            routine = plan.routines[idx];
        }
        if (!routine) {
            routine = plan.routines[0];
        }

        return {
            dayIndex: routine.dayIndex !== undefined ? routine.dayIndex : 0,
            dayName: routine.dayName || WEEKDAY_NAMES[0],
            day: routine.dayName || WEEKDAY_NAMES[0],
            dateOfWeek: routine.dateOfWeek || "",
            focus: routine.focus,
            workoutName: routine.focus,
            isRestDay: routine.isRestDay,
            durationMin: routine.durationMin || routine.estimatedMinutes || 45,
            duration: routine.durationMin || routine.estimatedMinutes || 45,
            intensity: routine.intensity || "medium",
            estimatedCalories: routine.estimatedCalories || routine.calories || 250,
            calories: routine.estimatedCalories || routine.calories || 250,
            requiredEquipment: routine.requiredEquipment || ["bodyweight"],
            heroImageUrl: routine.heroImageUrl || getHeroImageForFocus(routine.focus),
            coachNote: routine.coachNote || "",
            warmup: routine.warmup || [],
            exercises: routine.exercises || [],
            cooldown: routine.cooldown || [],
            completed: routine.completed || false,
            feedback: routine.feedback || null
        };
    }

    /**
     * Retrieve today's workout for real current weekday in Asia/Kolkata
     */
    async getTodayWorkout(userId) {
        const todayWeekday = getWeekdayKolkata(); // e.g. "Monday"
        const todayIndex = WEEKDAY_NAMES.indexOf(todayWeekday);
        const validIndex = todayIndex >= 0 ? todayIndex : 0;

        const dayData = await this.getDayWorkout(userId, validIndex);
        return {
            ...dayData,
            date: getTodayKolkata(),
            isToday: true
        };
    }

    /**
     * Record session feedback from user
     */
    async saveSessionFeedback(userId, { dayIndex, difficulty, soreness, energy, painAreas = [], notes = "" }) {
        const plan = await this.getCurrentPlan(userId);
        const idx = Number(dayIndex);
        let routine = plan.routines.find(r => Number(r.dayIndex) === idx);
        if (!routine && !isNaN(idx) && plan.routines[idx]) {
            routine = plan.routines[idx];
        }

        if (!routine) {
            throw new Error(`Routine for dayIndex ${dayIndex} not found`);
        }

        const feedbackObj = {
            difficulty: difficulty || "just_right",
            soreness: soreness || "none",
            energy: energy || "normal",
            painAreas: Array.isArray(painAreas) ? painAreas : [],
            notes: notes || "",
            submittedAt: new Date()
        };

        routine.feedback = feedbackObj;

        if (!plan.adaptationStatus) {
            plan.adaptationStatus = {};
        }
        plan.adaptationStatus.recentFeedback = feedbackObj;

        // If user reported pain or difficulty was too_hard, mark plan as stale for gentle adaptation
        if (difficulty === "too_hard" || (Array.isArray(painAreas) && painAreas.length > 0)) {
            plan.planStale = true;
        }

        await plan.save();
        return { success: true, feedback: feedbackObj, planStale: plan.planStale };
    }

    /**
     * Complete workout session
     */
    async completeSession(userId, { dayIndex, exercisesCompleted = [], durationMin = 45 }) {
        const plan = await this.getCurrentPlan(userId);
        const idx = Number(dayIndex);
        let routine = plan.routines.find(r => Number(r.dayIndex) === idx);
        if (!routine && !isNaN(idx) && plan.routines[idx]) {
            routine = plan.routines[idx];
        }

        if (!routine) {
            throw new Error(`Routine for dayIndex ${dayIndex} not found`);
        }

        routine.completed = true;
        routine.completedAt = new Date();
        routine.durationMinActual = durationMin;

        // Mark exercises
        if (Array.isArray(exercisesCompleted) && exercisesCompleted.length > 0) {
            routine.exercises.forEach(ex => {
                const isDone = exercisesCompleted.some(id => String(id) === String(ex.exerciseId) || id === ex.name);
                if (isDone) ex.completed = true;
            });
        } else {
            routine.exercises.forEach(ex => { ex.completed = true; });
        }

        const allDone = plan.routines.filter(r => !r.isRestDay).every(r => r.completed);
        if (allDone) {
            plan.adaptationStatus.progressiveOverloadApplied = true;
        }

        await plan.save();
        return plan;
    }

    /**
     * Skip workout session and adapt schedule
     */
    async skipSession(userId, { dayIndex, reason = "" }) {
        const plan = await this.getCurrentPlan(userId);
        const idx = Number(dayIndex);
        let routine = plan.routines.find(r => Number(r.dayIndex) === idx);
        if (!routine && !isNaN(idx) && plan.routines[idx]) {
            routine = plan.routines[idx];
        }

        if (!routine) {
            throw new Error(`Routine for dayIndex ${dayIndex} not found`);
        }


        routine.skipped = true;
        routine.skipReason = reason;

        // Reschedule to next rest day
        let nextRest = plan.routines.find(r => r.dayIndex > idx && r.isRestDay);
        if (!nextRest) {
            nextRest = plan.routines.find(r => r.isRestDay);
        }

        let adaptationMsg = "Session marked as skipped.";
        if (nextRest) {
            nextRest.focus = `${routine.focus} (Rescheduled)`;
            nextRest.isRestDay = false;
            nextRest.exercises = routine.exercises;
            nextRest.warmup = routine.warmup;
            nextRest.cooldown = routine.cooldown;
            nextRest.durationMin = routine.durationMin;
            nextRest.estimatedCalories = routine.estimatedCalories;
            nextRest.requiredEquipment = routine.requiredEquipment;
            nextRest.heroImageUrl = routine.heroImageUrl;

            plan.adaptationStatus.rescheduledDays.push({
                fromDay: idx,
                toDay: nextRest.dayIndex,
                reason
            });
            adaptationMsg = `Session rescheduled to ${nextRest.dayName}`;
        }

        await plan.save();
        return { plan, message: adaptationMsg };
    }
}

module.exports = new WorkoutPlanService();