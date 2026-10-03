// 📄 Path: src/service/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-3.8-flash", "gemini-flash-latest"];

function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Sanitize error message so no API keys or connection strings are logged
 */
function sanitizeError(err) {
    if (!err) return "Unknown error";
    const msg = err.message || String(err);
    return msg.replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]");
}

/**
 * Execute Gemini model call with single retry + backoff, model fallbacks, and 20-30s timeout
 */
async function generateWithFallback(prompt, timeoutMs = 25000) {
    const genAI = getGenAI();
    let lastError = null;

    for (const modelName of FALLBACK_MODELS) {
        // Attempt with 1 retry on transient errors (503, 429, timeout)
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                
                // Promise race with 25s timeout
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Gemini timeout after ${timeoutMs}ms`)), timeoutMs)
                );

                const resultPromise = model.generateContent(prompt);
                const result = await Promise.race([resultPromise, timeoutPromise]);
                return result.response.text().trim();
            } catch (err) {
                lastError = err;
                const status = err.status || (err.message?.includes("503") ? 503 : err.message?.includes("429") ? 429 : 500);
                const sanitized = sanitizeError(err);
                
                if (attempt === 1 && (status === 503 || status === 429 || err.message?.includes("timeout"))) {
                    console.warn(`⚠️ Model ${modelName} encountered ${status} on attempt 1. Retrying with backoff (1500ms)... Error: ${sanitized}`);
                    await new Promise(r => setTimeout(r, 1500));
                    continue;
                } else {
                    console.warn(`⚠️ Model ${modelName} attempt ${attempt} failed (${status}): ${sanitized}. Trying next fallback model...`);
                    break;
                }
            }
        }
    }

    throw lastError || new Error("All Gemini models failed to respond.");
}


/**
 * Clean and parse JSON from Gemini response (handling codeblocks if present)
 */
function parseGeminiJson(rawText) {
    if (!rawText) return null;
    let clean = rawText.trim();
    if (clean.startsWith("```json")) {
        clean = clean.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    } else if (clean.startsWith("```")) {
        clean = clean.replace(/^```\s*/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(clean);
}

const FIRST_TIME_MOTIVATIONAL_LINES = [
    "Welcome to FitSync! Consistency beats intensity every single time. Let's conquer today's goals together!",
    "Your journey starts with your next meal and workout. Stay committed and drink plenty of water today.",
    "A journey of a thousand miles begins with a single clean meal. Start strong with your nutrition targets!",
    "Small daily improvements over time lead to stunning results. Focus on hitting your protein goal today.",
    "Welcome to day one! Track your meals, complete your workout, and trust the process.",
    "The secret of getting ahead is getting started. Fuel your body with high-quality nutrients today.",
    "Consistency is what transforms average into excellence. Let's make today count towards your goal!",
    "Greatness is forged one disciplined choice at a time. Prioritize your hydration and protein today.",
    "Welcome aboard! Focus on progress, not perfection. Hit your daily water and calorie targets.",
    "Your body can stand almost anything; it's your mind you have to convince. Let's crush today's plan!",
    "Every healthy choice you make today is an investment in your future self. Eat clean and stay hydrated.",
    "Believe in the power of daily habits. Start with a protein-rich meal and active movement today.",
    "You don't have to be extreme, just consistent. Log your first meal and hit your daily targets.",
    "Motivation gets you going, but discipline keeps you growing. Let's build your fitness foundation today!",
    "Today is your clean slate. Focus on nutritious whole foods and give your workout 100%.",
    "Champions are built when no one is watching. Stay focused on your macros and rest well tonight.",
    "Your potential is endless. Nourish your muscles with clean protein and maintain steady hydration.",
    "Step by step, day by day. Every macro logged brings you closer to your dream physique.",
    "Welcome to FitSync! Stay mindful of your portions and celebrate every small win today.",
    "Energy flows where focus goes. Direct your focus to hitting your targets today and feeling your best!",
    "The hard days are the days that count the most. Keep your vision clear and your habits strong!"
];

/**
 * Feature C & Task 5: Dynamic AI nutrition insight with yesterday's feedback
 * Returns { message: string, tone: string, suggestedFoods: string[], isFirstTime?: boolean }
 */
async function generateDynamicNutritionInsight({
    remainingProtein,
    remainingCalories,
    remainingCarbs,
    remainingFat,
    remainingWater,
    targetProtein,
    targetCalories,
    dietType = "Veg",
    timeBucket = "afternoon",
    goal = "Maintain",
    yesterdaySummary = null,
    isFirstTime = false,
    userId = "",
    date = ""
}) {
    const isVeg = !dietType.toLowerCase().includes("non");
    const defaultFoods = isVeg
        ? (timeBucket === "morning" ? ["Paneer Bhurji", "High-Protein Oats", "Greek Yogurt"] : ["Soya Chunks Curry", "Dal Tadka & Rice", "Tofu Stir-Fry"])
        : (timeBucket === "morning" ? ["3 Boiled Eggs", "Masala Omelette", "Greek Yogurt"] : ["Grilled Chicken Breast", "Egg Curry & Rice", "Tuna Salad"]);

    // First time user: rotate from 20+ lines seeded by userId + date
    if (isFirstTime || !yesterdaySummary) {
        const seedStr = `${userId || "user"}_${date || "today"}_first_time`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) hash = (hash << 5) - hash + seedStr.charCodeAt(i);
        const index = Math.abs(hash) % FIRST_TIME_MOTIVATIONAL_LINES.length;

        return {
            message: FIRST_TIME_MOTIVATIONAL_LINES[index],
            tone: "encouraging",
            suggestedFoods: defaultFoods,
            isFirstTime: true
        };
    }

    // 1. Rule-based fallback template generator referencing yesterday
    const getFallback = () => {
        let msg = "";
        let tone = "encouraging";

        if (yesterdaySummary.missedProtein) {
            tone = "corrective";
            msg = `You missed protein yesterday (${yesterdaySummary.consumedProtein}g). Prioritize ${defaultFoods[0]} today to hit your ${goal.toLowerCase()} goal.`;
        } else if (yesterdaySummary.hitProtein) {
            tone = "celebratory";
            msg = `Great job hitting protein yesterday! Maintain momentum with ${remainingProtein}g left today; try ${defaultFoods[0]}.`;
        } else if (yesterdaySummary.missedWorkout) {
            tone = "motivational";
            msg = `Missed yesterday's workout? Reset today with good hydration and a protein-rich ${defaultFoods[0]}.`;
        } else {
            tone = "encouraging";
            msg = `With ${remainingProtein}g protein left today, fuel your ${goal.toLowerCase()} with a hearty serving of ${defaultFoods[0]}.`;
        }

        return {
            message: msg.slice(0, 160),
            tone,
            suggestedFoods: defaultFoods,
            isFirstTime: false
        };
    };

    if (!process.env.GEMINI_API_KEY) {
        return getFallback();
    }

    const prompt = `You are a certified sports nutritionist.
Current User Status:
- Time of Day: ${timeBucket}
- Fitness Goal: ${goal}
- Diet Preference: ${dietType}
- Target Today: ${targetCalories} kcal, ${targetProtein}g protein
- Remaining Today: ${remainingProtein}g protein, ${remainingCalories} kcal, ${remainingCarbs}g carbs, ${remainingFat}g fat, ${remainingWater}L water.

Yesterday's Summary:
- Calories Consumed: ${yesterdaySummary.consumedCalories} / ${yesterdaySummary.targetCalories} kcal
- Protein Consumed: ${yesterdaySummary.consumedProtein}g / ${yesterdaySummary.targetProtein}g (Goal met: ${yesterdaySummary.hitProtein ? "Yes" : "No"})
- Water Consumed: ${yesterdaySummary.consumedWater}L
- Workout Completed: ${yesterdaySummary.workoutCompleted ? "Yes" : "No"}
- Workout Feedback: ${yesterdaySummary.workoutFeedback || "None"}
- Current Streak: ${yesterdaySummary.streak || 0} days

Task:
Provide exactly ONE short, warm, highly actionable tip (STRICTLY MAXIMUM 25 WORDS).
Reference yesterday's performance (e.g. if protein was missed yesterday, advise making up for it today; if workout was completed, encourage recovery).
Suggest a specific food matching their ${dietType} diet and the ${timeBucket} time of day.
Return your response in STRICT JSON format:
{
  "message": "Your short tip under 25 words referencing yesterday and recommending a food.",
  "tone": "motivational",
  "suggestedFoods": ["Food 1", "Food 2"]
}
Output only valid JSON, without extra commentary or markdown.`;

    try {
        const raw = await generateWithFallback(prompt, 20000);
        const parsed = parseGeminiJson(raw);
        if (parsed && typeof parsed.message === "string" && Array.isArray(parsed.suggestedFoods)) {
            return {
                message: parsed.message.trim(),
                tone: parsed.tone || "encouraging",
                suggestedFoods: parsed.suggestedFoods.slice(0, 4),
                isFirstTime: false
            };
        }
        return getFallback();
    } catch (err) {
        console.warn("⚠️ Gemini dynamic insight failed, using fallback:", err.message);
        return getFallback();
    }
}


