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

// Uses the model configured in server/.env.
const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

const MAX_QUESTIONS = 10;

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
   ROLE-SPECIFIC TECHNICAL SKILLS
========================================================= */

const SKILLS_BY_ROLE = {
    "software-developer": [
        "Java",
        "Python",
        "JavaScript",
        "C++",
        "C#",
        "TypeScript",
    ],

    "data-analyst": [
        "SQL",
        "Python",
        "Excel",
        "Power BI",
        "Tableau",
        "R",
    ],

    cybersecurity: [
        "Python",
        "Linux",
        "Networking",
        "SQL",
        "Bash / Shell Scripting",
        "PowerShell",
    ],

    "cloud-devops": [
        "Linux",
        "AWS",
        "Azure",
        "Docker",
        "Kubernetes",
        "Terraform",
        "Python",
        "Bash / Shell Scripting",
    ],

    "ui-ux": [
        "Figma",
        "UI Design",
        "UX Design",
        "User Research",
        "Prototyping",
        "HTML/CSS",
        "Design Systems",
    ],
};

/* =========================================================
   VALIDATE INTERVIEW MODE
========================================================= */

const normalizeInterviewMode = (mode) => {
    return mode === "hr" ? "hr" : "technical";
};

/* =========================================================
   GET VALID TECHNICAL SKILL
========================================================= */

const getTechnicalSkill = (role, skill) => {
    const roleSkills = SKILLS_BY_ROLE[role];

    if (
        Array.isArray(roleSkills) &&
        roleSkills.includes(skill)
    ) {
        return skill;
    }

    if (Array.isArray(roleSkills) && roleSkills.length > 0) {
        return roleSkills[0];
    }

    return "General Technical Skills";
};

/* =========================================================
   SAFE JSON PARSER
========================================================= */

const parseAIJson = (text) => {
    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }

    const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Invalid Gemini JSON:", text);

        throw new Error(
            "Gemini returned an invalid JSON response."
        );
    }
};

/* =========================================================
   NORMALIZE SCORE
========================================================= */

const normalizeScore = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round(number)));
};

/* =========================================================
   SAFE TEXT AND ARRAY HELPERS
========================================================= */

const safeText = (value) =>
    typeof value === "string" ? value : "";

const safeArray = (value) =>
    Array.isArray(value)
        ? value.filter((item) => typeof item === "string")
        : [];

/* =========================================================
   GENERATE CONTENT WITH GEMINI

   IMPORTANT:
   - Uses GEMINI_MODEL from .env.
   - Does not repeatedly retry quota-exceeded errors.
   - Retries only selected temporary service/network errors.
========================================================= */

const generateWithGemini = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error(
            "GEMINI_API_KEY is missing. Check server/.env."
        );
    }

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(
                `Gemini model: ${GEMINI_MODEL} | Attempt: ${attempt}/${MAX_RETRIES}`
            );

            const response = await gemini.models.generateContent({
                model: GEMINI_MODEL,
                contents: prompt,
            });

            const text = response.text;

            if (!text || !text.trim()) {
                throw new Error(
                    "Gemini returned an empty response."
                );
            }

            return text;
        } catch (error) {
            const status =
                Number(error?.status || error?.code) || 0;

            const message = error?.message || "";
            const lowerMessage = message.toLowerCase();

            console.error("Gemini request failed:", {
                model: GEMINI_MODEL,
                attempt,
                status,
                message,
            });

            // Quota errors should not be retried repeatedly.
            if (
                status === 429 ||
                /resource_exhausted|quota exceeded|rate limit/i.test(
                    message
                )
            ) {
                throw error;
            }

            const isTemporaryError =
                [500, 502, 503, 504].includes(status) ||
                lowerMessage.includes("headers timeout") ||
                lowerMessage.includes("fetch failed") ||
                lowerMessage.includes("temporarily unavailable") ||
                lowerMessage.includes("overloaded") ||
                lowerMessage.includes("timed out") ||
                lowerMessage.includes("econnreset");

            if (!isTemporaryError || attempt === MAX_RETRIES) {
                throw error;
            }

            const delay = 1000 * Math.pow(2, attempt - 1);

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
   FIRST QUESTION BY INTERVIEW MODE
   The first question does not require an AI API call.
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
            "Tell me about yourself and your technical background.",
        type: "technical-intro",
        focus: "Technical Introduction",
        difficulty: "easy",
    };
};

