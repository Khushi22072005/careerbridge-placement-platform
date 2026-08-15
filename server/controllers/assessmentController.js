// =====================================================
// SUBMIT CAREER ASSESSMENT
// =====================================================

const submitAssessment = async (req, res) => {
    try {
        console.log("=================================");
        console.log("CAREER ASSESSMENT SUBMIT");
        console.log("=================================");

        const { role, answers } = req.body;

        // -------------------------------------------------
        // VALIDATE ROLE
        // -------------------------------------------------

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Assessment role is required.",
            });
        }

        // -------------------------------------------------
        // VALIDATE ANSWERS
        // -------------------------------------------------

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Answers must be provided as an array.",
            });
        }

        if (answers.length !== 20) {
            return res.status(400).json({
                success: false,
                message: `Exactly 20 answers are required. Received ${answers.length}.`,
            });
        }

        console.log("Role:", role);
        console.log("Answers received:", answers.length);

        // -------------------------------------------------
        // GET QUESTIONS
        // -------------------------------------------------

        const questionIds = answers.map(
            (answer) => Number(answer.questionId)
        );

        if (questionIds.some(Number.isNaN)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID detected.",
            });
        }

        /*
         * IMPORTANT:
         * Replace `pool` import below with the same database
         * connection import already used by your assessment
         * questions route.
         */

        const { pool } = require("../config/db");

        const placeholders = questionIds
            .map((_, index) => `$${index + 1}`)
            .join(", ");

        const questionQuery = `
            SELECT
                id,
                role,
                category,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_answer,
                difficulty
            FROM questions
            WHERE id IN (${placeholders})
        `;

        const questionResult = await pool.query(
            questionQuery,
            questionIds
        );

        const questions = questionResult.rows;

        console.log(
            "Questions retrieved:",
            questions.length
        );

        // -------------------------------------------------
        // VERIFY EXACTLY 20 QUESTIONS
        // -------------------------------------------------

        if (questions.length !== 20) {
            return res.status(400).json({
                success: false,
                message:
                    "The assessment could not retrieve all 20 questions.",
            });
        }

        // -------------------------------------------------
        // VERIFY ROLE
        // -------------------------------------------------

        const normalizedRole =
            String(role)
                .trim()
                .toLowerCase();

        const invalidRoleQuestion =
            questions.find(
                (question) =>
                    String(question.role)
                        .trim()
                        .toLowerCase() !== normalizedRole
            );

        if (invalidRoleQuestion) {
            return res.status(400).json({
                success: false,
                message:
                    "One or more questions do not belong to the selected role.",
            });
        }

        // -------------------------------------------------
        // CREATE ANSWER MAP
        // -------------------------------------------------

        const answerMap = {};

        answers.forEach((answer) => {
            answerMap[Number(answer.questionId)] =
                String(answer.selectedOption)
                    .trim()
                    .toUpperCase();
        });

        // -------------------------------------------------
        // CATEGORY STORAGE
        // -------------------------------------------------

        const categoryStats = {};

        // -------------------------------------------------
        // OVERALL SCORE
        // -------------------------------------------------

        let correctCount = 0;

        // -------------------------------------------------
        // QUESTION-BY-QUESTION EVALUATION
        // -------------------------------------------------

        const evaluatedQuestions =
            questions.map((question) => {
                const selectedAnswer =
                    answerMap[Number(question.id)];

                const correctAnswer =
                    String(question.correct_answer)
                        .trim()
                        .toUpperCase();

                const isCorrect =
                    selectedAnswer === correctAnswer;

                if (isCorrect) {
                    correctCount++;
                }

                // ---------------------------------------------
                // CATEGORY
                // ---------------------------------------------

                const category =
                    question.category ||
                    "General";

                if (!categoryStats[category]) {
                    categoryStats[category] = {
                        category,
                        correct: 0,
                        total: 0,
                    };
                }

                categoryStats[category].total++;

                if (isCorrect) {
                    categoryStats[category].correct++;
                }

                return {
                    questionId: question.id,
                    category,
                    difficulty: question.difficulty,
                    selectedAnswer,
                    correctAnswer,
                    isCorrect,
                };
            });

        // -------------------------------------------------
        // OVERALL PERCENTAGE
        // -------------------------------------------------

        const totalQuestions = questions.length;

        const percentage =
            Math.round(
                (correctCount / totalQuestions) * 100
            );

        // -------------------------------------------------
        // PERFORMANCE LEVEL
        // -------------------------------------------------

        let performance;

        if (percentage >= 90) {
            performance = "Excellent";
        } else if (percentage >= 80) {
            performance = "Very Good";
        } else if (percentage >= 70) {
            performance = "Good";
        } else if (percentage >= 60) {
            performance = "Average";
        } else if (percentage >= 40) {
            performance = "Needs Improvement";
        } else {
            performance = "Beginner";
        }

        // -------------------------------------------------
        // CATEGORY PERFORMANCE
        // -------------------------------------------------

        const categoryPerformance =
            Object.values(categoryStats)
                .map((item) => {
                    const categoryPercentage =
                        Math.round(
                            (item.correct / item.total) *
                                100
                        );

                    let categoryLevel;

                    if (categoryPercentage >= 90) {
                        categoryLevel = "Excellent";
                    } else if (categoryPercentage >= 80) {
                        categoryLevel = "Very Good";
                    } else if (categoryPercentage >= 70) {
                        categoryLevel = "Good";
                    } else if (categoryPercentage >= 60) {
                        categoryLevel = "Average";
                    } else if (categoryPercentage >= 40) {
                        categoryLevel = "Needs Improvement";
                    } else {
                        categoryLevel = "Beginner";
                    }

                    return {
                        category: item.category,
                        correct: item.correct,
                        total: item.total,
                        percentage: categoryPercentage,
                        level: categoryLevel,
                    };
                })
                .sort(
                    (a, b) =>
                        b.percentage -
                        a.percentage
                );

        // -------------------------------------------------
        // DATA ANALYST CATEGORY DESCRIPTIONS
        // -------------------------------------------------

        const categoryInformation = {
            "SQL & Databases": {
                description:
                    "SQL querying, filtering, joins, grouping, aggregation and relational database concepts.",

                improvement:
                    "Strengthen SQL querying, joins, filtering, aggregation and relational database concepts.",

                topics: [
                    "SELECT & WHERE",
                    "JOINs",
                    "GROUP BY",
                    "Aggregations",
                    "Subqueries",
                ],
            },

            "Statistics & Data Analysis": {
                description:
                    "Descriptive statistics, probability, correlation and analytical reasoning.",

                improvement:
                    "Strengthen descriptive statistics, probability, correlation and statistical reasoning.",

                topics: [
                    "Mean & Median",
                    "Variance & Standard Deviation",
                    "Probability",
                    "Correlation",
                    "Hypothesis Testing",
                ],
            },

            "Python & Pandas": {
                description:
                    "Python programming, Pandas, data cleaning, transformation and dataset analysis.",

                improvement:
                    "Practice Python fundamentals, Pandas operations, data cleaning and data transformation.",

                topics: [
                    "Python Basics",
                    "Pandas",
                    "NumPy",
                    "Data Cleaning",
                    "Data Transformation",
                ],
            },

            "Data Visualization": {
                description:
                    "Charts, dashboards and visual interpretation of analytical results.",

                improvement:
                    "Improve chart selection, dashboard design and interpretation of visual patterns.",

                topics: [
                    "Charts",
                    "Dashboards",
                    "Visual Analysis",
                    "Power BI",
                    "Data Storytelling",
                ],
            },
        };

        // -------------------------------------------------
        // STRENGTHS
        // >= 80%
        // -------------------------------------------------

        const strengths =
            categoryPerformance
                .filter(
                    (category) =>
                        category.percentage >= 80
                )
                .map((category) => {
                    const info =
                        categoryInformation[
                            category.category
                        ];

                    return {
                        category:
                            category.category,

                        percentage:
                            category.percentage,

                        level:
                            category.level,

                        title:
                            category.category,

                        description:
                            info
                                ? `You demonstrated ${category.level.toLowerCase()} knowledge in ${category.category}.`
                                : `You demonstrated ${category.level.toLowerCase()} performance in this area.`,
                    };
                });

        // -------------------------------------------------
        // AREAS TO IMPROVE
        // < 70%
        // -------------------------------------------------

        const areasToImprove =
            categoryPerformance
                .filter(
                    (category) =>
                        category.percentage < 70
                )
                .map((category) => {
                    const info =
                        categoryInformation[
                            category.category
                        ];

                    return {
                        category:
                            category.category,

                        percentage:
                            category.percentage,

                        level:
                            category.level,

                        title:
                            category.category,

                        description:
                            info
                                ? info.improvement
                                : `Continue practicing ${category.category}.`,
                    };
                })
                .sort(
                    (a, b) =>
                        a.percentage -
                        b.percentage
                );

        // -------------------------------------------------
        // IF EVERYTHING IS ABOVE 70%
        // -------------------------------------------------

        if (areasToImprove.length === 0) {
            areasToImprove.push({
                category:
                    categoryPerformance[
                        categoryPerformance.length - 1
                    ]?.category ||
                    "Advanced Skills",

                percentage:
                    categoryPerformance[
                        categoryPerformance.length - 1
                    ]?.percentage || 0,

                level: "Good",

                title:
                    "Advanced Skill Development",

                description:
                    "Your core Data Analyst foundation is strong. Focus on advanced projects, real-world datasets and industry-level analytical problems.",
            });
        }

        // -------------------------------------------------
        // ROADMAP
        // -------------------------------------------------

        const roadmap =
            [...categoryPerformance]
                .sort(
                    (a, b) =>
                        a.percentage -
                        b.percentage
                )
                .map(
                    (
                        category,
                        index
                    ) => {
                        const info =
                            categoryInformation[
                                category.category
                            ];

                        return {
                            step: index + 1,

                            title:
                                category.category,

                            percentage:
                                category.percentage,

                            level:
                                category.level,

                            description:
                                info
                                    ? info.description
                                    : `Continue developing your ${category.category} skills.`,

                            topics:
                                info
                                    ? info.topics
                                    : [],
                        };
                    }
                );

        // -------------------------------------------------
        // OVERALL MESSAGE
        // -------------------------------------------------

        let overallMessage;

        if (percentage >= 90) {
            overallMessage =
                "You demonstrated excellent technical knowledge for the Data Analyst role.";
        } else if (percentage >= 80) {
            overallMessage =
                "You demonstrated very strong technical knowledge for the Data Analyst role.";
        } else if (percentage >= 70) {
            overallMessage =
                "You demonstrated a good technical foundation for the Data Analyst role.";
        } else if (percentage >= 60) {
            overallMessage =
                "You have a developing Data Analyst foundation. Strengthening the weaker categories will improve your readiness.";
        } else if (percentage >= 40) {
            overallMessage =
                "You have some foundational knowledge, but several Data Analyst areas require additional practice.";
        } else {
            overallMessage =
                "You should strengthen the core Data Analyst fundamentals before moving to advanced topics.";
        }

        // -------------------------------------------------
        // FINAL RESULT
        // -------------------------------------------------

        const result = {
            role: role,

            roleTitle: "Data Analyst",

            score: correctCount,

            total: totalQuestions,

            percentage,

            performance,

            overallMessage,

            categoryPerformance,

            strengths,

            areasToImprove,

            roadmap,

            evaluatedQuestions,
        };

        console.log(
            "================================="
        );

        console.log(
            "ASSESSMENT RESULT"
        );

        console.log(
            `Score: ${correctCount}/${totalQuestions}`
        );

        console.log(
            `Percentage: ${percentage}%`
        );

        console.log(
            `Performance: ${performance}`
        );

        console.log(
            "Category Performance:"
        );

        console.log(
            categoryPerformance
        );

        console.log(
            "================================="
        );

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        console.error(
            "================================="
        );

        console.error(
            "ASSESSMENT SUBMISSION ERROR"
        );

        console.error(
            error
        );

        console.error(
            "================================="
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to calculate assessment result.",
            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,
        });
    }
};

module.exports = {
    submitAssessment,
};