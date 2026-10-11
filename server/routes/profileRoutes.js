
const express = require("express");
const router = express.Router();
const pool = require("../src/config/db");

const EMPTY_PROFILE = {
    phone: "",
    college: "",
    degree: "",
    branch: "",
    graduation_year: "",
    current_year: "",
    cgpa: "",
    skills: [],
    skill_proficiency: {},
    soft_skills: [],
    career_goal: "",
    projects: [],
    certifications: [],
    achievements: [],
};

const ARRAY_FIELDS = [
    "skills",
    "soft_skills",
    "projects",
    "certifications",
    "achievements",
];

const normalizeArray = (value, field) => {
    if (value === undefined || value === null) return [];

    if (!Array.isArray(value)) {
        throw new Error(`${field} must be an array`);
    }

    return value;
};

const normalizeYear = (value) => {
    if (value === "" || value === null || value === undefined) {
        return null;
    }

    const year = Number(value);

    if (!Number.isInteger(year) || year < 1900 || year > 2200) {
        throw new Error("Graduation year must be a valid year");
    }

    return year;
};

const normalizeNumber = (value, field) => {
    if (value === "" || value === null || value === undefined) {
        return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
        throw new Error(`${field} must be a valid non-negative number`);
    }

    return number;
};

const normalizeProfile = (profile = {}) => ({
    ...EMPTY_PROFILE,
    ...profile,
    phone: profile.phone ?? "",
    college: profile.college ?? "",
    degree: profile.degree ?? "",
    branch: profile.branch ?? "",
    graduation_year: profile.graduation_year ?? "",
    current_year: profile.current_year ?? "",
    cgpa: profile.cgpa ?? "",
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    skill_proficiency:
        profile.skill_proficiency &&
        typeof profile.skill_proficiency === "object" &&
        !Array.isArray(profile.skill_proficiency)
            ? profile.skill_proficiency
            : {},
    soft_skills: Array.isArray(profile.soft_skills)
        ? profile.soft_skills
        : [],
    career_goal: profile.career_goal ?? "",
    projects: Array.isArray(profile.projects) ? profile.projects : [],
    certifications: Array.isArray(profile.certifications)
        ? profile.certifications
        : [],
    achievements: Array.isArray(profile.achievements)
        ? profile.achievements
        : [],
});

// GET /api/profile/:email
router.get("/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).trim();

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const userResult = await pool.query(
            `SELECT id, fullname, email
             FROM users
             WHERE LOWER(email) = LOWER($1)
             LIMIT 1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = userResult.rows[0];

        const result = await pool.query(
            `SELECT *
             FROM profiles
             WHERE user_id = $1
             LIMIT 1`,
            [user.id]
        );

        const row = result.rows[0];

        // Keep compatibility with profiles created before profile_data existed.
        const savedData = row?.profile_data || {};

        const legacyProfile = row
            ? {
                  phone: row.phone ?? "",
                  college: row.college ?? "",
                  degree: row.degree ?? "",
                  branch: row.branch ?? "",
                  graduation_year: row.graduation_year ?? "",
                  skills: Array.isArray(row.skills) ? row.skills : [],
              }
            : {};

        const profile = normalizeProfile({
            ...legacyProfile,
            ...savedData,
        });

        return res.status(200).json({ user, profile });
    } catch (error) {
        console.error("Get Profile Error:", error);

        return res.status(500).json({
            message: "Failed to load profile.",
        });
    }
});

// PUT /api/profile/:email
router.put("/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).trim();

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const userResult = await pool.query(
            `SELECT id, fullname, email
             FROM users
             WHERE LOWER(email) = LOWER($1)
             LIMIT 1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = userResult.rows[0];

        const incoming = req.body || {};

        const profile = normalizeProfile({
            ...EMPTY_PROFILE,
            ...incoming,
        });

        // Validate fields submitted by the Profile form.
        for (const field of ARRAY_FIELDS) {
            profile[field] = normalizeArray(profile[field], field);
        }

        if (
            !profile.skill_proficiency ||
            typeof profile.skill_proficiency !== "object" ||
            Array.isArray(profile.skill_proficiency)
        ) {
            throw new Error("Skill proficiency must be an object");
        }

        profile.graduation_year = normalizeYear(profile.graduation_year);
        profile.cgpa = normalizeNumber(profile.cgpa, "CGPA");

        // Save all Profile.jsx fields as JSONB, while keeping the
        // existing database columns synchronized for older app features.
        const result = await pool.query(
            `INSERT INTO profiles (
                user_id,
                phone,
                college,
                degree,
                branch,
                graduation_year,
                skills,
                profile_data,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id)
            DO UPDATE SET
                phone = EXCLUDED.phone,
                college = EXCLUDED.college,
                degree = EXCLUDED.degree,
                branch = EXCLUDED.branch,
                graduation_year = EXCLUDED.graduation_year,
                skills = EXCLUDED.skills,
                profile_data = EXCLUDED.profile_data,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *`,
            [
                user.id,
                profile.phone,
                profile.college,
                profile.degree,
                profile.branch,
                profile.graduation_year,
                profile.skills,
                JSON.stringify(profile),
            ]
        );

        return res.status(200).json({
            message: "Profile saved successfully.",
            user,
            profile: normalizeProfile({
                ...profile,
                ...(result.rows[0].profile_data || {}),
            }),
        });
    } catch (error) {
        console.error("Save Profile Error:", error);

        if (
            error.message.includes("must be an array") ||
            error.message.includes("valid year") ||
            error.message.includes("valid non-negative number") ||
            error.message.includes("must be an object")
        ) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Failed to save profile.",
            error: error.message,
        });
    }
});

module.exports = router;