/**
 * Feature I: Multi-turn Ask AI Fitness & Nutrition Coach
 */
async function chatWithAiCoach(userQuery, conversationHistory = [], userContext = {}) {
    const fallbackResponse = "I'm your FitSync Coach. Stay consistent with your hydration, aim for your daily protein target, and get adequate rest between workouts!";

    if (!process.env.GEMINI_API_KEY) {
        return fallbackResponse;
    }

    const {
        goal = "General Fitness",
        currentWeight = 70,
        targetWeight = 68,
        dietType = "Veg",
        injuries = [],
        equipment = [],
        remainingProtein = 50,
        remainingCalories = 800,
        todayWorkout = "Upper Body"
    } = userContext;

    const systemPrompt = `You are FitSync AI, an elite personal trainer and sports nutrition coach.
User Profile:
- Goal: ${goal}
- Current Weight: ${currentWeight} kg (Target: ${targetWeight} kg)
- Diet: ${dietType}
- Known Physical Limitations / Injuries: ${injuries.length > 0 ? injuries.join(", ") : "None reported"}
- Equipment Available: ${equipment.length > 0 ? equipment.join(", ") : "Bodyweight & basic equipment"}
- Today's Context: Remaining Protein: ${remainingProtein}g, Remaining Calories: ${remainingCalories} kcal, Scheduled Workout: ${todayWorkout}

RULES:
1. Scope: Only answer questions related to fitness, workouts, nutrition, macro tracking, form, recovery, and hydration.
2. Refusal: If the user asks about unrelated topics (e.g. coding, politics, finance, movies), politely refuse and guide them back to fitness.
3. Safety & Medical: NEVER provide medical diagnoses or prescribe medications. If the user mentions acute sharp pain, numbness, dizziness, or injury red flags, firmly advise consulting a doctor or physical therapist.
4. Style: Empathetic, encouraging, science-backed, and concise (under 80 words).`;

    // Build conversation context
    const formattedHistory = conversationHistory.slice(-10).map(msg => `${msg.role === "user" ? "User" : "Coach"}: ${msg.content}`).join("\n");

    const fullPrompt = `${systemPrompt}

Conversation History:
${formattedHistory}

User: "${userQuery}"
Coach:`;

    try {
        const reply = await generateWithFallback(fullPrompt, 35000);
        return reply || fallbackResponse;
    } catch (err) {
        console.error("❌ Gemini chatWithAiCoach error:", err.message);
        return "I'm having a brief connection delay right now. In the meantime, remember to hit your protein goal and stay hydrated today!";
    }
}

