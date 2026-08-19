import React from "react";
import "./CareerDevelopment.css";

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

function CareerDevelopment() {
    const readinessScore = 74;

    return (
        <div className="career-development-page">

            {/* HEADER */}
            <div className="career-development-header">

                <div>
                    <p className="page-eyebrow">
                        PERSONAL & PROFESSIONAL GROWTH
                    </p>

                    <h1>Career Development</h1>

                    <p className="page-description">
                        Build the confidence, communication and professional
                        skills you need to succeed in your career.
                    </p>
                </div>

                <button className="assessment-button">
                    <span>✦</span>
                    Take Assessment
                </button>

            </div>


            {/* CAREER READINESS */}
            <section className="readiness-section">

                <div className="readiness-card">

                    <div className="readiness-content">

                        <div>

                            <span className="section-label">
                                CAREER READINESS
                            </span>

                            <h2>
                                You are making good progress.
                            </h2>

                            <p>
                                Your current development profile shows strong
                                potential, with a few areas that can be
                                improved before placement season.
                            </p>

                        </div>

                        <div className="readiness-progress">

                            <div className="readiness-circle">

                                <svg viewBox="0 0 120 120">

                                    <circle
                                        className="circle-background"
                                        cx="60"
                                        cy="60"
                                        r="50"
                                    />

                                    <circle
                                        className="circle-progress"
                                        cx="60"
                                        cy="60"
                                        r="50"
                                    />

                                </svg>

                                <div className="readiness-score">
                                    <strong>
                                        {readinessScore}%
                                    </strong>

                                    <span>
                                        Ready
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>


                    <div className="readiness-stats">

                        <div>
                            <strong>3</strong>
                            <span>Strong Areas</span>
                        </div>

                        <div>
                            <strong>2</strong>
                            <span>Developing</span>
                        </div>

                        <div>
                            <strong>1</strong>
                            <span>Needs Focus</span>
                        </div>

                        <div>
                            <strong>12</strong>
                            <span>Activities Done</span>
                        </div>

                    </div>

                </div>

            </section>


            {/* DEVELOPMENT AREAS */}
            <section className="development-section">

                <div className="section-heading">

                    <div>

                        <span className="section-label">
                            YOUR DEVELOPMENT
                        </span>

                        <h2>
                            Areas to work on
                        </h2>

                    </div>

                    <button className="text-button">
                        View Assessment →
                    </button>

                </div>


                <div className="development-grid">

                    {developmentAreas.map((area) => (

                        <div
                            className="development-card"
                            key={area.title}
                        >

                            <div
                                className={`development-icon ${area.colorClass}`}
                            >
                                {area.icon}
                            </div>


                            <div className="development-card-top">

                                <div>

                                    <h3>
                                        {area.title}
                                    </h3>

                                    <p>
                                        {area.description}
                                    </p>

                                </div>


                                <span
                                    className={`development-level ${area.level
                                        .toLowerCase()
                                        .replace(" ", "-")}`}
                                >
                                    {area.level}
                                </span>

                            </div>


                            <div className="skill-score-row">

                                <span>
                                    Current level
                                </span>

                                <strong>
                                    {area.score}%
                                </strong>

                            </div>


                            <div className="skill-progress">

                                <div
                                    className={`skill-progress-fill ${area.colorClass}`}
                                    style={{
                                        width: `${area.score}%`,
                                    }}
                                ></div>

                            </div>


                            <button className="practice-button">
                                Practice →
                            </button>

                        </div>

                    ))}

                </div>

            </section>


            {/* TODAY'S CHALLENGE */}
            <section className="challenge-section">

                <div className="challenge-card">

                    <div className="challenge-left">

                        <div className="challenge-icon">
                            🎯
                        </div>


                        <div>

                            <span className="section-label">
                                TODAY'S CHALLENGE
                            </span>

                            <h2>
                                Introduce yourself in 60 seconds
                            </h2>

                            <p>
                                Imagine you are sitting in your first
                                interview. Give a concise introduction
                                covering your background, strengths and
                                career goals.
                            </p>


                            <div className="challenge-meta">

                                <span>
                                    ◷ 5 min
                                </span>

                                <span>
                                    ◉ Speaking
                                </span>

                                <span>
                                    ↗ Confidence
                                </span>

                            </div>


                            <button className="start-challenge-button">
                                ▶ Start Challenge
                            </button>

                        </div>

                    </div>


                    <div className="challenge-decoration">

                        <div className="decoration-circle circle-one"></div>

                        <div className="decoration-circle circle-two"></div>

                        <div className="decoration-card">

                            <span className="decoration-mic">
                                ◉
                            </span>

                            <span>
                                Practice
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            {/* AI DEVELOPMENT */}
            <section className="ai-section">

                <div className="ai-card">

                    <div className="ai-card-icon">
                        ✦
                    </div>


                    <div className="ai-card-content">

                        <span className="section-label">
                            AI-POWERED DEVELOPMENT
                        </span>

                        <h2>
                            Get personalized feedback
                        </h2>

                        <p>
                            Practice interview answers, communication
                            scenarios and workplace situations. CareerBridge
                            AI can analyze your responses and suggest
                            specific areas for improvement.
                        </p>


                        <div className="ai-features">

                            <span>
                                ✓ Communication feedback
                            </span>

                            <span>
                                ✓ Interview response analysis
                            </span>

                            <span>
                                ✓ Personalized recommendations
                            </span>

                        </div>

                    </div>


                    <button className="ai-button">
                        Start AI Practice →
                    </button>

                </div>

            </section>


            {/* RECENT ACTIVITIES */}
            <section className="activity-section">

                <div className="section-heading">

                    <div>

                        <span className="section-label">
                            YOUR PROGRESS
                        </span>

                        <h2>
                            Recent activities
                        </h2>

                    </div>

                    <button className="text-button">
                        View All →
                    </button>

                </div>


                <div className="activity-list">

                    {recentActivities.map((activity) => (

                        <div
                            className="activity-item"
                            key={activity.title}
                        >

                            <div className="activity-icon">
                                {activity.icon}
                            </div>


                            <div className="activity-info">

                                <h3>
                                    {activity.title}
                                </h3>

                                <p>
                                    {activity.type} · {activity.date}
                                </p>

                            </div>


                            <div className="activity-score">

                                <span>
                                    Score
                                </span>

                                <strong>
                                    {activity.score}
                                </strong>

                            </div>


                            <div className="completed-icon">
                                ✓
                            </div>

                        </div>

                    ))}

                </div>

            </section>

        </div>
    );
}

export default CareerDevelopment;