const express = require("express");
const router = express.Router();

const pool = require("../src/config/db");


// =====================================================
// ROLE CONFIGURATION
// =====================================================
//
// IMPORTANT:
//
// Each role has its OWN questions in technical_questions.
//
// The database should contain at least 20 questions for
// EACH role.
//
// Example:
//
// role = "software-developer"
// role = "data-analyst"
// role = "cybersecurity"
// role = "cloud-devops"
// role = "ui-ux"
//
// When a user selects one role, ONLY questions belonging
// to that role are used.
//
// Exactly 20 questions are selected.
// =====================================================

const roleConfig = {

    "software-developer": {
        title: "Software Developer"
    },

    "data-analyst": {
        title: "Data Analyst"
    },

    "cybersecurity": {
        title: "Cybersecurity"
    },

    "cloud-devops": {
        title: "Cloud / DevOps"
    },

    "ui-ux": {
        title: "UI/UX Designer"
    }

};


// =====================================================
// VALID ROLES
// =====================================================

const validRoles = Object.keys(roleConfig);


// =====================================================
// SHUFFLE HELPER
// =====================================================

function shuffleQuestions(questions) {

    return questions.sort(
        () => Math.random() - 0.5
    );

}


// =====================================================
// START TECHNICAL ASSESSMENT
//
// GET
//
// /api/technical-assessment/questions/:email?role=software-developer
//
// Example:
//
// /api/technical-assessment/questions/student@gmail.com?role=software-developer
//
// =====================================================

