
const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

/* =========================================================
   GEMINI CLIENT AND MODEL
========================================================= */

if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing from server/.env");
}

const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

const MAX_QUESTIONS = 10;

/* =========================================================
   HELPERS
========================================================= */

const normalizeInterviewMode = (mode) =>
    mode === "hr" ? "hr" : "technical";

const safeText = (value) =>
    typeof value === "string" ? value : "";

const safeArray = (value) =>
    Array.isArray(value)
        ? value.filter((item) => typeof item === "string")
        : [];

const normalizeScore = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round(number)));
};

const parseAIJson = (text) => {
    if (!text || !text.trim()) {
        throw new Error("Gemini returned an empty response.");
    }

    const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Invalid Gemini JSON response:", text);
        throw new Error("Gemini returned an invalid JSON response.");
    }
};

const getErrorStatus = (error) => {
    const candidate = Number(
        error?.status || error?.statusCode || error?.code
    );

    return Number.isFinite(candidate) ? candidate : 0;
};

const isQuotaError = (error) => {
    const status = getErrorStatus(error);
    const message = error?.message || "";

    return (
        status === 429 ||
        /resource_exhausted|quota exceeded|rate limit/i.test(message)
    );
};

/* =========================================================
   GEMINI REQUEST
========================================================= */

const generateWithGemini = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) {
        const error = new Error(
            "GEMINI_API_KEY is missing. Check server/.env."
        );

        error.status = 500;
        throw error;
    }

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
        try {
            console.log(
                `Gemini model: ${GEMINI_MODEL} | Attempt: ${attempt}/${maxRetries}`
            );

            const response = await gemini.models.generateContent({
                model: GEMINI_MODEL,
                contents: prompt,
            });

            const responseText = response?.text;

            if (
                typeof responseText !== "string" ||
                !responseText.trim()
            ) {
                throw new Error("Gemini returned an empty response.");
            }

            return responseText;
        } catch (error) {
            const status = getErrorStatus(error);
            const message =
                error?.message || "Unknown Gemini error.";
            const lowerMessage = message.toLowerCase();

            console.error("Gemini request failed:", {
                model: GEMINI_MODEL,
                attempt,
                status,
                message,
            });

            if (isQuotaError(error)) {
                throw error;
            }

            const temporary =
                [500, 502, 503, 504].includes(status) ||
                lowerMessage.includes("headers timeout") ||
                lowerMessage.includes("fetch failed") ||
                lowerMessage.includes("temporarily unavailable") ||
                lowerMessage.includes("overloaded") ||
                lowerMessage.includes("timed out") ||
                lowerMessage.includes("econnreset") ||
                lowerMessage.includes("socket hang up");

            if (!temporary || attempt === maxRetries) {
                throw error;
            }

            const delay = 1000 * 2 ** (attempt - 1);

            console.log(
                `Retrying Gemini in ${delay / 1000} second(s)...`
            );

            await new Promise((resolve) =>
                setTimeout(resolve, delay)
            );
        }
    }

    throw new Error(
        "Gemini request failed after multiple attempts."
    );
};

/* =========================================================
   FIRST QUESTION
   No Gemini call is required for the first question.
========================================================= */

const getFirstQuestion = (mode) => {
    if (mode === "hr") {
        return {
            question: "Tell me about yourself.",
            type: "hr",
            focus: "Introduction",
            difficulty: "easy",
        };
    }

    return {
        question:
            "Tell me about yourself and the technical skills you have developed.",
        type: "technical-intro",
        focus: "Technical Introduction",
        difficulty: "easy",
    };
};

/* =========================================================
   PREVIOUS ANSWER HISTORY
========================================================= */

