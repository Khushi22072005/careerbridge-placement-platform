const express = require("express");
const router = express.Router();

// =====================================================
// CAREERBRIDGE AI CAREER COMPANION
// =====================================================

const SYSTEM_INSTRUCTION = `
You are CareerBridge AI Career Companion, a helpful career
guidance assistant for college students and fresh graduates.

Your responsibilities:
- Explain career paths and required skills in simple language.
- Help students build step-by-step learning plans.
- Suggest practical projects for their skill level.
- Guide users on resumes, ATS preparation, placements, and interviews.
- Help students prepare for Software Developer, Data Analyst,
  Cybersecurity, Cloud/DevOps, and UI/UX Designer roles.
- Give realistic advice without guaranteeing jobs or placements.
- Ask clarifying questions when necessary.
- Keep answers structured, encouraging, and beginner-friendly.
- Do not claim to access student profiles, resumes, or databases
  unless that information has actually been provided.
- Use headings and bullet points when helpful.
`;

// =====================================================
// GEMINI CLIENT
// Uses a separate API key for Career Companion
// =====================================================

let aiClient = null;

async function getAIClient() {
    const apiKey = process.env.GEMINI_CHAT_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GEMINI_CHAT_API_KEY is missing from server/.env"
        );
    }

    if (!aiClient) {
        const { GoogleGenAI } = await import("@google/genai");

        aiClient = new GoogleGenAI({
            apiKey: apiKey
        });
    }

    return aiClient;
}

// =====================================================
// POST /api/career-companion/chat
// =====================================================

router.post("/chat", async (req, res) => {
    try {
        // ---------------------------------------------
        // 1. Validate incoming messages
        // ---------------------------------------------

        const { messages } = req.body || {};

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Please provide at least one chat message."
            });
        }

        if (messages.length > 20) {
            return res.status(400).json({
                error: "Please send no more than 20 messages at a time."
            });
        }

        const validMessages = messages.every((message) => {
            return (
                message &&
                ["user", "assistant", "model"].includes(message.role) &&
                typeof message.content === "string" &&
                message.content.trim().length > 0 &&
                message.content.length <= 6000
            );
        });

        if (!validMessages) {
            return res.status(400).json({
                error: "One or more chat messages are invalid."
            });
        }

        // The latest message must be from the user.
        const lastMessage = messages[messages.length - 1];

        if (lastMessage.role !== "user") {
            return res.status(400).json({
                error: "The latest message must be from the user."
            });
        }

        // ---------------------------------------------
        // 2. Convert messages to Gemini format
        // ---------------------------------------------

        const contents = messages.map((message) => ({
            role: message.role === "user" ? "user" : "model",
            parts: [
                {
                    text: message.content.trim()
                }
            ]
        }));

        // ---------------------------------------------
        // 3. Get the AI client
        // ---------------------------------------------

        const ai = await getAIClient();

        const model =
            process.env.GEMINI_CHAT_MODEL ||
            "gemini-3.5-flash-lite";

        console.log(
            "Career Companion request received.",
            "Model:",
            model
        );

        // ---------------------------------------------
        // 4. Generate AI response
        // ---------------------------------------------

        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
                maxOutputTokens: 1200
            }
        });

        const reply = response.text;

        // ---------------------------------------------
        // 5. Validate AI response
        // ---------------------------------------------

        if (!reply || !reply.trim()) {
            console.error(
                "Career Companion returned an empty response."
            );

            return res.status(502).json({
                error: "The AI returned an empty response. Please try again."
            });
        }

        // ---------------------------------------------
        // 6. Send response to frontend
        // ---------------------------------------------

        return res.status(200).json({
            reply: reply.trim()
        });

    } catch (error) {
        // ---------------------------------------------
        // 7. Detailed backend error logging
        // ---------------------------------------------

        const errorMessage = String(error?.message || "");
        const errorStatus = Number(error?.status || error?.code);

        console.error("Career Companion error details:", {
            message: errorMessage,
            status: error?.status,
            code: error?.code,
            model: process.env.GEMINI_CHAT_MODEL || "gemini-3.5-flash-lite",
            chatKeyConfigured: Boolean(
                process.env.GEMINI_CHAT_API_KEY
            )
        });

        // ---------------------------------------------
        // 8. Missing API key
        // ---------------------------------------------

        if (
            errorMessage.includes(
                "GEMINI_CHAT_API_KEY is missing"
            )
        ) {
            return res.status(500).json({
                error: "Career Companion is not configured. Please check the server .env file."
            });
        }

        // ---------------------------------------------
        // 9. Quota and rate-limit errors
        // ---------------------------------------------

        if (
            errorStatus === 429 ||
            /RESOURCE_EXHAUSTED|quota exceeded|rate limit/i.test(
                errorMessage
            )
        ) {
            return res.status(429).json({
                error: "Career Companion has temporarily reached its AI usage limit. Please try again later. You can continue using your other CareerBridge features."
            });
        }

        // ---------------------------------------------
        // 10. Invalid API key
        // ---------------------------------------------

        if (
            errorStatus === 401 ||
            errorStatus === 403 ||
            /API key not valid|invalid API key|permission denied|unauthorized/i.test(
                errorMessage
            )
        ) {
            return res.status(502).json({
                error: "Career Companion could not authenticate with the AI service. Check the chatbot API key and project permissions."
            });
        }

        // ---------------------------------------------
        // 11. Invalid model
        // ---------------------------------------------

        if (
            /NOT_FOUND|model not found|not supported for generateContent/i.test(
                errorMessage
            )
        ) {
            return res.status(502).json({
                error: "The configured Gemini model is unavailable. Check the model name and API support."
            });
        }

        // ---------------------------------------------
        // 12. Other errors
        // ---------------------------------------------

        return res.status(502).json({
            error: "Career Companion could not generate a response. Check the backend terminal for details."
        });
    }
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;