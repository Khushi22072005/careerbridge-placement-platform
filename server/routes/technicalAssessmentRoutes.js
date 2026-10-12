
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

    cybersecurity: {
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

// =====================================================
// HELPER: PERFORMANCE LEVEL
// =====================================================

function getPerformanceLevel(score) {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Intermediate";
    return "Needs Improvement";
}

// =====================================================
// HELPER: ROADMAP LEVEL
// =====================================================

function getRoadmapLevel(score) {
    if (score < 40) return "Foundation";
    if (score < 70) return "Skill Building";
    return "Placement Ready";
}

// =====================================================
// HELPER: NORMALIZE ANSWER OPTION
// =====================================================

function normalizeOption(value) {
    return String(value || "").trim().toUpperCase();
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

        return res.status(200).json({ roles });
    } catch (error) {
        console.error("Roles Error:", error);

        return res.status(500).json({
            message: "Failed to load roles.",
        });
    }
});

// =====================================================
// GET QUESTIONS AND START ASSESSMENT
//
// GET /api/technical-assessment/questions/:email
//     ?role=data-analyst&skill=Python
// =====================================================

router.get("/questions/:email", async (req, res) => {
    try {
        const email = String(req.params.email || "")
            .trim()
            .toLowerCase();

        const role = String(req.query.role || "").trim();
        const skill = String(req.query.skill || "").trim();

        if (!email) {
            return res.status(400).json({
                message: "Email is required.",
            });
        }

        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({
                message: "A valid career role is required.",
            });
        }

        if (!skill || !roleConfig[role].skills.includes(skill)) {
            return res.status(400).json({
                message: "A valid skill for the selected role is required.",
            });
        }

        // Find user
        const userResult = await pool.query(
            `
            SELECT id, fullname, email
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

        // Get 20 random questions for the selected role and skill.
        // Never send correct_option before submission.

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

        // Create assessment record
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
            VALUES ($1, $2, $3, $4, 0, 0, false)
            RETURNING id
            `,
            [user.id, role, skill, 20]
        );

        const assessmentId = assessmentResult.rows[0].id;

        // Safe question response
        const safeQuestions = questions.map((q) => ({
            id: q.id,
            category: q.category,
            question: q.question,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            difficulty: q.difficulty,
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
    let transactionStarted = false;

    try {
        const { assessmentId, answers } = req.body;

        const parsedAssessmentId = Number(assessmentId);

        if (
            !Number.isInteger(parsedAssessmentId) ||
            parsedAssessmentId <= 0
        ) {
            return res.status(400).json({
                message: "A valid assessmentId is required.",
            });
        }

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
            selectedOption: normalizeOption(answer.selectedOption),
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

        // Begin transaction
        client = await pool.connect();
        await client.query("BEGIN");
        transactionStarted = true;

        // Lock assessment while submitting
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
            transactionStarted = false;

            return res.status(404).json({
                message: "Assessment not found.",
            });
        }

        const assessment = assessmentResult.rows[0];

        if (assessment.completed) {
            await client.query("ROLLBACK");
            transactionStarted = false;

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
            transactionStarted = false;

            return res.status(400).json({
                message:
                    "The assessment has an invalid role or skill configuration.",
            });
        }

        // Fetch complete question details for answer review.
        // correct_option is fetched only on the server.

        const questionsResult = await client.query(
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
                difficulty,
                correct_option
            FROM technical_questions
            WHERE id = ANY($1::integer[])
              AND role = $2
              AND category = $3
            `,
            [questionIds, role, skill]
        );

        const questions = questionsResult.rows;

        if (questions.length !== 20) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(400).json({
                message:
                    "One or more questions do not belong to this assessment's selected role and skill.",
            });
        }

        const questionMap = new Map();

        questions.forEach((question) => {
            questionMap.set(Number(question.id), question);
        });

        let correctAnswers = 0;

        const categoryScores = {};

        const difficultyScores = {
            Easy: { total: 0, correct: 0 },
            Medium: { total: 0, correct: 0 },
            Difficult: { total: 0, correct: 0 },
        };

        const evaluatedAnswers = [];

        // Evaluate each answer in the submitted order.
        for (const answer of normalizedAnswers) {
            const question = questionMap.get(answer.questionId);

            if (!question) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    message: "A submitted question could not be verified.",
                });
            }

            const correctOption = normalizeOption(
                question.correct_option
            );

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

            // Save answer in the database.
            await client.query(
                `
                INSERT INTO technical_answers
                (
                    assessment_id,
                    question_id,
                    selected_option,
                    is_correct
                )
                VALUES ($1, $2, $3, $4)
                `,
                [
                    parsedAssessmentId,
                    answer.questionId,
                    answer.selectedOption,
                    isCorrect,
                ]
            );

            // Full question details for the result page.
            evaluatedAnswers.push({
                questionId: question.id,
                question: question.question,

                option_a: question.option_a,
                option_b: question.option_b,
                option_c: question.option_c,
                option_d: question.option_d,

                category,
                difficulty: question.difficulty,

                selectedAnswer: answer.selectedOption,
                correctAnswer: correctOption,
                isCorrect,
            });
        }

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

        const categoryResults = Object.entries(categoryScores)
            .map(([category, data]) => ({
                category,
                total: data.total,
                correct: data.correct,
                score: Math.round(
                    (data.correct / data.total) * 100
                ),
            }))
            .sort((a, b) =>
                a.category.localeCompare(b.category)
            );

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

        const performanceLevel = getPerformanceLevel(score);
        const roadmapLevel = getRoadmapLevel(score);

        // Update assessment
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

        // Commit transaction
        await client.query("COMMIT");
        transactionStarted = false;

        // Return the summary and question-by-question details.
        return res.status(200).json({
            message: "Assessment submitted successfully.",

            result: {
                assessmentId: parsedAssessmentId,
                role,
                roleTitle: roleConfig[role].title,
                skill,

                totalQuestions,
                correctAnswers,
                incorrectAnswers:
                    totalQuestions - correctAnswers,

                score,
                performanceLevel,
                roadmapLevel,

                categoryResults,
                difficultyResults,

                evaluatedAnswers,
            },

            // Also expose answers at the root level for compatibility.
            answers: evaluatedAnswers,
        });
    } catch (error) {
        if (client && transactionStarted) {
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

        // Find user
        const userResult = await pool.query(
            `
            SELECT id, fullname, email
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

        // Get latest completed assessment
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
            ORDER BY completed_at DESC NULLS LAST, id DESC
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

        // Get category scores
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

        // Retrieve individual answers for the result page.
        const answersResult = await pool.query(
            `
            SELECT
                q.id AS "questionId",
                q.question,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.category,
                q.difficulty,
                a.selected_option AS "selectedAnswer",
                q.correct_option AS "correctAnswer",
                a.is_correct AS "isCorrect"
            FROM technical_answers a
            JOIN technical_questions q
              ON q.id = a.question_id
            WHERE a.assessment_id = $1
            ORDER BY a.id
            `,
            [assessment.id]
        );

        const evaluatedAnswers = answersResult.rows.map((row) => ({
            ...row,
            questionId: Number(row.questionId),
            selectedAnswer: normalizeOption(row.selectedAnswer),
            correctAnswer: normalizeOption(row.correctAnswer),
            isCorrect: row.isCorrect === true,
        }));

        // Normalize PostgreSQL values
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

        const result = {
            assessmentId: assessment.id,
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

            categoryResults,
            evaluatedAnswers,
        };

        return res.status(200).json({
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
            },

            assessment: result,
            result,
            answers: evaluatedAnswers,
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