const buildHistory = (previousAnswers, mode) => {
    if (
        !Array.isArray(previousAnswers) ||
        previousAnswers.length === 0
    ) {
        return "No previous interview history.";
    }

    return previousAnswers
        .slice(-MAX_QUESTIONS)
        .map((item, index) => {
            const evaluation = item?.evaluation || {};

            return `
Question ${index + 1}:
${safeText(item?.question)}

Candidate answer:
${safeText(item?.answer)}

Evaluation:
Overall: ${evaluation.overall ?? "N/A"}
Communication: ${evaluation.communication ?? "N/A"}
Relevance: ${evaluation.relevance ?? "N/A"}

${
    mode === "technical"
        ? `Technical accuracy: ${evaluation.technicalAccuracy ?? "N/A"}`
        : `Answer structure: ${
              evaluation.answerStructure ??
              evaluation.structure ??
              "N/A"
          }`
}

Feedback: ${safeText(evaluation.feedback)}
Understanding: ${safeText(evaluation.understanding)}
`;
        })
        .join("\n");
};

/* =========================================================
   EVALUATION PROMPT
========================================================= */

const buildEvaluationPrompt = ({
    mode,
    question,
    questionType,
    answer,
    previousContext,
}) => {
    if (mode === "hr") {
        return `
You are an experienced HR interviewer assessing a candidate
preparing for entry-level placement interviews.

Interview mode: HR Interview
Question type: ${questionType || "behavioral"}

Interview question:
${question}

Candidate's actual answer:
${answer}

Previous interview context:
${previousContext}

Evaluate only what the candidate actually said.
Do not invent experiences or assume facts not stated.

Assess:
1. Communication
2. Relevance
3. Answer structure
4. Clarity of expression
5. Completeness

For behavioral answers, consider the situation, candidate's
actions, and outcome when relevant. Do not require the candidate
to name the STAR method.

Do not infer personality, honesty, or emotional state from text.
Evaluate only the supplied answer.

Score every criterion from 0 to 100.
Provide concise feedback, specific strengths, improvements,
and a short explanation of what the answer demonstrates.

Return only valid JSON without markdown or code fences:
{
  "overall": 0,
  "communication": 0,
  "relevance": 0,
  "answerStructure": 0,
  "confidence": 0,
  "completeness": 0,
  "feedback": "",
  "strengths": [],
  "improvements": [],
  "understanding": ""
}`;
    }

    return `
You are an expert technical interviewer conducting an adaptive
technical placement interview for an entry-level candidate.

Interview mode: Technical Interview
Question type: ${questionType || "technical"}

Interview question:
${question}

Candidate's actual answer:
${answer}

Previous interview context:
${previousContext}

Evaluate only the candidate's actual answer.
Do not generate the next question.
Do not automatically award high scores.

There is no selected role or selected skill.
Determine the relevant technical topic from the question,
the candidate's answer, and the available interview history.

Assess:
1. Communication
2. Relevance
3. Technical accuracy
4. Completeness
5. Structure

For coding or SQL questions, evaluate correctness, logic,
approach, and explanation when applicable.

For tool or platform questions, evaluate relevant practical
understanding.

For project questions, evaluate the candidate's demonstrated
understanding instead of expecting memorized answers.

Do not penalize the candidate for omitting unrelated technologies.

Score every criterion from 0 to 100.
Provide concise feedback, specific strengths, improvements,
and a short explanation of what the answer demonstrates.

Return only valid JSON without markdown or code fences:
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
  "understanding": ""
}`;
};

/* =========================================================
   NEXT QUESTION PROMPT
   Questions adapt to the candidate's previous answers.
========================================================= */

