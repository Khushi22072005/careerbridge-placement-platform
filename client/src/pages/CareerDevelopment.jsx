import React, { useEffect, useState } from "react";
import "./CareerDevelopment.css";

const API_BASE_URL = "http://localhost:5000/api";

function CareerDevelopment() {
    const [developmentAreas, setDevelopmentAreas] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [improvementPlan, setImprovementPlan] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [weeklyGoal, setWeeklyGoal] = useState(null);

    const [readinessScore, setReadinessScore] = useState(0);

    const [readinessStats, setReadinessStats] = useState({
        strong: 0,
        developing: 0,
        focus: 0,
        activities: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* =====================================================
       LOAD CAREER DEVELOPMENT DATA
    ===================================================== */

    useEffect(() => {
        loadCareerDevelopment();
    }, []);

    const loadCareerDevelopment = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/career-development`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && {
                            Authorization: `Bearer ${token}`,
                        }),
                    },
                }
            );

            const contentType =
                response.headers.get("content-type") || "";

            if (!contentType.includes("application/json")) {
                throw new Error(
                    `Career Development API returned ${response.status}. Backend route may not exist.`
                );
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load career development data"
                );
            }

            setDevelopmentAreas(data.developmentAreas || []);
            setRecentActivities(data.recentActivities || []);
            setImprovementPlan(data.improvementPlan || []);
            setAchievements(data.achievements || []);
            setWeeklyGoal(data.weeklyGoal || null);

            setReadinessScore(
                Math.min(
                    Math.max(data.readinessScore || 0, 0),
                    100
                )
            );

            setReadinessStats({
                strong: data.readinessStats?.strong || 0,
                developing: data.readinessStats?.developing || 0,
                focus: data.readinessStats?.focus || 0,
                activities: data.readinessStats?.activities || 0,
            });

        } catch (err) {
            console.error(
                "Career Development loading error:",
                err
            );

            setError(
                err.message ||
                "Unable to load career development data"
            );

        } finally {
            setLoading(false);
        }
    };


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const handleAssessment = () => {
        window.location.href = "/career-assessment";
    };


    const handlePractice = (area) => {
        if (area.activityLink) {
            window.location.href = area.activityLink;
        }
    };


    const handleWeeklyGoal = () => {
        if (weeklyGoal?.link) {
            window.location.href = weeklyGoal.link;
        }
    };


    const openActivity = (path) => {
        window.location.href = path;
    };


    /* =====================================================
       READINESS MESSAGE
    ===================================================== */

    const getReadinessMessage = () => {
        if (readinessScore >= 85) {
            return {
                title: "You're highly career ready.",
                description:
                    "You have built strong professional foundations. Keep practicing and refining your skills to stay placement ready.",
            };
        }

        if (readinessScore >= 70) {
            return {
                title: "You're on a strong path.",
                description:
                    "Your professional skills are developing well. A few focused activities can help you become even more placement ready.",
            };
        }

        if (readinessScore >= 50) {
            return {
                title: "You're making good progress.",
                description:
                    "You have a solid starting point. Continue working on your development areas to improve your overall career readiness.",
            };
        }

        return {
            title: "Let's build your career readiness.",
            description:
                "Complete your assessment and professional activities to identify your strengths and create a personalized growth path.",
        };
    };


    const readinessMessage = getReadinessMessage();


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="career-development-page">

                <div className="loading-state">

                    <div className="loading-spinner"></div>

                    <h3>
                        Loading Career Development
                    </h3>

                    <p>
                        Preparing your personalized development plan...
                    </p>

                </div>

            </div>
        );
    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {
        return (
            <div className="career-development-page">

                <div className="error-state">

                    <div className="error-icon">
                        !
                    </div>

                    <h2>
                        Unable to load Career Development
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="assessment-button"
                        onClick={loadCareerDevelopment}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    return (
        <div className="career-development-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="career-development-header">

                <div>

                    <p className="page-eyebrow">
                        PERSONAL & PROFESSIONAL GROWTH
                    </p>

                    <h1>
                        Career Development
                    </h1>

                    <p className="page-description">
                        Strengthen the professional skills, workplace
                        confidence and habits that help you move from
                        student to professional.
                    </p>

                </div>

                <button
                    className="assessment-button"
                    onClick={handleAssessment}
                >
                    <span>✦</span>
                    Retake Assessment
                </button>

            </header>


            {/* =====================================================
                CAREER READINESS
            ===================================================== */}

            <section className="readiness-section">

                <div className="readiness-card">

                    <div className="readiness-content">

                        <div className="readiness-text">

                            <span className="section-label">
                                CAREER READINESS
                            </span>

                            <h2>
                                {readinessMessage.title}
                            </h2>

                            <p>
                                {readinessMessage.description}
                            </p>

                            <div className="readiness-mini-tags">

                                <span>
                                    ✓ Professional Skills
                                </span>

                                <span>
                                    ✓ Workplace Readiness
                                </span>

                                <span>
                                    ✓ Continuous Growth
                                </span>

                            </div>

                        </div>


                        <div className="readiness-progress">

                            <div className="readiness-circle">

                                <svg
                                    viewBox="0 0 120 120"
                                    aria-label={`${readinessScore}% career readiness`}
                                >

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
                                        style={{
                                            strokeDasharray: 314,
                                            strokeDashoffset:
                                                314 -
                                                (314 *
                                                    readinessScore) /
                                                    100,
                                        }}
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


                    {/* STATS */}

                    <div className="readiness-stats">

                        <div>
                            <strong>
                                {readinessStats.strong}
                            </strong>

                            <span>
                                Strong Areas
                            </span>
                        </div>

                        <div>
                            <strong>
                                {readinessStats.developing}
                            </strong>

                            <span>
                                Developing
                            </span>
                        </div>

                        <div>
                            <strong>
                                {readinessStats.focus}
                            </strong>

                            <span>
                                Needs Focus
                            </span>
                        </div>

                        <div>
                            <strong>
                                {readinessStats.activities}
                            </strong>

                            <span>
                                Activities Done
                            </span>
                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                DEVELOPMENT AREAS
            ===================================================== */}

            <section className="development-section">

                <div className="section-heading">

                    <div>

                        <span className="section-label">
                            YOUR DEVELOPMENT
                        </span>

                        <h2>
                            Professional skill profile
                        </h2>

                    </div>

                    <button
                        className="text-button"
                        onClick={handleAssessment}
                    >
                        View Assessment →
                    </button>

                </div>


                {developmentAreas.length === 0 ? (

                    <div className="empty-development">

                        <div className="empty-development-icon">
                            ✦
                        </div>

                        <h3>
                            No development profile yet
                        </h3>

                        <p>
                            Complete your career assessment to
                            generate personalized development areas.
                        </p>

                        <button
                            className="assessment-button"
                            onClick={handleAssessment}
                        >
                            Take Assessment
                        </button>

                    </div>

                ) : (

                    <div className="development-grid">

                        {developmentAreas.map((area, index) => (

                            <div
                                className="development-card"
                                key={
                                    area.title ||
                                    `development-${index}`
                                }
                            >

                                <div
                                    className={`development-icon ${
                                        area.colorClass || ""
                                    }`}
                                >
                                    {area.icon || "✦"}
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
                                        className={`development-level ${
                                            area.level
                                                ?.toLowerCase()
                                                .replace(
                                                    /\s+/g,
                                                    "-"
                                                ) || "developing"
                                        }`}
                                    >
                                        {area.level || "Developing"}
                                    </span>

                                </div>

                                <div className="skill-score-row">

                                    <span>
                                        Current level
                                    </span>

                                    <strong>
                                        {area.score || 0}%
                                    </strong>

                                </div>

                                <div className="skill-progress">

                                    <div
                                        className={`skill-progress-fill ${
                                            area.colorClass || ""
                                        }`}
                                        style={{
                                            width:
                                                `${Math.min(
                                                    Math.max(
                                                        area.score || 0,
                                                        0
                                                    ),
                                                    100
                                                )}%`,
                                        }}
                                    />

                                </div>

                                <button
                                    className="practice-button"
                                    onClick={() =>
                                        handlePractice(area)
                                    }
                                >
                                    {area.practiceText ||
                                        "Practice Skill →"}
                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* =====================================================
                IMPROVEMENT PLAN
            ===================================================== */}

            <section className="improvement-section">

                <div className="section-heading">

                    <div>

                        <span className="section-label">
                            PERSONALIZED PLAN
                        </span>

                        <h2>
                            Your improvement roadmap
                        </h2>

                    </div>

                </div>


                {improvementPlan.length === 0 ? (

                    <div className="empty-development">

                        <div className="empty-development-icon">
                            🎯
                        </div>

                        <h3>
                            Your improvement roadmap will appear here
                        </h3>

                        <p>
                            Complete development activities to receive
                            personalized recommendations.
                        </p>

                    </div>

                ) : (

                    <div className="improvement-list">

                        {improvementPlan.map((item, index) => {

                            const progress = Math.min(
                                Math.max(
                                    item.progress || 0,
                                    0
                                ),
                                100
                            );

                            return (
                                <div
                                    className="improvement-item"
                                    key={
                                        item.title ||
                                        `improvement-${index}`
                                    }
                                >

                                    <div
                                        className={`improvement-icon ${
                                            item.status || ""
                                        }`}
                                    >
                                        {item.status === "completed"
                                            ? "✓"
                                            : "!"}
                                    </div>

                                    <div className="improvement-content">

                                        <div className="improvement-title-row">

                                            <h3>
                                                {item.title}
                                            </h3>

                                            <span>
                                                {item.currentScore || 0}%
                                                <b> → </b>
                                                {item.targetScore || 0}%
                                            </span>

                                        </div>

                                        <p>
                                            {item.description}
                                        </p>

                                        <div className="improvement-progress">

                                            <div
                                                style={{
                                                    width:
                                                        `${progress}%`,
                                                }}
                                            />

                                        </div>

                                        <small>
                                            Recommended:{" "}
                                            {item.recommendation}
                                        </small>

                                    </div>

                                    {item.link && (

                                        <button
                                            className="improvement-button"
                                            onClick={() =>
                                                window.location.href =
                                                    item.link
                                            }
                                        >
                                            Continue →
                                        </button>

                                    )}

                                </div>
                            );
                        })}

                    </div>

                )}

            </section>


            {/* =====================================================
                WEEKLY GOAL
            ===================================================== */}

            {weeklyGoal && (

                <section className="weekly-goal-section">

                    <div className="weekly-goal-card">

                        <div className="weekly-goal-icon">
                            🎯
                        </div>

                        <div className="weekly-goal-content">

                            <span className="section-label">
                                THIS WEEK'S DEVELOPMENT GOAL
                            </span>

                            <h2>
                                {weeklyGoal.title}
                            </h2>

                            <p>
                                {weeklyGoal.description}
                            </p>

                            <div className="weekly-goal-progress-row">

                                <div className="weekly-goal-progress">

                                    <div
                                        style={{
                                            width:
                                                `${Math.min(
                                                    Math.max(
                                                        weeklyGoal.progress || 0,
                                                        0
                                                    ),
                                                    100
                                                )}%`,
                                        }}
                                    />

                                </div>

                                <strong>
                                    {weeklyGoal.progress || 0}%
                                </strong>

                            </div>

                            <span className="weekly-goal-meta">
                                {weeklyGoal.completed || 0} of{" "}
                                {weeklyGoal.total || 0} activities
                                completed
                            </span>

                        </div>

                        <button
                            className="weekly-goal-button"
                            onClick={handleWeeklyGoal}
                        >
                            Continue Goal →
                        </button>

                    </div>

                </section>

            )}


            {/* =====================================================
                PROFESSIONAL SKILL ACTIVITIES
            ===================================================== */}

            <section className="activities-section">

                <div className="section-heading">

                    <div>

                        <span className="section-label">
                            SKILL BUILDING
                        </span>

                        <h2>
                            Build workplace skills
                        </h2>

                    </div>

                    <span className="section-helper">
                        Short activities • Practical scenarios
                    </span>

                </div>


                <div className="professional-activities-grid">

                    {/* COMMUNICATION */}

                    <div className="professional-activity-card">

                        <div className="professional-card-top">

                            <div className="professional-activity-icon communication">
                                💬
                            </div>

                            <span>
                                5 min
                            </span>

                        </div>

                        <h3>
                            Communication Challenge
                        </h3>

                        <p>
                            Practice explaining ideas clearly,
                            writing professional messages and
                            communicating with confidence.
                        </p>

                        <button
                            onClick={() =>
                                openActivity(
                                    "/career-development/communication"
                                )
                            }
                        >
                            Start Activity →
                        </button>

                    </div>


                    {/* LEADERSHIP */}

                    <div className="professional-activity-card">

                        <div className="professional-card-top">

                            <div className="professional-activity-icon leadership">
                                ◈
                            </div>

                            <span>
                                7 min
                            </span>

                        </div>

                        <h3>
                            Leadership Scenario
                        </h3>

                        <p>
                            Respond to realistic workplace
                            situations and develop better
                            decision-making skills.
                        </p>

                        <button
                            onClick={() =>
                                openActivity(
                                    "/career-development/leadership"
                                )
                            }
                        >
                            Start Activity →
                        </button>

                    </div>


                    {/* PROBLEM SOLVING */}

                    <div className="professional-activity-card">

                        <div className="professional-card-top">

                            <div className="professional-activity-icon problem-solving">
                                💡
                            </div>

                            <span>
                                8 min
                            </span>

                        </div>

                        <h3>
                            Problem Solving
                        </h3>

                        <p>
                            Solve realistic workplace problems
                            using structured and logical thinking.
                        </p>

                        <button
                            onClick={() =>
                                openActivity(
                                    "/career-development/problem-solving"
                                )
                            }
                        >
                            Start Activity →
                        </button>

                    </div>


                    {/* TIME MANAGEMENT */}

                    <div className="professional-activity-card">

                        <div className="professional-card-top">

                            <div className="professional-activity-icon time-management">
                                ◷
                            </div>

                            <span>
                                5 min
                            </span>

                        </div>

                        <h3>
                            Time Management
                        </h3>

                        <p>
                            Prioritize tasks, manage deadlines
                            and make better use of your working day.
                        </p>

                        <button
                            onClick={() =>
                                openActivity(
                                    "/career-development/time-management"
                                )
                            }
                        >
                            Start Activity →
                        </button>

                    </div>


                    {/* PROFESSIONALISM */}

                    <div className="professional-activity-card">

                        <div className="professional-card-top">

                            <div className="professional-activity-icon professionalism">
                                ✦
                            </div>

                            <span>
                                6 min
                            </span>

                        </div>

                        <h3>
                            Workplace Professionalism
                        </h3>

                        <p>
                            Learn how to handle workplace etiquette,
                            teamwork, accountability and professional
                            behaviour.
                        </p>

                        <button
                            onClick={() =>
                                openActivity(
                                    "/career-development/professionalism"
                                )
                            }
                        >
                            Start Activity →
                        </button>

                    </div>


                    {/* CONFIDENCE */}

                    <div className="professional-activity-card">

                        <div className="professional-card-top">

                            <div className="professional-activity-icon confidence">
                                ✨
                            </div>

                            <span>
                                5 min
                            </span>

                        </div>

                        <h3>
                            Confidence Builder
                        </h3>

                        <p>
                            Practice confident workplace responses,
                            introductions and professional self-expression.
                        </p>

                        <button
                            onClick={() =>
                                openActivity(
                                    "/career-development/confidence"
                                )
                            }
                        >
                            Start Activity →
                        </button>

                    </div>

                </div>

            </section>


            {/* =====================================================
                ACHIEVEMENTS
            ===================================================== */}

            <section className="achievements-section">

                <div className="section-heading">

                    <div>

                        <span className="section-label">
                            MILESTONES
                        </span>

                        <h2>
                            Your achievements
                        </h2>

                    </div>

                </div>


                {achievements.length === 0 ? (

                    <div className="achievement-empty">

                        <div className="achievement-empty-icon">
                            🏆
                        </div>

                        <h3>
                            Your first achievement is waiting
                        </h3>

                        <p>
                            Complete professional activities to
                            unlock milestones and build your growth
                            streak.
                        </p>

                    </div>

                ) : (

                    <div className="achievements-grid">

                        {achievements.map(
                            (achievement, index) => (

                                <div
                                    className={`achievement-card ${
                                        achievement.unlocked
                                            ? "unlocked"
                                            : "locked"
                                    }`}
                                    key={
                                        achievement.title ||
                                        index
                                    }
                                >

                                    <div className="achievement-icon">
                                        {achievement.icon ||
                                            "🏆"}
                                    </div>

                                    <div>

                                        <h3>
                                            {achievement.title}
                                        </h3>

                                        <p>
                                            {achievement.description}
                                        </p>

                                    </div>

                                    {achievement.unlocked && (
                                        <span className="achievement-status">
                                            Unlocked
                                        </span>
                                    )}

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* =====================================================
                RECENT ACTIVITIES
            ===================================================== */}

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

                </div>


                {recentActivities.length === 0 ? (

                    <div className="empty-activities">

                        <div className="empty-activity-icon">
                            ◉
                        </div>

                        <h3>
                            No activities yet
                        </h3>

                        <p>
                            Complete your first professional
                            development activity to start
                            tracking your progress.
                        </p>

                    </div>

                ) : (

                    <div className="activity-list">

                        {recentActivities.map(
                            (activity, index) => (

                                <div
                                    className="activity-item"
                                    key={
                                        activity.title ||
                                        index
                                    }
                                >

                                    <div className="activity-icon">
                                        {activity.icon || "✦"}
                                    </div>

                                    <div className="activity-info">

                                        <h3>
                                            {activity.title}
                                        </h3>

                                        <p>
                                            {activity.type}
                                            {" · "}
                                            {activity.date}
                                        </p>

                                    </div>

                                    <div className="activity-score">

                                        <span>
                                            Score
                                        </span>

                                        <strong>
                                            {activity.score || 0}%
                                        </strong>

                                    </div>

                                    <div className="completed-icon">
                                        ✓
                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* =====================================================
                FOOTER MESSAGE
            ===================================================== */}

            <div className="development-footer-card">

                <div className="development-footer-icon">
                    ✦
                </div>

                <div>

                    <h3>
                        Small progress creates big career growth.
                    </h3>

                    <p>
                        Keep completing activities, improving your
                        weakest areas and tracking your progress.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default CareerDevelopment;