/**
 * Feature E & Task 2: Optional Gemini workout plan optimizer
 */
async function optimizeWorkoutPlanWithGemini(candidateDays, userProfile, yesterdayFeedback = null) {
    if (!process.env.GEMINI_API_KEY) {
        return null;
    }

    const feedbackContext = yesterdayFeedback
        ? `Yesterday's Workout Feedback: Difficulty was '${yesterdayFeedback.difficulty || "just_right"}', Soreness: '${yesterdayFeedback.soreness || "none"}', Pain areas: ${JSON.stringify(yesterdayFeedback.painAreas || [])}. Adapt sets and rest accordingly.`
        : "No previous workout feedback available.";

    const prompt = `You are an elite master strength and conditioning coach.
User Context:
- Goal: ${userProfile.goal}
- Fitness Level: ${userProfile.level}
- Duration: ${userProfile.duration} mins
- Location: ${userProfile.location}
- ${feedbackContext}

Candidate Days and Exercises (STRICT RULE: ONLY choose IDs from this list):
${JSON.stringify(candidateDays.map(d => ({
    dayIndex: d.dayIndex,
    focus: d.focus,
    isRestDay: d.isRestDay,
    candidateExercises: (d.exercises || []).map(e => ({
        exerciseId: e.exerciseId,
        name: e.name,
        defaultSets: e.sets,
        defaultReps: e.reps,
        defaultRestSec: e.restSec
    }))
})), null, 2)}

Task:
For each training day, choose 6-7 exercises from candidateExercises, ordering from compound to isolation.
Fine-tune sets, reps, and restSec according to the user's goal and feedback. Provide a 1-sentence coachNote.
STRICT JSON format:
[
  {
    "dayIndex": 0,
    "coachNote": "Focus on explosive leg drive and tight core bracing.",
    "exercises": [
      {
        "exerciseId": "<id strictly from candidateExercises>",
        "sets": 3,
        "reps": "8-10",
        "restSec": 75,
        "note": "Control the descent"
      }
    ]
  }
]
Output ONLY valid JSON. Never invent IDs outside candidateExercises.`;

    try {
        const raw = await generateWithFallback(prompt, 25000);
        return parseGeminiJson(raw);
    } catch (err) {
        console.warn("⚠️ Gemini workout plan optimizer skipped:", err.message);
        return null;
    }
}