/* =========================================================
   BUILD PREVIOUS ANSWER HISTORY
========================================================= */

const buildHistory = (previousAnswers, mode) => {
    if (!Array.isArray(previousAnswers)) {
        return "No previous interview history.";
    }

    return previousAnswers
        .slice(-10)
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
    roleName,
    technicalSkill,
    question,
    questionType,
    answer,
    previousContext,
}) => {
    if (mode === "hr") {
        return `
You are an experienced HR interviewer assessing a candidate
preparing for entry-level placement interviews.

Target role:
${roleName}

Interview mode:
HR Interview

Question type:
${questionType || "behavioral"}

Interview question:
${question}

Candidate's actual answer:
${answer}

Previous interview context:
${previousContext}

EVALUATION OBJECTIVE

Evaluate only what the candidate actually said.
Do not invent experiences or assume facts that were not stated.
Do not evaluate technical knowledge unless the question
specifically asks for a technical explanation.

Assess:
1. Communication: clarity and understandable expression.
2. Relevance: how directly the answer addresses the question.
3. Answer structure: organization and logical flow.
4. Confidence: how clearly and decisively the answer is expressed.
5. Completeness: whether the response sufficiently answers the question.

For behavioral questions, consider whether the candidate
explains the situation, their own actions, and the outcome
when those details are relevant.

Do not penalize a candidate merely for not using the STAR
method by name. Evaluate the actual answer.

Do not infer real-world confidence, personality, honesty,
or emotional state from text alone. Assess only observable
communication in the supplied answer.

Score every criterion from 0 to 100.
Give an overall score reflecting the quality of the answer.

Provide:
- concise, constructive feedback
- specific strengths
- specific improvements
- a short explanation of what the answer demonstrates

OUTPUT RULES

Return only valid JSON, without markdown or code fences.

Use exactly this structure:
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
}
`;
    }

    return `
You are an expert technical interviewer conducting a realistic
technical placement interview.

Target role:
${roleName}

Selected technical skill:
${technicalSkill}

Question type:
${questionType || "technical"}

Interview question:
${question}

Candidate's actual answer:
${answer}

Previous interview context:
${previousContext}

EVALUATION OBJECTIVE

Evaluate only the candidate's actual answer.
Do not generate the next question.
Do not automatically award high scores.
Do not penalize the candidate for omitting unrelated technologies.

Assess:
1. Communication
2. Relevance
3. Technical accuracy
4. Completeness
5. Structure

Evaluate according to the selected role, skill, and question.
For coding or SQL questions, consider correctness, logic,
approach, and explanation when applicable.
For tool or platform questions, evaluate relevant practical
understanding rather than unrelated programming knowledge.
For project questions, evaluate the candidate's demonstrated
understanding instead of expecting a memorized answer.

Score every criterion from 0 to 100.
Give an overall score reflecting the actual answer.

Provide:
- concise, constructive feedback
- specific strengths
- specific improvements
- a short explanation of what the answer demonstrates

OUTPUT RULES

Return only valid JSON, without markdown or code fences.

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
  "understanding": ""
}
`;
};

/* =========================================================
   NEXT QUESTION PROMPT
========================================================= */