const buildNextQuestionPrompt = ({
    mode,
    questionNumber,
    currentQuestion,
    currentAnswer,
    history,
}) => {
    if (mode === "hr") {
        return `
You are conducting a realistic HR placement interview
for a final-year student applying for an entry-level role.

Question number to generate: ${questionNumber}

Previous question:
${currentQuestion}

Candidate's latest answer:
${currentAnswer}

Previous interview history:
${history}

Generate exactly ONE next HR interview question.

Follow naturally from the candidate's latest answer whenever
possible. Explore suitable topics such as career goals,
motivation, strengths, areas to improve, teamwork, disagreements,
time management, learning from mistakes, problem-solving,
pressure, leadership, communication, project contribution,
ethical judgment, and role motivation.

If the candidate describes an experience, ask a relevant
follow-up about their actions, reasoning, or outcome.

If the answer is vague, ask for clarification.

Avoid repeating previous questions. Do not assume work experience.
College, academic projects, internships, and team activities
are valid contexts for entry-level candidates.

Keep the interview suitable for a fresher and do not turn it
into a technical quiz.

Type may be hr, behavioral, situational, follow-up, motivation,
teamwork, communication, or project-experience.

Difficulty must be easy, medium, or hard.

Return only valid JSON without markdown:
{
  "question": "",
  "type": "",
  "focus": "",
  "difficulty": ""
}`;
    }

    return `
You are conducting a realistic adaptive technical placement
interview for an entry-level candidate.

Question number to generate: ${questionNumber}

Previous question:
${currentQuestion}

Candidate's latest answer:
${currentAnswer}

Previous interview history:
${history}

Generate exactly ONE personalized technical interview question.

There is no selected role or selected skill. Infer the appropriate
topic from the candidate's answers, mentioned skills, projects,
and previous questions.

The candidate's latest answer must strongly influence the
next question. Follow up on what the candidate actually says.

Examples:
- If the candidate mentions SQL, ask a relevant SQL question.
- If the candidate mentions Python, explore Python or its use.
- If the candidate mentions Java, explore Java.
- If the candidate mentions Excel or Power BI, follow those topics.
- If the candidate mentions a project, ask about its implementation,
  technical choices, challenges, or problem-solving.
- If the candidate mentions another technology, follow that topic.

These are examples, not assumptions. Use the candidate's actual
answer and do not introduce unrelated technologies just to
increase difficulty.

ADAPTIVE DIFFICULTY

Strong answer: gradually explore a deeper concept or practical
implementation.

Average answer: maintain a similar level or explore the concept
from another angle.

Weak answer: ask a simpler clarification or check the foundation.

Use previous evaluation history as supporting context, but let
the actual answer remain the main influence.

Avoid repeating previous questions or asking substantially
the same question again.

Keep questions suitable for entry-level placement interviews.
Generate one natural question, not a list.

Type may be technical, project, follow-up, problem-solving,
scenario, coding, query, or debugging.

Difficulty must be easy, medium, or hard.

Return only valid JSON without markdown:
{
  "question": "",
  "type": "",
  "focus": "",
  "difficulty": ""
}`;
};

/* =========================================================
   ERROR RESPONSE HELPER
========================================================= */

const sendGeminiError = (res, error, operation) => {
    console.error(`${operation} error:`, {
        model: GEMINI_MODEL,
        status: getErrorStatus(error),
        code: error?.code,
        message: error?.message,
    });

    if (isQuotaError(error)) {
        return res.status(429).json({
            message:
                "The interview AI has reached its current usage limit. Please try again later.",
            error: error?.message || "Quota exceeded.",
        });
    }

    const upstreamStatus = getErrorStatus(error);

    const statusCode = [502, 503, 504].includes(upstreamStatus)
        ? upstreamStatus
        : 500;

    return res.status(statusCode).json({
        message:
            operation === "Interview evaluation"
                ? "Unable to evaluate the interview answer."
                : "Unable to generate the next interview question.",
        error: error?.message || "Unknown Gemini error.",
        model: GEMINI_MODEL,
    });
};

/* =========================================================
   POST /EVALUATE
   Evaluate one interview answer.
========================================================= */

