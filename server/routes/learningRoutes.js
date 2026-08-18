const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    enrollCourse,
    getMyCourses,
    updateProgress
} = require("../controllers/learningController");


// =====================================================
// ENROLL IN A COURSE
// POST /api/learning/enroll
// =====================================================

router.post(
    "/enroll",
    authMiddleware,
    enrollCourse
);


// =====================================================
// GET MY COURSES
// GET /api/learning/my-courses
// =====================================================

router.get(
    "/my-courses",
    authMiddleware,
    getMyCourses
);


// =====================================================
// UPDATE COURSE PROGRESS
// PATCH /api/learning/:id/progress
// =====================================================

router.patch(
    "/:id/progress",
    authMiddleware,
    updateProgress
);


module.exports = router;