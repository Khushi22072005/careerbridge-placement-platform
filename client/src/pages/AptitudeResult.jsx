
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssessmentResult.css";

/* =========================================================
   FORMAT COMPLETION DATE
========================================================= */

const formatCompletedDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const getNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

const normalizeResult = (data) => {
    if (!data || typeof data !== "object") return null;

    const raw =
        data.result && typeof data.result === "object"
            ? data.result
            : data;

    const total = getNumber(
        raw.total_questions ??
        raw.totalQuestions ??
        raw.total,
        0
    );

    const correct = getNumber(
        raw.correct_answers ??
        raw.correctAnswers ??
        raw.correct,
        0
    );

    const incorrect = getNumber(
        raw.incorrect_answers ??
        raw.incorrectAnswers ??
        raw.incorrect,
        Math.max(0, total - correct)
    );

    const scoreValue =
        raw.score ??
        raw.percentage ??
        raw.overallPercentage ??
        raw.scorePercentage;

    const score =
        scoreValue !== undefined
            ? getNumber(scoreValue, 0)
            : total > 0
                ? (correct / total) * 100
                : 0;

    return {
        category: raw.category || "Aptitude Assessment",
        totalQuestions: total,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        score: Math.max(0, Math.min(100, score)),
        completedAt:
            raw.completed_at ??
            raw.completedAt ??
            null,
        completed: raw.completed,
    };
};

/* =========================================================
   PERFORMANCE MESSAGE
========================================================= */

const getPerformanceMessage = (score) => {
    if (score >= 90) {
        return "Excellent performance! Continue practising to maintain your reasoning skills.";
    }

    if (score >= 75) {
        return "You answered a large share of the questions correctly. Keep practising to strengthen your skills.";
    }

    if (score >= 60) {
        return "You have made a good start. Review the questions you missed to improve your performance.";
    }

    if (score >= 40) {
        return "There are some concepts to revisit. Review your learning material and try another practice test.";
    }

    return "More practice can help you build confidence. Review the concepts and try again when you are ready.";
};

/* =========================================================
   ANSWER HELPERS
========================================================= */

const getOptionLabel = (option) => {
    if (option === null || option === undefined || option === "") {
        return "";
    }

    return String(option).trim().toUpperCase();
};

const getAnswerText = (answer, optionValue) => {
    if (
        optionValue === null ||
        optionValue === undefined ||
        optionValue === ""
    ) {
        return "Not answered";
    }

    const options = {
        A: answer.option_a,
        B: answer.option_b,
        C: answer.option_c,
        D: answer.option_d,
    };

    const value = String(optionValue).trim();
    const letter = getOptionLabel(value);

    // Database stores A, B, C or D.
    if (
        Object.prototype.hasOwnProperty.call(options, letter) &&
        options[letter] !== null &&
        options[letter] !== undefined
    ) {
        return `${letter}. ${options[letter]}`;
    }

    // Database stores the complete answer text.
    return value;
};

const isAnswerCorrect = (answer) => {
    const value = answer.is_correct;

    return (
        value === true ||
        value === 1 ||
        value === "1" ||
        String(value).toLowerCase() === "true"
    );
};

/* =========================================================
   APTITUDE RESULT COMPONENT
========================================================= */

