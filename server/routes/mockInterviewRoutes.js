const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

/* =========================================================
   GEMINI CLIENT
========================================================= */

if (!process.env.GEMINI_API_KEY) {
    console.error(
        "❌ GEMINI_API_KEY is missing from server/.env"
    );
}

const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

/* =========================================================
   GEMINI MODEL
========================================================= */

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-2.5-flash";

/* =========================================================
   ROLE INFORMATION
========================================================= */

const ROLE_NAMES = {
    "software-developer": "Software Developer",
    "data-analyst": "Data Analyst",
    cybersecurity: "Cybersecurity",
    "cloud-devops": "Cloud / DevOps",
    "ui-ux": "UI/UX Designer",
};

/* =========================================================
   SAFE JSON PARSER
========================================================= */

const parseAIJson = (text) => {
    if (!text) {
        throw new Error(
            "Gemini returned an empty response."
        );
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        const cleaned = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        try {
            return JSON.parse(cleaned);
        } catch (secondError) {
            console.error(
                "❌ Could not parse Gemini JSON."
            );

            console.error(
                "Raw Gemini response:"
            );

            console.error(text);

            throw new Error(
                "Gemini returned an invalid JSON response."
            );
        }
    }
};

/* =========================================================
   NORMALIZE SCORE
========================================================= */

const normalizeScore = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(100, Math.round(number))
    );
};

/* =========================================================
   GENERATE CONTENT WITH GEMINI
========================================================= */

const generateWithGemini = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error(
            "GEMINI_API_KEY is missing. Check server/.env."
        );
    }

    console.log(
        "🤖 Sending request to Gemini..."
    );

    console.log(
        "Gemini model:",
        GEMINI_MODEL
    );

    const response =
        await gemini.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });

    const text =
        response.text;

    if (!text) {
        throw new Error(
            "Gemini returned an empty response."
        );
    }

    console.log(
        "✅ Gemini response received."
    );

    console.log(
        "Gemini output:",
        text
    );

    return text;
};

/* =========================================================
   EVALUATE INTERVIEW ANSWER
========================================================= */

