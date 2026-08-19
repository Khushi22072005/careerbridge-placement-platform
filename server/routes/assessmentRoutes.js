const express = require("express");
const router = express.Router();

const pool = require("../src/config/db");
const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// ROLE MAP
// =====================================================

const roleMap = {
    "software-developer": "Software Developer",
    "data-analyst": "Data Analyst",
    "cybersecurity": "Cybersecurity",
    "cloud-devops": "Cloud / DevOps",
    "ui-ux": "UI/UX Designer"
};


// =====================================================
// GET QUESTIONS
// GET /api/assessment/questions/:role
// =====================================================

router.get(
    "/questions/:role",
    async (req, res) => {

        try {

            const { role } = req.params;

            const selectedRole = roleMap[role];

            if (!selectedRole) {
                return res.status(400).json({
                    message: "Invalid career role."
                });
            }

            const result = await pool.query(
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
                FROM career_assessment_questions
                WHERE role = $1
                ORDER BY RANDOM()
                LIMIT 20
                `,
                [selectedRole]
            );

            if (result.rows.length !== 20) {

                return res.status(400).json({
                    message:
                        `This role has only ${result.rows.length} questions in the database. Exactly 20 questions are required.`,
                    role,
                    roleName: selectedRole,
                    totalQuestions: result.rows.length
                });
            }

            return res.status(200).json({

                role,
                roleName: selectedRole,
                totalQuestions: result.rows.length,
                questions: result.rows

            });

        } catch (error) {

            console.error(
                "Career assessment questions error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to load career assessment questions."
            });
        }
    }
);


// =====================================================
// SUBMIT CAREER ASSESSMENT
// POST /api/assessment/submit
// =====================================================

router.post(
    "/submit",
    authMiddleware,
    async (req, res) => {

        try {

            const userId = req.user.id;

            const {
                role,
                answers
            } = req.body;

            // =================================================
            // VALIDATE ROLE
            // =================================================

            if (!role) {

                return res.status(400).json({
                    message: "Career role is required."
                });

            }

            const selectedRole = roleMap[role];

            if (!selectedRole) {

                return res.status(400).json({
                    message: "Invalid career role."
                });

            }

            // =================================================
            // VALIDATE ANSWERS
            // =================================================

            if (!Array.isArray(answers)) {

                return res.status(400).json({
                    message: "Answers must be an array."
                });

            }

            if (answers.length !== 20) {

                return res.status(400).json({
                    message:
                        `Assessment must contain exactly 20 answers. Received ${answers.length}.`
                });

            }

            const questionIds = answers.map(
                answer => Number(answer.questionId)
            );

            const uniqueQuestionIds =
                new Set(questionIds);

            if (uniqueQuestionIds.size !== 20) {

                return res.status(400).json({
                    message:
                        "Assessment contains duplicate questions."
                });

            }

            const validOptions = ["A", "B", "C", "D"];

            for (const answer of answers) {

                if (!answer.questionId) {

                    return res.status(400).json({
                        message:
                            "Every answer must contain a questionId."
                    });

                }

                if (
                    !validOptions.includes(
                        answer.selectedOption
                    )
                ) {

                    return res.status(400).json({
                        message:
                            "Every answer must contain a valid option."
                    });

                }
            }

            // =================================================
            // FETCH QUESTIONS
            // =================================================

            const questionResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        role,
                        category,
                        correct_option
                    FROM career_assessment_questions
                    WHERE id = ANY($1::integer[])
                    AND role = $2
                    `,
                    [
                        questionIds,
                        selectedRole
                    ]
                );

            if (questionResult.rows.length !== 20) {

                return res.status(400).json({
                    message:
                        "One or more questions do not belong to the selected career role."
                });

            }

            // =================================================
            // QUESTION MAP
            // =================================================

            const questionMap = new Map();

            questionResult.rows.forEach(question => {

                questionMap.set(
                    Number(question.id),
                    question
                );

            });

            // =================================================
            // SCORE
            // =================================================

            let correctAnswers = 0;

            const categoryScores = {};

            for (const answer of answers) {

                const questionId =
                    Number(answer.questionId);

                const question =
                    questionMap.get(questionId);

                if (!question) {

                    return res.status(400).json({
                        message:
                            "Invalid question submitted."
                    });

                }

                const isCorrect =
                    question.correct_option ===
                    answer.selectedOption;

                if (isCorrect) {
                    correctAnswers++;
                }

                const category =
                    question.category || "General";

                if (!categoryScores[category]) {

                    categoryScores[category] = {
                        total: 0,
                        correct: 0
                    };

                }

                categoryScores[category].total++;

                if (isCorrect) {
                    categoryScores[category].correct++;
                }
            }

            // =================================================
            // OVERALL SCORE
            // =================================================

            const totalQuestions = answers.length;

            const score =
                Math.round(
                    (correctAnswers / totalQuestions) * 100
                );

            // =================================================
            // CATEGORY RESULTS
            // =================================================

            const categoryResults =
                Object.entries(categoryScores)
                    .map(([category, data]) => {

                        const categoryScore =
                            Math.round(
                                (data.correct / data.total) * 100
                            );

                        return {
                            category,
                            correct: data.correct,
                            total: data.total,
                            score: categoryScore
                        };

                    });

            // =================================================
            // PERFORMANCE
            // =================================================

            let performanceLevel;

            if (score >= 85) {

                performanceLevel = "Excellent";

            } else if (score >= 70) {

                performanceLevel = "Strong";

            } else if (score >= 50) {

                performanceLevel = "Moderate";

            } else {

                performanceLevel = "Needs Improvement";

            }

            // =================================================
            // SAVE RESULT FOR LOGGED-IN USER
            // =================================================

            await pool.query(
                `
                INSERT INTO career_assessment_results
                (
                    user_id,
                    role,
                    role_name,
                    total_questions,
                    correct_answers,
                    incorrect_answers,
                    score,
                    performance_level,
                    category_results
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9
                )
                `,
                [
                    userId,
                    role,
                    selectedRole,
                    totalQuestions,
                    correctAnswers,
                    totalQuestions - correctAnswers,
                    score,
                    performanceLevel,
                    JSON.stringify(categoryResults)
                ]
            );

            // =================================================
            // RESPONSE
            // =================================================

            const result = {

                role,
                roleName: selectedRole,

                totalQuestions,

                correctAnswers,

                incorrectAnswers:
                    totalQuestions - correctAnswers,

                score,

                performanceLevel,

                categoryResults,

                completedAt:
                    new Date().toISOString()

            };

            return res.status(200).json({

                message:
                    "Career assessment submitted successfully.",

                result

            });

        } catch (error) {

            console.error(
                "Career assessment submission error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to submit career assessment."
            });
        }
    }
);


// =====================================================
// GET MY LATEST ASSESSMENT
// GET /api/assessment/my-result
// =====================================================

router.get(
    "/my-result",
    authMiddleware,
    async (req, res) => {

        try {

            const userId = req.user.id;

            const result = await pool.query(
                `
                SELECT *
                FROM career_assessment_results
                WHERE user_id = $1
                ORDER BY completed_at DESC
                LIMIT 1
                `,
                [userId]
            );

            if (result.rows.length === 0) {

                return res.status(200).json({
                    hasAssessment: false
                });

            }

            const assessment = result.rows[0];

            return res.status(200).json({

                hasAssessment: true,

                assessment: {

                    id: assessment.id,

                    role: assessment.role,

                    roleName: assessment.role_name,

                    totalQuestions:
                        assessment.total_questions,

                    correctAnswers:
                        assessment.correct_answers,

                    incorrectAnswers:
                        assessment.incorrect_answers,

                    score:
                        assessment.score,

                    performanceLevel:
                        assessment.performance_level,

                    categoryResults:
                        assessment.category_results,

                    completedAt:
                        assessment.completed_at

                }

            });

        } catch (error) {

            console.error(
                "Get assessment result error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to fetch assessment result."
            });

        }
    }
);


module.exports = router;