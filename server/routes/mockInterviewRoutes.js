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
    process.env.GEMINI_MODEL || "gemini-3.6-flash";

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

Question:
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
                          .join("\n\n")
                    : "No previous answers.";

            /* -----------------------------------------
               EVALUATION PROMPT
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

Evaluate:

1. Communication
2. Relevance
3. Technical accuracy
4. Completeness
5. Structure

Give each score from 0 to 100.

Calculate a meaningful overall score.

Also provide:

- concise feedback
- strengths
- improvements
- understanding

IMPORTANT:

The nextQuestion field must be based on the
candidate's ACTUAL answer.

Identify something meaningful from the answer such as:

- technology
- tool
- project
- concept
- skill
- experience
- decision
- problem
- weakness
- claim

Then generate a natural follow-up question.

Do NOT generate a random unrelated question.

Do NOT repeat the current question.

If the candidate mentioned a project,
ask something deeper about that project.

If the candidate mentioned a technology,
ask about that technology.

If the candidate gave a weak answer,
ask a simpler clarification question.

If the candidate gave a strong answer,
gradually increase difficulty.

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
               SAFE TEXT
            ----------------------------------------- */

            result.feedback =
                result.feedback || "";

            result.understanding =
                result.understanding || "";

            result.nextQuestion =
                result.nextQuestion || "";

            result.nextQuestionType =
                result.nextQuestionType ||
                "follow-up";

            result.nextDifficulty =
                result.nextDifficulty ||
                "medium";

            /* -----------------------------------------
               RESPONSE
            ----------------------------------------- */

            console.log(
                "✅ Evaluation completed successfully."
            );

            console.log(
                "Overall Score:",
                result.overall
            );

            console.log(
                "Personalized Next Question:",
                result.nextQuestion
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
   PERSONALIZED FIRST / NEXT QUESTION
========================================================= */

router.post(
    "/next-question",
    async (req, res) => {
        try {
            console.log(
                "\n========================================"
            );

            console.log(
                "🎯 PERSONALIZED NEXT INTERVIEW QUESTION"
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

            /* =================================================
               FIRST QUESTION
            ================================================= */

            if (
                !currentQuestion ||
                !currentAnswer
            ) {

                console.log(
                    "🟢 Generating first interview question..."
                );

                return res.json({
                    question:
                        `Tell me about yourself and why you are interested in becoming a ${roleName}.`,

                    type:
                        "intro",

                    focus:
                        "Introduction and Career Interest",

                    difficulty:
                        "easy",
                });
            }

            /* =================================================
               INTERVIEW HISTORY
            ================================================= */

            const history =
                Array.isArray(
                    previousAnswers
                )
                    ? previousAnswers
                          .slice(-5)
                          .map(
                              (
                                  item,
                                  index
                              ) =>
                                  `
Question ${index + 1}:
${
                                      item.question ||
                                      ""
                                  }

Candidate Answer:
${
                                      item.answer ||
                                      ""
                                  }
`
                          )
                          .join("\n")
                    : "No previous interview history.";

            /* =================================================
               PERSONALIZED PROMPT
            ================================================= */

            const prompt = `
You are conducting a REALISTIC adaptive placement
interview for a final-year B.Tech student.

Candidate role:
${roleName}

Question number:
${questionNumber}

Previous question:
${currentQuestion}

Candidate's latest answer:
${currentAnswer}

Previous interview history:
${history}

=========================================================
YOUR TASK
=========================================================

Generate ONLY ONE personalized next interview question.

The next question MUST primarily depend on the
candidate's latest answer.

Analyze the candidate's answer and identify
something meaningful.

For example:

- technology mentioned
- programming language
- tool
- project
- concept
- skill
- experience
- decision
- problem
- weakness
- claim
- answer that needs clarification

Then ask a natural follow-up question about it.

=========================================================
IMPORTANT RULES
=========================================================

RULE 1:
DO NOT ask a random unrelated question.

RULE 2:
DO NOT use a predefined fixed sequence.

RULE 3:
DO NOT repeat the previous question.

RULE 4:
The candidate's latest answer should determine
the direction of the next question.

RULE 5:
If the candidate mentions a PROJECT,
ask deeper questions about that project.

RULE 6:
If the candidate mentions a TECHNOLOGY,
ask about their understanding or practical use
of that technology.

RULE 7:
If the candidate mentions SQL,
you may ask about joins, queries, aggregation,
subqueries, optimization, etc.

RULE 8:
If the candidate mentions Python,
you may ask about Pandas, NumPy, functions,
data cleaning, analysis, etc.

RULE 9:
If the candidate mentions Power BI,
you may ask about dashboards, KPIs,
data modelling, DAX, visualization, etc.

RULE 10:
If the candidate gives a weak answer,
ask a simpler clarification/follow-up question.

RULE 11:
If the candidate gives a strong answer,
gradually increase the difficulty.

RULE 12:
Keep the interview realistic for placements.

RULE 13:
Do not jump randomly between unrelated topics.

=========================================================
EXAMPLES
=========================================================

Candidate answer:
"I used SQL and Power BI in my healthcare project."

Good next question:
"How did you use SQL to prepare the healthcare
data before creating your Power BI dashboard?"

---------------------------------------------------------

Candidate answer:
"I used Pandas to clean the dataset."

Good next question:
"Which Pandas operations did you use to handle
missing values and duplicate records?"

---------------------------------------------------------

Candidate answer:
"I created a healthcare accessibility map using QGIS."

Good next question:
"How did you use buffer analysis in your
healthcare accessibility project?"

---------------------------------------------------------

Candidate answer:
"I am comfortable with SQL JOINs."

Good next question:
"Can you explain a situation where you used a JOIN
to combine data from two tables?"

---------------------------------------------------------

Candidate answer:
"I used Power BI to create a dashboard."

Good next question:
"What KPIs did you include in your dashboard,
and how did you decide which KPIs were important?"

=========================================================
QUESTION TYPES
=========================================================

Possible types:

intro
technical
project
follow-up
problem-solving
behavioral
scenario

=========================================================
OUTPUT
=========================================================

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

            /* =================================================
               GEMINI REQUEST
            ================================================= */

            console.log(
                "🤖 Generating personalized question..."
            );

            const rawText =
                await generateWithGemini(
                    prompt
                );

            /* =================================================
               PARSE RESPONSE
            ================================================= */

            const result =
                parseAIJson(
                    rawText
                );

            /* =================================================
               VALIDATE
            ================================================= */

            if (
                !result.question
            ) {
                throw new Error(
                    "Gemini did not return a personalized question."
                );
            }

            result.type =
                result.type ||
                "follow-up";

            result.focus =
                result.focus ||
                "Candidate's Previous Answer";

            result.difficulty =
                result.difficulty ||
                "medium";

            /* =================================================
               RESPONSE
            ================================================= */

            console.log(
                "✅ Personalized question generated."
            );

            console.log(
                "Question:",
                result.question
            );

            console.log(
                "Type:",
                result.type
            );

            console.log(
                "Focus:",
                result.focus
            );

            console.log(
                "Difficulty:",
                result.difficulty
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
                "❌ PERSONALIZED NEXT QUESTION ERROR"
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

            console.error(
                "========================================\n"
            );

            return res.status(500).json({
                message:
                    "Unable to generate personalized interview question.",

                error:
                    error.message ||
                    "Unknown Gemini error.",
            });
        }
    }
);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;