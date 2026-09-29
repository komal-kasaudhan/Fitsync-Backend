const WorkoutPlan = require('../models/WorkoutPlan');
const Exercise = require('../models/Exercise');

class WorkoutPlanService {
    async generateAndSaveWorkoutPlan(userId, compiledContext) {
        try {
            const { bottomSheetCurrentConstraints, userOnboardingTelemetry } = compiledContext;
            
            const dbExercises = await Exercise.find({}).limit(5);

            const ex1 = dbExercises[0]?._id || "669527e2b1c3d4e5f6a7b8e1";
            const ex2 = dbExercises[1]?._id || "669527e2b1c3d4e5f6a7b8e2";

            const generatedRoutines = bottomSheetCurrentConstraints.weeklyActiveDays.map((day, index) => {
                const isEven = index % 2 === 0;
                return {
                    day: day,
                    workoutName: isEven ? "Back + Biceps" : "Chest + Triceps Explosion",
                    targetMuscles: isEven ? ["Back", "Biceps"] : ["Chest", "Triceps"],
                    duration: bottomSheetCurrentConstraints.durationPerSession,
                    calories: isEven ? 350 : 420,
                    difficulty: userOnboardingTelemetry.fitnessGoal === "Muscle Gain" ? "Intermediate" : "Beginner",
                    exercises: [
                        { exerciseId: ex1, sets: 3, reps: "12", restDuration: "60s" },
                        { exerciseId: ex2, sets: 3, reps: "10", restDuration: "45s" }
                    ]
                };
            });

            
            const weeklyWorkoutPlan = await WorkoutPlan.findOneAndUpdate(
                { userId, status: 'Active' },
                {
                    userId,
                    weekNumber: 1,
                    routines: generatedRoutines,
                    status: 'Active'
                },
                { returnDocument: 'after', upsert: true, new: true }
            );

            return weeklyWorkoutPlan;
        } catch (error) {
            throw new Error(`[WorkoutPlanService Error]: ${error.message}`);
        }
    }
}

module.exports = new WorkoutPlanService();