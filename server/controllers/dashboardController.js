const pool = require("../src/config/db");

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, name, email, created_at
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        const dashboard = {
            placementReadiness: 0,
            careerMatch: 0,
            roadmapProgress: 0,
            resumeScore: 0,
            skillsCompleted: 0,
            profileCompletion: 0
        };

        res.json({
            message: "Dashboard data fetched successfully",

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            },

            dashboard: dashboard
        });

    } catch (error) {
        console.error("Dashboard Error:", error);

        res.status(500).json({
            message: "Failed to fetch dashboard data"
        });
    }
};