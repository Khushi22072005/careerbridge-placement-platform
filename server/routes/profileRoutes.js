const express = require("express");
const router = express.Router();
const pool = require("../src/config/db");


// =====================================================
// GET PROFILE
// GET /api/profile/:email
// =====================================================

router.get("/:email", async (req, res) => {
    try {
        const { email } = req.params;

        // ---------------------------------------------
        // 1. Find user
        // ---------------------------------------------

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

        // ---------------------------------------------
        // 2. Find profile
        // ---------------------------------------------

        const profileResult = await pool.query(
            `
            SELECT
                id,
                user_id,
                phone,
                college,
                degree,
                branch,
                graduation_year,
                skills,
                interests,
                preferred_roles,
                preferred_locations,
                created_at,
                updated_at
            FROM profiles
            WHERE user_id = $1
            `,
            [user.id]
        );

        // ---------------------------------------------
        // 3. Profile doesn't exist yet
        // ---------------------------------------------

        if (profileResult.rows.length === 0) {
            return res.status(200).json({
                user,
                profile: null,
            });
        }

        // ---------------------------------------------
        // 4. Return profile
        // ---------------------------------------------

        res.status(200).json({
            user,
            profile: profileResult.rows[0],
        });

    } catch (error) {

        console.error("Get Profile Error:", error);

        res.status(500).json({
            message: "Failed to load profile",
            error: error.message,
        });
    }
});


// =====================================================
// CREATE / UPDATE PROFILE
// PUT /api/profile/:email
// =====================================================

router.put("/:email", async (req, res) => {
    try {

        const { email } = req.params;

        const {
            phone,
            college,
            degree,
            branch,
            graduation_year,
            skills,
            interests,
            preferred_roles,
            preferred_locations,
        } = req.body;

        // ---------------------------------------------
        // 1. Find user
        // ---------------------------------------------

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

        // ---------------------------------------------
        // 2. Check whether profile already exists
        // ---------------------------------------------

        const existingProfile = await pool.query(
            `
            SELECT id
            FROM profiles
            WHERE user_id = $1
            `,
            [user.id]
        );

        // ---------------------------------------------
        // 3. UPDATE existing profile
        // ---------------------------------------------

        if (existingProfile.rows.length > 0) {

            const updatedProfile = await pool.query(
                `
                UPDATE profiles
                SET
                    phone = $1,
                    college = $2,
                    degree = $3,
                    branch = $4,
                    graduation_year = $5,
                    skills = $6,
                    interests = $7,
                    preferred_roles = $8,
                    preferred_locations = $9,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $10
                RETURNING *
                `,
                [
                    phone,
                    college,
                    degree,
                    branch,
                    graduation_year,
                    skills,
                    interests,
                    preferred_roles,
                    preferred_locations,
                    user.id,
                ]
            );

            return res.status(200).json({
                message: "Profile updated successfully",
                profile: updatedProfile.rows[0],
            });
        }

        // ---------------------------------------------
        // 4. CREATE new profile
        // ---------------------------------------------

        const newProfile = await pool.query(
            `
            INSERT INTO profiles (
                user_id,
                phone,
                college,
                degree,
                branch,
                graduation_year,
                skills,
                interests,
                preferred_roles,
                preferred_locations
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10
            )
            RETURNING *
            `,
            [
                user.id,
                phone,
                college,
                degree,
                branch,
                graduation_year,
                skills,
                interests,
                preferred_roles,
                preferred_locations,
            ]
        );

        res.status(201).json({
            message: "Profile created successfully",
            profile: newProfile.rows[0],
        });

    } catch (error) {

        console.error("Update Profile Error:", error);

        res.status(500).json({
            message: "Failed to save profile",
            error: error.message,
        });
    }
});


module.exports = router;