const express = require("express");
const router = express.Router();

const pool = require("../src/config/db");

// =====================================================
// ROLE AND SKILL CONFIGURATION
// =====================================================

const roleConfig = {
    "software-developer": {
        title: "Software Developer",
        skills: [
            "Java",
            "Python",
            "JavaScript",
            "C++",
            "C#",
            "TypeScript",
        ],
    },

    "data-analyst": {
        title: "Data Analyst",
        skills: [
            "SQL",
            "Python",
            "Excel",
            "Power BI",
            "Tableau",
            "R",
            "Statistics",
        ],
    },

    "cybersecurity": {
        title: "Cybersecurity",
        skills: [
            "Python",
            "Linux",
            "Networking",
            "SQL",
            "Bash/Shell",
            "PowerShell",
        ],
    },

    "cloud-devops": {
        title: "Cloud / DevOps",
        skills: [
            "Linux",
            "AWS",
            "Azure",
            "Docker",
            "Kubernetes",
            "Terraform",
            "Python",
            "Bash/Shell",
        ],
    },

    "ui-ux": {
        title: "UI/UX Designer",
        skills: [
            "Figma",
            "UI Design",
            "UX Design",
            "User Research",
            "Prototyping",
            "HTML/CSS",
            "Design Systems",
        ],
    },
};

const validRoles = Object.keys(roleConfig);

const validOptions = ["A", "B", "C", "D"];

const validDifficulties = ["Easy", "Medium", "Difficult"];

// =====================================================
// HELPER: PERFORMANCE LEVEL
// =====================================================

function getPerformanceLevel(score) {
    if (score >= 80) {
        return "Strong";
    }

    if (score >= 60) {
        return "Intermediate";
    }

    return "Needs Improvement";
}

// =====================================================
// HELPER: ROADMAP LEVEL
// This is a practice-stage label based on the assessment
// score, not a prediction of placement or employability.
// =====================================================

function getRoadmapLevel(score) {
    if (score < 40) {
        return "Foundation";
    }

    if (score < 70) {
        return "Skill Building";
    }

    return "Placement Ready";
}

// =====================================================
// GET AVAILABLE ROLES AND SKILLS
//
// GET /api/technical-assessment/roles
// =====================================================

router.get("/roles", async (req, res) => {
    try {
        const roles = validRoles.map((roleId) => ({
            id: roleId,
            title: roleConfig[roleId].title,
            skills: roleConfig[roleId].skills,
        }));

        return res.status(200).json({
            roles,
        });
    } catch (error) {
        console.error("Roles Error:", error);

        return res.status(500).json({
            message: "Failed to load roles.",
        });
    }
});

// =====================================================
// START TECHNICAL ASSESSMENT
//
// GET /api/technical-assessment/questions/:email
//     ?role=data-analyst&skill=Python
//
// Example:
// /api/technical-assessment/questions/student@gmail.com
//     ?role=data-analyst&skill=Python
// =====================================================