const buildNextQuestionPrompt = ({
    mode,
    roleName,
    technicalSkill,
    questionNumber,
    currentQuestion,
    currentAnswer,
    history,
}) => {
    if (mode === "hr") {
        return `
You are conducting a realistic HR placement interview
for a final-year student applying for an entry-level role.

Target role:
${roleName}

Interview mode:
HR Interview

Question number to generate:
${questionNumber}

Previous question:
${currentQuestion}

Candidate's latest answer:
${currentAnswer}

Previous interview history:
${history}

YOUR TASK

Generate exactly ONE next HR interview question.

The question should follow naturally from the candidate's
latest answer whenever possible.

Explore appropriate HR and placement topics, including:
- introduction and career goals
- motivation for the role
- strengths and areas for improvement
- teamwork and collaboration
- handling disagreements
- time management and prioritization
- adapting to change
- learning from mistakes
- problem-solving at work or college
- handling pressure or deadlines
- leadership and responsibility
- communication
- project contributions and personal learning
- ethical judgment and workplace situations
- why the candidate wants this role or company

ADAPTIVE FOLLOW-UP

If the candidate describes an experience, ask a relevant
follow-up about their actions, reasoning, or outcome.

If an answer is vague, ask a clear follow-up for details.

If the answer is thoughtful and specific, explore the
reasoning, lessons learned, or practical outcome.

Avoid asking the same question or substantially repeating
a previous question.

Do not invent facts about the candidate.
Do not assume they have work experience.
College, academic projects, internships, and team activities
are valid contexts for entry-level candidates.

Keep the questions suitable for a realistic fresher interview.
Do not turn this into a technical quiz.
A project-related HR question may ask about teamwork,
responsibility, challenges, or learning, but not detailed
technical testing.

Possible types:
hr, behavioral, situational, follow-up, motivation, teamwork,
communication, project-experience.

Difficulty must be easy, medium, or hard.

Return only valid JSON without markdown or code fences:
{
  "question": "",
  "type": "",
  "focus": "",
  "difficulty": ""
}
`;
    }

    return `
You are conducting a realistic adaptive technical placement
interview for an entry-level candidate.

Target role:
${roleName}

Selected technical skill:
${technicalSkill}

Question number to generate:
${questionNumber}

Previous question:
${currentQuestion}

Candidate's latest answer:
${currentAnswer}

Previous interview history:
${history}

YOUR TASK

Generate exactly ONE personalized technical question.

The question must be relevant to both the selected role
and the selected technical skill.

Use the candidate's latest answer to determine the next
topic and appropriate difficulty.

Assess concepts, practical application, problem-solving,
coding, SQL, debugging, design decisions, or project knowledge
only when relevant to the selected skill.

Examples of relevant directions:
- SQL: filtering, joins, aggregation, subqueries, CTEs,
  window functions, and query reasoning.
- Python: fundamentals, functions, data manipulation,
  data cleaning, debugging, and problem-solving.
- Excel: formulas, lookups, PivotTables, cleaning, and analysis.
- Power BI: data modelling, DAX, measures, KPIs, and dashboards.
- Software development: language fundamentals, data structures,
  algorithms, debugging, and implementation.
- Cybersecurity: networking, Linux, security principles,
  threat analysis, and incident scenarios.
- Cloud/DevOps: cloud services, Linux, deployment, containers,
  automation, and troubleshooting.
- UI/UX: user research, wireframes, usability, prototypes,
  design systems, and design decisions.

Use only the areas appropriate for the selected skill.
Do not introduce unrelated technologies just to increase difficulty.

ADAPTIVE DIFFICULTY

Strong answer: gradually explore deeper concepts or practical
implementation.

Average answer: maintain a similar level or approach the
concept from another angle.

Weak answer: ask a simpler clarification or test the foundation.

Use the previous evaluation history as supporting context.
The candidate's actual answer should remain the main influence.

Avoid repeating previous questions or asking substantially
the same question again.

Keep questions suitable for entry-level placement interviews.
Generate one natural question, not a list.

Possible types:
technical, project, follow-up, problem-solving, scenario,
coding, query, debugging.

Difficulty must be easy, medium, or hard.

Return only valid JSON without markdown or code fences:
{
  "question": "",
  "type": "",
  "focus": "",
  "difficulty": ""
}
`;
};

