import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AssessmentResult.css";

const ROLE_TITLES = {
  "software-developer": "Software Developer",
  "data-analyst": "Data Analyst",
  cybersecurity: "Cybersecurity Analyst",
  "cloud-devops": "Cloud / DevOps Engineer",
  "ui-ux": "UI/UX Designer",
};

const getRoleTitle = (role, backendTitle) => {
  if (backendTitle) return backendTitle;
  if (!role) return "Technical";

  return (
    ROLE_TITLES[role] ||
    role
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};

const getNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getScore = (result) => {
  if (!result) return 0;

  const value =
    result.percentage ??
    result.overallPercentage ??
    result.scorePercentage ??
    result.accuracy ??
    result.score;

  if (value !== undefined && value !== null && value !== "") {
    const score = Number(value);
    if (Number.isFinite(score)) {
      return Math.max(0, Math.min(100, Math.round(score)));
    }
  }

  const correct = getNumber(
    result.correctAnswers ?? result.correct,
    0
  );
  const total = getNumber(
    result.totalQuestions ?? result.total,
    0
  );

  return total > 0
    ? Math.round((correct / total) * 100)
    : 0;
};

const getSavedResult = () => {
  const keysToCheck = [
    ["session", "assessmentResult"],
    ["local", "assessmentResult"],
    ["local", "technicalAssessmentResult"],
  ];

  for (const [storageType, key] of keysToCheck) {
    const storage =
      storageType === "session" ? sessionStorage : localStorage;

    const stored = storage.getItem(key);
    if (!stored) continue;

    try {
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        continue;
      }

      const result =
        parsed.result &&
        typeof parsed.result === "object" &&
        !Array.isArray(parsed.result)
          ? parsed.result
          : parsed;

      return result;
    } catch (error) {
      console.error(`Could not parse ${key}:`, error);
    }
  }

  return null;
};

