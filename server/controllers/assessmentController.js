// =====================================================
// CAREER ASSESSMENT SUBMIT CONTROLLER
// =====================================================

const { pool } = require("../config/db");

// =====================================================
// ROLE MAP
// URL role key -> role name stored in the database
// Keep these keys consistent with your questions route
// and frontend.
// =====================================================

const roleMap = {
    "software-developer": "Software Developer",
    "data-analyst": "Data Analyst",
    "cybersecurity": "Cybersecurity",
    "cloud-devops": "Cloud / DevOps",
    "ui-ux": "UI/UX Designer",
};

// =====================================================
// SKILL MAP
// Skill names must match the category values used by
// the questions table for this assessment flow.
// =====================================================

const skillMap = {
    "Software Developer": [
        "Java",
        "Python",
        "JavaScript",
        "C++",
        "C#",
        "TypeScript",
    ],
    "Data Analyst": [
        "SQL",
        "Python",
        "Excel",
        "Power BI",
        "Tableau",
        "R",
        "Statistics",
    ],
    "Cybersecurity": [
        "Python",
        "Linux",
        "Networking",
        "SQL",
        "Bash/Shell",
        "PowerShell",
    ],
    "Cloud / DevOps": [
        "Linux",
        "AWS",
        "Azure",
        "Docker",
        "Kubernetes",
        "Terraform",
        "Python",
        "Bash/Shell",
    ],
    "UI/UX Designer": [
        "Figma",
        "UI Design",
        "UX Design",
        "User Research",
        "Prototyping",
        "HTML/CSS",
        "Design Systems",
    ],
};

// =====================================================
// CATEGORY INFORMATION
// Optional descriptive information for Data Analyst
// category names. Other categories use fallback text.
// =====================================================

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

// =====================================================
// HELPER: GET PERFORMANCE LEVEL
// =====================================================

const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) {
        return "Excellent";
    }

    if (percentage >= 80) {
        return "Very Good";
    }

    if (percentage >= 70) {
        return "Good";
    }

    if (percentage >= 60) {
        return "Average";
    }

    if (percentage >= 40) {
        return "Needs Improvement";
    }

    return "Beginner";
};

// =====================================================
// HELPER: GET OVERALL MESSAGE
// =====================================================

const getOverallMessage = (percentage, roleTitle, skill) => {
    if (percentage >= 90) {
        return `You demonstrated excellent knowledge in ${skill} for the ${roleTitle} role.`;
    }

    if (percentage >= 80) {
        return `You demonstrated very strong knowledge in ${skill} for the ${roleTitle} role.`;
    }

    if (percentage >= 70) {
        return `You demonstrated a good foundation in ${skill} for the ${roleTitle} role.`;
    }

    if (percentage >= 60) {
        return `You have a developing foundation in ${skill}. Practicing the areas that need improvement can help strengthen your knowledge.`;
    }

    if (percentage >= 40) {
        return `You have some foundational knowledge in ${skill}, but further practice is needed.`;
    }

    return `Focus on strengthening the fundamentals of ${skill} before moving to advanced topics.`;
};

// =====================================================
// HELPER: GET CATEGORY DESCRIPTION
// =====================================================

const getCategoryDescription = (category) => {
    const info = categoryInformation[category];

    if (info) {
        return info.description;
    }

    return `This section covers your performance in ${category}.`;
};

// =====================================================
// HELPER: GET CATEGORY IMPROVEMENT
// =====================================================

const getCategoryImprovement = (category) => {
    const info = categoryInformation[category];

    if (info) {
        return info.improvement;
    }

    return `Continue practicing ${category} to improve your understanding.`;
};

// =====================================================
// HELPER: GET CATEGORY TOPICS
// =====================================================

const getCategoryTopics = (category) => {
    const info = categoryInformation[category];

    if (info) {
        return info.topics;
    }

    return [];
};

// =====================================================
// SUBMIT CAREER ASSESSMENT
// POST /api/assessment/submit
//
// Expected request body:
// {
//     "role": "data-analyst",
//     "skill": "Python",
//     "answers": [
//         {
//             "questionId": 1,
//             "selectedOption": "A"
//         }
//     ]
// }
//
// Exactly 20 answer objects are required.
// =====================================================

