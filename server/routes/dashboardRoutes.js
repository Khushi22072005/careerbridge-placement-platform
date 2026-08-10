const express = require("express");
const router = express.Router();

const pool = require("../src/config/db");

// =====================================================
// GET DASHBOARD DATA
// GET /api/dashboard/:email
// =====================================================

router.get("/:email", async (req, res) => {
    try {
        const { email } = req.params;

        // =====================================================
        // 1. FIND USER
        // =====================================================

        const userResult = await pool.query(
            `
            SELECT
                id,
                fullname,
                email,
                role,
                created_at
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

        // =====================================================
        // 2. GET PROFILE
        // =====================================================

        const profileResult = await pool.query(
            `
            SELECT
                phone,
                college,
                degree,
                branch,
                graduation_year,
                skills,
                interests,
                preferred_roles,
                preferred_locations
            FROM profiles
            WHERE user_id = $1
            `,
            [user.id]
        );

        const profile =
            profileResult.rows.length > 0
                ? profileResult.rows[0]
                : null;

        // =====================================================
        // 3. GET LATEST CAREER ASSESSMENT
        // =====================================================

        const assessmentResult = await pool.query(
            `
            SELECT
                career_interest,
                recommended_career,
                career_match,
                technical_score,
                problem_solving_score,
                communication_score
            FROM career_assessments
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [user.id]
        );

        const assessment =
            assessmentResult.rows.length > 0
                ? assessmentResult.rows[0]
                : null;

        // =====================================================
        // 4. GET ROADMAP PROGRESS
        // =====================================================

        const roadmapResult = await pool.query(
            `
            SELECT
                career_assessment_completed,
                skill_gap_completed,
                learning_path_completed,
                placement_preparation_completed
            FROM roadmap_progress
            WHERE user_id = $1
            LIMIT 1
            `,
            [user.id]
        );

        const roadmapProgressData =
            roadmapResult.rows.length > 0
                ? roadmapResult.rows[0]
                : null;

        // =====================================================
        // 5. CALCULATE ROADMAP PROGRESS
        // =====================================================

        let roadmapProgress = 0;

        if (roadmapProgressData) {

            const roadmapSteps = [
                roadmapProgressData.career_assessment_completed,
                roadmapProgressData.skill_gap_completed,
                roadmapProgressData.learning_path_completed,
                roadmapProgressData.placement_preparation_completed,
            ];

            const completedSteps =
                roadmapSteps.filter(Boolean).length;

            roadmapProgress = Math.round(
                (completedSteps / roadmapSteps.length) * 100
            );
        }

        // =====================================================
        // 6. GET RESUME SCORE
        // =====================================================

        const resumeResult = await pool.query(
            `
            SELECT
                resume_score
            FROM resumes
            WHERE user_id = $1
            ORDER BY updated_at DESC
            LIMIT 1
            `,
            [user.id]
        );

        const resumeScore =
            resumeResult.rows.length > 0
                ? Number(
                    resumeResult.rows[0].resume_score
                ) || 0
                : 0;

        // =====================================================
        // 7. GET USER TASKS
        // =====================================================

        const tasksResult = await pool.query(
            `
            SELECT
                id,
                task_text,
                completed,
                created_at
            FROM dashboard_tasks
            WHERE user_id = $1
            ORDER BY created_at ASC
            `,
            [user.id]
        );

        const tasks = tasksResult.rows.map((task) => ({
            id: task.id,
            text: task.task_text,
            completed: task.completed,
        }));

        // =====================================================
        // 8. CALCULATE PROFILE COMPLETION
        // =====================================================

        let profileCompletion = 0;

        if (profile) {

            const profileFields = [
                profile.phone,
                profile.college,
                profile.degree,
                profile.branch,
                profile.graduation_year,
                profile.skills,
                profile.interests,
                profile.preferred_roles,
                profile.preferred_locations,
            ];

            const completedFields =
                profileFields.filter((field) => {

                    if (
                        field === null ||
                        field === undefined ||
                        field === ""
                    ) {
                        return false;
                    }

                    if (
                        Array.isArray(field) &&
                        field.length === 0
                    ) {
                        return false;
                    }

                    return true;
                }).length;

            profileCompletion = Math.round(
                (completedFields / profileFields.length) * 100
            );
        }

        // =====================================================
        // 9. CALCULATE SKILLS COMPLETED
        // =====================================================

        const skillsCompleted =
            profile &&
            Array.isArray(profile.skills)
                ? profile.skills.length
                : 0;

        // =====================================================
        // 10. CALCULATE CAREER MATCH
        // =====================================================

        const careerMatch =
            Number(assessment?.career_match) || 0;

        // =====================================================
        // 11. CALCULATE PLACEMENT READINESS
        // =====================================================

        const placementReadiness = Math.round(
            (
                careerMatch +
                profileCompletion +
                roadmapProgress +
                resumeScore
            ) / 4
        );

        // =====================================================
        // 12. SMART RECOMMENDATION
        // =====================================================

        let recommendation;

        if (!assessment) {

            recommendation = {
                title:
                    "Complete your career assessment",

                description:
                    "Complete your career assessment to receive personalized career recommendations.",

                action:
                    "Take Assessment",
            };

        } else if (
            Number(
                assessment.problem_solving_score
            ) < 60
        ) {

            recommendation = {
                title:
                    "Strengthen your problem-solving skills",

                description:
                    "Improving your problem-solving skills can increase your placement readiness.",

                action:
                    "Start Learning",
            };

        } else if (
            Number(
                assessment.technical_score
            ) < 60
        ) {

            recommendation = {
                title:
                    "Improve your technical skills",

                description:
                    "Strengthening your technical skills can improve your career readiness.",

                action:
                    "Start Learning",
            };

        } else if (
            Number(
                assessment.communication_score
            ) < 60
        ) {

            recommendation = {
                title:
                    "Improve your communication skills",

                description:
                    "Good communication skills are important for placements and interviews.",

                action:
                    "Start Learning",
            };

        } else {

            recommendation = {
                title:
                    "Continue your placement preparation",

                description:
                    "Your assessment results are looking good. Continue developing your skills.",

                action:
                    "Continue Learning",
            };
        }

        // =====================================================
        // 13. CAREER DATA
        // =====================================================

        const career = {
            title:
                assessment?.recommended_career ||
                "Complete Career Assessment",

            match:
                careerMatch,

            skills:
                Array.isArray(profile?.skills)
                    ? profile.skills
                    : [],
        };

        // =====================================================
        // 14. ROADMAP
        // =====================================================

        const roadmap = [

            {
                number: "01",

                title:
                    "Career Assessment",

                status:
                    roadmapProgressData
                        ?.career_assessment_completed
                        ? "Completed"
                        : "Pending",

                completed:
                    !!roadmapProgressData
                        ?.career_assessment_completed,

                active:
                    !roadmapProgressData
                        ?.career_assessment_completed,
            },

            {
                number: "02",

                title:
                    "Skill Gap Analysis",

                status:
                    roadmapProgressData
                        ?.skill_gap_completed
                        ? "Completed"
                        : roadmapProgressData
                            ?.career_assessment_completed
                        ? "Currently working"
                        : "Upcoming",

                completed:
                    !!roadmapProgressData
                        ?.skill_gap_completed,

                active:
                    !!roadmapProgressData
                        ?.career_assessment_completed &&
                    !roadmapProgressData
                        ?.skill_gap_completed,
            },

            {
                number: "03",

                title:
                    "Learning Path",

                status:
                    roadmapProgressData
                        ?.learning_path_completed
                        ? "Completed"
                        : roadmapProgressData
                            ?.skill_gap_completed
                        ? "Currently working"
                        : "Upcoming",

                completed:
                    !!roadmapProgressData
                        ?.learning_path_completed,

                active:
                    !!roadmapProgressData
                        ?.skill_gap_completed &&
                    !roadmapProgressData
                        ?.learning_path_completed,
            },

            {
                number: "04",

                title:
                    "Placement Preparation",

                status:
                    roadmapProgressData
                        ?.placement_preparation_completed
                        ? "Completed"
                        : roadmapProgressData
                            ?.learning_path_completed
                        ? "Currently working"
                        : "Upcoming",

                completed:
                    !!roadmapProgressData
                        ?.placement_preparation_completed,

                active:
                    !!roadmapProgressData
                        ?.learning_path_completed &&
                    !roadmapProgressData
                        ?.placement_preparation_completed,
            },
        ];

        // =====================================================
        // 15. DASHBOARD DATA
        // =====================================================

        const dashboard = {

            placementReadiness,

            careerMatch,

            roadmapProgress,

            resumeScore,

            skillsCompleted,

            profileCompletion,

            career,

            roadmap,

            tasks,

            recommendation,
        };

        // =====================================================
        // 16. SEND RESPONSE
        // =====================================================

        return res.status(200).json({

            user,

            profile,

            assessment,

            dashboard,

        });

    } catch (error) {

        console.error(
            "Dashboard API Error:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to load dashboard",

            error:
                error.message,

        });
    }
});

module.exports = router;