function AptitudeResult() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadResult = async () => {
            setLoading(true);
            setError("");

            const key = `aptitudeResult_${assessmentId}`;

            let savedResult = null;

            try {
                const saved = sessionStorage.getItem(key);

                if (saved) {
                    try {
                        savedResult = JSON.parse(saved);
                    } catch {
                        sessionStorage.removeItem(key);
                    }
                }

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `http://localhost:5000/api/aptitude/result/${assessmentId}`,
                    {
                        headers: token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {},
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                        "Could not load this assessment result."
                    );
                }

                const normalized = normalizeResult(data);

                if (
                    !normalized ||
                    normalized.totalQuestions === 0
                ) {
                    throw new Error(
                        "The result contains no question-count information."
                    );
                }

                const detailedAnswers = Array.isArray(data.answers)
                    ? data.answers
                    : [];

                if (!cancelled) {
                    setResult(normalized);
                    setAnswers(detailedAnswers);

                    // Save both the summary and detailed answers.
                    sessionStorage.setItem(
                        key,
                        JSON.stringify({
                            result: data.result || data,
                            answers: detailedAnswers,
                        })
                    );
                }
            } catch (err) {
                // Use the saved result if the backend is unavailable.
                if (savedResult) {
                    const cachedResult = normalizeResult(savedResult);

                    if (
                        cachedResult &&
                        cachedResult.totalQuestions > 0
                    ) {
                        if (!cancelled) {
                            setResult(cachedResult);
                            setAnswers(
                                Array.isArray(savedResult.answers)
                                    ? savedResult.answers
                                    : []
                            );
                        }
                    } else if (!cancelled) {
                        setError(
                            err.message ||
                            "Unable to load assessment results."
                        );
                    }
                } else if (!cancelled) {
                    setError(
                        err.message ||
                        "Unable to load assessment results."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadResult();

        return () => {
            cancelled = true;
        };
    }, [assessmentId]);

    /* =====================================================
       SCORE CALCULATIONS
    ===================================================== */

    const score = useMemo(
        () => result?.score ?? 0,
        [result]
    );

    const correctWidth = result?.totalQuestions
        ? `${(
            (result.correctAnswers / result.totalQuestions) * 100
        )}%`
        : "0%";

    const incorrectWidth = result?.totalQuestions
        ? `${(
            (result.incorrectAnswers / result.totalQuestions) * 100
        )}%`
        : "0%";

    const performance =
        score >= 90
            ? "Excellent"
            : score >= 75
                ? "Very Good"
                : score >= 60
                    ? "Good"
                    : score >= 40
                        ? "Needs Improvement"
                        : "Needs Attention";

    const handleRetake = () => {
        navigate("/aptitude-practice");
    };

    /* =====================================================
       LOADING STATE
    ===================================================== */

    if (loading) {
        return (
            <div className="result-page">
                <div className="result-loading">
                    <div className="result-spinner" />
                    <h2>Preparing your result...</h2>
                    <p>
                        Please wait while your assessment report loads.
                    </p>
                </div>
            </div>
        );
    }

    /* =====================================================
       ERROR STATE
    ===================================================== */

    if (error || !result) {
        return (
            <div className="result-page">
                <header className="result-header">
                    <div className="result-brand">
                        <div className="result-brand-logo">C</div>
                        <div>
                            <strong>CareerBridge</strong>
                            <span>Aptitude Assessment Report</span>
                        </div>
                    </div>
                </header>

                <main className="result-empty">
                    <div className="empty-icon">!</div>
                    <h1>Assessment Result Unavailable</h1>
                    <p>
                        {error ||
                            "No result was found for this attempt."}
                    </p>

                    <button
                        type="button"
                        className="primary-result-button"
                        onClick={handleRetake}
                    >
                        Back to Aptitude Practice
                    </button>
                </main>
            </div>
        );
    }

    /* =====================================================
       RESULT REPORT
    ===================================================== */

    return (
        <div className="result-page">
            <header className="result-header">
                <button
                    type="button"
                    className="result-dashboard-link"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>

                <div className="result-brand">
                    <div className="result-brand-logo">C</div>
                    <div>
                        <strong>CareerBridge</strong>
                        <span>Aptitude Assessment Report</span>
                    </div>
                </div>
            </header>

            <main className="result-main">

                {/* INTRODUCTION */}

                <section className="result-intro">
                    <p className="result-intro-label">
                        CAREERBRIDGE • APTITUDE ASSESSMENT
                    </p>

                    <h1>Your Assessment Results</h1>

                    <p>
                        Review your performance in {result.category}.
                    </p>
                </section>

                {/* ASSESSMENT SUMMARY */}

                <section className="result-section">
                    <div className="result-section-heading">
                        <div className="result-section-icon">
                            
                        </div>

                        <div>
                            <h2>Assessment Summary</h2>
                            <p>
                                Details of your completed assessment.
                            </p>
                        </div>
                    </div>

                    <div className="overview-grid">
                        <div className="overview-card">
                            <span>Assessment Type</span>
                            <strong>Aptitude Assessment</strong>
                        </div>

                        <div className="overview-card">
                            <span>Category</span>
                            <strong>{result.category}</strong>
                        </div>

                        <div className="overview-card">
                            <span>Total Questions</span>
                            <strong>{result.totalQuestions}</strong>
                        </div>

                        <div className="overview-card">
                            <span>Completed On</span>
                            <strong>
                                {formatCompletedDate(result.completedAt)}
                            </strong>
                        </div>
                    </div>
                </section>

                {/* OVERALL SCORE */}

                <section className="result-score-card">
                    <div className="score-circle-wrapper">
                        <div
                            className="score-circle"
                            style={{
                                "--score": `${score}%`,
                            }}
                            role="img"
                            aria-label={`Overall score: ${score}%`}
                        >
                            <div className="score-circle-inner">
                                <strong>
                                    {score.toFixed(0)}%
                                </strong>
                                <span>Overall Score</span>
                            </div>
                        </div>
                    </div>

                    <div className="score-content">
                        <p className="score-small-label">
                            ASSESSMENT PERFORMANCE
                        </p>

                        <h2>{performance}</h2>

                        <p>{getPerformanceMessage(score)}</p>

                        <div className="score-mini-stats">
                            <div>
                                <strong>
                                    {result.correctAnswers}
                                </strong>
                                <span>Correct</span>
                            </div>

                            <div>
                                <strong>
                                    {result.incorrectAnswers}
                                </strong>
                                <span>Incorrect</span>
                            </div>

                            <div>
                                <strong>
                                    {result.totalQuestions}
                                </strong>
                                <span>Total</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ANSWER BREAKDOWN SUMMARY + OPTIONAL DROPDOWN */}

                <section className="result-section">
                    <div className="result-section-heading">
                        <div className="result-section-icon">
                            
                        </div>

                        <div>
                            <h2>Answer Breakdown</h2>
                            <p>
                                See your overall answer summary or
                                optionally review each question.
                            </p>
                        </div>
                    </div>

                    <div className="overview-grid">
                        <div className="overview-card">
                            <span>Correct Answers</span>
                            <strong>{result.correctAnswers}</strong>
                        </div>

                        <div className="overview-card">
                            <span>Incorrect Answers</span>
                            <strong>{result.incorrectAnswers}</strong>
                        </div>
                    </div>

                    {/* PERFORMANCE BAR */}

                    <div
                        style={{
                            display: "flex",
                            width: "100%",
                            height: 18,
                            overflow: "hidden",
                            borderRadius: 999,
                            background: "#e9e5f2",
                            marginTop: 22,
                        }}
                        role="img"
                        aria-label={`${result.correctAnswers} correct and ${result.incorrectAnswers} incorrect answers`}
                    >
                        <div
                            style={{
                                width: correctWidth,
                                background: "#16a34a",
                                transition: "width 0.4s ease",
                            }}
                        />

                        <div
                            style={{
                                width: incorrectWidth,
                                background: "#ef4444",
                                transition: "width 0.4s ease",
                            }}
                        />
                    </div>

                    <p style={{ marginTop: 14 }}>
                        🟢 Correct: {result.correctAnswers}
                        {"  "}
                        🔴 Incorrect: {result.incorrectAnswers}
                    </p>

                    {/* COLLAPSIBLE QUESTION REVIEW */}

                    <details className="answer-breakdown-dropdown">
                        <summary className="answer-breakdown-summary">
                            <span className="answer-breakdown-summary-text">
                                <strong>Review Your Answers</strong>
                                <small>
                                    View each question, your answer,
                                    and the correct answer.
                                </small>
                            </span>

                            <span
                                className="answer-breakdown-arrow"
                                aria-hidden="true"
                            >
                                ⌄
                            </span>
                        </summary>

                        <div className="answer-breakdown-content">
                            {answers.length > 0 ? (
                                <div className="answer-breakdown-list">
                                    {answers.map((answer, index) => {
                                        const selected =
                                            answer.selected_option ??
                                            answer.selectedOption;

                                        const correct =
                                            answer.correct_option ??
                                            answer.correctOption;

                                        const isCorrect =
                                            isAnswerCorrect(answer);

                                        return (
                                            <article
                                                key={
                                                    answer.question_id ??
                                                    answer.questionId ??
                                                    index
                                                }
                                                className={`answer-breakdown-card ${
                                                    isCorrect
                                                        ? "answer-correct"
                                                        : "answer-incorrect"
                                                }`}
                                            >
                                                <div className="answer-card-heading">
                                                    <h3>
                                                        Question {index + 1}
                                                    </h3>

                                                    <span
                                                        className={`answer-status ${
                                                            isCorrect
                                                                ? "status-correct"
                                                                : "status-incorrect"
                                                        }`}
                                                    >
                                                        {isCorrect
                                                            ? "✓ Correct"
                                                            : "✕ Incorrect"}
                                                    </span>
                                                </div>

                                                <p className="answer-question-text">
                                                    {answer.question ||
                                                        answer.question_text ||
                                                        "Question text unavailable"}
                                                </p>

                                                <div className="answer-detail-row">
                                                    <strong>Your answer</strong>

                                                    <span>
                                                        {getAnswerText(
                                                            answer,
                                                            selected
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="answer-detail-row">
                                                    <strong>
                                                        Correct answer
                                                    </strong>

                                                    <span>
                                                        {getAnswerText(
                                                            answer,
                                                            correct
                                                        )}
                                                    </span>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="answer-breakdown-empty">
                                    <p>
                                        Detailed answers are not available
                                        for this attempt. Your overall score
                                        is shown above.
                                    </p>
                                </div>
                            )}
                        </div>
                    </details>
                </section>

                {/* SCORE INTERPRETATION */}

                <section className="result-section">
                    <div className="result-section-heading">
                        <div className="result-section-icon">
                            
                        </div>

                        <div>
                            <h2>Score Interpretation</h2>
                            <p>
                                A summary of your performance on this attempt.
                            </p>
                        </div>
                    </div>

                    <div className="skill-placeholder">
                        <strong>{performance}</strong>

                        <span>
                            You answered {result.correctAnswers} out of{" "}
                            {result.totalQuestions} questions correctly
                            in {result.category}. This result reflects
                            this attempt only.
                        </span>
                    </div>
                </section>

                {/* NEXT STEPS */}

                <section className="result-section">
                    <div className="result-section-heading">
                        <div className="result-section-icon">
                            
                        </div>

                        <div>
                            <h2>What You Can Do Next</h2>
                            <p>
                                Continue your preparation with CareerBridge.
                            </p>
                        </div>
                    </div>

                    <div className="improve-grid">
                        <div className="improve-card">
                            <div className="improve-icon-circle">
                                1
                            </div>

                            <div>
                                <strong>Review the concepts</strong>
                                <p>
                                    Revisit the learning material for{" "}
                                    {result.category}.
                                </p>
                            </div>
                        </div>

                        <div className="improve-card">
                            <div className="improve-icon-circle">
                                2
                            </div>

                            <div>
                                <strong>Practise another category</strong>
                                <p>
                                    Build your reasoning skills with other
                                    aptitude categories.
                                </p>
                            </div>
                        </div>

                        <div className="improve-card">
                            <div className="improve-icon-circle">
                                3
                            </div>

                            <div>
                                <strong>Try another attempt</strong>
                                <p>
                                    Practise again and compare your
                                    performance across attempts.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NAVIGATION BUTTONS */}

                <div className="result-actions">
                    <button
                        type="button"
                        className="secondary-result-button"
                        onClick={handleRetake}
                    >
                        Try Another Test
                    </button>

                    <button
                        type="button"
                        className="secondary-result-button"
                        onClick={() => navigate("/assessments")}
                    >
                        Back to Assessments
                    </button>

                    <button
                        type="button"
                        className="primary-result-button"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard →
                    </button>
                </div>

                <p className="result-footer">
                    This report is based on the answers submitted for
                    this aptitude assessment attempt.
                </p>
            </main>
        </div>
    );
}

export default AptitudeResult;