/* =========================================================
   POST /EVALUATE
   EVALUATE ONE ANSWER
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
            role,
            skill,
            interviewMode,
            question,
            questionType,
            answer,
            previousAnswers = [],
        } = req.body;

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

        const roleName =
            ROLE_NAMES[role] ||
            role ||
            "Technology Professional";

        const technicalSkill =
            getTechnicalSkill(role, skill);

        const previousContext = buildHistory(
            previousAnswers,
            mode
        );

        const prompt = buildEvaluationPrompt({
            mode,
            roleName,
            technicalSkill,
            question: question.trim(),
            questionType,
            answer: answer.trim(),
            previousContext,
        });

        const rawText = await generateWithGemini(prompt);
        const result = parseAIJson(rawText);

        const scores = [
            "overall",
            "communication",
            "relevance",
            "completeness",
        ];

        scores.forEach((key) => {
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

            result.confidence = normalizeScore(
                result.confidence
            );

            // Preserve compatibility with the frontend.
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
        console.error("Interview evaluation error:", {
            model: GEMINI_MODEL,
            status: error?.status,
            code: error?.code,
            message: error?.message,
        });

        const status =
            Number(error?.status || error?.code) || 500;

        const isQuotaError =
            status === 429 ||
            /RESOURCE_EXHAUSTED|quota exceeded|rate limit/i.test(
                error?.message || ""
            );

        if (isQuotaError) {
            return res.status(429).json({
                message:
                    "The interview AI has reached its current usage limit. Please try again later.",
            });
        }

        const statusCode =
            [502, 503, 504].includes(status) ? status : 500;

        return res.status(statusCode).json({
            message: "Unable to evaluate the interview answer.",
            error: error.message || "Unknown Gemini error.",
        });
    }
});

/* =========================================================
   POST /NEXT-QUESTION
   GENERATE FIRST OR NEXT QUESTION
========================================================= */

router.post("/next-question", async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message:
                    "Gemini API key is missing. Check server/.env.",
            });
        }

        const {
            role,
            skill,
            interviewMode,
            previousAnswers = [],
            currentQuestion = null,
            currentAnswer = null,
            questionNumber = 1,
        } = req.body;

        const mode = normalizeInterviewMode(interviewMode);

        const roleName =
            ROLE_NAMES[role] ||
            role ||
            "Technology Professional";

        const technicalSkill =
            getTechnicalSkill(role, skill);

        const number = Number(questionNumber);

        if (
            !Number.isInteger(number) ||
            number < 1 ||
            number > MAX_QUESTIONS
        ) {
            return res.status(400).json({
                message:
                    `Question number must be between 1 and ${MAX_QUESTIONS}.`,
            });
        }

        // The first question is predefined and uses no AI request.
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

        const history = buildHistory(
            previousAnswers,
            mode
        );

        const nextQuestionNumber = number + 1;

        const prompt = buildNextQuestionPrompt({
            mode,
            roleName,
            technicalSkill,
            questionNumber: nextQuestionNumber,
            currentQuestion,
            currentAnswer,
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
        console.error("Next-question generation error:", {
            model: GEMINI_MODEL,
            status: error?.status,
            code: error?.code,
            message: error?.message,
        });

        const status =
            Number(error?.status || error?.code) || 500;

        const isQuotaError =
            status === 429 ||
            /RESOURCE_EXHAUSTED|quota exceeded|rate limit/i.test(
                error?.message || ""
            );

        if (isQuotaError) {
            return res.status(429).json({
                message:
                    "The interview AI has reached its current usage limit. Please try again later.",
            });
        }

        const statusCode =
            [502, 503, 504].includes(status) ? status : 500;

        return res.status(statusCode).json({
            message:
                "Unable to generate the next interview question.",
            error: error.message || "Unknown Gemini error.",
        });
    }
});

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;
