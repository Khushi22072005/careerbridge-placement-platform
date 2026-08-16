import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AssessmentResult.css";

/* =====================================================
   ROLE TITLES
===================================================== */

const ROLE_TITLES = {
    "software-developer": "Software Developer",
    "data-analyst": "Data Analyst",
    cybersecurity: "Cybersecurity",
    "cloud-devops": "Cloud / DevOps",
    "ui-ux": "UI/UX Designer",
};

/* =====================================================
   HELPERS
===================================================== */

const getRoleTitle = (role) => {
    if (!role) {
        return "Data Analyst";
    }

    return (
        ROLE_TITLES[role] ||
        role
            .replace(/-/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
    );
};

const getScore = (result) => {
    const possibleValues = [
        result?.percentage,
        result?.overallPercentage,
        result?.scorePercentage,
        result?.accuracy,
        result?.overallScore,
    ];

    for (const value of possibleValues) {
        const number = Number(value);

        if (
            Number.isFinite(number) &&
            number >= 0 &&
            number <= 100
        ) {
            return Math.round(number);
        }
    }

    const correct = Number(
        result?.correctAnswers ??
        result?.correct ??
        result?.score ??
        0
    );

    const total = Number(
        result?.totalQuestions ??
        result?.total ??
        20
    );

    if (
        Number.isFinite(correct) &&
        Number.isFinite(total) &&
        total > 0
    ) {
        return Math.round((correct / total) * 100);
    }

    return 0;
};

const getCorrectAnswers = (result) => {
    const value =
        result?.correctAnswers ??
        result?.correct ??
        result?.score;

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
};

const getTotalQuestions = (result) => {
    const value =
        result?.totalQuestions ??
        result?.total ??
        20;

    const number = Number(value);

    if (
        Number.isFinite(number) &&
        number > 0
    ) {
        return number;
    }

    return 20;
};

const getPerformanceLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Very Good";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";

    return "Needs Attention";
};

const getPerformanceMessage = (score, roleTitle) => {
    if (score >= 90) {
        return `You demonstrated strong technical knowledge for the ${roleTitle} role.`;
    }

    if (score >= 75) {
        return `You demonstrated a solid technical foundation for the ${roleTitle} role.`;
    }

    if (score >= 60) {
        return `You have a good starting foundation for the ${roleTitle} role, with some areas to strengthen.`;
    }

    if (score >= 40) {
        return `You have some foundational knowledge, but several ${roleTitle} concepts require further practice.`;
    }

    return `Your current result shows that you should strengthen the fundamentals before progressing further.`;
};

const normalizeArray = (value) => {
    return Array.isArray(value) ? value : [];
};

/* =====================================================
   CATEGORY NORMALIZER
===================================================== */

const getCategoryPerformance = (result) => {
    if (!result) {
        return [];
    }

    const possibleData =
        result?.categoryResults ??
        result?.categoryPerformance ??
        result?.categoryScores ??
        result?.categories ??
        result?.skillPerformance;

    if (Array.isArray(possibleData)) {
        return possibleData.map((item, index) => {
            const category =
                item?.category ??
                item?.name ??
                item?.title ??
                `Skill ${index + 1}`;

            const correct = Number(
                item?.correctAnswers ??
                item?.correct ??
                item?.right ??
                0
            );

            const total = Number(
                item?.totalQuestions ??
                item?.total ??
                item?.questions ??
                0
            );

            let score = Number(
                item?.score ??
                item?.percentage ??
                item?.accuracy
            );

            if (
                !Number.isFinite(score) &&
                total > 0
            ) {
                score = (correct / total) * 100;
            }

            if (!Number.isFinite(score)) {
                score = 0;
            }

            return {
                category,
                correct,
                total,
                score: Math.max(
                    0,
                    Math.min(100, score)
                ),
            };
        });
    }

    if (
        possibleData &&
        typeof possibleData === "object"
    ) {
        return Object.entries(possibleData).map(
            ([category, value], index) => {
                if (
                    value &&
                    typeof value === "object"
                ) {
                    const correct = Number(
                        value.correctAnswers ??
                        value.correct ??
                        value.right ??
                        0
                    );

                    const total = Number(
                        value.totalQuestions ??
                        value.total ??
                        value.questions ??
                        0
                    );

                    let score = Number(
                        value.score ??
                        value.percentage ??
                        value.accuracy
                    );

                    if (
                        !Number.isFinite(score) &&
                        total > 0
                    ) {
                        score =
                            (correct / total) * 100;
                    }

                    if (!Number.isFinite(score)) {
                        score = 0;
                    }

                    return {
                        category:
                            value.category ??
                            value.name ??
                            category,

                        correct,
                        total,

                        score: Math.max(
                            0,
                            Math.min(100, score)
                        ),
                    };
                }

                const numericValue =
                    Number(value) || 0;

                return {
                    category,
                    correct: 0,
                    total: 0,
                    score: Math.max(
                        0,
                        Math.min(
                            100,
                            numericValue
                        )
                    ),
                };
            }
        );
    }

    return [];
};

