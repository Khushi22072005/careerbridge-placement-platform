require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/authRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");
const profileRoutes = require("../routes/profileRoutes");
const mockInterviewRoutes =
    require("../routes/mockInterviewRoutes");
const assessmentRoutes =
    require("../routes/assessmentroutes");

const technicalAssessmentRoutes =
    require("../routes/technicalAssessmentRoutes");

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());


// =====================================================
// ROUTES
// =====================================================

app.use(
    "/api/auth",
    authRoutes
);
app.use(
    "/api/mock-interview",
    mockInterviewRoutes
);
app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/profile",
    profileRoutes
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