const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.6-flash";

exports.generateNutritionInsight = async (targetKcal, eatenKcal, targetProt, eatenProt) => {
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const remainingKcal = targetKcal - eatenKcal;
        const remainingProt = targetProt - eatenProt;

        const prompt = `You are a fitness coach. User stats today: ${eatenKcal}/${targetKcal} kcal consumed, ${eatenProt}/${targetProt}g protein consumed. 
                        Remaining: ${remainingKcal} kcal and ${remainingProt}g protein.
                        Give a single, highly energetic 1-sentence tip (max 15 words) on what they should eat next. Do not use markdown or emojis.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("❌ Gemini nutrition insight error:", error.message);
        return "You are on track! Keep hitting your daily protein target.";
    }
};

exports.askAiCoach = async (userQuery, userContext) => {
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `You are FitSync AI, a friendly expert nutrition and fitness coach.
                        User Context: ${userContext?.eatenKcal || 0}/${userContext?.targetKcal || 2000} kcal eaten today, ${userContext?.eatenProt || 0}/${userContext?.targetProt || 100}g protein.
                        User Question: "${userQuery}".
                        Provide a concise, practical answer in simple language under 60 words.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("❌ Gemini askAiCoach error:", error.message);
        return "Sorry, I am having trouble connecting right now. Please try again in a moment.";
    }
};