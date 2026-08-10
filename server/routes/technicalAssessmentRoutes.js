const express = require("express");
const router = express.Router();

const pool = require("../src/config/db");

// =====================================================
// START TECHNICAL ASSESSMENT
// GET /api/technical-assessment/questions/:email
// =====================================================

router.get("/questions/:email", async (req, res) => {
    try {
        const { email } = req.params;

        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        const userResult = await pool.query(
            `
            SELECT id, fullname, email
            FROM users
            WHERE email = $1
            `,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const user = userResult.rows[0];

        // -------------------------------------------------
        // GET 5 EASY QUESTIONS
        // -------------------------------------------------

        const easyResult = await pool.query(
            `
            SELECT
                id,
                category,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                difficulty
            FROM technical_questions
            WHERE difficulty = 'Easy'
            ORDER BY RANDOM()
            LIMIT 5
            `
        );

        // -------------------------------------------------
        // GET 5 MEDIUM QUESTIONS
        // -------------------------------------------------

        const mediumResult = await pool.query(
            `
            SELECT
                id,
                category,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                difficulty
            FROM technical_questions
            WHERE difficulty = 'Medium'
            ORDER BY RANDOM()
            LIMIT 5
            `
        );

        // -------------------------------------------------
        // GET 5 DIFFICULT QUESTIONS
        // -------------------------------------------------

        const difficultResult = await pool.query(
            `
            SELECT
                id,
                category,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                difficulty
            FROM technical_questions
            WHERE difficulty = 'Difficult'
            ORDER BY RANDOM()
            LIMIT 5
            `
        );

        // -------------------------------------------------
        // COMBINE QUESTIONS
        // -------------------------------------------------

        let questions = [
            ...easyResult.rows,
            ...mediumResult.rows,
            ...difficultResult.rows,
        ];

        // -------------------------------------------------
        // SHUFFLE QUESTIONS
        // -------------------------------------------------

        questions = questions.sort(
            () => Math.random() - 0.5
        );

        // -------------------------------------------------
        // CREATE ASSESSMENT RECORD
        // -------------------------------------------------

        const assessmentResult = await pool.query(
            `
            INSERT INTO technical_assessments
            (
                user_id,
                total_questions,
                correct_answers,
                score,
                completed
            )
            VALUES ($1, $2, 0, 0, false)
            RETURNING id
            `,
            [user.id, questions.length]
        );

        const assessmentId =
            assessmentResult.rows[0].id;

        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        res.status(200).json({
            assessmentId,

            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
            },

            questions,
        });

    } catch (error) {

        console.error(
            "Technical Assessment Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to start technical assessment",
            error: error.message,
        });
    }
});


// =====================================================
// SUBMIT TECHNICAL ASSESSMENT
// POST /api/technical-assessment/submit
// =====================================================