router.get(
    "/questions/:email",
    async (req, res) => {

        try {

            const { email } = req.params;

            const { role } = req.query;


            // =================================================
            // VALIDATE EMAIL
            // =================================================

            if (!email) {

                return res.status(400).json({

                    message:
                        "Email is required."

                });

            }


            // =================================================
            // VALIDATE ROLE
            // =================================================

            if (!role) {

                return res.status(400).json({

                    message:
                        "Career role is required."

                });

            }


            if (!validRoles.includes(role)) {

                return res.status(400).json({

                    message:
                        "Unsupported career role."

                });

            }


            // =================================================
            // FIND USER
            // =================================================

            const userResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        fullname,
                        email
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
                        "User not found."

                });

            }


            const user =
                userResult.rows[0];


            // =================================================
            // GET EXACTLY 20 QUESTIONS
            // =================================================
            //
            // VERY IMPORTANT:
            //
            // role is used as the main filter.
            //
            // So if the user selected:
            //
            // Software Developer
            //
            // only:
            //
            // role = "software-developer"
            //
            // questions are selected.
            //
            // Then RANDOM() chooses 20 from that role.
            //
            // =================================================

            const questionsResult =
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
                    FROM technical_questions
                    WHERE role = $1
                    ORDER BY RANDOM()
                    LIMIT 20
                    `,
                    [role]
                );


            const questions =
                questionsResult.rows;


            // =================================================
            // MAKE SURE ROLE HAS 20 QUESTIONS
            // =================================================

            if (
                questions.length < 20
            ) {

                return res.status(400).json({

                    message:
                        "This role does not have enough questions yet.",

                    role,

                    requiredQuestions: 20,

                    availableQuestions:
                        questions.length

                });

            }


            // =================================================
            // SHUFFLE QUESTIONS
            // =================================================

            const shuffledQuestions =
                shuffleQuestions(
                    questions
                );


            // =================================================
            // CREATE ASSESSMENT RECORD
            // =================================================

            const assessmentResult =
                await pool.query(
                    `
                    INSERT INTO technical_assessments
                    (
                        user_id,
                        role,
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
                        0,
                        0,
                        false
                    )
                    RETURNING id
                    `,
                    [
                        user.id,
                        role,
                        20
                    ]
                );


            const assessmentId =
                assessmentResult
                    .rows[0]
                    .id;


            // =================================================
            // SAFE QUESTIONS
            // =================================================
            //
            // IMPORTANT:
            //
            // correct_option is NOT sent to frontend.
            //
            // The frontend should never know the answer
            // before the student submits the assessment.
            //
            // =================================================

            const safeQuestions =
                shuffledQuestions.map(
                    (question) => ({

                        id:
                            question.id,

                        category:
                            question.category,

                        question:
                            question.question,

                        option_a:
                            question.option_a,

                        option_b:
                            question.option_b,

                        option_c:
                            question.option_c,

                        option_d:
                            question.option_d,

                        difficulty:
                            question.difficulty

                    })
                );


            // =================================================
            // SEND QUESTIONS
            // =================================================

            return res.status(200).json({

                message:
                    "Technical assessment started successfully.",

                assessmentId,

                role,

                roleTitle:
                    roleConfig[role].title,

                user: {

                    id:
                        user.id,

                    fullname:
                        user.fullname,

                    email:
                        user.email

                },

                totalQuestions: 20,

                questions:
                    safeQuestions

            });

        } catch (error) {

            console.error(
                "Technical Assessment Start Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Failed to start technical assessment.",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// SUBMIT TECHNICAL ASSESSMENT
//
// POST
//
// /api/technical-assessment/submit
//
// BODY:
//
// {
//     "assessmentId": 12,
//     "answers": [
//         {
//             "questionId": 5,
//             "selectedOption": "A"
//         }
//     ]
// }
//
// =====================================================

router.post(
    "/submit",
    async (req, res) => {

        try {

            const {

                assessmentId,

                answers

            } = req.body;


            // =================================================
            // VALIDATE SUBMISSION
            // =================================================

            if (
                !assessmentId ||
                !Array.isArray(answers)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid assessment submission."

                });

            }


            // =================================================
            // GET ASSESSMENT
            // =================================================

            const assessmentResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        user_id,
                        role,
                        total_questions,
                        completed
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
                        "Assessment not found."

                });

            }


            const assessment =
                assessmentResult.rows[0];


            // =================================================
            // PREVENT DUPLICATE SUBMISSION
            // =================================================

            if (
                assessment.completed
            ) {

                return res.status(400).json({

                    message:
                        "This assessment has already been submitted."

                });

            }


            // =================================================
            // SCORE VARIABLES
            // =================================================

            let correctAnswers = 0;


            const categoryScores = {};


            const difficultyScores = {

                Easy: {
                    total: 0,
                    correct: 0
                },

                Medium: {
                    total: 0,
                    correct: 0
                },

                Difficult: {
                    total: 0,
                    correct: 0
                }

            };


            // =================================================
            // PROCESS ANSWERS
            // =================================================

            for (
                const answer
                of answers
            ) {

                const {

                    questionId,

                    selectedOption

                } = answer;


                // -------------------------------------------------
                // FIND QUESTION
                // -------------------------------------------------

                const questionResult =
                    await pool.query(
                        `
                        SELECT
                            id,
                            role,
                            category,
                            difficulty,
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


                // =================================================
                // SECURITY CHECK #1
                //
                // Question must belong to selected role.
                // =================================================

                if (
                    question.role !==
                    assessment.role
                ) {

                    continue;

                }


                // =================================================
                // CHECK ANSWER
                // =================================================

                const isCorrect =
                    question.correct_option ===
                    selectedOption;


                if (isCorrect) {

                    correctAnswers++;

                }


                // =================================================
                // SAVE ANSWER
                // =================================================

                await pool.query(
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

                        assessmentId,

                        questionId,

                        selectedOption ||
                            null,

                        isCorrect

                    ]
                );


                // =================================================
                // CATEGORY SCORE
                // =================================================

                if (
                    !categoryScores[
                        question.category
                    ]
                ) {

                    categoryScores[
                        question.category
                    ] = {

                        total: 0,

                        correct: 0

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


                // =================================================
                // DIFFICULTY SCORE
                // =================================================

                if (
                    difficultyScores[
                        question.difficulty
                    ]
                ) {

                    difficultyScores[
                        question.difficulty
                    ].total++;


                    if (isCorrect) {

                        difficultyScores[
                            question.difficulty
                        ].correct++;

                    }

                }

            }


            // =================================================
            // CALCULATE SCORE
            // =================================================

            const totalQuestions =
                Number(
                    assessment.total_questions
                );


            const score =
                totalQuestions > 0

                    ? Math.round(
                        (
                            correctAnswers /
                            totalQuestions
                        ) * 100
                    )

                    : 0;


            // =================================================
            // UPDATE ASSESSMENT
            // =================================================

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

                    assessmentId

                ]
            );


            // =================================================
            // CATEGORY RESULTS
            // =================================================

            const categoryResults =
                Object.entries(
                    categoryScores
                ).map(
                    ([
                        category,
                        data
                    ]) => {

                        const categoryScore =
                            data.total > 0

                                ? Math.round(
                                    (
                                        data.correct /
                                        data.total
                                    ) * 100
                                )

                                : 0;


                        return {

                            category,

                            total:
                                data.total,

                            correct:
                                data.correct,

                            score:
                                categoryScore

                        };

                    }
                );


            // =================================================
            // DIFFICULTY RESULTS
            // =================================================

            const difficultyResults =
                Object.entries(
                    difficultyScores
                ).map(
                    ([
                        difficulty,
                        data
                    ]) => {

                        const difficultyScore =
                            data.total > 0

                                ? Math.round(
                                    (
                                        data.correct /
                                        data.total
                                    ) * 100
                                )

                                : 0;


                        return {

                            difficulty,

                            total:
                                data.total,

                            correct:
                                data.correct,

                            score:
                                difficultyScore

                        };

                    }
                );


            // =================================================
            // PERFORMANCE LEVEL
            // =================================================

            let performanceLevel;


            if (
                score >= 80
            ) {

                performanceLevel =
                    "Strong";

            } else if (
                score >= 60
            ) {

                performanceLevel =
                    "Intermediate";

            } else {

                performanceLevel =
                    "Needs Improvement";

            }


            // =================================================
            // ROADMAP LEVEL
            // =================================================
            //
            // IMPORTANT:
            //
            // This is NOT a career recommendation.
            //
            // The student already selected their role.
            //
            // The result only tells them which stage of the
            // roadmap they should start from.
            //
            // =================================================

            let roadmapLevel;


            if (
                score < 40
            ) {

                roadmapLevel =
                    "Foundation";

            } else if (
                score < 70
            ) {

                roadmapLevel =
                    "Skill Building";

            } else {

                roadmapLevel =
                    "Placement Ready";

            }


            // =================================================
            // SEND RESULT
            // =================================================

            return res.status(200).json({

                message:
                    "Assessment submitted successfully.",

                result: {

                    assessmentId,

                    role:
                        assessment.role,

                    roleTitle:
                        roleConfig[
                            assessment.role
                        ].title,

                    totalQuestions,

                    correctAnswers,

                    score,

                    performanceLevel,

                    roadmapLevel,

                    categoryResults,

                    difficultyResults

                }

            });

        } catch (error) {

            console.error(
                "Submit Assessment Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Failed to submit technical assessment.",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// GET LATEST RESULT
//
// GET
//
// /api/technical-assessment/result/:email
//
// =====================================================

router.get(
    "/result/:email",
    async (req, res) => {

        try {

            const { email } =
                req.params;


            // =================================================
            // FIND USER
            // =================================================

            const userResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        fullname,
                        email
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
                        "User not found."

                });

            }


            const user =
                userResult.rows[0];


            // =================================================
            // GET LATEST COMPLETED ASSESSMENT
            // =================================================

            const assessmentResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        role,
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
                    [user.id]
                );


            if (
                assessmentResult.rows.length === 0
            ) {

                return res.status(404).json({

                    message:
                        "No completed assessment found."

                });

            }


            const assessment =
                assessmentResult.rows[0];


            // =================================================
            // CATEGORY SCORES
            // =================================================

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
                        ON q.id =
                        a.question_id

                    WHERE a.assessment_id = $1

                    GROUP BY q.category

                    ORDER BY q.category
                    `,
                    [assessment.id]
                );


            const categoryResults =
                categoryResult.rows.map(
                    (row) => {

                        const total =
                            Number(
                                row.total
                            );


                        const correct =
                            Number(
                                row.correct
                            );


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

                                    : 0

                        };

                    }
                );


            // =================================================
            // PERFORMANCE LEVEL
            // =================================================

            let performanceLevel;


            if (
                assessment.score >= 80
            ) {

                performanceLevel =
                    "Strong";

            } else if (
                assessment.score >= 60
            ) {

                performanceLevel =
                    "Intermediate";

            } else {

                performanceLevel =
                    "Needs Improvement";

            }


            // =================================================
            // ROADMAP LEVEL
            // =================================================

            let roadmapLevel;


            if (
                assessment.score < 40
            ) {

                roadmapLevel =
                    "Foundation";

            } else if (
                assessment.score < 70
            ) {

                roadmapLevel =
                    "Skill Building";

            } else {

                roadmapLevel =
                    "Placement Ready";

            }


            // =================================================
            // SEND RESULT
            // =================================================

            return res.status(200).json({

                user: {

                    id:
                        user.id,

                    fullname:
                        user.fullname,

                    email:
                        user.email

                },

                assessment: {

                    id:
                        assessment.id,

                    role:
                        assessment.role,

                    roleTitle:
                        roleConfig[
                            assessment.role
                        ]
                            ? roleConfig[
                                assessment.role
                            ].title
                            : assessment.role,

                    totalQuestions:
                        assessment.total_questions,

                    correctAnswers:
                        assessment.correct_answers,

                    score:
                        assessment.score,

                    completed:
                        assessment.completed,

                    completedAt:
                        assessment.completed_at,

                    performanceLevel,

                    roadmapLevel

                },

                categoryResults

            });

        } catch (error) {

            console.error(
                "Get Result Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Failed to get assessment result.",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// GET AVAILABLE ROLES
//
// GET
//
// /api/technical-assessment/roles
//
// =====================================================

router.get(
    "/roles",
    async (req, res) => {

        try {

            return res.status(200).json({

                roles: [

                    {
                        id:
                            "software-developer",

                        title:
                            "Software Developer"

                    },

                    {
                        id:
                            "data-analyst",

                        title:
                            "Data Analyst"

                    },

                    {
                        id:
                            "cybersecurity",

                        title:
                            "Cybersecurity"

                    },

                    {
                        id:
                            "cloud-devops",

                        title:
                            "Cloud / DevOps"

                    },

                    {
                        id:
                            "ui-ux",

                        title:
                            "UI/UX Designer"

                    }

                ]

            });

        } catch (error) {

            console.error(
                "Roles Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Failed to load roles."

            });

        }

    }
);


module.exports = router;