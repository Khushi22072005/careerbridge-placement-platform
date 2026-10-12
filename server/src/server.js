require("dotenv").config();
const careerCompanionRoutes =
    require("../routes/careerCompanionRoutes");
const express = require("express");
const cors = require("cors");

const authRoutes =
    require("../routes/authRoutes");

const dashboardRoutes =
    require("../routes/dashboardRoutes");

const profileRoutes =
    require("../routes/profileRoutes");

const resumeRoutes =
    require("../routes/resumeRoutes");

const mockInterviewRoutes =
    require("../routes/mockInterviewRoutes");

const assessmentRoutes =
    require("../routes/assessmentroutes");

const technicalAssessmentRoutes =
    require("../routes/technicalAssessmentRoutes");

const learningRoutes =
    require("../routes/learningRoutes");
const careerDevelopmentRoutes =
    require("../routes/careerDevelopmentRoutes");
    
const aptitudeRoutes =
    require("../routes/aptitudeRoutes");

const codingRoutes = require("../routes/codingRoutes");
const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// ROUTES
// =====================================================

// AUTH
app.use(
    "/api/auth",
    authRoutes
);


// MOCK INTERVIEW
app.use(
    "/api/mock-interview",
    mockInterviewRoutes
);


// DASHBOARD
app.use(
    "/api/dashboard",
    dashboardRoutes
);


// PROFILE
app.use(
    "/api/profile",
    profileRoutes
);

// =====================================================
// CAREER DEVELOPMENT
// =====================================================

app.use(
    "/api/career-development",
    careerDevelopmentRoutes
);
// RESUME
app.use(
    "/api/resume",
    resumeRoutes
);


// =====================================================
// CAREER ASSESSMENT
// =====================================================

app.use(
    "/api/assessment",
    assessmentRoutes
);


// =====================================================
// TECHNICAL ASSESSMENT
// =====================================================

app.use(
    "/api/technical-assessment",
    technicalAssessmentRoutes
);


// =====================================================
// LEARNING HUB
// =====================================================

app.use(
    "/api/learning",
    learningRoutes
);
// =====================================================
// AI CAREER COMPANION
// =====================================================

app.use(
    "/api/career-companion",
    careerCompanionRoutes
);

 // =====================================================
// APTITUDE PRACTICE
// =====================================================

app.use(
    "/api/aptitude",
    aptitudeRoutes
);

app.use("/api/coding", codingRoutes);
// =====================================================
// SERVER
// =====================================================

app.listen(
    process.env.PORT,
    () => {
        console.log(
            `Server Running on Port ${process.env.PORT}`
        );
    }
);