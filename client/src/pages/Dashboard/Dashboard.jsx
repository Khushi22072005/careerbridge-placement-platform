
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import logoImg from "../../assets/images/logo.jpeg";

const API_BASE = "http://localhost:5000/api";
const REQUIRED_QUESTIONS = 20;
const VISIBLE_HISTORY_COUNT = 5;
const CHART_HISTORY_COUNT = 10;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assessment, setAssessment] = useState(null);

  const [attempts, setAttempts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  // NEW: Controls the assessment history dropdown.
  const [showAllHistory, setShowAllHistory] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const email =
        localStorage.getItem("userEmail") ||
        localStorage.getItem("email");

      if (!email) {
        throw new Error("User email not found. Please log in again.");
      }

      const response = await fetch(
        `${API_BASE}/dashboard/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load your dashboard."
        );
      }

      setUser(data.user || null);
      setProfile(data.profile || null);
      setAssessment(data.assessment || null);
      setDashboard(data.dashboard || null);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // FETCH REAL ASSESSMENT HISTORY
  // =====================================================

  const fetchAssessmentHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      const headers = {
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE}/assessment/history`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid history response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load assessment performance."
        );
      }

      const history = Array.isArray(data)
        ? data
        : Array.isArray(data.attempts)
        ? data.attempts
        : Array.isArray(data.history)
        ? data.history
        : [];

      const normalizedAttempts = history
        .map((attempt, index) => {
          const rawScore = Number(
            attempt.score ??
              attempt.percentage ??
              attempt.overallPercentage
          );

          const score = Number.isFinite(rawScore)
            ? Math.min(100, Math.max(0, rawScore))
            : 0;

          const rawTotal = Number(
            attempt.totalQuestions ??
              attempt.total_questions ??
              REQUIRED_QUESTIONS
          );

          const rawCorrect = Number(
            attempt.correctAnswers ??
              attempt.correct_answers ??
              0
          );

          const rawIncorrect = Number(
            attempt.incorrectAnswers ??
              attempt.incorrect_answers ??
              0
          );

          return {
            id: attempt.id ?? `attempt-${index}`,

            role:
              attempt.roleName ||
              attempt.role_name ||
              attempt.role ||
              "",

            skill:
              attempt.skill ||
              attempt.assessmentSkill ||
              attempt.assessment_skill ||
              "",

            score,

            totalQuestions:
              Number.isFinite(rawTotal) && rawTotal > 0
                ? rawTotal
                : REQUIRED_QUESTIONS,

            correctAnswers:
              Number.isFinite(rawCorrect) && rawCorrect >= 0
                ? rawCorrect
                : 0,

            incorrectAnswers:
              Number.isFinite(rawIncorrect) && rawIncorrect >= 0
                ? rawIncorrect
                : 0,

            performanceLevel:
              attempt.performanceLevel ||
              attempt.performance_level ||
              "",

            completedAt:
              attempt.completedAt ||
              attempt.completed_at ||
              attempt.createdAt ||
              attempt.created_at ||
              null,
          };
        })
        .sort((a, b) => {
          const dateA = a.completedAt
            ? new Date(a.completedAt).getTime()
            : 0;

          const dateB = b.completedAt
            ? new Date(b.completedAt).getTime()
            : 0;

          if (dateA !== dateB) {
            return dateA - dateB;
          }

          return String(a.id).localeCompare(
            String(b.id),
            undefined,
            { numeric: true }
          );
        });

      setAttempts(normalizedAttempts);
    } catch (err) {
      console.error("Assessment history error:", err);

      setHistoryError(
        err.message ||
          "Unable to load assessment performance."
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD AND REFRESH
  // =====================================================

  useEffect(() => {
    fetchDashboard();
    fetchAssessmentHistory();
  }, [
    fetchDashboard,
    fetchAssessmentHistory,
    location.pathname,
  ]);

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="cb-state-screen">
        <div className="cb-spinner" />

        <h2>Preparing your career dashboard</h2>

        <p>
          Loading your CareerBridge progress...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (error) {
    return (
      <div className="cb-state-screen">
        <div className="cb-state-icon">!</div>

        <h2>Unable to load dashboard</h2>

        <p>{error}</p>

        <button
          className="cb-primary-button"
          onClick={fetchDashboard}
        >
          Try again
        </button>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  const readiness = clamp(
    dashboard?.placementReadiness ??
      dashboard?.placement_readiness
  );

  const roadmapProgress = clamp(
    dashboard?.roadmapProgress ??
      dashboard?.roadmap_progress
  );

  const resumeScore = clamp(
    dashboard?.resumeScore ??
      dashboard?.resume_score
  );

  const profileCompletion = clamp(
    dashboard?.profileCompletion ??
      dashboard?.profile_completion
  );

  const firstName =
    user?.fullname?.trim().split(/\s+/)[0] ||
    user?.name?.trim().split(/\s+/)[0] ||
    "Student";

  const fullName =
    user?.fullname ||
    user?.name ||
    "Student";

  // =====================================================
  // ASSESSMENT PERFORMANCE CALCULATIONS
  // =====================================================

  // Attempts are sorted from oldest to newest.
  const latestAttempt =
    attempts.length > 0
      ? attempts[attempts.length - 1]
      : null;

  const latestScore = latestAttempt
    ? latestAttempt.score
    : null;

  const bestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => attempt.score))
      : null;

  const previousAttempt =
    attempts.length > 1
      ? attempts[attempts.length - 2]
      : null;

  const improvement =
    latestAttempt && previousAttempt
      ? latestAttempt.score - previousAttempt.score
      : null;

  const assessmentCompleted = attempts.length > 0;

  const backendAssessment = assessment || {};

  let storedAssessment = null;

  try {
    const raw = sessionStorage.getItem("assessmentResult");

    if (raw) {
      storedAssessment = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read stored assessment:", err);
  }

  const assessmentSources = [
    backendAssessment,
    storedAssessment,
  ];

  const readNumber = (keys, max = Infinity) => {
    for (const source of assessmentSources) {
      for (const key of keys) {
        const value = source?.[key];

        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          continue;
        }

        const number = Number(value);

        if (
          Number.isFinite(number) &&
          number >= 0 &&
          number <= max
        ) {
          return number;
        }
      }
    }

    return null;
  };

  const totalQuestions =
    readNumber(
      ["totalQuestions", "total_questions", "total"],
      10000
    ) || REQUIRED_QUESTIONS;

  let correctAnswers = readNumber(
    [
      "correctAnswers",
      "correct_answers",
      "correctCount",
      "correct_count",
      "correct",
    ],
    totalQuestions
  );

  const assessmentPercentage = readNumber(
    [
      "percentage",
      "overallPercentage",
      "scorePercentage",
      "accuracy",
    ],
    100
  );

  if (
    correctAnswers === null &&
    assessmentPercentage !== null
  ) {
    correctAnswers = Math.round(
      (assessmentPercentage / 100) * totalQuestions
    );
  }

  if (correctAnswers === null) {
    const score = readNumber(
      ["score", "total_score", "totalScore"],
      totalQuestions
    );

    correctAnswers = score ?? 0;
  }

  correctAnswers = Math.min(
    totalQuestions,
    Math.max(0, Math.round(correctAnswers))
  );

  const assessmentPercent = latestAttempt
    ? latestAttempt.score
    : assessmentPercentage ?? 0;

  const tasks = Array.isArray(dashboard?.tasks)
    ? dashboard.tasks
    : [];

  const hasBasicInformation = Boolean(
    profile?.phone &&
      user?.fullname &&
      user?.email
  );

  const hasEducationDetails = Boolean(
    profile?.college &&
      profile?.degree &&
      profile?.branch &&
      profile?.graduation_year
  );

  const hasSkillsAndInterests = Boolean(
    Array.isArray(profile?.skills) &&
      profile.skills.length > 0 &&
      Array.isArray(profile?.interests) &&
      profile.interests.length > 0
  );

  const hasCareerPreferences = Boolean(
    Array.isArray(profile?.preferred_roles) &&
      profile.preferred_roles.length > 0 &&
      Array.isArray(profile?.preferred_locations) &&
      profile.preferred_locations.length > 0
  );

  const checklist = [
    {
      label: "Basic information",
      done: hasBasicInformation,
    },
    {
      label: "Education details",
      done: hasEducationDetails,
    },
    {
      label: "Skills and interests",
      done: hasSkillsAndInterests,
    },
    {
      label: "Career preferences",
      done: hasCareerPreferences,
    },
  ];

  const nextStep = getNextStep({
    assessmentCompleted,
    profileCompletion,
    resumeScore,
    roadmapProgress,
  });

  const readinessMessage =
    readiness >= 80
      ? "Excellent progress! Keep strengthening your skills."
      : readiness >= 60
      ? "You're making progress. Keep moving towards your career goal."
      : "Build your career journey one step at a time.";

  const handleNextStep = () => {
    navigate(nextStep.path);
  };

  // =====================================================
  // HISTORY DISPLAY SETTINGS
  // =====================================================

  // Keep the full history in state, but show only five rows
  // until the user expands the history section.
  const reversedAttempts = [...attempts].reverse();

  const visibleAttempts = showAllHistory
    ? reversedAttempts
    : reversedAttempts.slice(0, VISIBLE_HISTORY_COUNT);

  const hasMoreHistory =
    attempts.length > VISIBLE_HISTORY_COUNT;

  // Only the ten newest attempts appear in the graph.
  // Statistics above still use the complete history.
  const chartAttempts = attempts.slice(-CHART_HISTORY_COUNT);

  // =====================================================
  // DASHBOARD UI
  // =====================================================

  return (
    <main className="cb-dashboard">
      {/* Header */}

      <header className="cb-topbar">
        <div className="cb-brand">
          <img
            src={logoImg}
            alt="CareerBridge Logo"
            className="cb-brand-logo"
          />

          <div>
            <strong>CareerBridge</strong>
            <span>STUDENT DASHBOARD</span>
          </div>
        </div>

        <button
          className="cb-profile-chip"
          onClick={() => navigate("/profile")}
          aria-label="Open your profile"
        >
          <span className="cb-avatar">
            {firstName.charAt(0).toUpperCase()}
          </span>

          <span className="cb-profile-chip-text">
            <strong>{fullName}</strong>
            <small>Student account</small>
          </span>

          <span className="cb-chevron">↗</span>
        </button>
      </header>

      {/* Welcome */}

      <section className="cb-welcome">
        <div className="cb-welcome-copy">
          

          <h1>
            Welcome back, <span>{firstName}!</span>
          </h1>

          <button
            className="cb-primary-button"
            onClick={handleNextStep}
          >
            {nextStep.label}
            <span>→</span>
          </button>

          <div className="cb-welcome-note">
             {readinessMessage}
          </div>
        </div>

        <div className="cb-readiness-panel">
          <span className="cb-panel-label">
            CAREER READINESS
          </span>

          <ProgressRing value={readiness} />

          <strong className="cb-readiness-status">
            {readiness >= 80
              ? "Career ready"
              : readiness >= 50
              ? "Making progress"
              : "Your journey starts here"}
          </strong>

          <p>
            Keep completing your preparation activities.
          </p>
        </div>

        <div className="cb-decoration cb-decoration-one" />
        <div className="cb-decoration cb-decoration-two" />
      </section>

     

      {/* Quick Actions */}

      <section className="cb-section">
        <div className="cb-section-heading">
          <div>
            

            <h2>Explore your career tools</h2>

            
          </div>
        </div>

        <div className="cb-actions-grid">
          <QuickAction
            
           
            title="Career Assessment"
            description="Discover strengths and improvement areas."
            onClick={() => navigate("/career-assessment")}
          />

          <QuickAction
            
            
            title="Resume Builder"
            description="Create and improve your professional resume."
            onClick={() => navigate("/resume-builder")}
          />

          <QuickAction
           
           
            title="Career Roadmap"
            description="Follow your learning plan step by step."
            onClick={() => navigate("/career-roadmap")}
          />

          <QuickAction
           
           
            title="Learning Hub"
            description="Explore resources for your career goals."
            onClick={() => navigate("/learning-hub")}
          />

          <QuickAction
            
            title="Mock Interview"
            description="Practice answering role-specific questions."
            onClick={() => navigate("/interview")}
          />

          
        </div>
      </section>

      {/* Assessment Performance */}

      <section className="cb-card cb-performance-card">
        <div className="cb-card-heading">
          <div>
            

            <h2>Assessment Performance</h2>

            <p>
              Track your assessment scores and see how your
              preparation improves over time.
            </p>
          </div>

          <button
            className="cb-outline-button"
            onClick={fetchAssessmentHistory}
            disabled={historyLoading}
          >
            {historyLoading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {historyLoading ? (
          <div className="cb-performance-state">
            <div className="cb-spinner" />

            <p>
              Loading your assessment history...
            </p>
          </div>
        ) : historyError ? (
          <div className="cb-performance-state">
            <div className="cb-state-icon">!</div>

            <h3>
              Unable to load assessment history
            </h3>

            <p>{historyError}</p>

            <button
              className="cb-primary-button"
              onClick={fetchAssessmentHistory}
            >
              Try again
            </button>
          </div>
        ) : attempts.length === 0 ? (
          <div className="cb-performance-empty">
            <div className="cb-performance-empty-icon">
              
            </div>

            <h3>Your progress starts here</h3>

            <p>
              Complete your first career assessment to see your
              score, track your improvement, and view your
              performance graph.
            </p>

            <button
              className="cb-primary-button"
              onClick={() => navigate("/career-assessment")}
            >
              Take an assessment <span>→</span>
            </button>
          </div>
        ) : (
          <>
            {/* Performance Summary Cards */}

            <div className="cb-performance-stats">
              <PerformanceStat
                label="Latest score"
                value={`${latestScore}%`}
                detail={formatDate(latestAttempt.completedAt)}
                tone="violet"
              />

              <PerformanceStat
                label="Best score"
                value={`${bestScore}%`}
                detail="Highest score achieved"
                tone="green"
              />

              

              <PerformanceStat
                label="Total attempts"
                value={attempts.length}
                detail="Assessments completed"
                tone="amber"
              />
            </div>

            {/* Score Graph */}

            <AssessmentChart attempts={chartAttempts} />

            {/* Assessment History: Five Latest by Default */}

            <div className="cb-attempt-history">
              <div className="cb-attempt-heading">
                <div>
                  <h3>Assessment history</h3>

                  <p>
                    Your latest assessment results.
                    {hasMoreHistory
                      ? " Older results are available on demand."
                      : " All your saved results are shown below."}
                  </p>
                </div>

                <span className="cb-attempt-count">
                  {attempts.length}{" "}
                  {attempts.length === 1
                    ? "assessment"
                    : "assessments"}
                </span>
              </div>

              <div className="cb-attempt-list">
                {visibleAttempts.map((attempt, index) => (
                  <div
                    className="cb-attempt-row"
                    key={`${attempt.id}-${index}`}
                  >
                    <div className="cb-attempt-number">
                      {attempts.length -
                        index}
                    </div>

                    <div className="cb-attempt-info">
                      <strong>
                        {attempt.skill ||
                          "Career Assessment"}
                      </strong>

                      <span>
                        {attempt.role
                          ? `${attempt.role} · `
                          : ""}
                        {formatDate(attempt.completedAt)}
                      </span>
                    </div>

                    <div className="cb-attempt-score">
                      <strong>{attempt.score}%</strong>

                      <span>
                        {attempt.performanceLevel ||
                          getPerformanceLevel(attempt.score)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All / Show Less */}

              {hasMoreHistory && (
                <div className="cb-history-toggle">
                  <button
                    type="button"
                    className="cb-outline-button cb-history-toggle-button"
                    onClick={() =>
                      setShowAllHistory((previous) => !previous)
                    }
                    aria-expanded={showAllHistory}
                  >
                    {showAllHistory
                      ? "Show latest 5"
                      : `View assessment history (${attempts.length - VISIBLE_HISTORY_COUNT} older)`}
                    <span aria-hidden="true">
                      {showAllHistory ? " ↑" : " ↓"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="cb-performance-footer">
              

              <button
                className="cb-text-button"
                onClick={() =>
                  navigate("/career-assessment")
                }
              >
                Take another assessment →
              </button>
            </div>
          </>
        )}
      </section>

      {/* Footer */}

       <footer className="cb-footer">
        <div className="cb-footer-brand">
          <img
            src={logoImg}
            alt="CareerBridge Logo"
            className="cb-footer-mark"
          />
          <div>
            <strong>CareerBridge</strong>
          </div>
        </div>

        
      </footer>
    </main>
  );
};

// =====================================================
// HELPERS
// =====================================================

function clamp(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(100, Math.max(0, number));
}

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Short date for graph labels.
function formatChartDate(value) {
  if (!value) {
    return "Date N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date N/A";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function getPerformanceLevel(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Moderate";

  return "Needs Improvement";
}

function getNextStep({
  assessmentCompleted,
  profileCompletion,
  resumeScore,
  roadmapProgress,
}) {
  if (!assessmentCompleted) {
    return {
      label: "Take career assessment",
      title: "Discover your strengths",
      description:
        "Start with your career assessment to understand your current preparation level.",
      path: "/career-assessment",
      
    };
  }

  if (profileCompletion < 100) {
    return {
      label: "Complete your profile",
      title: "Complete your profile",
      description:
        "Add your education, skills, interests, and career preferences for a more complete profile.",
      path: "/profile",
      
    };
  }

  if (resumeScore < 70) {
    return {
      label: "Improve your resume",
      title: "Strengthen your resume",
      description:
        "Review your resume and improve its content before applying for opportunities.",
      path: "/resume-builder",
      
    };
  }

  if (roadmapProgress < 100) {
    return {
      label: "Continue roadmap",
      title: "Build job-ready skills",
      description:
        "Continue your learning roadmap and work through the remaining preparation activities.",
      path: "/career-roadmap",
      icon: "↗",
    };
  }

  return {
    label: "Explore recommendations",
    title: "Explore your next opportunity",
    description:
      "Review career recommendations and continue preparing for your target role.",
    path: "/career-recommendations",
    
  };
}

// =====================================================
// CAREER READINESS RING
// =====================================================

function ProgressRing({ value }) {
  return (
    <div
      className="cb-progress-ring"
      style={{
        "--ring-progress": `${value * 3.6}deg`,
      }}
      role="img"
      aria-label={`Career readiness ${value}%`}
    >
      <div className="cb-progress-ring-inner">
        <strong>{value}%</strong>
        <span>READY</span>
      </div>
    </div>
  );
}

// =====================================================
// DASHBOARD STAT CARD
// =====================================================

function StatCard({
  icon,
  tone,
  label,
  value,
  detail,
  progress,
  onClick,
}) {
  return (
    <button
      className="cb-stat-card"
      onClick={onClick}
    >
      <div className="cb-stat-top">
        <span className={`cb-stat-icon ${tone}`}>
          {icon}
        </span>

        <span className="cb-stat-arrow">↗</span>
      </div>

      <span className="cb-stat-label">
        {label}
      </span>

      <strong className="cb-stat-value">
        {value}
      </strong>

      <div className="cb-stat-bottom">
        <span>{detail}</span>
      </div>

      <div className="cb-progress-track">
        <span
          className={tone}
          style={{
            width: `${clamp(progress)}%`,
          }}
        />
      </div>
    </button>
  );
}

// =====================================================
// QUICK ACTION CARD
// =====================================================

function QuickAction({
  icon,
  tone,
  title,
  description,
  onClick,
}) {
  return (
    <button
      className="cb-action-card"
      onClick={onClick}
    >
      <span className={`cb-action-icon ${tone}`}>
        {icon}
      </span>

      <span className="cb-action-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>

      <span className="cb-action-arrow">→</span>
    </button>
  );
}

// =====================================================
// ASSESSMENT PERFORMANCE STAT
// =====================================================

function PerformanceStat({
  label,
  value,
  detail,
  tone,
}) {
  return (
    <div className={`cb-performance-stat ${tone}`}>
      <span className="cb-performance-stat-label">
        {label}
      </span>

      <strong className="cb-performance-stat-value">
        {value}
      </strong>

      <span className="cb-performance-stat-detail">
        {detail}
      </span>
    </div>
  );
}

// =====================================================
// ASSESSMENT PERFORMANCE CHART
// Native SVG chart — no extra library required
// =====================================================

function AssessmentChart({ attempts }) {
  const width = 760;
  const height = 300;

  const paddingLeft = 48;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 48;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  const points = attempts.map((attempt, index) => {
    const x =
      attempts.length === 1
        ? paddingLeft + chartWidth / 2
        : paddingLeft +
          (index / (attempts.length - 1)) * chartWidth;

    const y =
      paddingTop +
      ((100 - attempt.score) / 100) * chartHeight;

    return {
      ...attempt,
      x,
      y,
    };
  });

  const polylinePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const areaPoints =
    points.length > 0
      ? [
          `${points[0].x},${paddingTop + chartHeight}`,
          ...points.map(
            (point) => `${point.x},${point.y}`
          ),
          `${points[points.length - 1].x},${paddingTop + chartHeight}`,
        ].join(" ")
      : "";

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="cb-chart-container">
      <div className="cb-chart-heading">
        <div>
          <h3>Score progression</h3>

          <p>
            Track your scores across completed assessments.
          </p>
        </div>

        <span className="cb-chart-unit">
          Score (%)
        </span>
      </div>

      <div className="cb-chart-scroll">
        <svg
          className="cb-performance-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Line chart showing assessment scores by completion date"
        >
          <defs>
            <linearGradient
              id="cb-performance-area-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#7868f5"
                stopOpacity="0.24"
              />

              <stop
                offset="100%"
                stopColor="#7868f5"
                stopOpacity="0.015"
              />
            </linearGradient>
          </defs>

          {/* Horizontal grid and Y-axis labels */}

          {yTicks.map((tick) => {
            const y =
              paddingTop +
              ((100 - tick) / 100) * chartHeight;

            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.12"
                  strokeDasharray={tick === 0 ? "0" : "4 5"}
                />

                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill="currentColor"
                  opacity="0.68"
                  fontSize="12"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area below score line */}

          {points.length > 1 && (
            <polygon
              points={areaPoints}
              fill="url(#cb-performance-area-gradient)"
            />
          )}

          {/* Score line */}

          {points.length > 1 && (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#7868f5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Score points and date labels */}

          {points.map((point) => (
            <g key={point.id}>
              <title>
                {`${point.skill || "Assessment"}: ${point.score}% on ${formatDate(point.completedAt)}`}
              </title>

              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                fill="#7868f5"
                stroke="currentColor"
                strokeOpacity="0.15"
                strokeWidth="2"
              />

              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#ffffff"
              />

              <text
                x={point.x}
                y={Math.max(
                  point.y - 14,
                  paddingTop + 12
                )}
                textAnchor="middle"
                fill="currentColor"
                fontSize="12"
                fontWeight="700"
              >
                {point.score}%
              </text>

              {/* Dates replace Attempt 1, Attempt 2, etc. */}

              <text
                x={point.x}
                y={height - 20}
                textAnchor="middle"
                fill="currentColor"
                opacity="0.72"
                fontSize="11"
              >
                {formatChartDate(point.completedAt)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="cb-chart-legend">
        <span className="cb-chart-legend-dot" />

        Assessment score

        <span className="cb-chart-legend-note">
          {attempts.length === 0
            ? "No recorded assessments"
            : `Latest ${attempts.length} ${
                attempts.length === 1
                  ? "assessment"
                  : "assessments"
              }`}
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