const formatCompletedDate = (dateValue) => {
  if (!dateValue) return "Date not available";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Date not available";

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getPerformanceMessage = (score) => {
  if (score >= 90) {
    return "You answered most questions correctly in this attempt. Keep practising to maintain your understanding.";
  }

  if (score >= 75) {
    return "You answered a large share of the questions correctly. Continued practice can help reinforce your knowledge.";
  }

  if (score >= 60) {
    return "Your answers show some understanding of the assessed material. Reviewing the questions you missed may help you prepare for another attempt.";
  }

  if (score >= 40) {
    return "This attempt indicates that there are several questions to revisit. Review the relevant learning material and consider retaking the assessment.";
  }

  return "This attempt shows that more practice may be useful before moving on. Review the learning material for this skill and try the assessment again when you feel ready.";
};

function AssessmentResult() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [storedRole, setStoredRole] = useState("");
  const [storedSkill, setStoredSkill] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = getSavedResult();

      const role =
        localStorage.getItem("selectedRole") ||
        localStorage.getItem("selectedCareerRole") ||
        "";

      const skill =
        localStorage.getItem("selectedSkill") ||
        localStorage.getItem("selectedCareerSkill") ||
        "";

      setStoredRole(role);
      setStoredSkill(skill);

      if (saved) {
        setResult(saved);
        console.log("Assessment result loaded:", saved);
      } else {
        console.warn("No saved assessment result found.");
      }
    } catch (error) {
      console.error("Unable to load assessment result:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const role = result?.role || storedRole;
  const skill = result?.skill || storedSkill;

  const roleTitle = useMemo(
    () => getRoleTitle(role, result?.roleTitle || result?.roleName),
    [role, result?.roleTitle, result?.roleName]
  );

  const score = useMemo(() => getScore(result), [result]);

  const totalQuestions = Math.max(
    0,
    getNumber(result?.totalQuestions ?? result?.total, 20)
  );

  const correctAnswers = Math.max(
    0,
    getNumber(result?.correctAnswers ?? result?.correct, 0)
  );

  const incorrectAnswers = Math.max(
    0,
    getNumber(
      result?.incorrectAnswers ?? result?.incorrect,
      totalQuestions - correctAnswers
    )
  );

  const completedAt = formatCompletedDate(result?.completedAt);

  const performance =
    result?.performanceLevel ||
    result?.performance ||
    (score >= 90
      ? "Excellent"
      : score >= 75
      ? "Very Good"
      : score >= 60
      ? "Good"
      : score >= 40
      ? "Needs Improvement"
      : "Needs Attention");

  const correctWidth =
    totalQuestions > 0
      ? `${(correctAnswers / totalQuestions) * 100}%`
      : "0%";

  const incorrectWidth =
    totalQuestions > 0
      ? `${(incorrectAnswers / totalQuestions) * 100}%`
      : "0%";

  const handleRetake = () => {
    sessionStorage.removeItem("assessmentResult");
    localStorage.removeItem("assessmentResult");
    localStorage.removeItem("technicalAssessmentResult");
    navigate("/career-assessment");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleCareerRoadmap = () => {
    navigate("/career-roadmap");
  };

  if (loading) {
    return (
      <div className="result-page">
        <div className="result-loading">
          <div className="result-spinner" />
          <h2>Preparing your result...</h2>
          <p>Please wait while your assessment report loads.</p>
        </div>
      </div>
    );
  }

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
            <div className="result-brand-logo">C</div>
            <div>
              <strong>CareerBridge</strong>
              <span>Assessment Report</span>
            </div>
          </div>
        </header>

        <main className="result-empty">
          <div className="empty-icon">!</div>
          <h1>Assessment Result Not Found</h1>
          <p>
            We could not find a saved result for this attempt. Please
            complete the assessment again to generate your report.
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
          <div className="result-brand-logo">C</div>
          <div>
            <strong>CareerBridge</strong>
            <span>Assessment Report</span>
          </div>
        </div>
      </header>

      <main className="result-main">
        {/* REPORT INTRO */}
        <section className="result-intro">
          <p className="result-intro-label">ASSESSMENT REPORT</p>
          <h1>Your Assessment Results</h1>
          <p>
            Review your score and answer summary for the completed
            assessment.
          </p>
        </section>

        {/* ASSESSMENT SUMMARY */}
        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon">📋</div>
            <div>
              <h2>Assessment Summary</h2>
              <p>Details of your completed assessment.</p>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-card">
              <span>Career Role</span>
              <strong>{roleTitle}</strong>
            </div>

            <div className="overview-card">
              <span>Skill Assessed</span>
              <strong>{skill || "Not specified"}</strong>
            </div>

            <div className="overview-card">
              <span>Total Questions</span>
              <strong>{totalQuestions}</strong>
            </div>

            <div className="overview-card">
              <span>Completed On</span>
              <strong>{completedAt}</strong>
            </div>
          </div>
        </section>

        {/* OVERALL SCORE */}
        <section className="result-score-card">
          <div className="score-circle-wrapper">
            <div
              className="score-circle"
              style={{ "--score": `${score}%` }}
              role="img"
              aria-label={`Overall score: ${score}%`}
            >
              <div className="score-circle-inner">
                <strong>{score}%</strong>
                <span>Overall Score</span>
              </div>
            </div>
          </div>

          <div className="score-content">
            <p className="score-small-label">ASSESSMENT PERFORMANCE</p>
            <h2>{performance}</h2>
            <p>{getPerformanceMessage(score)}</p>

            <div className="score-mini-stats">
              <div>
                <strong>{correctAnswers}</strong>
                <span>Correct</span>
              </div>
              <div>
                <strong>{incorrectAnswers}</strong>
                <span>Incorrect</span>
              </div>
              <div>
                <strong>{totalQuestions}</strong>
                <span>Total</span>
              </div>
            </div>
          </div>
        </section>

        {/* ANSWER BREAKDOWN */}
        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon">📊</div>
            <div>
              <h2>Answer Breakdown</h2>
              <p>How your submitted answers were scored.</p>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-card">
              <span>Correct Answers</span>
              <strong>{correctAnswers}</strong>
            </div>

            <div className="overview-card">
              <span>Incorrect Answers</span>
              <strong>{incorrectAnswers}</strong>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              height: "18px",
              overflow: "hidden",
              borderRadius: "999px",
              background: "#e9e5f2",
              marginTop: "22px",
            }}
            aria-label={`${correctAnswers} correct and ${incorrectAnswers} incorrect answers`}
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

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              marginTop: "14px",
            }}
          >
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#16a34a",
                  marginRight: "7px",
                }}
              />
              Correct: {correctAnswers}
            </span>

            <span>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  marginRight: "7px",
                }}
              />
              Incorrect: {incorrectAnswers}
            </span>
          </div>
        </section>

        {/* SCORE INTERPRETATION */}
        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon">📝</div>
            <div>
              <h2>Score Interpretation</h2>
              <p>A brief explanation of your assessment outcome.</p>
            </div>
          </div>

          <div className="skill-placeholder">
            <strong>{performance}</strong>
            <span>
              You scored {score}% by answering {correctAnswers} out of{" "}
              {totalQuestions} questions correctly. This result reflects
              your performance on this assessment attempt only. It is
              not a complete measure of your overall ability or career
              readiness.
            </span>
          </div>
        </section>

        {/* NEXT STEPS */}
        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon">🚀</div>
            <div>
              <h2>What You Can Do Next</h2>
              <p>Continue your preparation with CareerBridge.</p>
            </div>
          </div>

          <div className="improve-grid">
            <div className="improve-card">
              <div className="improve-icon-circle">1</div>
              <div>
                <strong>Review the assessed skill</strong>
                <p>
                  Revisit the learning material for {skill || "this skill"}
                  and practise questions related to the assessment.
                </p>
              </div>
            </div>

            <div className="improve-card">
              <div className="improve-icon-circle">2</div>
              <div>
                <strong>Continue your career preparation</strong>
                <p>
                  Explore your career roadmap and keep working toward
                  your learning goals.
                </p>
              </div>
            </div>

            <div className="improve-card">
              <div className="improve-icon-circle">3</div>
              <div>
                <strong>Retake when you are ready</strong>
                <p>
                  After practising, take the assessment again to review
                  your performance on a new attempt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ACTION BUTTONS */}
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

        <p className="result-footer">
          This report is based on the answers submitted for this
          assessment attempt.
        </p>
      </main>
    </div>
  );
}

export default AssessmentResult;