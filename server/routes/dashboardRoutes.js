const express = require("express");
const router = express.Router();

const pool = require("../src/config/db");

// ==========================================
// GET DASHBOARD DATA
// GET /api/dashboard/:email
// ==========================================

router.get("/:email", async (req, res) => {
    try {
        const { email } = req.params;

        // ==========================================
        // 1. FIND USER
        // ==========================================

        const userResult = await pool.query(
            `
            SELECT id, fullname, email, role, created_at
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

        // ==========================================
        // 2. GET PROFILE
        // ==========================================

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

        // ==========================================
        // 3. CALCULATE PROFILE COMPLETION
        // ==========================================

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

           const completedFields = profileFields.filter((field) => {
    if (
        field === null ||
        field === undefined ||
        field === ""
    ) {
        return false;
    }

    // PostgreSQL empty array
    if (Array.isArray(field) && field.length === 0) {
        return false;
    }

    return true;
}).length;

            profileCompletion = Math.round(
                (completedFields / profileFields.length) * 100
            );
        }
        // ==========================================
// 3.1 CALCULATE SKILLS COMPLETED
// ==========================================

const skillsCompleted =
    profile && Array.isArray(profile.skills)
        ? profile.skills.length
        : 0;

        // ==========================================
        // 4. DASHBOARD DATA
        // ==========================================

        const dashboard = {

            // --------------------------------------
            // These will become dynamic later
            // --------------------------------------

            placementReadiness: 68,

            careerMatch: 82,

            roadmapProgress: 46,

            resumeScore: 74,

            skillsCompleted,

            // --------------------------------------
            // NOW DYNAMIC
            // --------------------------------------

            profileCompletion,

            // ======================================
            // CAREER
            // ======================================

            career: {
                title: "Software Developer",

                match: 82,

                skills: [
                    "JavaScript",
                    "React",
                    "SQL",
                    "Problem Solving",
                ],

                companies: [
                    "Google",
                    "Microsoft",
                    "Accenture",
                ],
            },

            // ======================================
            // ROADMAP
            // ======================================

            roadmap: [
                {
                    number: "01",
                    title: "Career Assessment",
                    status: "Completed",
                    completed: true,
                    active: false,
                },

                {
                    number: "02",
                    title: "Skill Gap Analysis",
                    status: "Currently working",
                    completed: false,
                    active: true,
                },

                {
                    number: "03",
                    title: "Learning Path",
                    status: "Upcoming",
                    completed: false,
                    active: false,
                },

                {
                    number: "04",
                    title: "Placement Preparation",
                    status: "Upcoming",
                    completed: false,
                    active: false,
                },
            ],

            // ======================================
            // TODAY'S TASKS
            // ======================================

            tasks: [
                {
                    id: 1,
                    text: "Complete career assessment",
                    completed: true,
                },

                {
                    id: 2,
                    text: "Improve JavaScript skills",
                    completed: false,
                },

                {
                    id: 3,
                    text: "Update resume projects",
                    completed: false,
                },

                {
                    id: 4,
                    text: "Practice mock interview",
                    completed: false,
                },
            ],

            // ======================================
            // SMART RECOMMENDATION
            // ======================================

            recommendation: {
                title: "Strengthen your DSA skills",

                description:
                    "Software Developer roles commonly require strong problem-solving and data structure knowledge.",

                action: "Start Learning",
            },
        };

        // ==========================================
        // 5. SEND RESPONSE
        // ==========================================

        res.status(200).json({
            user,
            profile,
            dashboard,
        });

    } catch (error) {

        console.error(
            "Dashboard API Error:",
            error
        );

        res.status(500).json({
            message: "Failed to load dashboard",
            error: error.message,
        });
    }
});

module.exports = router;