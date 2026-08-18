const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
                "Could not parse AI JSON:",
                text
            );

            throw new Error(
                "AI returned an invalid response."
            );
        }
    }
};

/* =========================================================
   EVALUATE ANSWER
========================================================= */

router.post(
    "/evaluate",
    async (req, res) => {
        try {
            const {
                role,
                question,
                questionType,
                answer,
                previousAnswers = [],
            } = req.body;

            if (!question || !answer) {
                return res.status(400).json({
                    message:
                        "Question and answer are required.",
                });
            }

            const roleName =
                ROLE_NAMES[role] ||
                role ||
                "Technology Professional";

            const previousContext =
                previousAnswers
                    .slice(-5)
                    .map(
                        (item, index) =>
                            `Previous Answer ${index + 1}:
Question: ${item.question}
Answer: ${item.answer}`
                    )
                    .join("\n\n");

            const prompt = `
You are an expert technical interviewer conducting a mock interview.

Candidate target role:
${roleName}

Question type:
${questionType || "general"}

Interview question:
${question}

Candidate answer:
${answer}

Previous interview context:
${previousContext || "No previous answers."}

Evaluate the candidate's ACTUAL answer.

Do not give a fixed score.
Do not assume the answer is good.
Do not score based only on answer length.
Judge the content of the answer.

Evaluate:

1. Communication
2. Relevance
3. Technical accuracy
4. Completeness
5. Structure

Score each from 0 to 100.

Overall should be a meaningful weighted score based on the above.

Also provide:
- concise feedback
- strengths
- improvements
- whether the candidate demonstrated good understanding
- a recommended next interview question
- next question type
- next difficulty

The next question should depend on the candidate's actual answer.

If the candidate mentioned a technology, project, skill, experience,
or weakness, you may use that information for the next question.

Do not repeat the exact same question.

Return ONLY valid JSON.

JSON format:

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

            const response =
                await openai.responses.create({
                    model:
                        process.env.OPENAI_MODEL ||
                        "gpt-5.6",

                    instructions:
                        "You are a professional interviewer. Return only valid JSON. Never use markdown code fences.",

                    input: prompt,
                });

            const result =
                parseAIJson(
                    response.output_text
                );

            return res.json(result);
        } catch (error) {
            console.error(
                "Mock interview evaluation error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to evaluate the interview answer.",
                error:
                    process.env.NODE_ENV ===
                    "development"
                        ? error.message
                        : undefined,
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

            const history =
                previousAnswers
                    .slice(-6)
                    .map(
                        (item, index) =>
                            `Question ${index + 1}: ${item.question}
Answer: ${item.answer}`
                    )
                    .join("\n\n");

            let prompt;

            if (
                !currentQuestion ||
                !currentAnswer
            ) {
                prompt = `
You are an expert interviewer.

Create the first mock interview question for a candidate applying for:

${roleName}

Question number:
${questionNumber}

The question should be appropriate for a final-year
B.Tech IT student preparing for placements.

Return ONLY valid JSON:

{
  "question": "",
  "type": "",
  "focus": "",
  "difficulty": ""
}
`;
            } else {
                prompt = `
You are an expert adaptive interviewer.

Candidate role:
${roleName}

Previous question:
${currentQuestion}

Candidate's latest answer:
${currentAnswer}

Previous interview history:
${history || "None"}

Generate the next interview question.

The question MUST:
- depend on the candidate's answer when appropriate
- not simply repeat the previous question
- be relevant to the target role
- feel like a real interview
- adapt difficulty according to the candidate's demonstrated knowledge

Possible types:
intro
technical
problem-solving
behavioral
project
scenario
follow-up

Return ONLY valid JSON:

{
  "question": "",
  "type": "",
  "focus": "",
  "difficulty": ""
}
`;
            }

            const response =
                await openai.responses.create({
                    model:
                        process.env.OPENAI_MODEL ||
                        "gpt-5.6",

                    instructions:
                        "You are an adaptive professional interviewer. Return only valid JSON.",

                    input: prompt,
                });

            const result =
                parseAIJson(
                    response.output_text
                );

            return res.json(result);
        } catch (error) {
            console.error(
                "Next question generation error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to generate next interview question.",
                error:
                    process.env.NODE_ENV ===
                    "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

module.exports = router;