router.get("/questions/:email", async (req, res) => {
    try {
        const email = String(req.params.email || "")
            .trim()
            .toLowerCase();

        const role = String(req.query.role || "").trim();
        const skill = String(req.query.skill || "").trim();

        // -------------------------------------------------
        // VALIDATE EMAIL
        // -------------------------------------------------

        if (!email) {
            return res.status(400).json({
                message: "Email is required.",
            });
        }

        // -------------------------------------------------
        // VALIDATE ROLE
        // -------------------------------------------------

        if (!role) {
            return res.status(400).json({
                message: "Career role is required.",
            });
        }

        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: "Unsupported career role.",
            });
        }

        // -------------------------------------------------
        // VALIDATE SKILL
        // -------------------------------------------------

        if (!skill) {
            return res.status(400).json({
                message: "Assessment skill is required.",
            });
        }

        if (!roleConfig[role].skills.includes(skill)) {
            return res.status(400).json({
                message: "Unsupported skill for the selected role.",
            });
        }

        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        const userResult = await pool.query(
            `
            SELECT
                id,
                fullname,
                email
            FROM users
            WHERE LOWER(email) = $1
            `,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const user = userResult.rows[0];

        // -------------------------------------------------
        // GET 20 QUESTIONS FOR THE SELECTED ROLE + SKILL
        //
        // technical_questions.role stores the role key,
        // e.g. "data-analyst".
        //
        // technical_questions.category stores the skill,
        // e.g. "Python".
        // -------------------------------------------------

        const questionsResult = await pool.query(
            `
            SELECT
                id,
                role,
                category,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                difficulty
            FROM technical_questions
            WHERE role = $1
              AND category = $2
            ORDER BY RANDOM()
            LIMIT 20
            `,
            [role, skill]
        );

        const questions = questionsResult.rows;

        if (questions.length !== 20) {
            return res.status(400).json({
                message:
                    `This skill has ${questions.length} questions available. Exactly 20 are required.`,
                role,
                roleTitle: roleConfig[role].title,
                skill,
                requiredQuestions: 20,
                availableQuestions: questions.length,
            });
        }

        // -------------------------------------------------
        // CREATE ASSESSMENT RECORD
        //
        // The assessment_skill column must exist in
        // technical_assessments.
        // -------------------------------------------------

        const assessmentResult = await pool.query(
            `
            INSERT INTO technical_assessments
            (
                user_id,
                role,
                assessment_skill,
                total_questions,
                correct_answers,
                score,
                completed
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                0,
                0,
                false
            )
            RETURNING id
            `,
            [
                user.id,
                role,
                skill,
                20,
            ]
        );

        const assessmentId = assessmentResult.rows[0].id;

        // -------------------------------------------------
        // SEND SAFE QUESTIONS
        // Do not send correct_option to the frontend.
        // -------------------------------------------------

        const safeQuestions = questions.map((question) => ({
            id: question.id,
            category: question.category,
            question: question.question,
            option_a: question.option_a,
            option_b: question.option_b,
            option_c: question.option_c,
            option_d: question.option_d,
            difficulty: question.difficulty,
        }));

        return res.status(200).json({
            message: "Technical assessment started successfully.",
            assessmentId,
            role,
            roleTitle: roleConfig[role].title,
            skill,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
            },
            totalQuestions: 20,
            questions: safeQuestions,
        });
    } catch (error) {
        console.error("Technical Assessment Start Error:", error);

        return res.status(500).json({
            message: "Failed to start technical assessment.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
});

// =====================================================
// SUBMIT TECHNICAL ASSESSMENT
//
// POST /api/technical-assessment/submit
//
// BODY:
// {
//   "assessmentId": 12,
//   "answers": [
//     {
//       "questionId": 5,
//       "selectedOption": "A"
//     }
//   ]
// }
//
// Exactly 20 answers are required.
// =====================================================

router.post("/submit", async (req, res) => {
    let client;

    try {
        const { assessmentId, answers } = req.body;

        // -------------------------------------------------
        // VALIDATE ASSESSMENT ID
        // -------------------------------------------------

        const parsedAssessmentId = Number(assessmentId);

        if (
            !Number.isInteger(parsedAssessmentId) ||
            parsedAssessmentId <= 0
        ) {
            return res.status(400).json({
                message: "A valid assessmentId is required.",
            });
        }

        // -------------------------------------------------
        // VALIDATE ANSWERS
        // -------------------------------------------------

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                message: "Answers must be provided as an array.",
            });
        }

        if (answers.length !== 20) {
            return res.status(400).json({
                message:
                    `Exactly 20 answers are required. Received ${answers.length}.`,
            });
        }

        const questionIds = answers.map((answer) =>
            Number(answer?.questionId)
        );

        if (
            questionIds.some(
                (id) => !Number.isInteger(id) || id <= 0
            )
        ) {
            return res.status(400).json({
                message: "Invalid question ID detected.",
            });
        }

        if (new Set(questionIds).size !== 20) {
            return res.status(400).json({
                message: "Assessment contains duplicate question IDs.",
            });
        }

        const normalizedAnswers = answers.map((answer) => ({
            questionId: Number(answer.questionId),
            selectedOption: String(answer.selectedOption || "")
                .trim()
                .toUpperCase(),
        }));

        if (
            normalizedAnswers.some(
                (answer) =>
                    !validOptions.includes(answer.selectedOption)
            )
        ) {
            return res.status(400).json({
                message:
                    "Every answer must contain a valid option: A, B, C, or D.",
            });
        }

        // -------------------------------------------------
        // BEGIN TRANSACTION
        // Save all answers and mark the assessment complete
        // as one operation.
        // -------------------------------------------------

        client = await pool.connect();
        await client.query("BEGIN");

        // -------------------------------------------------
        // GET AND LOCK ASSESSMENT
        // -------------------------------------------------

        const assessmentResult = await client.query(
            `
            SELECT
                id,
                user_id,
                role,
                assessment_skill,
                total_questions,
                completed
            FROM technical_assessments
            WHERE id = $1
            FOR UPDATE
            `,
            [parsedAssessmentId]
        );

        if (assessmentResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Assessment not found.",
            });
        }

        const assessment = assessmentResult.rows[0];

        if (assessment.completed) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "This assessment has already been submitted.",
            });
        }

        const role = assessment.role;
        const skill = assessment.assessment_skill;

        if (
            !roleConfig[role] ||
            !roleConfig[role].skills.includes(skill)
        ) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message:
                    "The assessment has an invalid role or skill configuration.",
            });
        }

        // -------------------------------------------------
        // FETCH AND VERIFY THE 20 QUESTIONS
        // Every question must match this assessment's
        // selected role and skill.
        // -------------------------------------------------

        const questionsResult = await client.query(
            `
            SELECT
                id,
                role,
                category,
                difficulty,
                correct_option
            FROM technical_questions
            WHERE id = ANY($1::integer[])
              AND role = $2
              AND category = $3
            `,
            [
                questionIds,
                role,
                skill,
            ]
        );

        const questions = questionsResult.rows;

        if (questions.length !== 20) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message:
                    "One or more questions do not belong to this assessment's selected role and skill.",
            });
        }

        // -------------------------------------------------
        // CREATE QUESTION LOOKUP MAP
        // -------------------------------------------------

        const questionMap = new Map();

        questions.forEach((question) => {
            questionMap.set(Number(question.id), question);
        });

        // -------------------------------------------------
        // SCORE AND COLLECT CATEGORY / DIFFICULTY RESULTS
        // -------------------------------------------------

        let correctAnswers = 0;

        const categoryScores = {};

        const difficultyScores = {
            Easy: {
                total: 0,
                correct: 0,
            },
            Medium: {
                total: 0,
                correct: 0,
            },
            Difficult: {
                total: 0,
                correct: 0,
            },
        };

        // Keep the submitted order in the evaluated answer list.
        const evaluatedAnswers = [];

        for (const answer of normalizedAnswers) {
            const question = questionMap.get(answer.questionId);

            if (!question) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: "A submitted question could not be verified.",
                });
            }

            const correctOption = String(
                question.correct_option || ""
            )
                .trim()
                .toUpperCase();

            if (!validOptions.includes(correctOption)) {
                throw new Error(
                    `Question ${question.id} has an invalid correct_option in the database.`
                );
            }

            const isCorrect =
                answer.selectedOption === correctOption;

            if (isCorrect) {
                correctAnswers++;
            }

            const category = question.category || "General";

            if (!categoryScores[category]) {
                categoryScores[category] = {
                    total: 0,
                    correct: 0,
                };
            }

            categoryScores[category].total++;

            if (isCorrect) {
                categoryScores[category].correct++;
            }

            const difficulty = question.difficulty;

            if (difficultyScores[difficulty]) {
                difficultyScores[difficulty].total++;

                if (isCorrect) {
                    difficultyScores[difficulty].correct++;
                }
            }

            // Store each answer in the database.
            await client.query(
                `
                INSERT INTO technical_answers
                (
                    assessment_id,
                    question_id,
                    selected_option,
                    is_correct
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4
                )
                `,
                [
                    parsedAssessmentId,
                    answer.questionId,
                    answer.selectedOption,
                    isCorrect,
                ]
            );

            evaluatedAnswers.push({
                questionId: question.id,
                category,
                difficulty: question.difficulty,
                selectedAnswer: answer.selectedOption,
                correctAnswer: correctOption,
                isCorrect,
            });
        }

        // -------------------------------------------------
        // CALCULATE OVERALL SCORE
        // -------------------------------------------------

        const totalQuestions = Number(
            assessment.total_questions
        );

        if (totalQuestions !== 20) {
            throw new Error(
                "The assessment record does not have the expected total of 20 questions."
            );
        }

        const score = Math.round(
            (correctAnswers / totalQuestions) * 100
        );

        // -------------------------------------------------
        // CATEGORY RESULTS
        // -------------------------------------------------

        const categoryResults = Object.entries(categoryScores)
            .map(([category, data]) => ({
                category,
                total: data.total,
                correct: data.correct,
                score: Math.round(
                    (data.correct / data.total) * 100
                ),
            }))
            .sort((a, b) => a.category.localeCompare(b.category));

        // -------------------------------------------------
        // DIFFICULTY RESULTS
        // -------------------------------------------------

        const difficultyResults = Object.entries(difficultyScores)
            .map(([difficulty, data]) => ({
                difficulty,
                total: data.total,
                correct: data.correct,
                score:
                    data.total > 0
                        ? Math.round(
                              (data.correct / data.total) * 100
                          )
                        : 0,
            }));

        // -------------------------------------------------
        // PERFORMANCE AND ROADMAP LABELS
        // -------------------------------------------------

        const performanceLevel = getPerformanceLevel(score);
        const roadmapLevel = getRoadmapLevel(score);

        // -------------------------------------------------
        // UPDATE ASSESSMENT
        // -------------------------------------------------

        await client.query(
            `
            UPDATE technical_assessments
            SET
                correct_answers = $1,
                score = $2,
                completed = true,
                completed_at = CURRENT_TIMESTAMP
            WHERE id = $3
            `,
            [
                correctAnswers,
                score,
                parsedAssessmentId,
            ]
        );

        // -------------------------------------------------
        // COMMIT TRANSACTION
        // -------------------------------------------------

        await client.query("COMMIT");

        // -------------------------------------------------
        // SEND RESULT
        // -------------------------------------------------

        return res.status(200).json({
            message: "Assessment submitted successfully.",
            result: {
                assessmentId: parsedAssessmentId,
                role,
                roleTitle: roleConfig[role].title,
                skill,
                totalQuestions,
                correctAnswers,
                incorrectAnswers: totalQuestions - correctAnswers,
                score,
                performanceLevel,
                roadmapLevel,
                categoryResults,
                difficultyResults,
                evaluatedAnswers,
            },
        });
    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Assessment rollback error:",
                    rollbackError
                );
            }
        }

        console.error("Submit Assessment Error:", error);

        return res.status(500).json({
            message: "Failed to submit technical assessment.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// =====================================================
// GET LATEST COMPLETED RESULT
//
// GET /api/technical-assessment/result/:email
// =====================================================

router.get("/result/:email", async (req, res) => {
    try {
        const email = String(req.params.email || "")
            .trim()
            .toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Email is required.",
            });
        }

        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        const userResult = await pool.query(
            `
            SELECT
                id,
                fullname,
                email
            FROM users
            WHERE LOWER(email) = $1
            `,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const user = userResult.rows[0];

        // -------------------------------------------------
        // GET LATEST COMPLETED ASSESSMENT
        // -------------------------------------------------

        const assessmentResult = await pool.query(
            `
            SELECT
                id,
                role,
                assessment_skill,
                total_questions,
                correct_answers,
                score,
                completed,
                completed_at
            FROM technical_assessments
            WHERE user_id = $1
              AND completed = true
            ORDER BY completed_at DESC, id DESC
            LIMIT 1
            `,
            [user.id]
        );

        if (assessmentResult.rows.length === 0) {
            return res.status(404).json({
                message: "No completed assessment found.",
            });
        }

        const assessment = assessmentResult.rows[0];

        // -------------------------------------------------
        // GET CATEGORY SCORES FOR THIS ASSESSMENT
        // -------------------------------------------------

        const categoryResult = await pool.query(
            `
            SELECT
                q.category,
                COUNT(*) AS total,
                SUM(
                    CASE
                        WHEN a.is_correct = true THEN 1
                        ELSE 0
                    END
                ) AS correct
            FROM technical_answers a
            JOIN technical_questions q
              ON q.id = a.question_id
            WHERE a.assessment_id = $1
            GROUP BY q.category
            ORDER BY q.category
            `,
            [assessment.id]
        );

        const categoryResults = categoryResult.rows.map((row) => {
            const total = Number(row.total);
            const correct = Number(row.correct);

            return {
                category: row.category,
                total,
                correct,
                score:
                    total > 0
                        ? Math.round((correct / total) * 100)
                        : 0,
            };
        });

        // -------------------------------------------------
        // NORMALIZE VALUES FROM POSTGRES
        // -------------------------------------------------

        const score = Number(assessment.score);
        const totalQuestions = Number(
            assessment.total_questions
        );
        const correctAnswers = Number(
            assessment.correct_answers
        );

        const role = assessment.role;

        const roleTitle = roleConfig[role]
            ? roleConfig[role].title
            : role;

        return res.status(200).json({
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
            },

            assessment: {
                id: assessment.id,
                role,
                roleTitle,
                skill: assessment.assessment_skill,
                totalQuestions,
                correctAnswers,
                incorrectAnswers:
                    totalQuestions - correctAnswers,
                score,
                completed: assessment.completed,
                completedAt: assessment.completed_at,
                performanceLevel: getPerformanceLevel(score),
                roadmapLevel: getRoadmapLevel(score),
            },

            categoryResults,
        });
    } catch (error) {
        console.error("Get Result Error:", error);

        return res.status(500).json({
            message: "Failed to get assessment result.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
});

module.exports = router;