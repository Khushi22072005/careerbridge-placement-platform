require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/authRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");
const profileRoutes = require("../routes/profileRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const technicalAssessmentRoutes =
    require("../routes/technicalAssessmentRoutes");

const app = express();

// =====================================================
// CORS CONFIGURATION
// =====================================================
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(express.json());

// =====================================================
// API ROUTES
// =====================================================
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/assessment", assessmentRoutes);

app.use(
    "/api/technical-assessment",
    technicalAssessmentRoutes
);

// =====================================================
// START SERVER
// =====================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});