/**
 * Feature A: Rank and provide one-line reasons for top 5 meal recommendations
 * Returns array: [ { id: string, reason: string }, ... ]
 */
async function rankAndReasonMealRecommendations({
    candidates,
    userContext = {},
    currentSeason = "post_monsoon",
    remainingProtein = 50,
    remainingCalories = 600,
    timeBucket = "afternoon"
}) {
    if (!process.env.GEMINI_API_KEY || !Array.isArray(candidates) || candidates.length === 0) {
        return null;
    }

    const candidateSummary = candidates.map(c => ({
        id: c._id ? c._id.toString() : c.id.toString(),
        name: c.name,
        protein: c.protein,
        calories: c.calories,
        mealType: c.mealType,
        seasons: c.seasons || ["all"],
        tags: c.tags || ["high_protein"]
    }));

    const prompt = `You are a certified sports nutritionist and chef.
User Context:
- Current Indian Season: ${currentSeason}
- Time of Day: ${timeBucket}
- Fitness Goal: ${userContext.goal || "General Fitness"}
- Diet Preference: ${userContext.dietType || "Veg"}
- Remaining Protein Target Today: ${remainingProtein}g
- Remaining Calorie Target Today: ${remainingCalories} kcal

Candidate Recipes:
${JSON.stringify(candidateSummary, null, 2)}

Task:
Pick and order the BEST 5 recipes from the candidate list for the user's current meal.
For each selected recipe, write a short, friendly, one-line reason (STRICTLY MAXIMUM 15 WORDS) explaining why it fits right now (mentioning seasonal feel, protein, or digestion). Example: "Warm, 28g protein, comforting for this post-monsoon evening."

STRICT JSON format:
[
  {
    "id": "<must match an id from Candidate Recipes>",
    "reason": "One-line reason under 15 words"
  }
]
Rules:
1. ONLY return IDs that exist in the Candidate Recipes list above.
2. Return up to 5 objects.
3. Output ONLY valid JSON, without markdown formatting or other text.`;

    try {
        const raw = await generateWithFallback(prompt, 20000);
        const parsed = parseGeminiJson(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.every(p => p && typeof p.id === "string" && typeof p.reason === "string");
            if (valid) {
                return parsed;
            }
        }
        return null;
    } catch (err) {
        console.warn("⚠️ Gemini meal recommendation ranking skipped:", err.message);
        return null;
    }
}

module.exports = {
    generateWithFallback,
    parseGeminiJson,
    generateDynamicNutritionInsight,
    chatWithAiCoach,
    optimizeWorkoutPlanWithGemini,
    rankAndReasonMealRecommendations
};