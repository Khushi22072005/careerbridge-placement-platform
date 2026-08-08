require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/authRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");
const profileRoutes = require("../routes/profileRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

app.listen(process.env.PORT, () => {
    console.log("Server Running on Port", process.env.PORT);
});