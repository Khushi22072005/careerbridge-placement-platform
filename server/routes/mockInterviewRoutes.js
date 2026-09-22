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

    if (
        Array.isArray(roleSkills) &&
        roleSkills.length > 0
    ) {
        return roleSkills[0];
    }

    return "General Technical Skills";
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

/* =========================================================
   GENERATE CONTENT WITH GEMINI
   WITH RETRY FOR TEMPORARY FAILURES
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
                `🤖 Sending request to Gemini... (Attempt ${attempt}/${MAX_RETRIES})`
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

        } catch (error) {

            const status =
                error?.status ||
                error?.code ||
                error?.cause?.code;

            const message =
                error?.message ||
                "";

            const isTemporaryError =
                status === 503 ||
                status === 429 ||
                status === 500 ||
                status === 502 ||
                status === 504 ||
                message.includes(
                    "Headers Timeout"
                ) ||
                message.includes(
                    "fetch failed"
                ) ||
                message.includes(
                    "UNAVAILABLE"
                ) ||
                message.includes(
                    "overloaded"
                );

            console.error(
                `❌ Gemini attempt ${attempt} failed.`
            );

            console.error(
                "Error:",
                message
            );

            console.error(
                "Status:",
                status
            );

            /* -----------------------------------------
               DO NOT RETRY PERMANENT ERRORS
            ----------------------------------------- */

            if (
                !isTemporaryError ||
                attempt === MAX_RETRIES
            ) {
                throw error;
            }

            /* -----------------------------------------
               EXPONENTIAL BACKOFF
               Attempt 1 → 1 second
               Attempt 2 → 2 seconds
               Attempt 3 → 4 seconds
            ----------------------------------------- */

            const delay =
                1000 * Math.pow(
                    2,
                    attempt - 1
                );

            console.log(
                `⏳ Gemini temporarily unavailable. Retrying in ${delay / 1000} second(s)...`
            );

            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        delay
                    )
            );
        }
    }

    throw new Error(
        "Gemini request failed after multiple attempts."
    );
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
                skill,
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

            const technicalSkill =
                getTechnicalSkill(
                    role,
                    skill
                );

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
                              ) => {
                                  const evaluation =
                                      item.evaluation;

                                  return `
Previous Answer ${index + 1}:

Question:
${
                                      item.question ||
                                      ""
                                  }

Answer:
${
                                      item.answer ||
                                      ""
                                  }

Evaluation:
${
                                      evaluation
                                          ? JSON.stringify(
                                                evaluation
                                            )
                                          : "Not available"
                                  }
`;
                              }
                          )
                          .join("\n")
                    : "No previous answers.";

            /* -----------------------------------------
               EVALUATION PROMPT
            ----------------------------------------- */

            const prompt = `
You are an expert technical interviewer conducting
a realistic placement interview.

Candidate target role:
${roleName}

Candidate's selected technical skill / technology:
${technicalSkill}

Question type:
${questionType || "general"}

Interview question:
${question}

Candidate answer:
${answer}

Previous interview context:
${previousContext}

=========================================================
EVALUATION TASK
=========================================================

Evaluate ONLY the candidate's actual answer.

Do not generate the next interview question.

Do not automatically give a high score.

Do not give a low score simply because the answer is short.

Judge the actual content of the candidate's answer.

The selected technical skill/technology is an important
focus of this interview.

Evaluate the candidate's answer according to the
selected role and selected technical skill.

Do not evaluate the candidate using unrelated technologies.

If the selected skill is a programming language or
query language, consider the candidate's:

- understanding
- logic
- syntax
- problem-solving ability
- practical usage

when relevant to the question.

If the selected skill is a tool, platform, design technology,
or technical area, evaluate the candidate according to
that specific technology or area.

=========================================================
EVALUATION CRITERIA
=========================================================

Evaluate:

1. Communication
2. Relevance
3. Technical accuracy
4. Completeness
5. Structure

Give each score from 0 to 100.

Calculate a meaningful overall score based on the
quality of the candidate's actual answer.

Also provide:

- concise feedback
- strengths
- improvements
- understanding

The feedback must explain what was correct,
what was missing, and how the candidate can improve.

=========================================================
IMPORTANT
=========================================================

Evaluate the answer that was actually given.

Do not assume knowledge that the candidate did not
demonstrate.

Do not penalize the candidate for not mentioning
unrelated technologies.

For coding or SQL questions, evaluate correctness,
logic, approach, and explanation when applicable.

For project questions, evaluate the candidate's actual
understanding of the project rather than expecting
a predefined answer.

=========================================================
OUTPUT
=========================================================

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
    "understanding": ""
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

            const statusCode =
    error?.status === 429 ||
    error?.status === 503 ||
    error?.status === 502 ||
    error?.status === 504
        ? error.status
        : 500;

return res.status(statusCode).json({
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
               const statusCode =
    error?.status === 429 ||
    error?.status === 503 ||
    error?.status === 502 ||
    error?.status === 504
        ? error.status
        : 500;

return res.status(statusCode).json({
    message:
        "Unable to evaluate the interview answer.",

    error:
        error.message ||
        "Unknown Gemini error.",
});
            }

            /* -----------------------------------------
               REQUEST DATA
            ----------------------------------------- */

            const {
                role,
                skill,
                previousAnswers = [],
                currentQuestion = null,
                currentAnswer = null,
                questionNumber = 1,
            } = req.body;

            const roleName =
                ROLE_NAMES[role] ||
                role ||
                "Technology Professional";

            const technicalSkill =
                getTechnicalSkill(
                    role,
                    skill
                );

            /* =================================================
               FIRST QUESTION
            ================================================= */

            if (
                !currentQuestion ||
                !currentAnswer
            ) {
                console.log(
                    "🟢 Returning first interview question..."
                );

                return res.json({
                    question:
                        "Tell me about yourself.",

                    type:
                        "intro",

                    focus:
                        "Introduction",

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
                          .slice(-10)
                          .map(
                              (
                                  item,
                                  index
                              ) => {
                                  const evaluation =
                                      item.evaluation;

                                  return `
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

