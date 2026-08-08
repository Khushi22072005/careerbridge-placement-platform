import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ==========================================
  // FETCH DASHBOARD FROM BACKEND
  // ==========================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // Get logged-in user's email
      const email =
        localStorage.getItem("userEmail") ||
        localStorage.getItem("email");

      if (!email) {
        setError("User email not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/dashboard/${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load dashboard"
        );
      }

      setUser(data.user);
      setDashboard(data.dashboard);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

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

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>

        <h2>Unable to load dashboard</h2>

        <p>{error}</p>

        <button onClick={fetchDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD DATA
  // ==========================================

  const placementReadiness =
    dashboard?.placementReadiness ?? 0;

  const careerMatch =
    dashboard?.careerMatch ?? 0;

  const roadmapProgress =
    dashboard?.roadmapProgress ?? 0;

  const resumeScore =
    dashboard?.resumeScore ?? 0;

  const skillsCompleted =
    dashboard?.skillsCompleted ?? 0;

  const profileCompletion =
    dashboard?.profileCompletion ?? 0;

  const career =
    dashboard?.career || {};

  const roadmap =
    dashboard?.roadmap || [];

  const tasks =
    dashboard?.tasks || [];

  const recommendation =
    dashboard?.recommendation || {};

  const firstName =
    user?.fullname?.split(" ")[0] || "Student";

  // Number of completed tasks
  const completedTasks =
    tasks.filter((task) => task.completed).length;

  const totalTasks = tasks.length;

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="dashboard-container">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="dashboard-header">

        <div className="header-left">

          <p className="dashboard-label">
            YOUR CAREER JOURNEY
          </p>

          <h1>
            Welcome back, {firstName} 👋
          </h1>

          <p className="dashboard-subtitle">
            Track your progress and prepare yourself
            for your dream career.
          </p>

        </div>

        <div className="header-profile">

          <div className="profile-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <div className="profile-details">

            <strong>
              {user?.fullname || "Student"}
            </strong>

            <span>
              {user?.email}
            </span>

          </div>

        </div>

      </header>


      {/* =====================================
          PLACEMENT READINESS
      ===================================== */}

      <section className="readiness-card">

        <div className="readiness-left">

          <div className="readiness-icon">
            ⚡
          </div>

          <div className="readiness-content">

            <p className="small-label">
              YOUR PLACEMENT READINESS
            </p>

            <h2>
              You're making great progress!
            </h2>

            <p>
              Complete your career assessment to unlock
              personalized career recommendations.
            </p>

            <button className="primary-button">
              Continue Assessment ↗
            </button>

          </div>

        </div>


        <div className="readiness-right">

          <div
            className="progress-circle"
            style={{
              "--progress": `${placementReadiness}%`,
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
            Placement Readiness
          </span>

        </div>

      </section>


      {/* =====================================
          STATISTICS
      ===================================== */}

      <section className="stats-grid">

        <StatCard
          icon="🎯"
          title="Career Match"
          value={`${careerMatch}%`}
          subtitle="Personalized match"
          iconClass="blue"
        />

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
          subtitle="Improve your score"
          iconClass="orange"
        />

        <StatCard
          icon="🏆"
          title="Skills Completed"
          value={skillsCompleted}
          subtitle="Skills acquired"
          iconClass="green"
        />

      </section>


      {/* =====================================
          CAREER + PROFILE
      ===================================== */}

      <section className="dashboard-main-grid">

        {/* =====================================
            CAREER MATCH
        ===================================== */}

        <div className="dashboard-card career-match-card">

          <div className="card-top">

            <div>

              <p className="small-label">
                TOP CAREER MATCH
              </p>

              <h2>
                {career.title || "Software Developer"}
              </h2>

              <p className="card-description">
                Based on your interests, skills,
                assessment results, and career preferences.
              </p>

            </div>

            <span className="match-badge">
              {career.match ?? careerMatch}% Match
            </span>

          </div>


          {/* SKILLS */}

          <div className="skill-tags">

            {career.skills?.map((skill, index) => (
              <span key={index}>
                {skill}
              </span>
            ))}

          </div>


          {/* COMPANIES */}

          <div className="career-bottom">

            <div>

              <p className="small-label">
                POPULAR HIRING COMPANIES
              </p>

              <div className="companies">

                {career.companies?.map(
                  (company, index) => (
                    <span key={index}>
                      {company}
                    </span>
                  )
                )}

              </div>

            </div>

            <button className="outline-button">
              Explore →
            </button>

          </div>

        </div>


        {/* =====================================
            PROFILE
        ===================================== */}

        <div className="dashboard-card profile-card">

          <div className="profile-header">

            <div>

              <p className="small-label">
                PROFILE
              </p>

              <h2>
                Complete Your Profile
              </h2>

            </div>

            <button className="edit-button">
              ✎
            </button>

          </div>


          <div className="profile-progress">

            <div
              className="profile-circle"
              style={{
                "--progress": `${profileCompletion}%`,
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
                Complete your profile to receive
                better career recommendations.
              </p>

            </div>

          </div>


          {/* PROFILE CHECKLIST */}

          <div className="profile-checklist">

            <div className="check-item completed">
              ✓ Basic Information
            </div>

            <div className="check-item completed">
              ✓ Education Details
            </div>

            <div className="check-item">
              ○ Skills & Interests
            </div>

            <div className="check-item">
              ○ Career Preferences
            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          CAREER ROADMAP
      ===================================== */}

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

          <button className="text-button">
            View Full Roadmap →
          </button>

        </div>


        <div className="roadmap">

          {roadmap.map((step) => (

            <RoadmapStep
              key={step.number}
              number={step.number}
              title={step.title}
              status={step.status}
              active={step.active}
              completed={step.completed}
            />

          ))}

        </div>

      </section>


      {/* =====================================
          TASKS + RECOMMENDATION
      ===================================== */}

      <section className="bottom-grid">

        {/* =====================================
            TASKS
        ===================================== */}

        <div className="dashboard-card tasks-card">

          <div className="tasks-header">

            <div>

              <p className="small-label">
                TODAY
              </p>

              <h2>
                Your Tasks
              </h2>

            </div>

            <span className="task-count">
              {completedTasks}/{totalTasks}
            </span>

          </div>


          <div className="task-list">

            {tasks.length > 0 ? (

              tasks.map((task) => (

                <Task
                  key={task.id}
                  text={task.text}
                  completed={task.completed}
                />

              ))

            ) : (

              <p className="no-tasks">
                No tasks available.
              </p>

            )}

          </div>

        </div>


        {/* =====================================
            SMART RECOMMENDATION
        ===================================== */}

        <div className="recommendation-card">

          <div className="recommendation-icon">
            ⚡
          </div>

          <p className="small-label">
            SMART RECOMMENDATION
          </p>

          <h2>
            {recommendation.title ||
              "Start building your career skills"}
          </h2>

          <p>
            {recommendation.description ||
              "Complete your recommended learning activities to improve your placement readiness."}
          </p>

          <button>
            {recommendation.action || "Start Learning"} ↗
          </button>

        </div>

      </section>


      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="dashboard-footer">

        <span>
          © 2026 CareerBridge
        </span>

        <span>
          Personalized career guidance
        </span>

      </footer>

    </div>
  );
};


// =============================================
// STAT CARD
// =============================================

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  iconClass,
}) => {

  return (
    <div className="stat-card">

      <div className={`stat-icon ${iconClass}`}>
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


// =============================================
// ROADMAP STEP
// =============================================

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
        STEP {number}
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


// =============================================
// TASK
// =============================================

const Task = ({
  text,
  completed,
}) => {

  return (
    <div className="task">

      <span
        className={`task-checkbox ${
          completed ? "checked" : ""
        }`}
      >
        {completed ? "✓" : ""}
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


export default Dashboard;