router.post(
    "/evaluate",
    async (req, res) => {
        try {
            console.log(
                "\n========================================"
            );

            console.log(
                "🎯 MOCK INTERVIEW EVALUATION"
            );

            console.log(
                "========================================"
            );

            /* -----------------------------------------
               CHECK GEMINI API KEY
            ----------------------------------------- */

            if (!process.env.GEMINI_API_KEY) {
                console.error(
                    "❌ GEMINI_API_KEY is missing."
                );

                return res.status(500).json({
                    message:
                        "Gemini API key is missing. Check server/.env.",
                });
            }

            /* -----------------------------------------
               REQUEST DATA
            ----------------------------------------- */

            const {
                role,
                question,
                questionType,
                answer,
                previousAnswers = [],
            } = req.body;

            if (!question) {
                return res.status(400).json({
                    message:
                        "Interview question is required.",
                });
            }

            if (!answer) {
                return res.status(400).json({
                    message:
                        "Candidate answer is required.",
                });
            }

            const roleName =
                ROLE_NAMES[role] ||
                role ||
                "Technology Professional";

            /* -----------------------------------------
               PREVIOUS ANSWERS
            ----------------------------------------- */

            const previousContext =
                Array.isArray(previousAnswers)
                    ? previousAnswers
                          .slice(-5)
                          .map(
                              (
                                  item,
                                  index
                              ) =>
                                  `Previous Answer ${
                                      index + 1
                                  }:
Question: ${
                                      item.question ||
                                      ""
                                  }
Answer: ${
                                      item.answer ||
                                      ""
                                  }`
                          )
                          .join("\n\n")
                    : "No previous answers.";

            /* -----------------------------------------
               GEMINI PROMPT
            ----------------------------------------- */

            const prompt = `
You are an expert technical interviewer conducting
a realistic placement interview.

Candidate target role:
${roleName}

Question type:
${questionType || "general"}

Interview question:
${question}

Candidate answer:
${answer}

Previous interview context:
${previousContext}

Evaluate ONLY the candidate's actual answer.

Do not automatically give a high score.
Do not give a low score simply because the answer is short.
Judge the actual content.

Evaluate these areas:

1. Communication
2. Relevance
3. Technical accuracy
4. Completeness
5. Structure

Give each score from 0 to 100.

Calculate the overall score based on these areas.

Also provide:

- concise feedback
- strengths
- improvements
- understanding
- recommended next interview question
- next question type
- next difficulty

The next question should adapt to the candidate's
actual answer.

If the candidate mentioned a technology, project,
skill, experience, or weakness, you may use that
information for the next question.

Do not repeat the exact same question.

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.

Use exactly this structure:

{
    "overall": 0,
    "communication": 0,
    "relevance": 0,
    "technicalAccuracy": 0,
    "completeness": 0,
    "structure": 0,
    "feedback": "",
    "strengths": [],
    "improvements": [],
    "understanding": "",
    "nextQuestion": "",
    "nextQuestionType": "",
    "nextDifficulty": ""
}
`;

            /* -----------------------------------------
               GEMINI REQUEST
            ----------------------------------------- */

            const rawText =
                await generateWithGemini(
                    prompt
                );

            /* -----------------------------------------
               PARSE JSON
            ----------------------------------------- */

            const result =
                parseAIJson(
                    rawText
                );

            /* -----------------------------------------
               NORMALIZE SCORES
            ----------------------------------------- */

            result.overall =
                normalizeScore(
                    result.overall
                );

            result.communication =
                normalizeScore(
                    result.communication
                );

            result.relevance =
                normalizeScore(
                    result.relevance
                );

            result.technicalAccuracy =
                normalizeScore(
                    result.technicalAccuracy
                );

            result.completeness =
                normalizeScore(
                    result.completeness
                );

            result.structure =
                normalizeScore(
                    result.structure
                );

            /* -----------------------------------------
               SAFE ARRAYS
            ----------------------------------------- */

            if (
                !Array.isArray(
                    result.strengths
                )
            ) {
                result.strengths = [];
            }

            if (
                !Array.isArray(
                    result.improvements
                )
            ) {
                result.improvements = [];
            }

            /* -----------------------------------------
               SAFE TEXT VALUES
            ----------------------------------------- */

            result.feedback =
                result.feedback || "";

            result.understanding =
                result.understanding || "";

            result.nextQuestion =
                result.nextQuestion || "";

            result.nextQuestionType =
                result.nextQuestionType ||
                "technical";

            result.nextDifficulty =
                result.nextDifficulty ||
                "medium";

            /* -----------------------------------------
               SEND RESULT
            ----------------------------------------- */

            console.log(
                "✅ Evaluation completed successfully."
            );

            console.log(
                "Overall Score:",
                result.overall
            );

            console.log(
                "========================================\n"
            );

            return res.json(
                result
            );
        } catch (error) {
            console.error(
                "\n========================================"
            );

            console.error(
                "❌ MOCK INTERVIEW EVALUATION ERROR"
            );

            console.error(
                "========================================"
            );

            console.error(
                error
            );

            console.error(
                "Error message:",
                error.message
            );

            if (error.status) {
                console.error(
                    "HTTP status:",
                    error.status
                );
            }

            if (error.code) {
                console.error(
                    "Error code:",
                    error.code
                );
            }

            console.error(
                "========================================\n"
            );

            return res.status(500).json({
                message:
                    "Unable to evaluate the interview answer.",

                error:
                    error.message ||
                    "Unknown Gemini error.",
            });
        }
    }
);

/* =========================================================
   GENERATE FIRST / NEXT QUESTION
========================================================= */

