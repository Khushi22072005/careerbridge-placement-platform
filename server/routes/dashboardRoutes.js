const express = require("express");
const pool = require("../src/config/db");

const router = express.Router();

router.get("/:email", async (req, res) => {
    try {
        const { email } = req.params;

        const result = await pool.query(
            `SELECT id, fullname, email, role, created_at
             FROM users
             WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        res.json({
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            },

            dashboard: {
                placementReadiness: 68,
                careerMatch: 82,
                roadmapProgress: 46,
                resumeScore: 74,
                skillsCompleted: 14,
                profileCompletion: 75
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;