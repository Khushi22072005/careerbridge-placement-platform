

const express = require("express");
const router = express.Router();
const pool = require("../src/config/db");

// =====================================================
// APTITUDE CATEGORIES
// =====================================================

const APTITUDE_CATEGORIES = [
    "Numerical Reasoning",
    "Logical Reasoning",
    "Verbal Reasoning",
    "Analytical Reasoning"
];

// =====================================================
// GET APTITUDE CATEGORIES
// GET /api/aptitude/categories
// =====================================================

router.get("/categories", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT category, COUNT(*) AS question_count
             FROM aptitude_questions
             GROUP BY category
             ORDER BY category`
        );

        const categories = APTITUDE_CATEGORIES.map(category => {
            const match = result.rows.find(
                row => row.category === category
            );

            return {
                category,
                questionCount: match
                    ? Number(match.question_count)
                    : 0
            };
        });

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error("Error fetching aptitude categories:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load aptitude categories."
        });
    }
});

// =====================================================
// START APTITUDE TEST
// POST /api/aptitude/start
// =====================================================

router.post("/start", async (req, res) => {
    const { userId, category } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
            success: false,
            message: "A valid user ID is required."
        });
    }

    if (!APTITUDE_CATEGORIES.includes(category)) {
        return res.status(400).json({
            success: false,
            message: "Please select a valid aptitude category."
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const questionResult = await client.query(
            `SELECT
                id,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                difficulty
             FROM aptitude_questions
             WHERE category = $1
             ORDER BY RANDOM()
             LIMIT 5`,
            [category]
        );

        if (questionResult.rows.length < 5) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Not enough questions are available for this category."
            });
        }

        const assessmentResult = await client.query(
            `INSERT INTO aptitude_assessments
                (user_id, category, total_questions)
             VALUES ($1, $2, $3)
             RETURNING id, category, total_questions, started_at`,
            [userId, category, questionResult.rows.length]
        );

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            assessment: assessmentResult.rows[0],
            questions: questionResult.rows
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Error starting aptitude test:", error);

        res.status(500).json({
            success: false,
            message: "Unable to start the aptitude test."
        });
    } finally {
        client.release();
    }
});


/* =====================================================
   SUBMIT APTITUDE TEST
   POST /api/aptitude/submit
===================================================== */

router.post("/submit", async (req, res) => {
    const { assessmentId, answers } = req.body;

    if (
        !Number.isInteger(assessmentId) ||
        assessmentId <= 0 ||
        !Array.isArray(answers)
    ) {
        return res.status(400).json({
            success: false,
            message: "A valid assessment ID and answers are required."
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const assessmentResult = await client.query(
            `SELECT *
             FROM aptitude_assessments
             WHERE id = $1
             FOR UPDATE`,
            [assessmentId]
        );

        if (assessmentResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Assessment not found."
            });
        }

        const assessment = assessmentResult.rows[0];

        if (assessment.completed) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "This assessment has already been submitted."
            });
        }

        if (answers.length !== assessment.total_questions) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: `Please answer all ${assessment.total_questions} questions.`
            });
        }

        const questionIds = answers.map(answer => answer.questionId);

        if (
            questionIds.some(id => !Number.isInteger(id) || id <= 0) ||
            new Set(questionIds).size !== questionIds.length ||
            answers.some(answer =>
                !["A", "B", "C", "D"].includes(answer.selectedOption)
            )
        ) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Answers contain invalid or duplicate entries."
            });
        }

        const questionResult = await client.query(
            `SELECT id, correct_option, difficulty
             FROM aptitude_questions
             WHERE category = $1
               AND id = ANY($2::int[])`,
            [assessment.category, questionIds]
        );

        if (questionResult.rows.length !== assessment.total_questions) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "The submitted questions do not match this assessment."
            });
        }

        const questionMap = new Map(
            questionResult.rows.map(question => [
                question.id,
                question
            ])
        );

        let correctAnswers = 0;
        const categoryResults = {};

        for (const answer of answers) {
            const question = questionMap.get(answer.questionId);
            const isCorrect =
                answer.selectedOption === question.correct_option;

            if (isCorrect) correctAnswers++;

            if (!categoryResults[question.difficulty]) {
                categoryResults[question.difficulty] = {
                    total: 0,
                    correct: 0
                };
            }

            categoryResults[question.difficulty].total++;

            if (isCorrect) {
                categoryResults[question.difficulty].correct++;
            }

            await client.query(
                `INSERT INTO aptitude_answers
                    (assessment_id, question_id, selected_option, is_correct)
                 VALUES ($1, $2, $3, $4)`,
                [
                    assessmentId,
                    answer.questionId,
                    answer.selectedOption,
                    isCorrect
                ]
            );
        }

        const totalQuestions = assessment.total_questions;
        const score = Number(
            ((correctAnswers / totalQuestions) * 100).toFixed(2)
        );

        await client.query(
            `UPDATE aptitude_assessments
             SET correct_answers = $1,
                 score = $2,
                 completed = TRUE,
                 completed_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [correctAnswers, score, assessmentId]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            result: {
                assessmentId,
                category: assessment.category,
                totalQuestions,
                correctAnswers,
                incorrectAnswers: totalQuestions - correctAnswers,
                score,
                difficultyResults: categoryResults,
                completed: true
            }
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Error submitting aptitude test:", error);

        res.status(500).json({
            success: false,
            message: "Unable to submit the aptitude test."
        });
    } finally {
        client.release();
    }
});


/* =====================================================
   GET APTITUDE TEST RESULT
   GET /api/aptitude/result/:assessmentId
===================================================== */


router.get("/result/:assessmentId", async (req, res) => {
    try {
        const { assessmentId } = req.params;

        const resultQuery = await pool.query(
            `SELECT
                id AS assessment_id,
                category,
                total_questions,
                correct_answers,
                (total_questions - correct_answers) AS incorrect_answers,
                score,
                completed,
                started_at,
                completed_at
             FROM aptitude_assessments
             WHERE id = $1`,
            [assessmentId]
        );

        if (resultQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Assessment result not found."
            });
        }

        const result = resultQuery.rows[0];

        const answersQuery = await pool.query(
            `SELECT
                q.id AS question_id,
                q.question,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_option,
                aa.selected_option,
                aa.is_correct
             FROM aptitude_answers aa
             JOIN aptitude_questions q
                ON q.id = aa.question_id
             WHERE aa.assessment_id = $1
             ORDER BY q.id`,
            [assessmentId]
        );

        res.json({
            success: true,
            result,
            answers: answersQuery.rows
        });
    } catch (error) {
        console.error("Error fetching aptitude result:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch assessment result."
        });
    }
});


module.exports = router;