Previous Evaluation:
${
                                      evaluation
                                          ? `
Overall Score:
${
                                              evaluation.overall ??
                                              "N/A"
                                          }

Technical Accuracy:
${
                                              evaluation.technicalAccuracy ??
                                              "N/A"
                                          }

Feedback:
${
                                              evaluation.feedback ||
                                              "N/A"
                                          }

Understanding:
${
                                              evaluation.understanding ||
                                              "N/A"
                                          }
`
                                          : "Not available"
                                  }
`;
                              }
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

Selected technical skill / technology:
${technicalSkill}

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

The question must remain relevant to BOTH:

1. The candidate's selected role
2. The candidate's selected technical skill / technology

The candidate's previous answer should determine
the direction, depth, and difficulty of the next question.

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
25-QUESTION INTERVIEW
=========================================================

The complete interview contains a maximum of 25 questions.

Question 1 is always:

"Tell me about yourself."

You are generating questions only for Question 2 onward.

Across the interview, assess the candidate using an
appropriate mixture of:

- fundamental concepts
- technical concepts
- practical application
- coding questions
- SQL/query questions where applicable
- algorithm and problem-solving questions where applicable
- debugging questions where applicable
- scenario-based questions
- project-related questions
- advanced technical questions

Do not force a question type that is irrelevant to the
selected role or selected technical skill.

=========================================================
ADAPTIVE DIFFICULTY
=========================================================

If the candidate demonstrates strong understanding:

- gradually increase difficulty
- ask deeper technical questions
- ask practical implementation questions
- ask coding, query, or algorithm questions when relevant
- ask optimization or reasoning questions when relevant

If the candidate demonstrates average understanding:

- maintain a similar difficulty
- test the same concept from another angle
- gradually move toward practical application

If the candidate demonstrates weak understanding:

- reduce the difficulty
- ask a simpler clarification question
- test the underlying fundamental concept again

Do not suddenly move from a basic question to an
extremely advanced question without evidence that
the candidate is ready.

=========================================================
CODING, QUERY AND PROBLEM-SOLVING
=========================================================

When the selected technical skill supports programming,
SQL, scripting, algorithms, or problem solving, include
practical questions when appropriate.

For SQL, questions may include:

- SQL queries
- JOINs
- aggregation
- subqueries
- CTEs
- window functions
- query optimization
- scenario-based SQL problems

For programming languages, questions may include:

- coding problems
- debugging
- algorithms
- data structures
- time complexity
- space complexity
- optimization

For Python/Data Analytics, questions may include:

- Python coding
- Pandas
- NumPy
- data cleaning
- data manipulation
- analytical problem solving

For Power BI, questions may include:

- data modelling
- DAX
- calculated columns
- measures
- dashboards
- KPIs
- visualization decisions

For Cloud/DevOps, questions may include:

- Linux
- cloud concepts
- Docker
- Kubernetes
- Terraform
- scripting
- deployment
- troubleshooting

For UI/UX, questions may include:

- Figma
- design systems
- wireframes
- prototypes
- user research
- usability
- design decisions
- developer handoff

Only ask questions relevant to the selected technology.

=========================================================
ANSWER-DRIVEN FOLLOW-UP
=========================================================

Carefully analyze the latest candidate answer.

Identify:

- what the candidate knows
- what the candidate claims to know
- technologies mentioned
- concepts mentioned
- areas of confidence
- areas of uncertainty
- mistakes
- missing information
- practical experience
- projects mentioned
- specific interests

If the candidate demonstrates strong interest or
experience in a particular area of the selected
technical skill, explore that area more deeply.

Example:

Candidate answer:
"I am very interested in SQL queries and I have
practiced joins and subqueries."

Possible next question:
"Write an SQL query to find the second-highest
salary from an employee table."

If the candidate answers correctly, the next question
may increase in difficulty.

For example:
"Write a query to find the highest-paid employee
in each department."

If the candidate struggles, return to a simpler
conceptual or guided question.

The next question must feel like a natural continuation
of the interview conversation.

=========================================================
IMPORTANT RULES
=========================================================

RULE 1:
DO NOT ask a random unrelated question.

RULE 2:
DO NOT use a predefined fixed sequence.

RULE 3:
DO NOT repeat the previous question.

Also avoid asking substantially the same question
that has already been asked earlier in the interview.

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
subqueries, optimization, CTEs, or window functions.

RULE 8:
If the candidate mentions Python,
you may ask about Pandas, NumPy, functions,
data cleaning, analysis, algorithms, or coding.

RULE 9:
If the candidate mentions Power BI,
you may ask about dashboards, KPIs,
data modelling, DAX, visualization, or reporting.

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

RULE 14:
Do not ask about a technology that is unrelated
to the selected technical skill.

RULE 15:
Use the candidate's previous interview history to
avoid repeating topics and questions unnecessarily.

The interview should feel like one continuous conversation,
not a collection of unrelated questions.

RULE 16:
If the latest answer contains a specific claim,
experience, project, technology, or concept,
prefer exploring that information before introducing
a completely new topic.

RULE 17:
Use the previous evaluation information when available
to understand whether the candidate's previous answer
was strong, average, or weak.

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
coding
query
debugging

Choose the type that is appropriate for the selected
role, selected technical skill, and candidate's latest answer.

=========================================================
FINAL QUESTION GENERATION RULE
=========================================================

Before generating the question, internally determine:

1. What did the candidate say?
2. What technical concept or experience did they reveal?
3. Was their understanding strong, average, or weak?
4. What should be explored next?
5. What difficulty is appropriate?
6. Has this topic or question already been covered?
7. Is the question relevant to the selected role?
8. Is the question relevant to the selected technical skill?

Then generate ONE natural interview question.

Do not output this reasoning.

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