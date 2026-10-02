// 📄 Path: src/data/seedExercisesData.js
// 65+ Comprehensive real exercises covering Chest, Back, Shoulders, Biceps, Triceps, Quads, Hamstrings, Glutes, Calves, Core, Cardio/HIIT, and Mobility

const exercises = [
    // --- CHEST (PUSH) ---
    {
        name: "Standard Push-Up",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Triceps", "Anterior Deltoids", "Core"],
        movementType: "push",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["fat_loss", "muscle_gain", "endurance"],
        contraindications: ["wrist", "shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 15 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Start in a high plank position with hands slightly wider than shoulder-width.",
            "Lower your chest towards the floor by bending your elbows at a 45-degree angle.",
            "Push the floor away firmly to return to starting plank position."
        ],
        tips: ["Keep your glutes and core squeezed to maintain a straight spine."],
        imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500"
    },
    {
        name: "Incline Push-Up (Wrist & Shoulder Friendly)",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Triceps", "Core"],
        movementType: "push",
        equipment: ["bench", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["fat_loss", "muscle_gain"],
        contraindications: [], // Safe alternative for shoulder/lower_back
        defaultSets: 3,
        defaultRepRange: { min: 12, max: 15 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Place your hands on an elevated surface like a bench or sturdy table.",
            "Lower your chest to the edge keeping your body straight.",
            "Push back up smoothly."
        ],
        tips: ["Great low-joint-stress variation for beginners and shoulder recovery."],
        imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500"
    },
    {
        name: "Barbell Bench Press",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Triceps", "Front Delts"],
        movementType: "push",
        equipment: ["barbell", "bench"],
        locations: ["gym"],
        difficulty: "intermediate",
        goalTags: ["strength", "muscle_gain"],
        contraindications: ["shoulder", "wrist"],
        defaultSets: 4,
        defaultRepRange: { min: 6, max: 10 },
        restSec: 90,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Lie flat on the bench, feet planted firmly on the floor.",
            "Grip the bar slightly wider than shoulder width.",
            "Unrack and lower with control to mid-chest, then press upwards explosively."
        ],
        tips: ["Retract your shoulder blades into the bench to protect your rotator cuff."],
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"
    },
    {
        name: "Flat Dumbbell Press",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Triceps", "Shoulders"],
        movementType: "push",
        equipment: ["dumbbell", "bench"],
        locations: ["gym", "home"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "strength"],
        contraindications: ["shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 8, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Sit on a bench with dumbbells on your thighs, lie back kicking weights to chest level.",
            "Press the dumbbells upward until arms are extended but not locked.",
            "Lower with control until elbows reach bench height."
        ],
        tips: ["Dumbbells allow a more natural wrist and shoulder rotation than a barbell."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Incline Dumbbell Press",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Anterior Deltoids", "Triceps"],
        movementType: "push",
        equipment: ["dumbbell", "bench"],
        locations: ["gym", "home"],
        difficulty: "intermediate",
        goalTags: ["muscle_gain", "strength"],
        contraindications: ["shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 8, max: 12 },
        restSec: 75,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Set bench to 30-45 degree incline.",
            "Hold dumbbells at shoulder height with palms facing forward.",
            "Press upward over your upper chest."
        ],
        tips: ["Do not exceed a 45-degree angle to avoid shifting emphasis to front shoulders."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Standing Cable Chest Fly",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Front Delts"],
        movementType: "push",
        equipment: ["cable_machine"],
        locations: ["gym"],
        difficulty: "intermediate",
        goalTags: ["muscle_gain"],
        contraindications: ["shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 12, max: 15 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand centered between cable stacks with pulleys set at chest height.",
            "Step forward into a staggered stance with slight elbow bend.",
            "Bring hands together in a hugging motion, squeezing the chest at peak contraction."
        ],
        tips: ["Maintain continuous tension on the cables throughout the full arc."],
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500"
    },
    {
        name: "Resistance Band Chest Press",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Triceps", "Core"],
        movementType: "push",
        equipment: ["resistance_band"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["fat_loss", "muscle_gain"],
        contraindications: [], // Very safe joint load
        defaultSets: 3,
        defaultRepRange: { min: 12, max: 15 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Anchor band behind your back or around a post at chest height.",
            "Hold handles at your armpits and press forward until arms extend.",
            "Slowly return to start under band tension."
        ],
        tips: ["Ideal travel and home exercise for joint-friendly chest activation."],
        imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500"
    },
    {
        name: "Floor Dumbbell Press (Lower Back Safe)",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Triceps"],
        movementType: "push",
        equipment: ["dumbbell", "none"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "strength"],
        contraindications: [], // Eliminates arching, protects lower back and shoulder hyperextension
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Lie flat on the floor with knees bent and feet flat on the ground.",
            "Hold dumbbells at 90 degrees with upper arms touching the floor.",
            "Press upward until arms are extended, then lower until triceps gently touch floor."
        ],
        tips: ["The floor limits range of motion safely, preventing shoulder impingement."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },

    // --- BACK (PULL) ---
    {
        name: "Pull-Up (Bodyweight)",
        primaryMuscle: "Back",
        secondaryMuscles: ["Biceps", "Forearms", "Core"],
        movementType: "pull",
        equipment: ["pull_up_bar", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "advanced",
        goalTags: ["strength", "muscle_gain"],
        contraindications: ["shoulder", "elbow"],
        defaultSets: 3,
        defaultRepRange: { min: 5, max: 10 },
        restSec: 90,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Hang from a pull-up bar with an overhand grip wider than shoulders.",
            "Pull your chest up toward the bar by driving elbows down to your hips.",
            "Lower yourself under full control to a dead hang."
        ],
        tips: ["Engage your lats first before bending your elbows."],
        imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500"
    },
    {
        name: "Lat Pulldown (Cable)",
        primaryMuscle: "Back",
        secondaryMuscles: ["Biceps", "Rear Delts"],
        movementType: "pull",
        equipment: ["cable_machine"],
        locations: ["gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "strength"],
        contraindications: ["shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Sit at pulldown station with thighs secured under pads.",
            "Grip the bar wide, lean back slightly (10-15 degrees).",
            "Pull the bar smoothly to your upper chest and squeeze your back."
        ],
        tips: ["Avoid swinging backwards with momentum."],
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500"
    },
    {
        name: "Single-Arm Dumbbell Row",
        primaryMuscle: "Back",
        secondaryMuscles: ["Biceps", "Rear Delts", "Core"],
        movementType: "pull",
        equipment: ["dumbbell", "bench"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "strength"],
        contraindications: [], // Very safe as non-working arm supports spine on bench
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Place one knee and same-side hand on a flat bench for support.",
            "Hold dumbbell in opposite hand letting it hang fully stretched.",
            "Row the dumbbell towards your hip, driving elbow straight back."
        ],
        tips: ["Keep your torso parallel to the bench; do not twist your torso."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Barbell Bent-Over Row",
        primaryMuscle: "Back",
        secondaryMuscles: ["Hamstrings", "Biceps", "Lower Back"],
        movementType: "pull",
        equipment: ["barbell"],
        locations: ["gym"],
        difficulty: "intermediate",
        goalTags: ["strength", "muscle_gain"],
        contraindications: ["lower_back", "wrist"],
        defaultSets: 4,
        defaultRepRange: { min: 6, max: 10 },
        restSec: 90,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Hinge at the hips with knees slightly bent, back flat at a 45-degree angle.",
            "Grip barbell overhand and pull to your belly button.",
            "Lower barbell under control without rounding your spine."
        ],
        tips: ["Keep your core braced tight like before a punch."],
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"
    },
    {
        name: "Chest-Supported Dumbbell Row (Lower Back Friendly)",
        primaryMuscle: "Back",
        secondaryMuscles: ["Biceps", "Rear Deltoids"],
        movementType: "pull",
        equipment: ["dumbbell", "bench"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain"],
        contraindications: [], // Safest row for lower back issues
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Lie face down on an incline bench set to 30-45 degrees.",
            "Hold dumbbells letting arms hang straight down.",
            "Row dumbbells upward pulling through elbows while chest stays glued to bench."
        ],
        tips: ["Zero spinal strain; 100% of effort targets mid-back and lats."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Seated Cable Row",
        primaryMuscle: "Back",
        secondaryMuscles: ["Biceps", "Traps"],
        movementType: "pull",
        equipment: ["cable_machine"],
        locations: ["gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "strength"],
        contraindications: ["lower_back"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Sit with knees slightly bent and feet against foot plates.",
            "Hold V-bar with straight back.",
            "Pull handle into lower abdomen while driving elbows back and pinching shoulder blades."
        ],
        tips: ["Keep your chest proud and do not lean back excessively."],
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500"
    },
    {
        name: "Resistance Band Face Pull",
        primaryMuscle: "Back",
        secondaryMuscles: ["Rear Delts", "Rotator Cuff"],
        movementType: "pull",
        equipment: ["resistance_band"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["endurance", "muscle_gain"],
        contraindications: [], // Excellent for shoulder rehabilitation
        defaultSets: 3,
        defaultRepRange: { min: 15, max: 20 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Anchor band at eye level.",
            "Grip ends with knuckles facing outwards.",
            "Pull toward your forehead while separating hands and rotating forearms up."
        ],
        tips: ["Top posture exercise to reverse slouching and shoulder pain."],
        imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500"
    },

    // --- SHOULDERS (DELTOIDS) ---
    {
        name: "Standing Dumbbell Overhead Press",
        primaryMuscle: "Shoulders",
        secondaryMuscles: ["Triceps", "Core"],
        movementType: "push",
        equipment: ["dumbbell"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["strength", "muscle_gain"],
        contraindications: ["shoulder", "lower_back"],
        defaultSets: 3,
        defaultRepRange: { min: 8, max: 12 },
        restSec: 75,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand tall holding dumbbells at ear level with elbows bent at 90 degrees.",
            "Brace core and press dumbbells vertically overhead until arms lock softly.",
            "Lower slowly back to ear height."
        ],
        tips: ["Do not arch your lower back; squeeze glutes for stability."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Seated Dumbbell Shoulder Press (Lower Back Friendly)",
        primaryMuscle: "Shoulders",
        secondaryMuscles: ["Triceps"],
        movementType: "push",
        equipment: ["dumbbell", "bench"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "strength"],
        contraindications: ["shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 8, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Sit on an upright bench with back firmly pressed into backrest.",
            "Hold dumbbells at shoulder height and press upwards overhead.",
            "Lower under control."
        ],
        tips: ["Backrest supports spine and eliminates cheating."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Dumbbell Lateral Raise",
        primaryMuscle: "Shoulders",
        secondaryMuscles: ["Traps"],
        movementType: "push",
        equipment: ["dumbbell"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain"],
        contraindications: ["shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 12, max: 15 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand with dumbbells at sides, slight bend in elbows.",
            "Raise arms outward to the sides until parallel to the floor.",
            "Lower slowly over 2 seconds."
        ],
        tips: ["Lead with elbows, not wrists, and keep weights light."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Resistance Band Lateral Raise",
        primaryMuscle: "Shoulders",
        secondaryMuscles: ["Traps"],
        movementType: "push",
        equipment: ["resistance_band"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "fat_loss"],
        contraindications: [], // Gentle on shoulder rotator
        defaultSets: 3,
        defaultRepRange: { min: 15, max: 20 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand in the middle of a resistance band holding handles at sides.",
            "Raise arms to shoulder level against band tension.",
            "Pause 1 second at top and lower smoothly."
        ],
        tips: ["Constant tension makes light bands feel challenging."],
        imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500"
    },
    {
        name: "Dumbbell Front Raise",
        primaryMuscle: "Shoulders",
        secondaryMuscles: ["Upper Chest"],
        movementType: "push",
        equipment: ["dumbbell"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain"],
        contraindications: ["shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Hold dumbbells in front of thighs with palms facing down.",
            "Lift arms forward until shoulder height.",
            "Lower with control."
        ],
        tips: ["Avoid swinging torso backwards."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Cable Face Pull",
        primaryMuscle: "Shoulders",
        secondaryMuscles: ["Upper Back", "Rotator Cuff"],
        movementType: "pull",
        equipment: ["cable_machine"],
        locations: ["gym"],
        difficulty: "beginner",
        goalTags: ["endurance", "muscle_gain"],
        contraindications: [],
        defaultSets: 3,
        defaultRepRange: { min: 12, max: 15 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Attach rope to high pulley.",
            "Grip rope ends thumbs facing backward.",
            "Pull towards your face while separating elbows outward."
        ],
        tips: ["One of the best shoulder health and posture movements."],
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500"
    },

    // --- ARMS (BICEPS & TRICEPS) ---
    {
        name: "Dumbbell Bicep Curl",
        primaryMuscle: "Biceps",
        secondaryMuscles: ["Forearms"],
        movementType: "pull",
        equipment: ["dumbbell"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain"],
        contraindications: ["wrist", "elbow"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand with dumbbells hanging at arm's length.",
            "Curl weights upward while rotating palms to face your shoulders.",
            "Squeeze biceps at the top and lower slowly."
        ],
        tips: ["Keep your elbows pinned at your sides."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Hammer Curl (Elbow Friendly)",
        primaryMuscle: "Biceps",
        secondaryMuscles: ["Brachialis", "Forearms"],
        movementType: "pull",
        equipment: ["dumbbell"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "strength"],
        contraindications: [], // Neutral grip protects wrist and elbow
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Hold dumbbells with palms facing each other (neutral grip).",
            "Curl weights up while maintaining neutral palm orientation.",
            "Lower under full control."
        ],
        tips: ["Builds forearm thickness and arm width."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Resistance Band Bicep Curl",
        primaryMuscle: "Biceps",
        secondaryMuscles: ["Forearms"],
        movementType: "pull",
        equipment: ["resistance_band"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["fat_loss", "muscle_gain"],
        contraindications: [],
        defaultSets: 3,
        defaultRepRange: { min: 12, max: 15 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand on resistance band holding handles with palms forward.",
            "Curl up against elastic tension, squeeze at peak.",
            "Lower slowly."
        ],
        tips: ["Resists throughout the entire arc."],
        imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500"
    },
    {
        name: "Tricep Bench Dips",
        primaryMuscle: "Triceps",
        secondaryMuscles: ["Chest", "Front Delts"],
        movementType: "push",
        equipment: ["bench", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "fat_loss"],
        contraindications: ["shoulder", "wrist"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 15 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Sit on edge of a bench, hands beside hips gripping the edge.",
            "Slide hips off bench, bend elbows to 90 degrees lowering hips.",
            "Press through palms to lockout arms."
        ],
        tips: ["Keep your back close to the bench to avoid excessive shoulder extension."],
        imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500"
    },
    {
        name: "Cable Tricep Rope Pushdown",
        primaryMuscle: "Triceps",
        secondaryMuscles: [],
        movementType: "push",
        equipment: ["cable_machine"],
        locations: ["gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain"],
        contraindications: ["elbow"],
        defaultSets: 3,
        defaultRepRange: { min: 12, max: 15 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Hold rope attachment on high pulley with elbows locked at your ribs.",
            "Push rope down, spreading rope ends apart at the bottom.",
            "Control the return up to elbow height."
        ],
        tips: ["Do not allow your elbows to flare or drift forward."],
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500"
    },
    {
        name: "Dumbbell Overhead Tricep Extension",
        primaryMuscle: "Triceps",
        secondaryMuscles: ["Core"],
        movementType: "push",
        equipment: ["dumbbell"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["muscle_gain"],
        contraindications: ["elbow", "shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Sit or stand holding one dumbbell overhead with both hands cup-gripping top plate.",
            "Bend elbows lowering dumbbell behind your head.",
            "Extend elbows to press weight back overhead."
        ],
        tips: ["Targets the long head of the triceps for fuller arm size."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },

    // --- LEGS (QUADS & GLUTES & HAMSTRINGS & CALVES) ---
    {
        name: "Bodyweight Air Squat",
        primaryMuscle: "Quads",
        secondaryMuscles: ["Glutes", "Hamstrings", "Core"],
        movementType: "legs",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["fat_loss", "muscle_gain", "endurance"],
        contraindications: ["knee"],
        defaultSets: 3,
        defaultRepRange: { min: 15, max: 20 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand with feet shoulder-width apart, toes slightly angled out.",
            "Hinge hips back and bend knees until thighs are parallel to ground.",
            "Drive through heels to stand upright."
        ],
        tips: ["Keep your chest proud and knees tracking in line with your toes."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Goblet Squat (Dumbbell or Kettlebell)",
        primaryMuscle: "Quads",
        secondaryMuscles: ["Glutes", "Core", "Upper Back"],
        movementType: "legs",
        equipment: ["dumbbell", "kettlebell"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "fat_loss"],
        contraindications: ["knee"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Hold a dumbbell vertically against your chest with palms under the weight.",
            "Squat down between your knees keeping your torso upright.",
            "Stand back up squeezing glutes at the top."
        ],
        tips: ["The front weight naturally keeps your spine upright, protecting the lower back."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Barbell Back Squat",
        primaryMuscle: "Quads",
        secondaryMuscles: ["Glutes", "Hamstrings", "Lower Back", "Core"],
        movementType: "legs",
        equipment: ["barbell"],
        locations: ["gym"],
        difficulty: "advanced",
        goalTags: ["strength", "muscle_gain"],
        contraindications: ["knee", "lower_back"],
        defaultSets: 4,
        defaultRepRange: { min: 6, max: 8 },
        restSec: 120,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Rest barbell on upper traps/rear delts, unrack and take two steps back.",
            "Take deep breath, brace core, and descend until thighs are at parallel.",
            "Drive up forcefully pushing through mid-foot."
        ],
        tips: ["The king of leg exercises. Warm up thoroughly first."],
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"
    },
    {
        name: "Glute Bridge (Bodyweight - Knee & Back Safe)",
        primaryMuscle: "Glutes",
        secondaryMuscles: ["Hamstrings", "Core"],
        movementType: "legs",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["fat_loss", "muscle_gain", "mobility"],
        contraindications: [], // Exceptionally safe for bad knees and back pain
        defaultSets: 3,
        defaultRepRange: { min: 15, max: 20 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Lie on your back with knees bent and feet flat on the floor, hip-width apart.",
            "Drive through heels to lift hips until thighs and torso align.",
            "Squeeze glutes hard at the top for 2 seconds, then lower smoothly."
        ],
        tips: ["Primary rehabilitation exercise to activate dormant glutes."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Barbell / Dumbbell Romanian Deadlift (RDL)",
        primaryMuscle: "Hamstrings",
        secondaryMuscles: ["Glutes", "Lower Back", "Forearms"],
        movementType: "pull",
        equipment: ["barbell", "dumbbell"],
        locations: ["gym", "home"],
        difficulty: "intermediate",
        goalTags: ["muscle_gain", "strength"],
        contraindications: ["lower_back"],
        defaultSets: 3,
        defaultRepRange: { min: 8, max: 12 },
        restSec: 90,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand holding weights in front of thighs with soft knee bend.",
            "Push hips straight back while sliding weights down along your shins.",
            "When you feel a deep stretch in hamstrings, drive hips forward to stand."
        ],
        tips: ["Hinge at hips; do not squat down with knees."],
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"
    },
    {
        name: "Swiss Ball or Towel Hamstring Curl (Knee & Back Safe)",
        primaryMuscle: "Hamstrings",
        secondaryMuscles: ["Glutes", "Calves"],
        movementType: "pull",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "endurance"],
        contraindications: [], // Safe alternative for spinal issues
        defaultSets: 3,
        defaultRepRange: { min: 12, max: 15 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Lie on back with heels on a slippery towel or Swiss ball.",
            "Lift hips into a bridge.",
            "Curl heels toward your glutes, keeping hips elevated throughout."
        ],
        tips: ["Burns the hamstrings with zero load on the lumbar spine."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Walking Dumbbell Lunges",
        primaryMuscle: "Quads",
        secondaryMuscles: ["Glutes", "Hamstrings", "Calves"],
        movementType: "legs",
        equipment: ["dumbbell", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["fat_loss", "muscle_gain"],
        contraindications: ["knee", "ankle"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Step forward with right leg and lower hips until both knees form 90-degree angles.",
            "Drive off front heel to step forward into next lunge with left leg."
        ],
        tips: ["Maintain an upright torso and do not let front knee collapse inward."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Box Step-Ups (Knee Friendly Single Leg)",
        primaryMuscle: "Quads",
        secondaryMuscles: ["Glutes", "Calves"],
        movementType: "legs",
        equipment: ["bench", "bodyweight", "dumbbell"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["fat_loss", "muscle_gain"],
        contraindications: [], // Much gentler on knees than lunges
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand facing a sturdy box or bench at knee height.",
            "Place entire foot on box and step up using only the lead leg.",
            "Step down smoothly under control."
        ],
        tips: ["Avoid pushing off with the trailing back foot."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Leg Press Machine",
        primaryMuscle: "Quads",
        secondaryMuscles: ["Glutes", "Hamstrings"],
        movementType: "legs",
        equipment: ["leg_press"],
        locations: ["gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "strength"],
        contraindications: ["knee"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 90,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Sit in machine with back and head flat against padded support.",
            "Place feet shoulder-width on sled.",
            "Lower weight until knees are at 90 degrees, press platform back up without locking knees."
        ],
        tips: ["Never let your lower back round off the seat pad at bottom."],
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500"
    },
    {
        name: "Standing Calf Raises",
        primaryMuscle: "Calves",
        secondaryMuscles: ["Ankles"],
        movementType: "legs",
        equipment: ["bodyweight", "dumbbell"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["endurance", "muscle_gain"],
        contraindications: ["ankle"],
        defaultSets: 3,
        defaultRepRange: { min: 15, max: 20 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand on balls of feet on edge of a step.",
            "Lower heels for a deep stretch in calves.",
            "Press high onto tiptoes and hold contraction for 1 full second."
        ],
        tips: ["Pause at bottom to remove elastic Achilles tendon bounce."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },

    // --- CORE & ABS ---
    {
        name: "Standard Plank (Core Stability)",
        primaryMuscle: "Core",
        secondaryMuscles: ["Glutes", "Shoulders"],
        movementType: "core",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["endurance", "fat_loss"],
        contraindications: ["shoulder"], // Very safe for lower back
        defaultSets: 3,
        defaultRepRange: { min: 30, max: 60 },
        restSec: 45,
        isTimed: true,
        durationSec: 45,
        instructions: [
            "Rest on forearms and toes with body in a straight line.",
            "Tighten abs as if preparing to take a punch.",
            "Breathe steadily while holding posture."
        ],
        tips: ["Do not allow hips to sag or hike into a pyramid."],
        imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=500"
    },
    {
        name: "Dead Bug (Back-Safe Core Strengthening)",
        primaryMuscle: "Core",
        secondaryMuscles: ["Hip Flexors"],
        movementType: "core",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["mobility", "endurance"],
        contraindications: [], // Gold standard for lower back rehab
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Lie on back with arms pointing to ceiling and knees bent at 90 degrees.",
            "Slowly extend right arm overhead and left leg straight toward floor simultaneously.",
            "Return and alternate sides while keeping lower back pressed flat into floor."
        ],
        tips: ["If your lower back arches off floor, do not extend legs as low."],
        imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=500"
    },
    {
        name: "Bird Dog (Spine & Core Stability)",
        primaryMuscle: "Core",
        secondaryMuscles: ["Glutes", "Lower Back"],
        movementType: "core",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["mobility", "endurance"],
        contraindications: [], // Doctor-recommended for spinal stability
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Start on hands and knees (tabletop position).",
            "Extend right arm forward and left leg straight back simultaneously.",
            "Hold 2 seconds, return and switch sides."
        ],
        tips: ["Imagine balancing a cup of water on your lower back."],
        imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=500"
    },
    {
        name: "Hanging Leg Raise",
        primaryMuscle: "Core",
        secondaryMuscles: ["Hip Flexors", "Forearms"],
        movementType: "core",
        equipment: ["pull_up_bar"],
        locations: ["gym", "home"],
        difficulty: "advanced",
        goalTags: ["muscle_gain", "strength"],
        contraindications: ["lower_back", "shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 8, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Hang from pull up bar with arms straight.",
            "Without swinging, curl knees or straight legs up toward chest.",
            "Lower slowly under full control."
        ],
        tips: ["Posterior pelvic tilt at the top engages lower abs intensely."],
        imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500"
    },
    {
        name: "Russian Twists (Obliques)",
        primaryMuscle: "Core",
        secondaryMuscles: ["Obliques"],
        movementType: "core",
        equipment: ["bodyweight", "dumbbell"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["fat_loss", "endurance"],
        contraindications: ["lower_back"],
        defaultSets: 3,
        defaultRepRange: { min: 16, max: 20 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Sit with knees bent, lean back at 45 degrees, lift feet slightly off floor.",
            "Rotate torso from side to side tapping hands/weight on floor beside hip."
        ],
        tips: ["Turn your shoulders with the movement, not just your arms."],
        imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=500"
    },

    // --- CARDIO & HIIT ---
    {
        name: "Jumping Jacks (Warmup & Cardio)",
        primaryMuscle: "Calves",
        secondaryMuscles: ["Shoulders", "Quads", "Core"],
        movementType: "cardio",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["fat_loss", "endurance"],
        contraindications: ["knee", "ankle"],
        defaultSets: 3,
        defaultRepRange: { min: 30, max: 50 },
        restSec: 30,
        isTimed: true,
        durationSec: 45,
        instructions: [
            "Stand with feet together and hands at sides.",
            "Jump feet out while swinging arms overhead.",
            "Jump back to start position smoothly."
        ],
        tips: ["Land softly on the balls of your feet."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "High Knees (HIIT Cardio)",
        primaryMuscle: "Quads",
        secondaryMuscles: ["Calves", "Core"],
        movementType: "cardio",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["fat_loss", "endurance"],
        contraindications: ["knee", "ankle"],
        defaultSets: 3,
        defaultRepRange: { min: 30, max: 45 },
        restSec: 30,
        isTimed: true,
        durationSec: 30,
        instructions: [
            "Run in place driving knees up toward chest level as quickly as possible.",
            "Pump arms in rhythm with opposite legs."
        ],
        tips: ["Stay light on your feet and keep chest tall."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Low-Impact Step Jacks (Knee Friendly Cardio)",
        primaryMuscle: "Calves",
        secondaryMuscles: ["Shoulders", "Core"],
        movementType: "cardio",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["fat_loss", "endurance"],
        contraindications: [], // Zero impact for sensitive knees/ankles
        defaultSets: 3,
        defaultRepRange: { min: 20, max: 30 },
        restSec: 30,
        isTimed: true,
        durationSec: 45,
        instructions: [
            "Step right foot out to side while raising arms overhead.",
            "Step back to center and immediately step left foot out.",
            "Maintain a brisk pace without jumping."
        ],
        tips: ["Keeps heart rate elevated with zero joint pounding."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Mountain Climbers",
        primaryMuscle: "Core",
        secondaryMuscles: ["Shoulders", "Quads"],
        movementType: "cardio",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["fat_loss", "endurance"],
        contraindications: ["wrist", "shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 20, max: 30 },
        restSec: 45,
        isTimed: true,
        durationSec: 30,
        instructions: [
            "Start in high plank position.",
            "Drive right knee towards chest, quickly switch and drive left knee.",
            "Alternate in a rapid running motion."
        ],
        tips: ["Keep hips low and level with shoulders."],
        imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=500"
    },
    {
        name: "Burpees (Full Body Conditioning)",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Quads", "Triceps", "Core"],
        movementType: "cardio",
        equipment: ["bodyweight", "none"],
        locations: ["home", "gym"],
        difficulty: "advanced",
        goalTags: ["fat_loss", "endurance"],
        contraindications: ["knee", "lower_back", "wrist"],
        defaultSets: 3,
        defaultRepRange: { min: 8, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Drop into a squat with hands on floor.",
            "Kick feet back into plank and lower chest to floor.",
            "Push up, jump feet to hands, and explode vertically with hands overhead."
        ],
        tips: ["Pace yourself; high intensity calorie burner."],
        imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500"
    },
    {
        name: "Treadmill Incline Walking (Low Joint Impact Fat Loss)",
        primaryMuscle: "Glutes",
        secondaryMuscles: ["Calves", "Hamstrings"],
        movementType: "cardio",
        equipment: ["treadmill"],
        locations: ["gym"],
        difficulty: "beginner",
        goalTags: ["fat_loss", "endurance"],
        contraindications: [], // Very safe for knee rehabilitation
        defaultSets: 1,
        defaultRepRange: { min: 15, max: 30 },
        restSec: 0,
        isTimed: true,
        durationSec: 1200,
        instructions: [
            "Set treadmill incline to 8-12% and speed to 4.5-5.5 km/h.",
            "Walk with upright posture without holding onto handrails.",
            "Pump arms gently."
        ],
        tips: ["Burns as many calories as running with none of the joint impact."],
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500"
    },
    {
        name: "Jump Rope (Cardio & Footwork)",
        primaryMuscle: "Calves",
        secondaryMuscles: ["Forearms", "Shoulders", "Core"],
        movementType: "cardio",
        equipment: ["jump_rope"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["fat_loss", "endurance"],
        contraindications: ["knee", "ankle"],
        defaultSets: 3,
        defaultRepRange: { min: 50, max: 100 },
        restSec: 45,
        isTimed: true,
        durationSec: 60,
        instructions: [
            "Hold rope handles at hip height.",
            "Turn rope with wrists, jumping 1-2 inches off floor just enough for rope to pass.",
            "Land softly on balls of feet."
        ],
        tips: ["Keep elbows tucked into your sides."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Kettlebell Swing",
        primaryMuscle: "Glutes",
        secondaryMuscles: ["Hamstrings", "Core", "Upper Back"],
        movementType: "pull",
        equipment: ["kettlebell", "dumbbell"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["fat_loss", "strength"],
        contraindications: ["lower_back"],
        defaultSets: 3,
        defaultRepRange: { min: 15, max: 20 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Hinge hips back letting kettlebell swing between legs.",
            "Snap hips forward explosively to drive kettlebell to chest height.",
            "Let weight swing back naturally into next hinge."
        ],
        tips: ["Drive from the hips and glutes, not by lifting with your arms."],
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"
    },

    // --- MOBILITY & RECOVERY ---
    {
        name: "Cat-Cow Stretch (Spinal Mobility)",
        primaryMuscle: "Back",
        secondaryMuscles: ["Core", "Neck"],
        movementType: "mobility",
        equipment: ["none", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["mobility"],
        contraindications: [], // Gentle on entire spine
        defaultSets: 2,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 30,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "On all fours, inhale as you drop belly toward floor and look up (Cow).",
            "Exhale as you arch your spine toward ceiling tucking chin to chest (Cat).",
            "Move fluidly with breath."
        ],
        tips: ["Relieves stiffness and improves spinal disc hydration."],
        imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=500"
    },
    {
        name: "World's Greatest Stretch (Thoracic & Hips)",
        primaryMuscle: "Hamstrings",
        secondaryMuscles: ["Glutes", "Upper Back", "Hip Flexors"],
        movementType: "mobility",
        equipment: ["none", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["mobility"],
        contraindications: [],
        defaultSets: 2,
        defaultRepRange: { min: 5, max: 6 },
        restSec: 30,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Step into deep lunge with right foot outside right hand.",
            "Drop right elbow towards floor inside front ankle.",
            "Rotate torso and reach right arm toward ceiling, opening chest."
        ],
        tips: ["Unlocks hips, thoracic spine, and ankles in one smooth flow."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Child's Pose (Lat & Lower Back Decompression)",
        primaryMuscle: "Back",
        secondaryMuscles: ["Hips", "Shoulders"],
        movementType: "mobility",
        equipment: ["none", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["mobility"],
        contraindications: ["knee"],
        defaultSets: 2,
        defaultRepRange: { min: 30, max: 60 },
        restSec: 30,
        isTimed: true,
        durationSec: 45,
        instructions: [
            "Kneel on floor with big toes touching and knees wide.",
            "Sit hips back onto heels while extending arms forward on floor.",
            "Rest forehead on mat and take deep belly breaths."
        ],
        tips: ["Excellent restorative stretch between intense sets or post-workout."],
        imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=500"
    },
    {
        name: "Pigeon Stretch (Glute & Hip Opener)",
        primaryMuscle: "Glutes",
        secondaryMuscles: ["Hip Flexors"],
        movementType: "mobility",
        equipment: ["none", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["mobility"],
        contraindications: ["knee"],
        defaultSets: 2,
        defaultRepRange: { min: 30, max: 45 },
        restSec: 30,
        isTimed: true,
        durationSec: 40,
        instructions: [
            "Bring right shin forward in front of hips on the mat.",
            "Extend left leg straight back behind you.",
            "Square hips and fold torso forward over right leg."
        ],
        tips: ["Releases tight piriformis muscle that causes sciatica and hip tightness."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Standing Doorway Chest Stretch",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Anterior Deltoids", "Biceps"],
        movementType: "mobility",
        equipment: ["none", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["mobility"],
        contraindications: [],
        defaultSets: 2,
        defaultRepRange: { min: 20, max: 30 },
        restSec: 30,
        isTimed: true,
        durationSec: 30,
        instructions: [
            "Place forearms on either side of an open doorframe at 90 degrees.",
            "Step forward with one foot until you feel a gentle stretch across chest.",
            "Hold without bouncing."
        ],
        tips: ["Instantly counters hunched desk posture."],
        imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500"
    },
    {
        name: "Ankle Dorsiflexion Wall Mobilization",
        primaryMuscle: "Calves",
        secondaryMuscles: ["Ankles"],
        movementType: "mobility",
        equipment: ["none", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["mobility"],
        contraindications: [],
        defaultSets: 2,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 30,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Stand 3-4 inches away from a wall in a staggered stance.",
            "Drive front knee straight forward to touch wall without heel lifting off floor.",
            "Return and repeat."
        ],
        tips: ["Improves squat depth by restoring tight ankle mobility."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Bulgarian Split Squat",
        primaryMuscle: "Quads",
        secondaryMuscles: ["Glutes", "Hamstrings", "Calves"],
        movementType: "legs",
        equipment: ["dumbbell", "bench", "bodyweight"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["muscle_gain", "strength", "fat_loss"],
        contraindications: ["knee"],
        defaultSets: 3,
        defaultRepRange: { min: 8, max: 12 },
        restSec: 75,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Place one foot elevated behind you on a bench.",
            "Lower hips until front thigh is nearly parallel to floor.",
            "Drive through front heel to return to start position."
        ],
        tips: ["Unilateral staple for building single-leg power and glute development."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Barbell Hip Thrust",
        primaryMuscle: "Glutes",
        secondaryMuscles: ["Hamstrings", "Core"],
        movementType: "legs",
        equipment: ["barbell", "bench"],
        locations: ["gym"],
        difficulty: "intermediate",
        goalTags: ["strength", "muscle_gain"],
        contraindications: [], // Excellent for lower back safe glute overload
        defaultSets: 4,
        defaultRepRange: { min: 8, max: 12 },
        restSec: 90,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Sit on floor with upper back against a bench and loaded barbell across hips.",
            "Plant feet firmly, drive hips upward until thighs and torso align horizontally.",
            "Squeeze glutes hard for 2 seconds at top, then lower under control."
        ],
        tips: ["Keep your chin tucked and gaze forward to protect your lumbar spine."],
        imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500"
    },
    {
        name: "Incline Dumbbell Bicep Curl",
        primaryMuscle: "Biceps",
        secondaryMuscles: ["Forearms"],
        movementType: "pull",
        equipment: ["dumbbell", "bench"],
        locations: ["home", "gym"],
        difficulty: "intermediate",
        goalTags: ["muscle_gain"],
        contraindications: ["shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Sit back on an incline bench set to 45-60 degrees with dumbbells hanging straight down.",
            "Curl dumbbells upward keeping upper arms perpendicular to the floor.",
            "Squeeze biceps at the top and lower slowly for a full stretch."
        ],
        tips: ["Maximizes stretch on the long head of the bicep."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Lying Triceps Skull Crushers",
        primaryMuscle: "Triceps",
        secondaryMuscles: ["Forearms"],
        movementType: "push",
        equipment: ["barbell", "dumbbell", "bench"],
        locations: ["gym", "home"],
        difficulty: "intermediate",
        goalTags: ["muscle_gain", "strength"],
        contraindications: ["elbow"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 12 },
        restSec: 60,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Lie flat on a bench holding an EZ bar or dumbbells directly above your chest.",
            "Hing at elbows to lower weight towards your forehead or crown of head.",
            "Extend elbows to press weight back up to lockout."
        ],
        tips: ["Keep elbows tucked in; do not allow them to flare out wide."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Standing Barbell Overhead Press (OHP)",
        primaryMuscle: "Shoulders",
        secondaryMuscles: ["Triceps", "Upper Chest", "Core"],
        movementType: "push",
        equipment: ["barbell"],
        locations: ["gym"],
        difficulty: "advanced",
        goalTags: ["strength", "muscle_gain"],
        contraindications: ["shoulder", "lower_back"],
        defaultSets: 4,
        defaultRepRange: { min: 6, max: 8 },
        restSec: 90,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Rest barbell across front delts and clavicle with overhand grip.",
            "Brace core and glutes, press bar straight up clearing your chin.",
            "Lock arms overhead and shrug shoulders slightly at the top."
        ],
        tips: ["The foundational vertical pressing compound lift."],
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"
    },
    {
        name: "Farmer's Walk (Grip, Traps & Core)",
        primaryMuscle: "Core",
        secondaryMuscles: ["Forearms", "Traps", "Calves"],
        movementType: "core",
        equipment: ["dumbbell", "kettlebell"],
        locations: ["gym", "home"],
        difficulty: "beginner",
        goalTags: ["strength", "fat_loss", "endurance"],
        contraindications: ["wrist"],
        defaultSets: 3,
        defaultRepRange: { min: 30, max: 50 },
        restSec: 60,
        isTimed: true,
        durationSec: 45,
        instructions: [
            "Pick up a pair of heavy dumbbells or kettlebells with a secure grip.",
            "Stand tall with shoulders pulled back and down.",
            "Walk smoothly with small controlled paces for distance or time."
        ],
        tips: ["Builds crushing grip strength and bulletproof core stability."],
        imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
    },
    {
        name: "Hanging Knee Tucks (Beginner Core)",
        primaryMuscle: "Core",
        secondaryMuscles: ["Hip Flexors", "Forearms"],
        movementType: "core",
        equipment: ["pull_up_bar"],
        locations: ["home", "gym"],
        difficulty: "beginner",
        goalTags: ["muscle_gain", "endurance"],
        contraindications: ["shoulder"],
        defaultSets: 3,
        defaultRepRange: { min: 10, max: 15 },
        restSec: 45,
        isTimed: false,
        durationSec: 0,
        instructions: [
            "Hang from pull-up bar with arms straight.",
            "Pull knees upward toward chest without swinging your body.",
            "Lower legs slowly back down."
        ],
        tips: ["Great progression toward full hanging leg raises."],
        imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500"
    }
];

module.exports = exercises;
