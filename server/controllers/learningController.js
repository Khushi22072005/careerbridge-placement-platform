const pool = require("../src/config/db");


// =====================================================
// 1. GET ALL COURSES
// GET /api/learning/courses
// =====================================================

const getCourses = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT *
            FROM learning_courses
            ORDER BY started_at DESC
            `
        );

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Get all courses error:", error);

        return res.status(500).json({
            message: "Failed to fetch courses"
        });
    }
};


// =====================================================
// 2. ENROLL IN A COURSE
// POST /api/learning/enroll
// =====================================================

const enrollCourse = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            courseId,
            courseTitle,
            provider,
            courseUrl,
            skill
        } = req.body;

        if (!courseId || !courseTitle) {
            return res.status(400).json({
                message: "Course ID and course title are required"
            });
        }

        const existingCourse = await pool.query(
            `
            SELECT *
            FROM learning_courses
            WHERE user_id = $1
            AND course_id = $2
            `,
            [userId, courseId]
        );

        if (existingCourse.rows.length > 0) {
            return res.status(200).json({
                message: "Course already enrolled",
                course: existingCourse.rows[0]
            });
        }

        const result = await pool.query(
            `
            INSERT INTO learning_courses
            (
                user_id,
                course_id,
                course_title,
                provider,
                course_url,
                skill
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                userId,
                courseId,
                courseTitle,
                provider,
                courseUrl,
                skill
            ]
        );

        return res.status(201).json({
            message: "Course enrolled successfully",
            course: result.rows[0]
        });

    } catch (error) {
        console.error("Enroll course error:", error);

        return res.status(500).json({
            message: "Failed to enroll in course"
        });
    }
};


// =====================================================
// 3. GET USER'S COURSES
// GET /api/learning/my-courses
// =====================================================

const getMyCourses = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM learning_courses
            WHERE user_id = $1
            ORDER BY started_at DESC
            `,
            [userId]
        );

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Get learning courses error:", error);

        return res.status(500).json({
            message: "Failed to fetch learning courses"
        });
    }
};


// =====================================================
// 4. UPDATE COURSE PROGRESS
// PATCH /api/learning/:id/progress
// =====================================================

const updateProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { progress } = req.body;

        if (
            progress === undefined ||
            Number(progress) < 0 ||
            Number(progress) > 100
        ) {
            return res.status(400).json({
                message: "Progress must be between 0 and 100"
            });
        }

        const numericProgress = Number(progress);

        const status =
            numericProgress === 100
                ? "completed"
                : "in-progress";

        const result = await pool.query(
            `
            UPDATE learning_courses
            SET
                progress = $1,
                status = $2::varchar,
                completed_at =
                    CASE
                        WHEN $1 = 100
                        THEN CURRENT_TIMESTAMP
                        ELSE NULL
                    END
            WHERE id = $3
            AND user_id = $4
            RETURNING *
            `,
            [
                numericProgress,
                status,
                id,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        return res.status(200).json({
            message: "Progress updated successfully",
            course: result.rows[0]
        });

    } catch (error) {
        console.error("Update progress error:", error);

        return res.status(500).json({
            message: "Failed to update course progress"
        });
    }
};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    getCourses,
    enrollCourse,
    getMyCourses,
    updateProgress
};