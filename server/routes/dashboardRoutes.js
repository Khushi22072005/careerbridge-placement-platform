const express = require("express");
const router = express.Router();

const pool = require("../src/config/db");

// ==========================================
// GET DASHBOARD DATA
// GET /api/dashboard/:email
// ==========================================

router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // ------------------------------------------
    // 1. Find user
    // ------------------------------------------

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

    // ------------------------------------------
    // 2. Dashboard data
    // ------------------------------------------

    /*
      These values can later be calculated from:
      - career assessment
      - skills
      - resume
      - profile
      - roadmap
      - tasks

      For now, these are default values.
    */

    const dashboard = {
      placementReadiness: 68,
      careerMatch: 82,
      roadmapProgress: 46,
      resumeScore: 74,
      skillsCompleted: 14,
      profileCompletion: 75,

      // ----------------------------------------
      // Career recommendation
      // ----------------------------------------

      career: {
        title: "Software Developer",

        match: 82,

        skills: [
          "JavaScript",
          "React",
          "SQL",
          "Problem Solving",
        ],

        companies: [
          "Google",
          "Microsoft",
          "Accenture",
        ],
      },

      // ----------------------------------------
      // Career roadmap
      // ----------------------------------------

      roadmap: [
        {
          number: "01",
          title: "Career Assessment",
          status: "Completed",
          completed: true,
          active: false,
        },

        {
          number: "02",
          title: "Skill Gap Analysis",
          status: "Currently working",
          completed: false,
          active: true,
        },

        {
          number: "03",
          title: "Learning Path",
          status: "Upcoming",
          completed: false,
          active: false,
        },

        {
          number: "04",
          title: "Placement Preparation",
          status: "Upcoming",
          completed: false,
          active: false,
        },
      ],

      // ----------------------------------------
      // Today's tasks
      // ----------------------------------------

      tasks: [
        {
          id: 1,
          text: "Complete career assessment",
          completed: true,
        },

        {
          id: 2,
          text: "Improve JavaScript skills",
          completed: false,
        },

        {
          id: 3,
          text: "Update resume projects",
          completed: false,
        },

        {
          id: 4,
          text: "Practice mock interview",
          completed: false,
        },
      ],

      // ----------------------------------------
      // Smart recommendation
      // ----------------------------------------

      recommendation: {
        title: "Strengthen your DSA skills",

        description:
          "Software Developer roles commonly require strong problem-solving and data structure knowledge.",

        action: "Start Learning",
      },
    };

    // ------------------------------------------
    // 3. Send response
    // ------------------------------------------

    res.status(200).json({
      user,
      dashboard,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);

    res.status(500).json({
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
});

module.exports = router;