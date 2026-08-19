import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const REQUIRED_QUESTIONS = 20;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assessment, setAssessment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const email =
        localStorage.getItem("userEmail") ||
        localStorage.getItem("email");

      if (!email) {
        setError("User email not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/dashboard/${encodeURIComponent(
          email
        )}`
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Server returned an invalid dashboard response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load dashboard"
        );
      }

      console.log("=================================");
      console.log("DASHBOARD DATA");
      console.log(data);
      console.log("ASSESSMENT DATA");
      console.log(data.assessment);
      console.log("=================================");

      setUser(data.user || null);
      setProfile(data.profile || null);
      setAssessment(data.assessment || null);
      setDashboard(data.dashboard || null);

    } catch (err) {
      console.error("Dashboard Error:", err);

      setError(
        err.message ||
          "Something went wrong while loading dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // =====================================================
  // REFRESH WHEN RETURNING TO DASHBOARD
  // =====================================================

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      fetchDashboard();
    }
  }, [location.pathname, fetchDashboard]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading">

        <div className="loading-spinner"></div>

        <h3>
          Loading your CareerBridge dashboard...
        </h3>

        <p>
          Preparing your personalized career journey
        </p>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="dashboard-error">

        <div className="error-icon">
          ⚠️
        </div>

        <h2>
          Unable to load dashboard
        </h2>

        <p>
          {error}
        </p>

        <button onClick={fetchDashboard}>
          Try Again
        </button>

      </div>
    );
  }

  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  const placementReadiness =
    Number(
      dashboard?.placementReadiness ??
      dashboard?.placement_readiness ??
      0
    ) || 0;

  const roadmapProgress =
    Number(
      dashboard?.roadmapProgress ??
      dashboard?.roadmap_progress ??
      0
    ) || 0;

  const resumeScore =
    Number(
      dashboard?.resumeScore ??
      dashboard?.resume_score ??
      0
    ) || 0;

  const profileCompletion =
    Number(
      dashboard?.profileCompletion ??
      dashboard?.profile_completion ??
      0
    ) || 0;

  // =====================================================
  // CAREER DATA
  // =====================================================

  const roadmap =
    Array.isArray(dashboard?.roadmap)
      ? dashboard.roadmap
      : [];

  const tasks =
    Array.isArray(dashboard?.tasks)
      ? dashboard.tasks
      : [];

  // =====================================================
  // ASSESSMENT DATA
  // =====================================================

  const backendAssessment = assessment || {};

  // =====================================================
  // GET STORED ASSESSMENT RESULT
  // =====================================================

  let storedAssessmentResult = null;

  try {
    const storedResult =
      sessionStorage.getItem("assessmentResult");

    if (storedResult) {
      storedAssessmentResult =
        JSON.parse(storedResult);

      console.log(
        "Stored Assessment Result:",
        storedAssessmentResult
      );
    }
  } catch (storageError) {
    console.error(
      "Assessment session storage error:",
      storageError
    );
  }

  // =====================================================
  // ACTUAL ASSESSMENT SCORE
  // =====================================================

  /*
   * We check multiple possible names because
   * the backend/result page may use different names.
   */

  const possibleScores = [
    backendAssessment.score,
    backendAssessment.total_score,
    backendAssessment.totalScore,
    backendAssessment.correct_answers,
    backendAssessment.correctAnswers,
    backendAssessment.correct_count,
    backendAssessment.correctCount,

    storedAssessmentResult?.score,
    storedAssessmentResult?.total_score,
    storedAssessmentResult?.totalScore,
    storedAssessmentResult?.correct_answers,
    storedAssessmentResult?.correctAnswers,
    storedAssessmentResult?.correct_count,
    storedAssessmentResult?.correctCount,
  ];

  let actualScore = null;

  for (const value of possibleScores) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !isNaN(Number(value))
    ) {
      actualScore = Number(value);
      break;
    }
  }

  // =====================================================
  // ANSWERED QUESTIONS
  // =====================================================

  const possibleAnsweredCounts = [
    backendAssessment.answered_questions,
    backendAssessment.questions_answered,
    backendAssessment.answeredQuestions,
    backendAssessment.questionsAnswered,
    backendAssessment.total_answered,
    backendAssessment.totalAnswered,

    dashboard?.assessmentAnsweredQuestions,
    dashboard?.assessment_answered_questions,

    storedAssessmentResult?.answered_questions,
    storedAssessmentResult?.questions_answered,
    storedAssessmentResult?.answeredQuestions,
    storedAssessmentResult?.questionsAnswered,
  ];

  let answeredQuestions = null;

  for (const value of possibleAnsweredCounts) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !isNaN(Number(value))
    ) {
      answeredQuestions = Number(value);
      break;
    }
  }

  // =====================================================
  // IMPORTANT SCORE LOGIC
  // =====================================================

  /*
   * If your assessment result is 12/20,
   * actualScore will be 12.
   *
   * Therefore Dashboard will show:
   *
   * 12/20
   *
   * NOT 20/20.
   */

  if (actualScore !== null) {
    answeredQuestions = actualScore;
  }

  /*
   * If there is no score but answered questions
   * are available, use those.
   */

  if (answeredQuestions === null) {
    answeredQuestions = 0;
  }

  /*
   * Keep value between 0 and 20.
   */

  answeredQuestions = Math.max(
    0,
    Math.min(
      Number(answeredQuestions) || 0,
      REQUIRED_QUESTIONS
    )
  );

  // =====================================================
  // ASSESSMENT COMPLETED
  // =====================================================

  const assessmentCompleted =
    Boolean(
      backendAssessment.completed === true ||
      backendAssessment.is_completed === true ||
      backendAssessment.completed_at ||
      backendAssessment.status === "completed" ||
      backendAssessment.status === "Completed" ||
      storedAssessmentResult
    );

  /*
   * IMPORTANT:
   *
   * Completion does NOT mean 20/20.
   *
   * A student can complete all 20 questions
   * and score 12/20.
   *
   * Therefore we DO NOT change answeredQuestions
   * to 20 when completed.
   */

  const finalAssessmentCompleted =
    assessmentCompleted;

  // =====================================================
  // ASSESSMENT PROGRESS
  // =====================================================

  const assessmentProgress =
    Math.round(
      (answeredQuestions / REQUIRED_QUESTIONS) * 100
    );

  // =====================================================
  // USER NAME
  // =====================================================

  const firstName =
    user?.fullname?.split(" ")[0] ||
    user?.name?.split(" ")[0] ||
    "Student";

  // =====================================================
  // TASK COUNT
  // =====================================================

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const totalTasks =
    tasks.length > 0
      ? tasks.length
      : 4;

  // =====================================================
  // READINESS TITLE
  // =====================================================

  const getReadinessTitle = () => {

    if (placementReadiness >= 80) {
      return "You're career ready!";
    }

    if (placementReadiness >= 60) {
      return "You're making great progress!";
    }

    if (placementReadiness >= 40) {
      return "You're building your career!";
    }

    return "Let's build your career readiness!";
  };

  // =====================================================
  // READINESS DESCRIPTION
  // =====================================================

  const getReadinessDescription = () => {

    if (placementReadiness >= 80) {
      return "Great work! Continue improving your skills and preparing for your target career.";
    }

    if (placementReadiness >= 60) {
      return "You're on the right track. Continue building your skills, resume and career roadmap.";
    }

    return "Complete your profile, career assessment and preparation activities to build your personalized career journey.";
  };

  // =====================================================
  // READINESS BUTTON
  // =====================================================

  const getReadinessButton = () => {

    if (!finalAssessmentCompleted) {
      return "Take Career Assessment";
    }

    if (profileCompletion < 100) {
      return "Complete Profile";
    }

    if (resumeScore < 70) {
      return "Improve Resume";
    }

    if (roadmapProgress < 100) {
      return "Continue Roadmap";
    }

    return "View Career Progress";
  };

  // =====================================================
  // READINESS BUTTON ACTION
  // =====================================================

  const handleReadinessButton = () => {

    if (!finalAssessmentCompleted) {
      navigate("/career-assessment");
      return;
    }

    if (profileCompletion < 100) {
      navigate("/profile");
      return;
    }

    if (resumeScore < 70) {
      navigate("/resume-builder");
      return;
    }

    if (roadmapProgress < 100) {
      navigate("/career-roadmap");
      return;
    }

    navigate("/career-recommendations");
  };

  // =====================================================
  // PROFILE CHECKLIST
  // =====================================================

  const hasBasicInformation =
    Boolean(
      profile?.phone &&
      user?.fullname &&
      user?.email
    );

  const hasEducationDetails =
    Boolean(
      profile?.college &&
      profile?.degree &&
      profile?.branch &&
      profile?.graduation_year
    );

  const hasSkillsAndInterests =
    Boolean(
      Array.isArray(profile?.skills) &&
      profile.skills.length > 0 &&
      Array.isArray(profile?.interests) &&
      profile.interests.length > 0
    );

  const hasCareerPreferences =
    Boolean(
      Array.isArray(profile?.preferred_roles) &&
      profile.preferred_roles.length > 0 &&
      Array.isArray(profile?.preferred_locations) &&
      profile.preferred_locations.length > 0
    );

  const profileChecklist = [
    {
      label: "Basic Information",
      completed: hasBasicInformation,
    },
    {
      label: "Education Details",
      completed: hasEducationDetails,
    },
    {
      label: "Skills & Interests",
      completed: hasSkillsAndInterests,
    },
    {
      label: "Career Preferences",
      completed: hasCareerPreferences,
    },
  ];

  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (
    <div className="dashboard-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div className="header-left">

          <p className="dashboard-label">
            YOUR CAREER JOURNEY
          </p>

          <h1>
            Welcome back, {firstName}
          </h1>

          <p className="dashboard-subtitle">
            Track your progress, build job-ready skills
            and prepare for your dream career.
          </p>

        </div>

        <div className="header-profile">

          <div className="profile-avatar">
            {firstName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-details">

            <strong>
              {user?.fullname || "Student"}
            </strong>

            <span>
              {user?.email || ""}
            </span>

          </div>

        </div>

      </header>


      {/* =================================================
          CAREER READINESS
      ================================================= */}

      <section className="readiness-card">

        <div className="readiness-left">

          <div className="readiness-icon">
            🎯
          </div>

          <div className="readiness-content">

            <p className="small-label">
              YOUR CAREER READINESS
            </p>

            <h2>
              {getReadinessTitle()}
            </h2>

            <p>
              {getReadinessDescription()}
            </p>

            <button
              className="primary-button"
              onClick={handleReadinessButton}
            >
              {getReadinessButton()} ↗
            </button>

          </div>

        </div>

        <div className="readiness-right">

          <div
            className="progress-circle"
            style={{
              "--progress":
                `${placementReadiness}%`,
            }}
          >

            <div className="progress-inner">

              <strong>
                {placementReadiness}%
              </strong>

              <span>
                Ready
              </span>

            </div>

          </div>

          <span className="readiness-label">
            Career Readiness
          </span>

        </div>

      </section>


      {/* =================================================
          MAIN STATISTICS
      ================================================= */}

      <section className="stats-grid">

        <StatCard
          icon="🗺️"
          title="Roadmap Progress"
          value={`${roadmapProgress}%`}
          subtitle="Career roadmap"
          iconClass="purple"
        />

        <StatCard
          icon="📄"
          title="Resume Score"
          value={`${resumeScore}/100`}
          subtitle="Resume strength"
          iconClass="orange"
        />

        <StatCard
          icon="🧠"
          title="Assessment"

          /*
           * THIS IS THE IMPORTANT PART
           *
           * If score = 12
           * Dashboard shows 12/20
           */

          value={`${answeredQuestions}/${REQUIRED_QUESTIONS}`}

          subtitle={
            finalAssessmentCompleted
              ? `Assessment completed • Score: ${answeredQuestions}/${REQUIRED_QUESTIONS}`
              : `${assessmentProgress}% completed`
          }

          iconClass="green"
        />

      </section>


      {/* =================================================
          PROFILE
      ================================================= */}

      <section className="dashboard-card profile-card profile-card-full">

        <div className="profile-header">

          <div>

            <p className="small-label">
              PROFILE
            </p>

            <h2>
              {profileCompletion >= 100
                ? "Profile Completed"
                : "Complete Your Profile"}
            </h2>

          </div>

          <button
            className="edit-button"
            onClick={() =>
              navigate("/profile")
            }
          >
            ✎
          </button>

        </div>

        <div className="profile-progress">

          <div
            className="profile-circle"
            style={{
              "--progress":
                `${profileCompletion}%`,
            }}
          >

            <strong>
              {profileCompletion}%
            </strong>

          </div>

          <div className="profile-progress-text">

            <h3>
              {profileCompletion >= 100
                ? "Profile completed!"
                : "You're almost there!"}
            </h3>

            <p>
              {profileCompletion >= 100
                ? "Your profile is complete."
                : "Complete your profile for better career recommendations."}
            </p>

          </div>

        </div>

        <div className="profile-checklist">

          {profileChecklist.map(
            (item, index) => (

              <div
                key={index}
                className={`check-item ${
                  item.completed
                    ? "completed"
                    : ""
                }`}
              >

                <span className="check-symbol">
                  {item.completed
                    ? "✓"
                    : "○"}
                </span>

                {item.label}

              </div>

            )
          )}

        </div>

      </section>


      {/* =================================================
          CAREER ROADMAP
      ================================================= */}

      <section className="dashboard-card roadmap-card">

        <div className="roadmap-header">

          <div>

            <p className="small-label">
              YOUR JOURNEY
            </p>

            <h2>
              Career Roadmap
            </h2>

          </div>

          <button
            className="text-button"
            onClick={() =>
              navigate("/career-roadmap")
            }
          >
            View Full Roadmap →
          </button>

        </div>

        <div className="roadmap">

          <div className="roadmap-line"></div>

          {roadmap.length > 0 ? (

            roadmap.map((step) => (

              <RoadmapStep
                key={step.number}
                number={step.number}
                title={step.title}
                status={step.status}
                active={step.active}
                completed={step.completed}
              />

            ))

          ) : (

            <>

              <RoadmapStep
                number="1"
                title="Career Assessment"
                status={
                  finalAssessmentCompleted
                    ? "Completed"
                    : "Pending"
                }
                active={
                  !finalAssessmentCompleted
                }
                completed={
                  finalAssessmentCompleted
                }
              />

              <RoadmapStep
                number="2"
                title="Skill Gap Analysis"
                status="Upcoming"
                active={false}
                completed={false}
              />

              <RoadmapStep
                number="3"
                title="Learning Path"
                status="Upcoming"
                active={false}
                completed={false}
              />

              <RoadmapStep
                number="4"
                title="Placement Preparation"
                status={
                  resumeScore >= 70
                    ? "In Progress"
                    : "Upcoming"
                }
                active={
                  finalAssessmentCompleted &&
                  resumeScore < 100
                }
                completed={
                  resumeScore >= 100
                }
              />

            </>

          )}

        </div>

      </section>


      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="dashboard-card quick-actions-card">

        <div>

          <p className="small-label">
            QUICK ACTIONS
          </p>

          <h2>
            Continue Your Preparation
          </h2>

        </div>

        <div className="quick-actions">

          <QuickAction
            icon="🧭"
            title="Career Assessment"
            description={`${REQUIRED_QUESTIONS} questions to discover your career`}
            onClick={() =>
              navigate("/career-assessment")
            }
          />

          <QuickAction
            icon="📄"
            title="Resume Builder"
            description="Build your professional resume"
            onClick={() =>
              navigate("/resume-builder")
            }
          />

          <QuickAction
            icon="🗺️"
            title="Career Roadmap"
            description="Follow your personalized roadmap"
            onClick={() =>
              navigate("/career-roadmap")
            }
          />

          <QuickAction
            icon="📚"
            title="Learning Hub"
            description="Explore learning resources"
            onClick={() =>
              navigate("/learning-hub")
            }
          />

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="dashboard-footer">

        <span>
          © {new Date().getFullYear()} CareerBridge
        </span>

        <span>
          Personalized career guidance &
          placement readiness
        </span>

      </footer>

    </div>
  );
};


// ======================================================
// STAT CARD
// ======================================================

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  iconClass,
}) => {

  return (
    <div className="stat-card">

      <div
        className={`stat-icon ${iconClass}`}
      >
        {icon}
      </div>

      <div className="stat-content">

        <p>
          {title}
        </p>

        <h2>
          {value}
        </h2>

        <span>
          {subtitle}
        </span>

      </div>

    </div>
  );
};


// ======================================================
// ROADMAP STEP
// ======================================================

const RoadmapStep = ({
  number,
  title,
  status,
  active,
  completed,
}) => {

  return (
    <div
      className={`roadmap-step ${
        completed
          ? "completed-step"
          : active
          ? "active-step"
          : ""
      }`}
    >

      <div className="roadmap-circle">

        {completed
          ? "✓"
          : active
          ? "•"
          : number}

      </div>

      <span className="step-number">
        STEP{" "}
        {String(number).padStart(2, "0")}
      </span>

      <h4>
        {title}
      </h4>

      <span className="step-status">
        {status}
      </span>

    </div>
  );
};


// ======================================================
// TASK
// ======================================================

const Task = ({
  text,
  completed,
}) => {

  return (
    <div className="task-item">

      <span
        className={`task-checkbox ${
          completed
            ? "checked"
            : ""
        }`}
      >
        {completed
          ? "✓"
          : ""}
      </span>

      <span
        className={
          completed
            ? "task-completed"
            : ""
        }
      >
        {text}
      </span>

    </div>
  );
};


// ======================================================
// QUICK ACTION
// ======================================================

const QuickAction = ({
  icon,
  title,
  description,
  onClick,
}) => {

  return (
    <button
      className="quick-action"
      onClick={onClick}
    >

      <div className="quick-action-icon">
        {icon}
      </div>

      <div className="quick-action-content">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <span className="quick-action-arrow">
        →
      </span>

    </button>
  );
};


export default Dashboard;