router.post("/submit", async (req, res) => {

    try {

        const {
            assessmentId,
            answers,
        } = req.body;

        if (
            !assessmentId ||
            !Array.isArray(answers)
        ) {
            return res.status(400).json({
                message:
                    "Invalid assessment submission",
            });
        }

        // -------------------------------------------------
        // GET QUESTIONS AND CHECK ANSWERS
        // -------------------------------------------------

        let correctAnswers = 0;

        const categoryScores = {};

        for (const answer of answers) {

            const {
                questionId,
                selectedOption,
            } = answer;

            const questionResult =
                await pool.query(
                    `
                    SELECT
                        category,
                        correct_option
                    FROM technical_questions
                    WHERE id = $1
                    `,
                    [questionId]
                );

            if (
                questionResult.rows.length === 0
            ) {
                continue;
            }

            const question =
                questionResult.rows[0];

            const isCorrect =
                question.correct_option ===
                selectedOption;

            if (isCorrect) {
                correctAnswers++;
            }

            // -------------------------------------------------
            // SAVE ANSWER
            // -------------------------------------------------

            await pool.query(
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
                    assessmentId,
                    questionId,
                    selectedOption || null,
                    isCorrect,
                ]
            );

            // -------------------------------------------------
            // CATEGORY SCORE
            // -------------------------------------------------

            if (
                !categoryScores[
                    question.category
                ]
            ) {
                categoryScores[
                    question.category
                ] = {
                    total: 0,
                    correct: 0,
                };
            }

            categoryScores[
                question.category
            ].total++;

            if (isCorrect) {
                categoryScores[
                    question.category
                ].correct++;
            }
        }

        // -------------------------------------------------
        // GET TOTAL QUESTIONS
        // -------------------------------------------------

        const assessmentResult =
            await pool.query(
                `
                SELECT total_questions
                FROM technical_assessments
                WHERE id = $1
                `,
                [assessmentId]
            );

        if (
            assessmentResult.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "Assessment not found",
            });
        }

        const totalQuestions =
            assessmentResult.rows[0]
                .total_questions;

        // -------------------------------------------------
        // CALCULATE SCORE
        // -------------------------------------------------

        const score =
            totalQuestions > 0
                ? Math.round(
                    (correctAnswers /
                        totalQuestions) *
                        100
                )
                : 0;

        // -------------------------------------------------
        // UPDATE ASSESSMENT
        // -------------------------------------------------

        await pool.query(
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
                assessmentId,
            ]
        );

        // -------------------------------------------------
        // CATEGORY RESULTS
        // -------------------------------------------------

        const categoryResults =
            Object.entries(
                categoryScores
            ).map(
                ([
                    category,
                    data,
                ]) => {

                    const categoryScore =
                        Math.round(
                            (
                                data.correct /
                                data.total
                            ) * 100
                        );

                    return {
                        category,
                        score:
                            categoryScore,
                        correct:
                            data.correct,
                        total:
                            data.total,
                    };
                }
            );

        // -------------------------------------------------
        // SEND RESULT
        // -------------------------------------------------

        res.status(200).json({

            message:
                "Assessment submitted successfully",

            result: {
                assessmentId,
                totalQuestions,
                correctAnswers,
                score,
                categoryResults,
            },
        });

    } catch (error) {

        console.error(
            "Submit Assessment Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to submit assessment",
            error: error.message,
        });
    }
});


// =====================================================
// GET LATEST RESULT
// GET /api/technical-assessment/result/:email
// =====================================================

router.get("/result/:email", async (req, res) => {

    try {

        const { email } = req.params;

        const userResult =
            await pool.query(
                `
                SELECT id
                FROM users
                WHERE email = $1
                `,
                [email]
            );

        if (
            userResult.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        const userId =
            userResult.rows[0].id;

        const assessmentResult =
            await pool.query(
                `
                SELECT
                    id,
                    total_questions,
                    correct_answers,
                    score,
                    completed,
                    completed_at
                FROM technical_assessments
                WHERE user_id = $1
                  AND completed = true
                ORDER BY completed_at DESC
                LIMIT 1
                `,
                [userId]
            );

        if (
            assessmentResult.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "No completed assessment found",
            });
        }

        const assessment =
            assessmentResult.rows[0];

        // -------------------------------------------------
        // CATEGORY SCORES
        // -------------------------------------------------

        const categoryResult =
            await pool.query(
                `
                SELECT
                    q.category,
                    COUNT(*) AS total,
                    SUM(
                        CASE
                            WHEN a.is_correct = true
                            THEN 1
                            ELSE 0
                        END
                    ) AS correct
                FROM technical_answers a
                JOIN technical_questions q
                    ON q.id = a.question_id
                WHERE a.assessment_id = $1
                GROUP BY q.category
                `,
                [assessment.id]
            );

        const categoryResults =
            categoryResult.rows.map(
                (row) => {

                    const total =
                        Number(row.total);

                    const correct =
                        Number(row.correct);

                    return {
                        category:
                            row.category,

                        total,

                        correct,

                        score:
                            total > 0
                                ? Math.round(
                                    (
                                        correct /
                                        total
                                    ) * 100
                                )
                                : 0,
                    };
                }
            );

        res.status(200).json({

            assessment,

            categoryResults,

        });

    } catch (error) {

        console.error(
            "Get Result Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to get assessment result",
            error: error.message,
        });
    }
});


module.exports = router;