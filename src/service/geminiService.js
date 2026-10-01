const { GoogleGenerativeAI } = require('@google/generative-ai');

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-3.5-flash", "gemini-flash-latest"];

function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    return new GoogleGenerativeAI(apiKey);
}

async function generateWithFallback(prompt) {
    const genAI = getGenAI();
    let lastError = null;

    for (const modelName of FALLBACK_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (err) {
            console.warn(`⚠️ Model ${modelName} failed (${err.status || err.message}), trying fallback...`);
            lastError = err;
        }
    }

    throw lastError || new Error("All Gemini models failed to respond.");
}

exports.generateNutritionInsight = async (targetKcal, eatenKcal, targetProt, eatenProt) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "You are on track! Keep hitting your daily protein target.";
        }
        const remainingKcal = targetKcal - eatenKcal;
        const remainingProt = targetProt - eatenProt;

        const prompt = `You are a fitness coach. User stats today: ${eatenKcal}/${targetKcal} kcal consumed, ${eatenProt}/${targetProt}g protein consumed. 
                        Remaining: ${remainingKcal} kcal and ${remainingProt}g protein.
                        Give a single, highly energetic 1-sentence tip (max 15 words) on what they should eat next. Do not use markdown or emojis.`;

        return await generateWithFallback(prompt);
    } catch (error) {
        console.error("❌ Gemini nutrition insight error:", error.message);
        return "You are on track! Keep hitting your daily protein target.";
    }
};

exports.askAiCoach = async (userQuery, userContext) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "AI Coach requires GEMINI_API_KEY to be set in your server .env file.";
        }
        const prompt = `You are FitSync AI, a friendly expert nutrition and fitness coach.
                        User Context: ${userContext?.eatenKcal || 0}/${userContext?.targetKcal || 2000} kcal eaten today, ${userContext?.eatenProt || 0}/${userContext?.targetProt || 100}g protein.
                        User Question: "${userQuery}".
                        Provide a concise, practical answer in simple language under 60 words.`;

        return await generateWithFallback(prompt);
    } catch (error) {
        console.error("❌ Gemini askAiCoach error:", error.message);
        return "Sorry, I am having trouble connecting right now. Please try again in a moment.";
    }
};