const submitAssessment = async (req, res) => {
    try {
        console.log("=================================");
        console.log("CAREER ASSESSMENT SUBMIT");
        console.log("=================================");

        const { role, skill, answers } = req.body;

        // -------------------------------------------------
        // VALIDATE ROLE
        // -------------------------------------------------

        if (!role || typeof role !== "string") {
            return res.status(400).json({
                success: false,
                message: "Assessment role is required.",
            });
        }

        const selectedRole = roleMap[role];

        if (!selectedRole) {
            return res.status(400).json({
                success: false,
                message: "Invalid career role.",
            });
        }

        // -------------------------------------------------
        // VALIDATE SKILL
        // -------------------------------------------------

        if (!skill || typeof skill !== "string") {
            return res.status(400).json({
                success: false,
                message: "Assessment skill is required.",
            });
        }

        if (!skillMap[selectedRole]?.includes(skill)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill selected for this role.",
            });
        }

        // -------------------------------------------------
        // VALIDATE ANSWERS ARRAY
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

        console.log("Role:", selectedRole);
        console.log("Skill:", skill);
        console.log("Answers received:", answers.length);

        // -------------------------------------------------
        // VALIDATE QUESTION IDS
        // -------------------------------------------------

        const questionIds = answers.map((answer) => {
            if (
                !answer ||
                answer.questionId === undefined ||
                answer.questionId === null ||
                answer.questionId === ""
            ) {
                return NaN;
            }

            return Number(answer.questionId);
        });

        if (
            questionIds.some(
                (id) => !Number.isInteger(id) || id <= 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID detected.",
            });
        }

        // Reject repeated question IDs
        if (new Set(questionIds).size !== 20) {
            return res.status(400).json({
                success: false,
                message: "Assessment contains duplicate questions.",
            });
        }

        // -------------------------------------------------
        // VALIDATE SELECTED OPTIONS
        // -------------------------------------------------

        const validOptions = ["A", "B", "C", "D"];

        const invalidAnswer = answers.some((answer) => {
            const selectedOption = String(
                answer?.selectedOption ?? ""
            )
                .trim()
                .toUpperCase();

            return !validOptions.includes(selectedOption);
        });

        if (invalidAnswer) {
            return res.status(400).json({
                success: false,
                message:
                    "Every answer must contain a valid option: A, B, C, or D.",
            });
        }

        // -------------------------------------------------
        // FETCH QUESTIONS FOR THIS ROLE AND SKILL
        // -------------------------------------------------

        const placeholders = questionIds
            .map((_, index) => `$${index + 1}`)
            .join(", ");

        const rolePlaceholder = `$${questionIds.length + 1}`;
        const skillPlaceholder = `$${questionIds.length + 2}`;

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
                correct_option,
                difficulty
            FROM career_assessment_questions
            WHERE id IN (${placeholders})
              AND role = ${rolePlaceholder}
              AND category = ${skillPlaceholder}
        `;

        const questionResult = await pool.query(
            questionQuery,
            [...questionIds, selectedRole, skill]
        );

        const questions = questionResult.rows;

        console.log("Questions retrieved:", questions.length);

        // -------------------------------------------------
        // VERIFY EXACTLY 20 MATCHING QUESTIONS
        // -------------------------------------------------

        if (questions.length !== 20) {
            return res.status(400).json({
                success: false,
                message:
                    "One or more submitted questions do not belong to the selected role and skill.",
            });
        }

        // -------------------------------------------------
        // CREATE QUESTION MAP
        // -------------------------------------------------

        const questionMap = new Map();

        questions.forEach((question) => {
            questionMap.set(Number(question.id), question);
        });

        // -------------------------------------------------
        // CREATE ANSWER MAP
        // -------------------------------------------------

        const answerMap = new Map();

        answers.forEach((answer) => {
            answerMap.set(
                Number(answer.questionId),
                String(answer.selectedOption)
                    .trim()
                    .toUpperCase()
            );
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

        const evaluatedQuestions = questionIds.map((questionId) => {
            const question = questionMap.get(questionId);

            if (!question) {
                throw new Error(
                    `Question ${questionId} was not found during evaluation.`
                );
            }

            const selectedAnswer = answerMap.get(questionId);

            const correctAnswer = String(
                question.correct_option ?? ""
            )
                .trim()
                .toUpperCase();

            const isCorrect = selectedAnswer === correctAnswer;

            if (isCorrect) {
                correctCount++;
            }

            const category = question.category || "General";

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

        const totalQuestions = evaluatedQuestions.length;

        const percentage = Math.round(
            (correctCount / totalQuestions) * 100
        );

        // -------------------------------------------------
        // PERFORMANCE LEVEL
        // -------------------------------------------------

        const performance = getPerformanceLevel(percentage);

        // -------------------------------------------------
        // CATEGORY PERFORMANCE
        // -------------------------------------------------

        const categoryPerformance = Object.values(categoryStats)
            .map((item) => {
                const categoryPercentage = Math.round(
                    (item.correct / item.total) * 100
                );

                return {
                    category: item.category,
                    correct: item.correct,
                    total: item.total,
                    percentage: categoryPercentage,
                    level: getPerformanceLevel(categoryPercentage),
                };
            })
            .sort((a, b) => b.percentage - a.percentage);

        // -------------------------------------------------
        // STRENGTHS
        // Categories with 80% or above
        // -------------------------------------------------

        const strengths = categoryPerformance
            .filter((category) => category.percentage >= 80)
            .map((category) => ({
                category: category.category,
                percentage: category.percentage,
                level: category.level,
                title: category.category,
                description:
                    `You demonstrated ${category.level.toLowerCase()} knowledge in ${category.category}.`,
            }));

        // -------------------------------------------------
        // AREAS TO IMPROVE
        // Categories below 70%
        // -------------------------------------------------

        const areasToImprove = categoryPerformance
            .filter((category) => category.percentage < 70)
            .map((category) => ({
                category: category.category,
                percentage: category.percentage,
                level: category.level,
                title: category.category,
                description: getCategoryImprovement(
                    category.category
                ),
            }))
            .sort((a, b) => a.percentage - b.percentage);

        // If no category is below 70%, suggest continued
        // development in the lowest-scoring category.
        if (areasToImprove.length === 0 && categoryPerformance.length > 0) {
            const lowestCategory =
                [...categoryPerformance].sort(
                    (a, b) => a.percentage - b.percentage
                )[0];

            areasToImprove.push({
                category: lowestCategory.category,
                percentage: lowestCategory.percentage,
                level: lowestCategory.level,
                title: "Further Skill Development",
                description:
                    `Continue developing your ${skill} knowledge with practice questions and practical exercises.`,
            });
        }

        // -------------------------------------------------
        // ROADMAP
        // Lowest-scoring categories appear first.
        // -------------------------------------------------

        const roadmap = [...categoryPerformance]
            .sort((a, b) => a.percentage - b.percentage)
            .map((category, index) => ({
                step: index + 1,
                title: category.category,
                percentage: category.percentage,
                level: category.level,
                description: getCategoryDescription(
                    category.category
                ),
                topics: getCategoryTopics(category.category),
            }));

        // -------------------------------------------------
        // OVERALL MESSAGE
        // -------------------------------------------------

        const overallMessage = getOverallMessage(
            percentage,
            selectedRole,
            skill
        );

        // -------------------------------------------------
        // FINAL RESULT
        // -------------------------------------------------

        const result = {
            role,
            roleTitle: selectedRole,
            skill,

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

            completedAt: new Date().toISOString(),
        };

        // -------------------------------------------------
        // LOG RESULT
        // -------------------------------------------------

        console.log("=================================");
        console.log("ASSESSMENT RESULT");
        console.log(`Role: ${selectedRole}`);
        console.log(`Skill: ${skill}`);
        console.log(`Score: ${correctCount}/${totalQuestions}`);
        console.log(`Percentage: ${percentage}%`);
        console.log(`Performance: ${performance}`);
        console.log("Category Performance:");
        console.log(categoryPerformance);
        console.log("=================================");

        // -------------------------------------------------
        // SEND RESPONSE
        // -------------------------------------------------

        return res.status(200).json({
            success: true,
            result,
        });

    } catch (error) {
        console.error("=================================");
        console.error("ASSESSMENT SUBMISSION ERROR");
        console.error(error);
        console.error("=================================");

        return res.status(500).json({
            success: false,
            message: "Unable to calculate assessment result.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {
    submitAssessment,
};