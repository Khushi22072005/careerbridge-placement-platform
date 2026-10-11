
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CareerRoadmap.css";
import logoImg from "../assets/images/logo.jpeg";

const ROADMAPS = {
  "data-analyst": {
    title: "Data Analyst",
    description:
      "Progress from data fundamentals to SQL, Excel, Power BI, practical projects and interview preparation.",
    duration: "24–30 weeks",
    stages: [
      {
        title: "Start with the Basics",
        category: "FOUNDATION",
        icon: "01",
        duration: "Weeks 1–3",
        description:
          "Understand data and learn how analysts organize information.",
        skills: [
          "Data types and tables",
          "Excel basics",
          "Formulas and functions",
          "Sorting and filtering",
          "Basic statistics"
        ],
        task: "Clean and organize a small dataset.",
        milestone: "Understand and summarize a dataset.",
        interview:
          "Explain mean, median, data types and missing values."
      },
      {
        title: "Build Core Skills",
        category: "TECHNICAL SKILLS",
        icon: "02",
        duration: "Weeks 4–10",
        description:
          "Learn the main tools used to query, analyse and visualize data.",
        skills: [
          "SQL queries and joins",
          "Grouping and aggregation",
          "Excel PivotTables",
          "Power BI",
          "Data modelling and DAX"
        ],
        task: "Answer business questions using SQL and Excel.",
        milestone:
          "Analyse data and create meaningful visualizations.",
        interview:
          "Practise SQL joins, aggregations and KPI questions."
      },
      {
        title: "Practise and Build",
        category: "PRACTICAL EXPERIENCE",
        icon: "03",
        duration: "Weeks 11–18",
        description:
          "Apply your skills to a complete analysis instead of isolated exercises.",
        skills: [
          "Data quality checks",
          "Exploratory analysis",
          "KPI calculation",
          "Dashboard design",
          "Insight interpretation"
        ],
        task: "Complete an end-to-end analytics project.",
        milestone:
          "Present a dashboard with findings supported by your data.",
        interview:
          "Explain your analysis, assumptions and business insights."
      },
      {
        title: "Prepare Your Profile",
        category: "CAREER READINESS",
        icon: "04",
        duration: "Weeks 19–22",
        description:
          "Make your skills and project work easy for recruiters to understand.",
        skills: [
          "Resume preparation",
          "Project documentation",
          "GitHub presentation",
          "Dashboard walkthrough",
          "Communication skills"
        ],
        task: "Prepare a resume and a clear project explanation.",
        milestone:
          "Present your skills and project contributions confidently.",
        interview:
          "Practise explaining your decisions and results."
      },
      {
        title: "Interview and Placement",
        category: "FINAL PREPARATION",
        icon: "05",
        duration: "Weeks 23–30",
        description:
          "Prepare for screening rounds, technical assessments and interviews.",
        skills: [
          "SQL interview practice",
          "Excel questions",
          "Power BI concepts",
          "Business case questions",
          "Mock interviews",
          "HR preparation"
        ],
        task:
          "Complete mock interviews and timed practice questions.",
        milestone:
          "Demonstrate job-relevant analytical skills in interviews.",
        interview:
          "Practise technical, case-study and behavioural rounds."
      }
    ]
  },

  "software-developer": {
    title: "Software Developer",
    description:
      "Progress from programming fundamentals to building and explaining software.",
    duration: "24–32 weeks",
    stages: [
      {
        title: "Start with the Basics",
        category: "FOUNDATION",
        icon: "01",
        duration: "Weeks 1–4",
        description:
          "Choose a programming language and develop logical thinking.",
        skills: [
          "Variables and data types",
          "Conditions and loops",
          "Functions",
          "Arrays and strings",
          "Object-oriented basics"
        ],
        task:
          "Write small programs using fundamental concepts.",
        milestone:
          "Solve beginner programming problems independently.",
        interview:
          "Explain variables, functions, loops and OOP concepts."
      },
      {
        title: "Build Core Skills",
        category: "TECHNICAL SKILLS",
        icon: "02",
        duration: "Weeks 5–11",
        description:
          "Learn problem-solving, databases and application development.",
        skills: [
          "Data structures",
          "Searching and sorting",
          "Time complexity",
          "SQL and databases",
          "HTTP and REST APIs"
        ],
        task:
          "Solve coding problems and practise database queries.",
        milestone:
          "Choose suitable data structures and explain your solution.",
        interview:
          "Practise DSA, OOP, DBMS and basic networking questions."
      },
      {
        title: "Practise and Build",
        category: "PRACTICAL EXPERIENCE",
        icon: "03",
        duration: "Weeks 12–19",
        description:
          "Apply programming concepts by building a working application.",
        skills: [
          "Frontend or application UI",
          "Backend fundamentals",
          "API integration",
          "Database connectivity",
          "Testing and debugging"
        ],
        task:
          "Build a functional application with a clear purpose.",
        milestone:
          "Demonstrate the application and explain its architecture.",
        interview:
          "Explain the code, features, database and technical decisions."
      },
      {
        title: "Prepare Your Profile",
        category: "CAREER READINESS",
        icon: "04",
        duration: "Weeks 20–24",
        description:
          "Prepare your code, project documentation and professional profile.",
        skills: [
          "Git and GitHub",
          "Clean code",
          "README documentation",
          "Resume preparation",
          "Project walkthrough"
        ],
        task:
          "Organize your repository and prepare a project presentation.",
        milestone:
          "Show readable code and explain your contribution.",
        interview:
          "Practise describing design choices and debugging."
      },
      {
        title: "Interview and Placement",
        category: "FINAL PREPARATION",
        icon: "05",
        duration: "Weeks 25–32",
        description:
          "Prepare for coding assessments, technical rounds and HR discussions.",
        skills: [
          "DSA revision",
          "OOP and DBMS",
          "Coding assessments",
          "System design basics",
          "Mock interviews",
          "HR preparation"
        ],
        task:
          "Complete timed coding tests and mock interviews.",
        milestone:
          "Explain solutions clearly and demonstrate technical readiness.",
        interview:
          "Practise coding, CS fundamentals and behavioural rounds."
      }
    ]
  },

  "ui-ux": {
    title: "UI/UX Designer",
    description:
      "Progress from design principles to user-focused interfaces and portfolio presentation.",
    duration: "16–24 weeks",
    stages: [
      {
        title: "Start with the Basics",
        category: "FOUNDATION",
        icon: "01",
        duration: "Weeks 1–3",
        description:
          "Understand the visual principles that make digital products clear and usable.",
        skills: [
          "Color and typography",
          "Spacing and alignment",
          "Layout and hierarchy",
          "Visual consistency",
          "Accessibility basics"
        ],
        task:
          "Review an existing interface and identify usability issues.",
        milestone:
          "Recognize common visual design problems.",
        interview:
          "Explain contrast, hierarchy, consistency and accessibility."
      },
      {
        title: "Build Core Skills",
        category: "DESIGN SKILLS",
        icon: "02",
        duration: "Weeks 4–8",
        description:
          "Learn how to understand users and translate needs into design decisions.",
        skills: [
          "User research",
          "Personas and user journeys",
          "Information architecture",
          "Wireframing",
          "Figma",
          "Prototyping"
        ],
        task:
          "Map a user journey and create initial wireframes.",
        milestone:
          "Turn a user problem into a structured design flow.",
        interview:
          "Explain user research, personas and design decisions."
      },
      {
        title: "Practise and Build",
        category: "PRACTICAL EXPERIENCE",
        icon: "03",
        duration: "Weeks 9–14",
        description:
          "Design and evaluate a digital experience from problem to prototype.",
        skills: [
          "Interactive prototypes",
          "Responsive layouts",
          "Design systems",
          "Usability testing",
          "Iteration and feedback"
        ],
        task:
          "Design a connected set of screens for a user problem.",
        milestone:
          "Present a prototype and explain improvements from feedback.",
        interview:
          "Walk through your design process and usability choices."
      },
      {
        title: "Prepare Your Profile",
        category: "CAREER READINESS",
        icon: "04",
        duration: "Weeks 15–18",
        description:
          "Present your design process and decisions in a clear portfolio.",
        skills: [
          "Case study writing",
          "Portfolio structure",
          "Design rationale",
          "Presentation skills",
          "Resume preparation"
        ],
        task:
          "Prepare a case study covering the problem, process and outcome.",
        milestone:
          "Explain the reasoning behind your design decisions.",
        interview:
          "Practise portfolio walkthroughs and design critiques."
      },
      {
        title: "Interview and Placement",
        category: "FINAL PREPARATION",
        icon: "05",
        duration: "Weeks 19–24",
        description:
          "Prepare to discuss design challenges, research and collaboration.",
        skills: [
          "Portfolio interviews",
          "Design challenges",
          "Usability questions",
          "Accessibility review",
          "Mock interviews",
          "HR preparation"
        ],
        task:
          "Present a case study and practise a timed design challenge.",
        milestone:
          "Explain how your design addresses user needs.",
        interview:
          "Practise portfolio, problem-solving and behavioural rounds."
      }
    ]
  },

  "cloud-devops": {
    title: "Cloud / DevOps Engineer",
    description:
      "Progress from operating systems and networking to cloud deployment and troubleshooting.",
    duration: "24–32 weeks",
    stages: [
      {
        title: "Start with the Basics",
        category: "FOUNDATION",
        icon: "01",
        duration: "Weeks 1–4",
        description:
          "Understand the systems and networks that applications depend on.",
        skills: [
          "Linux commands",
          "Files and permissions",
          "Processes",
          "IP addressing",
          "DNS",
          "HTTP and HTTPS"
        ],
        task:
          "Use Linux commands and investigate basic connectivity issues.",
        milestone:
          "Understand basic server and networking concepts.",
        interview:
          "Explain Linux commands, DNS and common network protocols."
      },
      {
        title: "Build Core Skills",
        category: "TECHNICAL SKILLS",
        icon: "02",
        duration: "Weeks 5–11",
        description:
          "Learn version control, automation and cloud infrastructure concepts.",
        skills: [
          "Git and GitHub",
          "Shell scripting",
          "Cloud fundamentals",
          "Virtual machines",
          "Storage and networking",
          "CI/CD concepts"
        ],
        task:
          "Use version control and describe a deployment workflow.",
        milestone:
          "Explain how code moves from development to deployment.",
        interview:
          "Practise Linux, networking, Git and cloud fundamentals."
      },
      {
        title: "Practise and Build",
        category: "PRACTICAL EXPERIENCE",
        icon: "03",
        duration: "Weeks 12–19",
        description:
          "Understand how applications are packaged, deployed and maintained.",
        skills: [
          "Docker",
          "Container images",
          "Cloud deployment",
          "Environment configuration",
          "CI/CD pipeline basics",
          "Application logs"
        ],
        task:
          "Deploy a simple application using a documented workflow.",
        milestone:
          "Explain the deployment process and common failure points.",
        interview:
          "Discuss containers, deployment steps and troubleshooting."
      },
      {
        title: "Prepare Your Profile",
        category: "CAREER READINESS",
        icon: "04",
        duration: "Weeks 20–24",
        description:
          "Document your infrastructure work and explain operational decisions.",
        skills: [
          "GitHub documentation",
          "Architecture diagrams",
          "Deployment documentation",
          "Security fundamentals",
          "Resume preparation"
        ],
        task:
          "Document the architecture and deployment steps of your work.",
        milestone:
          "Explain the system components and how they interact.",
        interview:
          "Practise describing your infrastructure and configuration."
      },
      {
        title: "Interview and Placement",
        category: "FINAL PREPARATION",
        icon: "05",
        duration: "Weeks 25–32",
        description:
          "Prepare for technical discussions involving reliability and operations.",
        skills: [
          "Linux revision",
          "Networking questions",
          "Cloud concepts",
          "CI/CD troubleshooting",
          "Monitoring and logs",
          "Mock interviews"
        ],
        task:
          "Practise diagnosing sample deployment and connectivity failures.",
        milestone:
          "Explain a structured approach to troubleshooting.",
        interview:
          "Practise scenario-based, technical and HR rounds."
      }
    ]
  }
};

