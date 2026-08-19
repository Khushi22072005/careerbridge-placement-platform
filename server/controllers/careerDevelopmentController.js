const getCareerDevelopment = async (req, res) => {
    try {
        const developmentAreas = [
            {
                title: "Communication",
                description: "Express your ideas clearly and confidently.",
                score: 82,
                level: "Strong",
                icon: "💬",
                colorClass: "communication",
            },
            {
                title: "Confidence",
                description: "Build confidence for interviews and presentations.",
                score: 64,
                level: "Developing",
                icon: "✦",
                colorClass: "confidence",
            },
            {
                title: "Leadership",
                description: "Develop initiative and decision-making skills.",
                score: 58,
                level: "Developing",
                icon: "◈",
                colorClass: "leadership",
            },
            {
                title: "Problem Solving",
                description: "Improve your approach to real-world situations.",
                score: 76,
                level: "Strong",
                icon: "💡",
                colorClass: "problem-solving",
            },
            {
                title: "Time Management",
                description: "Manage priorities and meet professional deadlines.",
                score: 71,
                level: "Good",
                icon: "◷",
                colorClass: "time-management",
            },
            {
                title: "Professionalism",
                description: "Develop workplace-ready professional behavior.",
                score: 79,
                level: "Strong",
                icon: "▣",
                colorClass: "professionalism",
            },
        ];

        const recentActivities = [
            {
                title: "Self Introduction Practice",
                type: "Communication",
                date: "Completed today",
                score: "84%",
                icon: "◉",
            },
            {
                title: "Situational Judgment",
                type: "Problem Solving",
                date: "Completed yesterday",
                score: "78%",
                icon: "◆",
            },
            {
                title: "Professional Communication",
                type: "Professionalism",
                date: "Completed 3 days ago",
                score: "91%",
                icon: "✦",
            },
        ];

        const readinessScore = 74;

        res.status(200).json({
            success: true,
            readinessScore,
            developmentAreas,
            recentActivities,
            stats: {
                strongAreas: 3,
                developingAreas: 2,
                needsFocus: 1,
                activitiesDone: 12,
            },
        });

    } catch (error) {
        console.error(
            "Career Development Controller Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load career development data",
        });
    }
};

module.exports = {
    getCareerDevelopment,
};