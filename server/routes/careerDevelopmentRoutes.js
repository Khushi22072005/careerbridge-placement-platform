const express = require("express");

const router = express.Router();

const {
    getCareerDevelopment,
} = require("../controllers/careerDevelopmentController");


// =====================================================
// GET CAREER DEVELOPMENT DATA
// GET /api/career-development
// =====================================================

router.get(
    "/",
    getCareerDevelopment
);

module.exports = router;