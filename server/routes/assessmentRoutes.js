const express = require("express");
const router = express.Router();

const pool = require("../src/config/db");
const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// ROLE MAP
// URL role key -> role name stored in the database
// =====================================================

const roleMap = {
    "software-developer": "Software Developer",
    "data-analyst": "Data Analyst",
    "cybersecurity": "Cybersecurity",
    "cloud-devops": "Cloud / DevOps",
    "ui-ux": "UI/UX Designer"
};

// =====================================================
// SKILL MAP
// Skill names must match the question table's category
// values exactly.
// =====================================================

const skillMap = {
    "Software Developer": [
        "Java",
        "Python",
        "JavaScript",
        "C++",
        "C#",
        "TypeScript"
    ],

    "Data Analyst": [
        "SQL",
        "Python",
        "Excel",
        "Power BI",
        "Tableau",
        "R"
    ],

    "Cybersecurity": [
        "Python",
        "Linux",
        "Networking",
        "SQL",
        "Bash/Shell",
        "PowerShell"
    ],

    "Cloud / DevOps": [
        "Linux",
        "AWS",
        "Azure",
        "Docker",
        "Kubernetes",
        "Terraform",
        "Python",
        "Bash/Shell"
    ],

    "UI/UX Designer": [
        "Figma",
        "UI Design",
        "UX Design",
        "User Research",
        "Prototyping",
        "HTML/CSS",
        "Design Systems"
    ]
};

const REQUIRED_QUESTIONS = 20;
const VALID_OPTIONS = ["A", "B", "C", "D"];

// =====================================================
// GET AVAILABLE SKILLS FOR A ROLE
// GET /api/assessment/skills/:role
// =====================================================

router.get("/skills/:role", async (req, res) => {
    try {
        const { role } = req.params;
        const selectedRole = roleMap[role];

        if (!selectedRole) {
            return res.status(400).json({
                message: "Invalid career role."
            });
        }

        // Only return skills with at least 20 questions.
        // The frontend can display these as selectable options.
        const result = await pool.query(
            `
            SELECT
                category,
                COUNT(*)::int AS question_count
            FROM career_assessment_questions
            WHERE role = $1
            GROUP BY category
            `,
            [selectedRole]
        );

        const countsBySkill = new Map(
            result.rows.map(row => [
                row.category,
                Number(row.question_count)
            ])
        );

        const availableSkills = (skillMap[selectedRole] || [])
            .filter(skill =>
                (countsBySkill.get(skill) || 0) >= REQUIRED_QUESTIONS
            );

        return res.status(200).json({
            role,
            roleName: selectedRole,
            requiredQuestions: REQUIRED_QUESTIONS,
            skills: availableSkills
        });
    } catch (error) {
        console.error("Career assessment skills error:", error);

        return res.status(500).json({
            message: "Failed to load available assessment skills."
        });
    }
});

// =====================================================
// GET QUESTIONS FOR A SELECTED ROLE AND SKILL
// GET /api/assessment/questions/:role/:skill
//
// Example:
// /api/assessment/questions/data-analyst/Python
// =====================================================