router.post("/evaluate", async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message:
                    "Gemini API key is missing. Check server/.env.",
            });
        }

        const {
            interviewMode,
            question,
            questionType,
            answer,
            previousAnswers = [],
        } = req.body || {};

        if (
            typeof question !== "string" ||
            !question.trim()
        ) {
            return res.status(400).json({
                message: "Interview question is required.",
            });
        }

        if (
            typeof answer !== "string" ||
            !answer.trim()
        ) {
            return res.status(400).json({
                message: "Candidate answer is required.",
            });
        }

        const mode = normalizeInterviewMode(interviewMode);

        const previousContext = buildHistory(
            previousAnswers,
            mode
        );

        const prompt = buildEvaluationPrompt({
            mode,
            question: question.trim(),
            questionType,
            answer: answer.trim(),
            previousContext,
        });

        const rawText = await generateWithGemini(prompt);
        const result = parseAIJson(rawText);

        [
            "overall",
            "communication",
            "relevance",
            "completeness",
        ].forEach((key) => {
            result[key] = normalizeScore(result[key]);
        });

        result.feedback = safeText(result.feedback);
        result.understanding = safeText(result.understanding);
        result.strengths = safeArray(result.strengths);
        result.improvements = safeArray(result.improvements);

        if (mode === "hr") {
            result.answerStructure = normalizeScore(
                result.answerStructure ?? result.structure
            );

            result.confidence = normalizeScore(result.confidence);

            // Compatibility with the existing frontend.
            result.technicalAccuracy = result.answerStructure;
        } else {
            result.technicalAccuracy = normalizeScore(
                result.technicalAccuracy
            );

            result.structure = normalizeScore(result.structure);
        }

        result.interviewMode = mode;

        console.log(
            `Interview evaluation completed: ${mode}, score ${result.overall}, model ${GEMINI_MODEL}`
        );

        return res.json(result);
    } catch (error) {
        return sendGeminiError(
            res,
            error,
            "Interview evaluation"
        );
    }
});

/* =========================================================
   POST /NEXT-QUESTION
   Return the first question or generate the next question.
========================================================= */

router.post("/next-question", async (req, res) => {
    try {
        const {
            interviewMode,
            previousAnswers = [],
            currentQuestion = null,
            currentAnswer = null,
            questionNumber = 1,
        } = req.body || {};

        const mode = normalizeInterviewMode(interviewMode);
        const number = Number(questionNumber);

        if (
            !Number.isInteger(number) ||
            number < 1 ||
            number > MAX_QUESTIONS
        ) {
            return res.status(400).json({
                message: `Question number must be between 1 and ${MAX_QUESTIONS}.`,
            });
        }

        // First question is predefined and does not call Gemini.
        if (!currentQuestion || !currentAnswer) {
            return res.json({
                ...getFirstQuestion(mode),
                questionNumber: 1,
                totalQuestions: MAX_QUESTIONS,
                interviewMode: mode,
            });
        }

        // Do not generate a question beyond question 10.
        if (number >= MAX_QUESTIONS) {
            return res.status(400).json({
                message:
                    "The interview has reached its 10-question limit.",
                finished: true,
                totalQuestions: MAX_QUESTIONS,
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message:
                    "Gemini API key is missing. Check server/.env.",
            });
        }

        const history = buildHistory(
            previousAnswers,
            mode
        );

        const nextQuestionNumber = number + 1;

        const prompt = buildNextQuestionPrompt({
            mode,
            questionNumber: nextQuestionNumber,
            currentQuestion: safeText(currentQuestion),
            currentAnswer: safeText(currentAnswer),
            history,
        });

        const rawText = await generateWithGemini(prompt);
        const result = parseAIJson(rawText);

        if (
            typeof result.question !== "string" ||
            !result.question.trim()
        ) {
            throw new Error(
                "Gemini did not return a valid interview question."
            );
        }

        const validDifficulties = [
            "easy",
            "medium",
            "hard",
        ];

        const difficulty = String(
            result.difficulty || "medium"
        ).toLowerCase();

        const response = {
            question: result.question.trim(),
            type:
                safeText(result.type) ||
                (mode === "hr" ? "behavioral" : "technical"),
            focus:
                safeText(result.focus) ||
                (mode === "hr"
                    ? "HR Interview"
                    : "Technical Skills"),
            difficulty: validDifficulties.includes(difficulty)
                ? difficulty
                : "medium",
            questionNumber: nextQuestionNumber,
            totalQuestions: MAX_QUESTIONS,
            interviewMode: mode,
        };

        console.log(
            `Generated ${mode} question ${nextQuestionNumber}/${MAX_QUESTIONS} using ${GEMINI_MODEL}`
        );

        return res.json(response);
    } catch (error) {
        return sendGeminiError(
            res,
            error,
            "Next-question generation"
        );
    }
});

module.exports = router;