router.post(
    "/next-question",
    async (req, res) => {
        try {
            console.log(
                "\n========================================"
            );

            console.log(
                "🎯 GENERATING NEXT INTERVIEW QUESTION"
            );

            console.log(
                "========================================"
            );

            /* -----------------------------------------
               CHECK API KEY
            ----------------------------------------- */

            if (!process.env.GEMINI_API_KEY) {
                return res.status(500).json({
                    message:
                        "Gemini API key is missing. Check server/.env.",
                });
            }

            /* -----------------------------------------
               REQUEST DATA
            ----------------------------------------- */

            const {
                role,
                previousAnswers = [],
                currentQuestion = null,
                currentAnswer = null,
                questionNumber = 1,
            } = req.body;

            const roleName =
                ROLE_NAMES[role] ||
                role ||
                "Technology Professional";

            /* -----------------------------------------
               HISTORY
            ----------------------------------------- */

            const history =
                Array.isArray(
                    previousAnswers
                )
                    ? previousAnswers
                          .slice(-6)
                          .map(
                              (
                                  item,
                                  index
                              ) =>
                                  `Question ${
                                      index + 1
                                  }:
${
                                      item.question ||
                                      ""
                                  }

Answer:
${
                                      item.answer ||
                                      ""
                                  }`
                          )
                          .join(
                              "\n\n"
                          )
                    : "None";

            let prompt;

            /* =================================================
               FIRST QUESTION
            ================================================= */

            if (
                !currentQuestion ||
                !currentAnswer
            ) {
                prompt = `
You are an expert placement interviewer.

Create the first mock interview question for:

Candidate role:
${roleName}

Question number:
${questionNumber}

The candidate is a final-year B.Tech IT student
preparing for placements.

The question should be realistic and appropriate
for the candidate's target role.

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.

Use exactly:

{
    "question": "",
    "type": "",
    "focus": "",
    "difficulty": ""
}
`;
            }

            /* =================================================
               ADAPTIVE NEXT QUESTION
            ================================================= */

            else {
                prompt = `
You are an expert adaptive placement interviewer.

Candidate target role:
${roleName}

Previous question:
${currentQuestion}

Candidate's latest answer:
${currentAnswer}

Previous interview history:
${history}

Generate the next interview question.

The question MUST:

- depend on the candidate's answer when appropriate
- not repeat the previous question
- be relevant to the target role
- feel like a real placement interview
- adapt to the candidate's demonstrated knowledge
- gradually increase or decrease difficulty appropriately

Possible question types:

intro
technical
problem-solving
behavioral
project
scenario
follow-up

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.

Use exactly:

{
    "question": "",
    "type": "",
    "focus": "",
    "difficulty": ""
}
`;
            }

            /* -----------------------------------------
               GEMINI REQUEST
            ----------------------------------------- */

            const rawText =
                await generateWithGemini(
                    prompt
                );

            /* -----------------------------------------
               PARSE RESPONSE
            ----------------------------------------- */

            const result =
                parseAIJson(
                    rawText
                );

            /* -----------------------------------------
               VALIDATE QUESTION
            ----------------------------------------- */

            if (
                !result.question
            ) {
                throw new Error(
                    "Gemini did not return a question."
                );
            }

            if (
                !result.type
            ) {
                result.type =
                    "technical";
            }

            if (
                !result.focus
            ) {
                result.focus =
                    "Technical Knowledge";
            }

            if (
                !result.difficulty
            ) {
                result.difficulty =
                    "medium";
            }

            console.log(
                "✅ Next question generated."
            );

            console.log(
                "Question:",
                result.question
            );

            return res.json(
                result
            );
        } catch (error) {
            console.error(
                "\n========================================"
            );

            console.error(
                "❌ NEXT QUESTION ERROR"
            );

            console.error(
                "========================================"
            );

            console.error(
                error
            );

            console.error(
                "Error message:",
                error.message
            );

            if (error.status) {
                console.error(
                    "HTTP status:",
                    error.status
                );
            }

            if (error.code) {
                console.error(
                    "Error code:",
                    error.code
                );
            }

            console.error(
                "========================================\n"
            );

            return res.status(500).json({
                message:
                    "Unable to generate next interview question.",

                error:
                    error.message ||
                    "Unknown Gemini error.",
            });
        }
    }
);

module.exports = router;