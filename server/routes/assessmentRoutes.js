const express = require("express");
const router = express.Router();

const pool = require("../src/config/db");

// =====================================================
// ROLE MAP
// =====================================================

const roleMap = {

    "software-developer":
        "Software Developer",

    "data-analyst":
        "Data Analyst",

    "cybersecurity":
        "Cybersecurity",

    "cloud-devops":
        "Cloud / DevOps",

    "ui-ux":
        "UI/UX Designer",

};

// =====================================================
// GET QUESTIONS
//
// GET
// /api/assessment/questions/:role
//
// Returns exactly 20 random questions.
// =====================================================

router.get(
    "/questions/:role",
    async (req, res) => {

        try {

            const { role } =
                req.params;

            console.log(
                "================================="
            );

            console.log(
                "CAREER ASSESSMENT REQUEST"
            );

            console.log(
                "Received role:",
                role
            );

            console.log(
                "================================="
            );

            // -------------------------------------------------
            // MAP ROLE
            // -------------------------------------------------

            const selectedRole =
                roleMap[role];

            console.log(
                "Mapped role:",
                selectedRole
            );

            // -------------------------------------------------
            // VALIDATE ROLE
            // -------------------------------------------------

            if (!selectedRole) {

                return res.status(400).json({

                    message:
                        "Invalid career role.",

                });
            }

            // -------------------------------------------------
            // GET QUESTIONS
            // -------------------------------------------------

            const result =
                await pool.query(
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

            console.log(
                "Questions found:",
                result.rows.length
            );

            // -------------------------------------------------
            // NOT ENOUGH QUESTIONS
            // -------------------------------------------------

            if (
                result.rows.length !== 20
            ) {

                console.error(
                    `Only ${result.rows.length} questions found for ${selectedRole}. Exactly 20 are required.`
                );

                return res.status(400).json({

                    message:
                        `This role has only ${result.rows.length} questions in the database. Exactly 20 questions are required.`,

                    role:
                        role,

                    roleName:
                        selectedRole,

                    totalQuestions:
                        result.rows.length,

                });
            }

            // -------------------------------------------------
            // RETURN QUESTIONS
            // -------------------------------------------------

            return res.status(200).json({

                role:
                    role,

                roleName:
                    selectedRole,

                totalQuestions:
                    result.rows.length,

                questions:
                    result.rows,

            });

        } catch (error) {

            console.error(
                "================================="
            );

            console.error(
                "CAREER ASSESSMENT DATABASE ERROR"
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "Code:",
                error.code
            );

            console.error(
                "Detail:",
                error.detail
            );

            console.error(
                "Hint:",
                error.hint
            );

            console.error(
                "================================="
            );

            return res.status(500).json({

                message:
                    "Failed to load career assessment questions.",

                error:
                    error.message,

            });
        }
    }
);

// =====================================================
// SUBMIT CAREER ASSESSMENT
//
// POST
// /api/assessment/submit
// =====================================================

router.post(
    "/submit",
    async (req, res) => {

        try {

            const {
                role,
                answers,
            } = req.body;

            console.log(
                "================================="
            );

            console.log(
                "CAREER ASSESSMENT SUBMISSION"
            );

            console.log(
                "Role:",
                role
            );

            console.log(
                "Answers received:",
                Array.isArray(answers)
                    ? answers.length
                    : "not an array"
            );

            console.log(
                "================================="
            );

            // =================================================
            // VALIDATE ROLE
            // =================================================

            if (!role) {

                return res.status(400).json({

                    message:
                        "Career role is required.",

                });
            }

            const selectedRole =
                roleMap[role];

            if (!selectedRole) {

                return res.status(400).json({

                    message:
                        "Invalid career role.",

                });
            }

            // =================================================
            // VALIDATE ANSWERS ARRAY
            // =================================================

            if (
                !Array.isArray(answers)
            ) {

                return res.status(400).json({

                    message:
                        "Answers must be an array.",

                });
            }

            // =================================================
            // EXACTLY 20 ANSWERS
            // =================================================

            if (
                answers.length !== 20
            ) {

                return res.status(400).json({

                    message:
                        `Assessment must contain exactly 20 answers. Received ${answers.length}.`,

                });
            }

            // =================================================
            // VALIDATE QUESTION IDs
            // =================================================

            const questionIds =
                answers.map(
                    (answer) =>
                        Number(
                            answer.questionId
                        )
                );

            // -------------------------------------------------
            // Check for duplicate IDs
            // -------------------------------------------------

            const uniqueQuestionIds =
                new Set(questionIds);

            if (
                uniqueQuestionIds.size !== 20
            ) {

                return res.status(400).json({

                    message:
                        "Assessment contains duplicate questions.",

                });
            }

            // =================================================
            // VALIDATE OPTIONS
            // =================================================

            const validOptions =
                ["A", "B", "C", "D"];

            for (
                const answer of answers
            ) {

                if (
                    !answer.questionId
                ) {

                    return res.status(400).json({

                        message:
                            "Every answer must contain a questionId.",

                    });
                }

                if (
                    !validOptions.includes(
                        answer.selectedOption
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Every answer must contain a valid option: A, B, C or D.",

                    });
                }
            }

            // =================================================
            // FETCH ACTUAL QUESTIONS
            //
            // IMPORTANT:
            // The server calculates the score.
            // The client NEVER sends correct answers.
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
                        selectedRole,
                    ]
                );

            // =================================================
            // EXACTLY 20 VALID QUESTIONS
            // =================================================

            if (
                questionResult.rows.length !== 20
            ) {

                return res.status(400).json({

                    message:
                        "One or more questions do not belong to the selected career role.",

                });
            }

            // =================================================
            // CREATE QUESTION MAP
            // =================================================

            const questionMap =
                new Map();

            questionResult.rows.forEach(
                (question) => {

                    questionMap.set(
                        Number(question.id),
                        question
                    );

                }
            );

            // =================================================
            // SCORE VARIABLES
            // =================================================

            let correctAnswers = 0;

            const categoryScores = {};

            // =================================================
            // EVALUATE ANSWERS
            // =================================================

            for (
                const answer of answers
            ) {

                const questionId =
                    Number(
                        answer.questionId
                    );

                const question =
                    questionMap.get(
                        questionId
                    );

                // -------------------------------------------------
                // Safety check
                // -------------------------------------------------

                if (!question) {

                    return res.status(400).json({

                        message:
                            "Invalid question submitted.",

                    });
                }

                const selectedOption =
                    answer.selectedOption;

                const isCorrect =
                    question.correct_option ===
                    selectedOption;

                // -------------------------------------------------
                // OVERALL SCORE
                // -------------------------------------------------

                if (isCorrect) {

                    correctAnswers++;

                }

                // -------------------------------------------------
                // CATEGORY
                // -------------------------------------------------

                const category =
                    question.category ||
                    "General";

                if (
                    !categoryScores[
                        category
                    ]
                ) {

                    categoryScores[
                        category
                    ] = {

                        total: 0,

                        correct: 0,

                    };
                }

                categoryScores[
                    category
                ].total++;

                if (isCorrect) {

                    categoryScores[
                        category
                    ].correct++;

                }
            }

            // =================================================
            // OVERALL SCORE
            // =================================================

            const totalQuestions =
                answers.length;

            const score =
                Math.round(
                    (
                        correctAnswers /
                        totalQuestions
                    ) * 100
                );

            // =================================================
            // CATEGORY RESULTS
            // =================================================

            const categoryResults =
                Object.entries(
                    categoryScores
                ).map(
                    ([category, data]) => {

                        const categoryScore =
                            Math.round(
                                (
                                    data.correct /
                                    data.total
                                ) * 100
                            );

                        return {

                            category,

                            correct:
                                data.correct,

                            total:
                                data.total,

                            score:
                                categoryScore,

                        };
                    }
                );

            // =================================================
            // PERFORMANCE LEVEL
            // =================================================

            let performanceLevel =
                "";

            if (score >= 85) {

                performanceLevel =
                    "Excellent";

            } else if (score >= 70) {

                performanceLevel =
                    "Strong";

            } else if (score >= 50) {

                performanceLevel =
                    "Moderate";

            } else {

                performanceLevel =
                    "Needs Improvement";
            }

            // =================================================
            // RESULT
            // =================================================

            const result = {

                role,

                roleName:
                    selectedRole,

                totalQuestions,

                correctAnswers,

                incorrectAnswers:
                    totalQuestions -
                    correctAnswers,

                score,

                performanceLevel,

                categoryResults,

                completedAt:
                    new Date().toISOString(),

            };

            // =================================================
            // RESPONSE
            // =================================================

            console.log(
                "Assessment completed:"
            );

            console.log(
                "Role:",
                selectedRole
            );

            console.log(
                "Score:",
                score
            );

            console.log(
                "Correct:",
                correctAnswers
            );

            console.log(
                "Incorrect:",
                totalQuestions -
                correctAnswers
            );

            return res.status(200).json({

                message:
                    "Career assessment submitted successfully.",

                result,

            });

        } catch (error) {

            console.error(
                "================================="
            );

            console.error(
                "CAREER ASSESSMENT SUBMISSION ERROR"
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "Code:",
                error.code
            );

            console.error(
                "================================="
            );

            return res.status(500).json({

                message:
                    "Failed to submit career assessment.",

                error:
                    error.message,

            });
        }
    }
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;