const STORAGE_KEY = "careerbridge_roadmap";

function loadProgress(role, count) {
  try {
    const all = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    const saved = all[role];

    if (!Array.isArray(saved)) return [];

    return [...new Set(saved)].filter(
      (index) =>
        Number.isInteger(index) &&
        index >= 0 &&
        index < count
    );
  } catch {
    return [];
  }
}

export default function CareerRoadmap() {
  const navigate = useNavigate();

  const [role, setRole] = useState("data-analyst");
  const [completed, setCompleted] = useState([]);
  const [activeStage, setActiveStage] = useState(0);

  const roadmap = ROADMAPS[role];
  const stages = roadmap.stages;

  const progress = Math.round(
    (completed.length / stages.length) * 100
  );

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("careerbridge_role");

      if (savedRole && ROADMAPS[savedRole]) {
        setRole(savedRole);
      }
    } catch {
      // Use the default role if storage is unavailable.
    }
  }, []);

  useEffect(() => {
    setCompleted(
      loadProgress(role, ROADMAPS[role].stages.length)
    );

    setActiveStage(0);

    try {
      localStorage.setItem("careerbridge_role", role);
    } catch {
      // The roadmap still works without persistent role storage.
    }
  }, [role]);

  useEffect(() => {
    try {
      const all = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );

      all[role] = completed;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(all)
      );
    } catch {
      // Progress remains available for the current session.
    }
  }, [role, completed]);

  function toggleStage(index) {
    setCompleted((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index].sort((a, b) => a - b)
    );
  }

  function resetProgress() {
    if (window.confirm("Reset progress for this career roadmap?")) {
      setCompleted([]);
      setActiveStage(0);
    }
  }

  const currentStage = stages[activeStage];

  return (
    <div className="career-roadmap-page">
      <header className="roadmap-header">
        <button
          className="roadmap-brand"
          type="button"
          onClick={() => navigate("/dashboard")}
          aria-label="CareerBridge dashboard"
        >
          <img
            src={logoImg}
            alt="CareerBridge logo"
            className="brand-logo"
          />

          <span className="brand-text">
            <strong>CareerBridge</strong>
            <small>Career Roadmap</small>
          </span>
        </button>

        <div className="roadmap-header-actions">
          <button
            className="roadmap-outline-btn"
            onClick={() => navigate("/assessment-result")}
            type="button"
          >
            Assessment
          </button>

          <button
            className="roadmap-main-btn"
            onClick={() => navigate("/dashboard")}
            type="button"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="roadmap-container">
        {/* Main career introduction */}
        <section className="roadmap-hero">
          <div className="roadmap-hero-copy">
            <span className="roadmap-kicker">
              YOUR PERSONAL CAREER JOURNEY
            </span>

            <h1>
              From <span>Beginner</span> to
              <br />
              Interview Ready
            </h1>

            <p>
              Follow a step-by-step path, build the right skills and
              track your progress towards your career goal.
            </p>
          </div>

          <div className="hero-progress-card">
            <span className="hero-progress-label">
              YOUR PROGRESS
            </span>

            <strong className="hero-progress-number">
              {progress}%
            </strong>

            <div
              className="hero-progress-track"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Roadmap completion"
            >
              <span style={{ width: `${progress}%` }} />
            </div>

            <p>
              {completed.length} of {stages.length} phases completed
            </p>
          </div>
        </section>

        {/* Career selection */}
        <section className="roadmap-controls">
          <div className="roadmap-role-control">
            <label htmlFor="roadmap-role">
              Choose your career path
            </label>

            <select
              id="roadmap-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {Object.entries(ROADMAPS).map(([key, item]) => (
                <option value={key} key={key}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="roadmap-role-description">
            <span className="role-description-icon">✦</span>
            <p>{roadmap.description}</p>
          </div>

          <button
            className="roadmap-reset-btn"
            type="button"
            onClick={resetProgress}
          >
            Reset progress
          </button>
        </section>

        {/* The middle journey-flow section has been removed. */}

        {/* Detailed learning stage */}
        <section className="stage-details" aria-live="polite">
          <div className="stage-detail-header">
            <div className="stage-detail-icon">
              {completed.includes(activeStage)
                ? "✓"
                : currentStage.icon}
            </div>

            <div className="stage-detail-title">
              <span>{currentStage.category}</span>
              <h2>{currentStage.title}</h2>
              <p>{currentStage.description}</p>
            </div>

            <span className="stage-duration-badge">
              {currentStage.duration}
            </span>
          </div>

          <div className="stage-detail-grid">
            <div className="detail-panel">
              <h3>
                <span className="detail-symbol">✦</span>
                Skills to develop
              </h3>

              <div className="skill-list">
                {currentStage.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="detail-panel">
              <h3>
                <span className="detail-symbol">◎</span>
                Practical task
              </h3>

              <p>{currentStage.task}</p>

              <div className="milestone-box">
                <span>YOUR MILESTONE</span>
                <p>{currentStage.milestone}</p>
              </div>
            </div>
          </div>

          <div className="interview-box">
            <div className="interview-icon">↗</div>

            <div>
              <strong>Interview preparation</strong>
              <p>{currentStage.interview}</p>
            </div>
          </div>

          <div className="stage-detail-footer">
            <label className="stage-check">
              <input
                type="checkbox"
                checked={completed.includes(activeStage)}
                onChange={() => toggleStage(activeStage)}
              />

              <span>
                {completed.includes(activeStage)
                  ? "Stage completed"
                  : "Mark stage as completed"}
              </span>
            </label>

            <div className="stage-navigation">
              <button
                type="button"
                className="roadmap-outline-btn"
                disabled={activeStage === 0}
                onClick={() =>
                  setActiveStage((value) => value - 1)
                }
              >
                ← Previous
              </button>

              {activeStage < stages.length - 1 ? (
                <button
                  type="button"
                  className="roadmap-main-btn"
                  onClick={() =>
                    setActiveStage((value) => value + 1)
                  }
                >
                  Next stage →
                </button>
              ) : (
                <button
                  type="button"
                  className="roadmap-main-btn"
                  onClick={() => navigate("/dashboard")}
                >
                  Finish roadmap ✓
                </button>
              )}
            </div>
          </div>
        </section>

        
      </main>

      <footer className="roadmap-footer">
        <div className="footer-brand">
          <img
            src={logoImg}
            alt="CareerBridge logo"
            className="brand-logo"
          />
          <span className="footer-brand-name">
            CareerBridge
          </span>
        </div>

        
      </footer>
    </div>
  );
}