router.get("/questions/:role/:skill", async (req, res) => {
    try {
        const { role, skill } = req.params;
        const selectedRole = roleMap[role];

        if (!selectedRole) {
            return res.status(400).json({
                message: "Invalid career role."
            });
        }

        if (!skillMap[selectedRole]?.includes(skill)) {
            return res.status(400).json({
                message: "Invalid skill selected for this role."
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
              AND category = $2
            ORDER BY RANDOM()
            LIMIT $3
            `,
            [selectedRole, skill, REQUIRED_QUESTIONS]
        );

        if (result.rows.length !== REQUIRED_QUESTIONS) {
            return res.status(400).json({
                message:
                    `Only ${result.rows.length} questions are available for ${selectedRole} - ${skill}. Exactly ${REQUIRED_QUESTIONS} are required.`,
                role,
                roleName: selectedRole,
                skill,
                totalQuestions: result.rows.length
            });
        }

        return res.status(200).json({
            role,
            roleName: selectedRole,
            skill,
            totalQuestions: result.rows.length,
            questions: result.rows
        });
    } catch (error) {
        console.error("Career assessment questions error:", error);

        return res.status(500).json({
            message: "Failed to load career assessment questions."
        });
    }
});

// =====================================================
// SUBMIT CAREER ASSESSMENT
// POST /api/assessment/submit
//
// Expected request body:
// {
//   "role": "data-analyst",
//   "skill": "Python",
//   "answers": [
//     { "questionId": 1, "selectedOption": "A" }
//   ]
// }
// =====================================================

router.post("/submit", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { role, skill, answers } = req.body;

        // Validate role
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

        // Validate skill
        if (!skill) {
            return res.status(400).json({
                message: "Assessment skill is required."
            });
        }

        if (!skillMap[selectedRole]?.includes(skill)) {
            return res.status(400).json({
                message: "Invalid skill selected for this role."
            });
        }

        // Validate answers array
        if (!Array.isArray(answers)) {
            return res.status(400).json({
                message: "Answers must be an array."
            });
        }

        if (answers.length !== REQUIRED_QUESTIONS) {
            return res.status(400).json({
                message:
                    `Assessment must contain exactly ${REQUIRED_QUESTIONS} answers. Received ${answers.length}.`
            });
        }

        // Validate question IDs and selected options
        for (const answer of answers) {
            if (
                !answer ||
                answer.questionId === undefined ||
                answer.questionId === null ||
                answer.questionId === ""
            ) {
                return res.status(400).json({
                    message: "Every answer must contain a questionId."
                });
            }

            const questionId = Number(answer.questionId);

            if (!Number.isInteger(questionId) || questionId <= 0) {
                return res.status(400).json({
                    message: "Every answer must contain a valid questionId."
                });
            }

            if (!VALID_OPTIONS.includes(answer.selectedOption)) {
                return res.status(400).json({
                    message:
                        "Every answer must contain a valid option: A, B, C, or D."
                });
            }
        }

        const questionIds = answers.map(answer =>
            Number(answer.questionId)
        );

        const uniqueQuestionIds = new Set(questionIds);

        if (uniqueQuestionIds.size !== REQUIRED_QUESTIONS) {
            return res.status(400).json({
                message: "Assessment contains duplicate questions."
            });
        }

        // Fetch and verify submitted questions
        const questionResult = await pool.query(
            `
            SELECT
                id,
                role,
                category,
                correct_option
            FROM career_assessment_questions
            WHERE id = ANY($1::integer[])
              AND role = $2
              AND category = $3
            `,
            [questionIds, selectedRole, skill]
        );

        if (questionResult.rows.length !== REQUIRED_QUESTIONS) {
            return res.status(400).json({
                message:
                    "One or more questions do not belong to the selected role and skill."
            });
        }

        // Create question lookup map
        const questionLookup = new Map();

        questionResult.rows.forEach(question => {
            questionLookup.set(Number(question.id), question);
        });

        // Calculate score
        let correctAnswers = 0;
        const categoryScores = {};

        for (const answer of answers) {
            const questionId = Number(answer.questionId);
            const question = questionLookup.get(questionId);

            if (!question) {
                return res.status(400).json({
                    message: "Invalid question submitted."
                });
            }

            const isCorrect =
                question.correct_option === answer.selectedOption;

            if (isCorrect) {
                correctAnswers++;
            }

            const category = question.category || "General";

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

        // Calculate overall score
        const totalQuestions = answers.length;
        const incorrectAnswers = totalQuestions - correctAnswers;

        const score = Math.round(
            (correctAnswers / totalQuestions) * 100
        );

        // Build category results
        const categoryResults = Object.entries(categoryScores)
            .map(([category, data]) => {
                const categoryScore = Math.round(
                    (data.correct / data.total) * 100
                );

                return {
                    category,
                    correct: data.correct,
                    total: data.total,
                    score: categoryScore
                };
            });

        // Determine performance level
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

        // Save result for logged-in user
        await pool.query(
            `
            INSERT INTO career_assessment_results
            (
                user_id,
                role,
                role_name,
                assessment_skill,
                total_questions,
                correct_answers,
                incorrect_answers,
                score,
                performance_level,
                category_results
            )
            VALUES
            (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10
            )
            `,
            [
                userId,
                role,
                selectedRole,
                skill,
                totalQuestions,
                correctAnswers,
                incorrectAnswers,
                score,
                performanceLevel,
                JSON.stringify(categoryResults)
            ]
        );

        // Build response
        const result = {
            role,
            roleName: selectedRole,
            skill,
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            score,
            performanceLevel,
            categoryResults,
            completedAt: new Date().toISOString()
        };

        return res.status(200).json({
            message: "Career assessment submitted successfully.",
            result
        });
    } catch (error) {
        console.error("Career assessment submission error:", error);

        return res.status(500).json({
            message: "Failed to submit career assessment."
        });
    }
});

module.exports = router;