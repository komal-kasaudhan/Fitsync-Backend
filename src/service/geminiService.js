// 📄 Path: src/service/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-3.5-flash", "gemini-flash-latest"];

function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Execute Gemini model call with model fallbacks and timeout
 */
async function generateWithFallback(prompt, timeoutMs = 60000) {
    const genAI = getGenAI();
    let lastError = null;

    for (const modelName of FALLBACK_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            
            // Promise race with timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Gemini timeout after ${timeoutMs}ms`)), timeoutMs)
            );

            const resultPromise = model.generateContent(prompt);
            const result = await Promise.race([resultPromise, timeoutPromise]);
            return result.response.text().trim();
        } catch (err) {
            console.warn(`⚠️ Model ${modelName} failed (${err.status || err.message}), trying fallback...`);
            lastError = err;
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

/**
 * Feature C: Dynamic AI nutrition insight
 * Returns { message: string, suggestedFoods: string[] }
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
    goal = "Maintain"
}) {
    // 1. Rule-based fallback template generator
    const getFallback = () => {
        const isVeg = !dietType.toLowerCase().includes("non");
        let foods = [];
        let msg = "";

        if (remainingProtein <= 5) {
            msg = `Great job! You've reached your protein goal today (${targetProtein}g). Focus on hydration and recovery.`;
            foods = ["Water with lemon", "Coconut water", "Herbal tea"];
        } else if (timeBucket === "morning") {
            foods = isVeg ? ["Paneer Bhurji", "High-Protein Oats", "Greek Yogurt"] : ["3 Boiled Eggs", "Masala Omelette", "Greek Yogurt"];
            msg = `You have ${remainingProtein}g of protein left. Kickstart your day with ${foods[0]} or ${foods[1]}!`;
        } else if (timeBucket === "afternoon") {
            foods = isVeg ? ["Soya Chunks Curry", "Dal Tadka & Rice", "Tofu Stir-Fry"] : ["Grilled Chicken Breast", "Egg Curry & Rice", "Tuna Salad"];
            msg = `${remainingProtein}g protein remaining today. Fuel your afternoon with a hearty serving of ${foods[0]}.`;
        } else if (timeBucket === "evening") {
            foods = isVeg ? ["Sprouted Moong Chaat", "Whey Protein Shake", "Roasted Makhana"] : ["Boiled Eggs", "Chicken Shawarma Salad", "Whey Shake"];
            msg = `Post-workout fuel: You need ${remainingProtein}g more protein. A quick ${foods[0]} will bridge the gap!`;
        } else {
            // Night
            foods = isVeg ? ["Cottage Cheese Sweet Bowl", "Warm Turmeric Milk", "Soya Granules"] : ["Casein / Whey Shake", "Boiled Egg Whites", "Greek Yogurt"];
            msg = `Wind down with ${remainingProtein}g protein remaining. A serving of ${foods[0]} supports overnight muscle recovery.`;
        }

        return {
            message: msg.slice(0, 160),
            suggestedFoods: foods
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
- Target: ${targetCalories} kcal, ${targetProtein}g protein
- Remaining Today: ${remainingProtein}g protein, ${remainingCalories} kcal, ${remainingCarbs}g carbs, ${remainingFat}g fat, ${remainingWater}L water.

Task:
Provide exactly ONE short, warm, highly actionable tip (STRICTLY MAXIMUM 25 WORDS).
State how much protein is left and suggest a specific healthy food matching their ${dietType} diet and the ${timeBucket} time of day.
Return your response in STRICT JSON format:
{
  "message": "Your short tip under 25 words mentioning the exact protein number and a specific food.",
  "suggestedFoods": ["Food 1", "Food 2", "Food 3"]
}
Output only valid JSON, without extra commentary or markdown.`;

    try {
        const raw = await generateWithFallback(prompt, 20000);
        const parsed = parseGeminiJson(raw);
        if (parsed && typeof parsed.message === "string" && Array.isArray(parsed.suggestedFoods)) {
            return {
                message: parsed.message.trim(),
                suggestedFoods: parsed.suggestedFoods.slice(0, 4)
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
 * Feature E: Optional Gemini workout plan optimizer
 */
async function optimizeWorkoutPlanWithGemini(candidateDays, userProfile) {
    if (!process.env.GEMINI_API_KEY) {
        return null;
    }

    const prompt = `You are a master strength coach.
User Context:
- Goal: ${userProfile.goal}
- Fitness Level: ${userProfile.level}
- Duration: ${userProfile.duration} mins
- Location: ${userProfile.location}

Here are the 7 days of training with candidate exercise IDs:
${JSON.stringify(candidateDays.map(d => ({
    dayIndex: d.dayIndex,
    focus: d.focus,
    isRestDay: d.isRestDay,
    candidateExerciseIds: d.exercises.map(e => e.exerciseId)
})))}

Task:
Return a JSON array of 7 objects. For each training day, choose and order the best 4-5 exercise IDs from candidateExerciseIds and include a 1-sentence motivational coachNote.
Strict JSON format:
[
  {
    "dayIndex": 0,
    "orderedExerciseIds": ["<id1>", "<id2>", ...],
    "coachNote": "Focus on controlled eccentrics on all compound lifts."
  },
  ...
]
Output ONLY valid JSON.`;

    try {
        const raw = await generateWithFallback(prompt, 25000);
        return parseGeminiJson(raw);
    } catch (err) {
        console.warn("⚠️ Gemini workout plan optimizer skipped:", err.message);
        return null;
    }
}

module.exports = {
    generateWithFallback,
    parseGeminiJson,
    generateDynamicNutritionInsight,
    chatWithAiCoach,
    optimizeWorkoutPlanWithGemini
};