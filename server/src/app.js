require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/authRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");
const profileRoutes = require("../routes/profileRoutes");

const assessmentRoutes = require("../routes/assessmentRoutes");
const technicalAssessmentRoutes =
    require("../routes/technicalAssessmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/assessment", assessmentRoutes);

app.use(
    "/api/technical-assessment",
    technicalAssessmentRoutes
);

app.listen(process.env.PORT, () => {
    console.log(
        "Server Running on Port",
        process.env.PORT
    );
});