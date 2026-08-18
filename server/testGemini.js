require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);
console.log("Gemini model:", process.env.GEMINI_MODEL);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
    try {
        const response = await ai.models.generateContent({
            model:
                process.env.GEMINI_MODEL ||
                "gemini-3.1-flash-lite",

            contents:
                "Say hello to CareerBridge in one sentence.",
        });

        console.log("\nGemini response:");
        console.log(response.text);
    } catch (error) {
        console.error("\nGemini ERROR:");
        console.error(error);
    }
}

testGemini();