/* =====================================================
   COMPONENT
===================================================== */

function AssessmentResult() {
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [role, setRole] = useState("data-analyst");
    const [loading, setLoading] = useState(true);

    /*
     * IMPORTANT:
     * Category analysis starts CLOSED.
     */
    const [showCategoryAnalysis, setShowCategoryAnalysis] =
        useState(false);

    /* =================================================
       LOAD RESULT
    ================================================= */

    useEffect(() => {
        try {
            const storedResult =
                sessionStorage.getItem(
                    "assessmentResult"
                );

            const storedRole =
                localStorage.getItem(
                    "selectedRole"
                );

            if (storedRole) {
                setRole(storedRole);
            }

            if (storedResult) {
                const parsedResult =
                    JSON.parse(storedResult);

                setResult(parsedResult);
            }
        } catch (error) {
            console.error(
                "Unable to load assessment result:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, []);

    /* =================================================
       BASIC CALCULATED DATA
    ================================================= */

    const roleTitle = useMemo(
        () => getRoleTitle(role),
        [role]
    );

    const score = useMemo(
        () => getScore(result),
        [result]
    );

    const correctAnswers = useMemo(
        () => getCorrectAnswers(result),
        [result]
    );

    const totalQuestions = useMemo(
        () => getTotalQuestions(result),
        [result]
    );

    const incorrectAnswers = Math.max(
        0,
        totalQuestions - correctAnswers
    );

    const performance = useMemo(
        () => getPerformanceLabel(score),
        [score]
    );

    const performanceMessage = useMemo(
        () =>
            getPerformanceMessage(
                score,
                roleTitle
            ),
        [score, roleTitle]
    );

    /* =================================================
       CATEGORY PERFORMANCE
    ================================================= */

    const categoryPerformance = useMemo(
        () => getCategoryPerformance(result),
        [result]
    );

    /* =================================================
       STRENGTHS
    ================================================= */

    const strengths = useMemo(() => {
        const backendStrengths =
            result?.strengths ??
            result?.strongAreas ??
            result?.strengthsList;

        const normalized =
            normalizeArray(backendStrengths);

        if (normalized.length > 0) {
            return normalized;
        }

        /*
         * Automatically derive strengths
         * from category scores.
         */

        const derivedStrengths =
            categoryPerformance
                .filter(
                    (item) =>
                        Number(item.score) >= 75
                )
                .sort(
                    (a, b) =>
                        b.score - a.score
                )
                .slice(0, 3);

        if (derivedStrengths.length > 0) {
            return derivedStrengths.map(
                (item) => ({
                    title: item.category,

                    description:
                        item.total > 0
                            ? `You answered ${item.correct} of ${item.total} questions correctly in this area, showing strong understanding.`
                            : `You demonstrated strong performance in ${item.category}.`,
                })
            );
        }

        return [
            {
                title:
                    "Technical Foundation",

                description:
                    `You demonstrated ${performance.toLowerCase()} overall technical knowledge for ${roleTitle}.`,
            },
        ];
    }, [
        result,
        categoryPerformance,
        performance,
        roleTitle,
    ]);

    /* =================================================
       AREAS TO IMPROVE
    ================================================= */

    const areasToImprove = useMemo(() => {
        const backendAreas =
            result?.areasToImprove ??
            result?.weakAreas ??
            result?.improvements ??
            result?.weaknesses;

        const normalized =
            normalizeArray(backendAreas);

        if (normalized.length > 0) {
            return normalized;
        }

        /*
         * Automatically derive weak areas
         * from category performance.
         */

        const derivedAreas =
            categoryPerformance
                .filter(
                    (item) =>
                        Number(item.score) < 75
                )
                .sort(
                    (a, b) =>
                        a.score - b.score
                )
                .slice(0, 4);

        if (derivedAreas.length > 0) {
            return derivedAreas.map(
                (item) => ({
                    title: item.category,

                    description:
                        item.total > 0
                            ? `You answered ${item.correct} of ${item.total} questions correctly in this area. Additional practice is recommended.`
                            : `Spend additional time strengthening ${item.category}.`,
                })
            );
        }

        return [
            {
                title:
                    "Continue Skill Development",

                description:
                    `Continue practising ${roleTitle} concepts and work on real-world projects to strengthen your practical knowledge.`,
            },
        ];
    }, [
        result,
        categoryPerformance,
        roleTitle,
    ]);

    /* =================================================
       RETAKE
    ================================================= */

    const handleRetake = () => {
        sessionStorage.removeItem(
            "assessmentResult"
        );

        navigate("/career-assessment");
    };

    /* =================================================
       DASHBOARD
    ================================================= */

    const handleDashboard = () => {
        navigate("/dashboard");
    };

    /* =================================================
       CAREER ROADMAP
    ================================================= */

    const handleCareerRoadmap = () => {
        navigate("/career-roadmap");
    };

    /* =================================================
       LOADING
    ================================================= */

    if (loading) {
        return (
            <div className="result-page">
                <div className="result-loading">
                    <div className="result-spinner"></div>

                    <h2>
                        Preparing your result...
                    </h2>

                    <p>
                        Please wait while we prepare
                        your assessment report.
                    </p>
                </div>
            </div>
        );
    }

    /* =================================================
       NO RESULT
    ================================================= */

    if (!result) {
        return (
            <div className="result-page">
                <header className="result-header">
                    <button
                        type="button"
                        className="result-dashboard-link"
                        onClick={handleDashboard}
                    >
                        ← Dashboard
                    </button>

                    <div className="result-brand">
                        <div className="result-brand-logo">
                            C
                        </div>

                        <div>
                            <strong>
                                CareerBridge
                            </strong>

                            <span>
                                Career Assessment
                            </span>
                        </div>
                    </div>
                </header>

                <main className="result-empty">
                    <div className="empty-icon">
                        !
                    </div>

                    <h1>
                        Assessment Result Not Found
                    </h1>

                    <p>
                        Your assessment result is not
                        available. Please complete the
                        assessment again.
                    </p>

                    <button
                        type="button"
                        className="primary-result-button"
                        onClick={handleRetake}
                    >
                        Start Assessment
                    </button>
                </main>
            </div>
        );
    }

    /* =================================================
       MAIN RESULT
    ================================================= */

    return (
        <div className="result-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="result-header">

                <button
                    type="button"
                    className="result-dashboard-link"
                    onClick={handleDashboard}
                >
                    ← Dashboard
                </button>

                <div className="result-brand">

                    <div className="result-brand-logo">
                        C
                    </div>

                    <div>
                        <strong>
                            CareerBridge
                        </strong>

                        <span>
                            Career Assessment
                        </span>
                    </div>

                </div>

            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="result-main">

                {/* =================================================
                    INTRO
                ================================================= */}

                <section className="result-intro">

                    <p className="result-intro-label">
                        ASSESSMENT COMPLETE
                    </p>

                    <h1>
                        Your {roleTitle} Assessment Result
                    </h1>

                    <p>
                        Here is a detailed analysis of
                        your technical performance and
                        recommended areas for improvement.
                    </p>

                </section>

                {/* =================================================
                    SCORE CARD
                ================================================= */}

                <section className="result-score-card">

                    <div className="score-circle-wrapper">

                        <div
                            className="score-circle"
                            style={{
                                "--score":
                                    `${score}%`,
                            }}
                        >
                            <div className="score-circle-inner">

                                <strong>
                                    {score}%
                                </strong>

                                <span>
                                    Overall Score
                                </span>

                            </div>
                        </div>

                    </div>

                    <div className="score-content">

                        <p className="score-small-label">
                            OVERALL PERFORMANCE
                        </p>

                        <h2>
                            {performance}
                        </h2>

                        <p>
                            {performanceMessage}
                        </p>

                        <div className="score-mini-stats">

                            <div>
                                <strong>
                                    {correctAnswers}
                                </strong>

                                <span>
                                    Correct
                                </span>
                            </div>

                            <div>
                                <strong>
                                    {incorrectAnswers}
                                </strong>

                                <span>
                                    Incorrect
                                </span>
                            </div>

                            <div>
                                <strong>
                                    {totalQuestions}
                                </strong>

                                <span>
                                    Total
                                </span>
                            </div>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    PERFORMANCE OVERVIEW
                ================================================= */}

                <section className="result-section">

                    <div className="result-section-heading">

                        <div className="result-section-icon">
                            📈
                        </div>

                        <div>
                            <h2>
                                Performance Overview
                            </h2>

                            <p>
                                Your assessment performance at
                                a glance.
                            </p>
                        </div>

                    </div>

                    <div className="overview-grid">

                        <div className="overview-card">
                            <span>
                                Questions Attempted
                            </span>

                            <strong>
                                {totalQuestions}
                            </strong>
                        </div>

                        <div className="overview-card">
                            <span>
                                Correct Answers
                            </span>

                            <strong>
                                {correctAnswers}
                            </strong>
                        </div>

                        <div className="overview-card">
                            <span>
                                Accuracy
                            </span>

                            <strong>
                                {score}%
                            </strong>
                        </div>

                        <div className="overview-card">
                            <span>
                                Performance
                            </span>

                            <strong>
                                {performance}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* =================================================
                    CATEGORY ANALYSIS
                ================================================= */}

                <section className="result-section skill-section">

                    <button
                        type="button"
                        className="category-toggle"
                        onClick={() =>
                            setShowCategoryAnalysis(
                                (previous) =>
                                    !previous
                            )
                        }
                        aria-expanded={
                            showCategoryAnalysis
                        }
                    >

                        <div className="category-toggle-left">

                            <div className="result-section-icon">
                                📊
                            </div>

                            <div>
                                <h2>
                                    Category Analysis
                                </h2>

                                <p>
                                    {categoryPerformance.length > 0
                                        ? `${categoryPerformance.length} skill areas evaluated`
                                        : "Detailed skill analysis"}
                                </p>
                            </div>

                        </div>

                        <div className="category-toggle-right">

                            <span>
                                {showCategoryAnalysis
                                    ? "Hide"
                                    : "View"}
                            </span>

                            <span
                                className={`category-chevron ${
                                    showCategoryAnalysis
                                        ? "open"
                                        : ""
                                }`}
                            >
                                ▼
                            </span>

                        </div>

                    </button>

                    {showCategoryAnalysis && (

                        <div className="category-analysis-content">

                            {categoryPerformance.length > 0 ? (

                                <div className="skill-list">

                                    {categoryPerformance.map(
                                        (
                                            item,
                                            index
                                        ) => {

                                            const category =
                                                item.category ||
                                                `Skill ${
                                                    index + 1
                                                }`;

                                            const categoryScore =
                                                Math.round(
                                                    Math.max(
                                                        0,
                                                        Math.min(
                                                            100,
                                                            Number(
                                                                item.score
                                                            ) || 0
                                                        )
                                                    )
                                                );

                                            const hasQuestionCount =
                                                item.total >
                                                0;

                                            return (
                                                <div
                                                    className="skill-item"
                                                    key={`${category}-${index}`}
                                                >

                                                    <div className="skill-top">

                                                        <div className="skill-name-group">

                                                            <span className="skill-name">
                                                                {category}
                                                            </span>

                                                            {hasQuestionCount && (
                                                                <span className="skill-correct-text">
                                                                    {item.correct} /{" "}
                                                                    {item.total}{" "}
                                                                    correct
                                                                </span>
                                                            )}

                                                        </div>

                                                        <strong>
                                                            {categoryScore}%
                                                        </strong>

                                                    </div>

                                                    <div className="skill-bar">

                                                        <div
                                                            className={`skill-bar-fill ${
                                                                categoryScore >=
                                                                75
                                                                    ? "high"
                                                                    : categoryScore >=
                                                                      50
                                                                    ? "medium"
                                                                    : "low"
                                                            }`}
                                                            style={{
                                                                width: `${categoryScore}%`,
                                                            }}
                                                        />

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            ) : (

                                <div className="skill-placeholder">

                                    <strong>
                                        Category analysis
                                        is not available.
                                    </strong>

                                    <span>
                                        Your assessment backend
                                        should return category
                                        or skill-level results
                                        to display them here.
                                    </span>

                                </div>

                            )}

                        </div>

                    )}

                </section>

                {/* =================================================
                    STRENGTHS
                ================================================= */}

                <section className="result-section">

                    <div className="result-section-heading">

                        <div className="result-section-icon strength-icon">
                            💪
                        </div>

                        <div>
                            <h2>
                                Your Strengths
                            </h2>

                            <p>
                                Areas where you demonstrated
                                stronger knowledge.
                            </p>
                        </div>

                    </div>

                    <div className="strength-grid">

                        {strengths.map(
                            (item, index) => {

                                const title =
                                    typeof item ===
                                    "string"
                                        ? item
                                        : item.title ??
                                          item.name ??
                                          "Technical Strength";

                                const description =
                                    typeof item ===
                                    "string"
                                        ? `You demonstrated good knowledge in ${item}.`
                                        : item.description ??
                                          item.details ??
                                          "You demonstrated good understanding in this area.";

                                return (
                                    <div
                                        className="strength-card"
                                        key={`${title}-${index}`}
                                    >

                                        <div className="strength-check">
                                            ✓
                                        </div>

                                        <div>
                                            <strong>
                                                {title}
                                            </strong>

                                            <p>
                                                {description}
                                            </p>
                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </section>

                {/* =================================================
                    AREAS TO IMPROVE
                ================================================= */}

                <section className="result-section">

                    <div className="result-section-heading">

                        <div className="result-section-icon improve-icon">
                            🎯
                        </div>

                        <div>
                            <h2>
                                Areas to Improve
                            </h2>

                            <p>
                                Skills that should receive
                                additional attention.
                            </p>
                        </div>

                    </div>

                    <div className="improve-grid">

                        {areasToImprove.map(
                            (item, index) => {

                                const title =
                                    typeof item ===
                                    "string"
                                        ? item
                                        : item.title ??
                                          item.name ??
                                          "Continue Skill Development";

                                const description =
                                    typeof item ===
                                    "string"
                                        ? `Spend additional time practising ${item}.`
                                        : item.description ??
                                          item.details ??
                                          "Additional practice is recommended in this area.";

                                return (
                                    <div
                                        className="improve-card"
                                        key={`${title}-${index}`}
                                    >

                                        <div className="improve-icon-circle">
                                            !
                                        </div>

                                        <div>
                                            <strong>
                                                {title}
                                            </strong>

                                            <p>
                                                {description}
                                            </p>
                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </section>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="result-actions">

                    <button
                        type="button"
                        className="secondary-result-button"
                        onClick={handleRetake}
                    >
                        Retake Assessment
                    </button>

                    <button
                        type="button"
                        className="secondary-result-button roadmap-button"
                        onClick={handleCareerRoadmap}
                    >
                        View Career Roadmap
                    </button>

                    <button
                        type="button"
                        className="primary-result-button"
                        onClick={handleDashboard}
                    >
                        Back to Dashboard →
                    </button>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <p className="result-footer">
                    CareerBridge assessment results are
                    generated from your submitted technical
                    assessment responses.
                </p>

            </main>
        </div>
    );
}

export default AssessmentResult;