import React, { useState } from "react";
import "./CareerAssessment.css";

const CareerAssessment = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const [answers, setAnswers] = useState({
    targetRole: "",
    programming: [],
    technicalSkills: [],
    dsa: {
      arrays: "",
      strings: "",
      linkedList: "",
      stackQueue: "",
      trees: "",
      graphs: "",
      dynamicProgramming: "",
    },
    strengths: [],
    workPreference: "",
    preferredLocations: [],
  });

  // =====================================================
  // TARGET ROLES
  // =====================================================

  const targetRoles = [
    {
      id: "software-developer",
      title: "Software Developer",
      description:
        "Build applications, websites and software systems.",
      icon: "💻",
    },
    {
      id: "data-analyst",
      title: "Data Analyst",
      description:
        "Analyze data and create insights for decision making.",
      icon: "📊",
    },
    {
      id: "cybersecurity",
      title: "Cybersecurity",
      description:
        "Protect systems, networks and applications.",
      icon: "🔐",
    },
    {
      id: "cloud-devops",
      title: "Cloud / DevOps",
      description:
        "Work with cloud infrastructure and deployment.",
      icon: "☁️",
    },
    {
      id: "ui-ux",
      title: "UI/UX Designer",
      description:
        "Design user-friendly digital experiences.",
      icon: "🎨",
    },
    {
      id: "not-sure",
      title: "I'm exploring careers",
      description:
        "Help me identify suitable career options.",
      icon: "🔎",
    },
  ];

  // =====================================================
  // PROGRAMMING SKILLS
  // =====================================================

  const programmingSkills = [
    "C",
    "C++",
    "Java",
    "Python",
    "JavaScript",
  ];

  // =====================================================
  // TECHNICAL SKILLS
  // =====================================================

  const technicalSkills = [
    "HTML / CSS",
    "React",
    "Node.js",
    "SQL",
    "Git / GitHub",
    "REST APIs",
    "MongoDB",
    "PostgreSQL",
  ];

  // =====================================================
  // DSA TOPICS
  // =====================================================

  const dsaTopics = [
    {
      id: "arrays",
      title: "Arrays",
      description:
        "Searching, sorting, two pointers and sliding window",
    },
    {
      id: "strings",
      title: "Strings",
      description:
        "Palindrome, anagrams, frequency and substrings",
    },
    {
      id: "linkedList",
      title: "Linked Lists",
      description:
        "Traversal, insertion, deletion and reversal",
    },
    {
      id: "stackQueue",
      title: "Stack & Queue",
      description:
        "LIFO, FIFO, implementation and applications",
    },
    {
      id: "trees",
      title: "Trees",
      description:
        "Binary trees, BST and tree traversals",
    },
    {
      id: "graphs",
      title: "Graphs",
      description:
        "BFS, DFS and graph fundamentals",
    },
    {
      id: "dynamicProgramming",
      title: "Dynamic Programming",
      description:
        "Memoization, tabulation and optimization",
    },
  ];

  // =====================================================
  // STRENGTHS
  // =====================================================

  const strengths = [
    "Problem Solving",
    "Analytical Thinking",
    "Communication",
    "Creativity",
    "Teamwork",
    "Leadership",
    "Adaptability",
    "Learning New Technologies",
  ];

  // =====================================================
  // LOCATIONS
  // =====================================================

  const locations = [
    "Mumbai",
    "Pune",
    "Bengaluru",
    "Hyderabad",
    "Delhi NCR",
    "Remote",
  ];

  // =====================================================
  // HANDLE MULTI SELECT
  // =====================================================

  const toggleArrayValue = (field, value) => {
    setAnswers((previous) => {
      const currentValues = previous[field] || [];

      if (currentValues.includes(value)) {
        return {
          ...previous,
          [field]: currentValues.filter(
            (item) => item !== value
          ),
        };
      }

      return {
        ...previous,
        [field]: [...currentValues, value],
      };
    });
  };

  // =====================================================
  // HANDLE DSA LEVEL
  // =====================================================

  const handleDsaLevel = (topic, level) => {
    setAnswers((previous) => ({
      ...previous,
      dsa: {
        ...previous.dsa,
        [topic]: level,
      },
    }));
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const canContinue = () => {
    if (currentStep === 1) {
      return answers.targetRole !== "";
    }

    if (currentStep === 2) {
      return (
        answers.programming.length > 0 ||
        answers.technicalSkills.length > 0
      );
    }

    if (currentStep === 3) {
      return Object.values(answers.dsa).some(
        (value) => value !== ""
      );
    }

    if (currentStep === 4) {
      return answers.strengths.length > 0;
    }

    if (currentStep === 5) {
      return (
        answers.workPreference !== "" &&
        answers.preferredLocations.length > 0
      );
    }

    return true;
  };

  // =====================================================
  // NEXT
  // =====================================================

  const nextStep = () => {
    if (!canContinue()) {
      alert(
        "Please complete this section before continuing."
      );
      return;
    }

    if (currentStep < 5) {
      setCurrentStep((previous) => previous + 1);
    } else {
      handleSubmit();
    }
  };

  // =====================================================
  // PREVIOUS
  // =====================================================

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((previous) => previous - 1);
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = () => {
    console.log(
      "CareerBridge Assessment Answers:",
      answers
    );

    alert(
      "Assessment completed! Backend integration will be connected next."
    );
  };

  // =====================================================
  // STEP TITLES
  // =====================================================

  const steps = [
    "Target Role",
    "Technical Skills",
    "DSA Assessment",
    "Strengths",
    "Preferences",
  ];

  // =====================================================
  // RENDER STEP 1
  // =====================================================

  const renderTargetRole = () => {
    return (
      <div className="assessment-section">
        <div className="section-heading">
          <div className="section-icon">🎯</div>

          <div>
            <h2>What role are you targeting?</h2>

            <p>
              Already know what career you want?
              Select your target role and we'll evaluate
              how prepared you are for it.
            </p>
          </div>
        </div>

        <label className="question-label">
          Select your target career <span>*</span>
        </label>

        <div className="role-grid">
          {targetRoles.map((role) => (
            <button
              type="button"
              key={role.id}
              className={`role-card ${
                answers.targetRole === role.id
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setAnswers((previous) => ({
                  ...previous,
                  targetRole: role.id,
                }))
              }
            >
              <div className="role-icon">
                {role.icon}
              </div>

              <div className="role-content">
                <h3>{role.title}</h3>

                <p>{role.description}</p>
              </div>

              <span className="radio-circle">
                {answers.targetRole === role.id
                  ? "✓"
                  : ""}
              </span>
            </button>
          ))}
        </div>

        <div className="assessment-note">
          💡 <strong>Why do we ask this?</strong>
          <span>
            Your target role allows CareerBridge to compare
            your current skills with the skills commonly
            required for that career.
          </span>
        </div>
      </div>
    );
  };

  // =====================================================
  // RENDER STEP 2
  // =====================================================

  const renderTechnicalSkills = () => {
    return (
      <div className="assessment-section">
        <div className="section-heading">
          <div className="section-icon">💻</div>

          <div>
            <h2>What technical skills do you have?</h2>

            <p>
              Select the technologies and tools you are
              comfortable working with.
            </p>
          </div>
        </div>

        <label className="question-label">
          Programming Languages
        </label>

        <div className="option-grid">
          {programmingSkills.map((skill) => (
            <button
              type="button"
              key={skill}
              className={`option-card ${
                answers.programming.includes(skill)
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                toggleArrayValue(
                  "programming",
                  skill
                )
              }
            >
              <span className="option-check">
                {answers.programming.includes(skill)
                  ? "✓"
                  : ""}
              </span>

              {skill}
            </button>
          ))}
        </div>

        <label className="question-label second-question">
          Technologies & Tools
        </label>

        <div className="option-grid">
          {technicalSkills.map((skill) => (
            <button
              type="button"
              key={skill}
              className={`option-card ${
                answers.technicalSkills.includes(
                  skill
                )
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                toggleArrayValue(
                  "technicalSkills",
                  skill
                )
              }
            >
              <span className="option-check">
                {answers.technicalSkills.includes(
                  skill
                )
                  ? "✓"
                  : ""}
              </span>

              {skill}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // =====================================================
  // RENDER STEP 3
  // =====================================================

  const renderDsaAssessment = () => {
    return (
      <div className="assessment-section">
        <div className="section-heading">
          <div className="section-icon">🧠</div>

          <div>
            <h2>How strong are you in DSA?</h2>

            <p>
              Rate your current understanding of important
              Data Structures and Algorithms topics.
            </p>
          </div>
        </div>

        <div className="dsa-info">
          <strong>Placement preparation</strong>

          <span>
            DSA is commonly tested in technical interviews.
            Your responses will help identify topics that
            need more practice.
          </span>
        </div>

        <div className="dsa-list">
          {dsaTopics.map((topic) => (
            <div className="dsa-item" key={topic.id}>
              <div className="dsa-topic">
                <h3>{topic.title}</h3>

                <p>{topic.description}</p>
              </div>

              <div className="level-buttons">
                {[
                  {
                    value: "beginner",
                    label: "Beginner",
                  },
                  {
                    value: "intermediate",
                    label: "Intermediate",
                  },
                  {
                    value: "advanced",
                    label: "Advanced",
                  },
                ].map((level) => (
                  <button
                    type="button"
                    key={level.value}
                    className={
                      answers.dsa[topic.id] ===
                      level.value
                        ? "level-selected"
                        : ""
                    }
                    onClick={() =>
                      handleDsaLevel(
                        topic.id,
                        level.value
                      )
                    }
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // =====================================================
  // RENDER STEP 4
  // =====================================================

  const renderStrengths = () => {
    return (
      <div className="assessment-section">
        <div className="section-heading">
          <div className="section-icon">⭐</div>

          <div>
            <h2>What are your strengths?</h2>

            <p>
              Select the qualities that best describe you.
              You can select multiple options.
            </p>
          </div>
        </div>

        <label className="question-label">
          Your strengths <span>*</span>
        </label>

        <div className="option-grid">
          {strengths.map((strength) => (
            <button
              type="button"
              key={strength}
              className={`option-card ${
                answers.strengths.includes(strength)
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                toggleArrayValue(
                  "strengths",
                  strength
                )
              }
            >
              <span className="option-check">
                {answers.strengths.includes(strength)
                  ? "✓"
                  : ""}
              </span>

              {strength}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // =====================================================
  // RENDER STEP 5
  // =====================================================

  const renderPreferences = () => {
    return (
      <div className="assessment-section">
        <div className="section-heading">
          <div className="section-icon">📍</div>

          <div>
            <h2>Tell us about your preferences</h2>

            <p>
              This helps us make your career roadmap more
              relevant to your placement goals.
            </p>
          </div>
        </div>

        <label className="question-label">
          Preferred work environment <span>*</span>
        </label>

        <div className="work-preference-grid">
          {[
            "Individual work",
            "Team-based work",
            "Hybrid",
            "No preference",
          ].map((preference) => (
            <button
              type="button"
              key={preference}
              className={`option-card ${
                answers.workPreference ===
                preference
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setAnswers((previous) => ({
                  ...previous,
                  workPreference: preference,
                }))
              }
            >
              <span className="option-check">
                {answers.workPreference ===
                preference
                  ? "✓"
                  : ""}
              </span>

              {preference}
            </button>
          ))}
        </div>

        <label className="question-label second-question">
          Preferred locations <span>*</span>
        </label>

        <div className="option-grid">
          {locations.map((location) => (
            <button
              type="button"
              key={location}
              className={`option-card ${
                answers.preferredLocations.includes(
                  location
                )
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                toggleArrayValue(
                  "preferredLocations",
                  location
                )
              }
            >
              <span className="option-check">
                {answers.preferredLocations.includes(
                  location
                )
                  ? "✓"
                  : ""}
              </span>

              {location}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // =====================================================
  // CURRENT STEP
  // =====================================================

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderTargetRole();

      case 2:
        return renderTechnicalSkills();

      case 3:
        return renderDsaAssessment();

      case 4:
        return renderStrengths();

      case 5:
        return renderPreferences();

      default:
        return null;
    }
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="assessment-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="assessment-header">
        <button
          type="button"
          className="back-dashboard"
          onClick={() =>
            (window.location.href = "/dashboard")
          }
        >
          ← Dashboard
        </button>

        <div className="assessment-brand">
          <div className="brand-logo">C</div>

          <div>
            <strong>CareerBridge</strong>

            <span>
              Career Fit & Placement Readiness
            </span>
          </div>
        </div>

        <div className="step-indicator">
          Step {currentStep} of 5
        </div>
      </header>

      {/* =================================================
          INTRO
      ================================================= */}

      <main className="assessment-main">
        <div className="assessment-intro">
          <p className="intro-label">
            CAREER FIT & PLACEMENT READINESS
          </p>

          <h1>
            Evaluate where you stand today.
          </h1>

          <p>
            Tell us your target role, current technical
            skills, DSA knowledge, strengths and preferences.
            CareerBridge will use this information to identify
            your skill gaps and help you prepare for placements.
          </p>
        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div className="progress-container">
          <div className="progress-top">
            <span>Your progress</span>

            <strong>
              {currentStep * 20}%
            </strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-filled"
              style={{
                width: `${currentStep * 20}%`,
              }}
            />
          </div>

          <div className="step-navigation">
            {steps.map((step, index) => {
              const stepNumber = index + 1;

              return (
                <div
                  key={step}
                  className={`progress-step ${
                    currentStep === stepNumber
                      ? "active"
                      : currentStep > stepNumber
                      ? "completed"
                      : ""
                  }`}
                >
                  <span>{stepNumber}</span>

                  <small>{step}</small>
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================
            CARD
        ================================================= */}

        <section className="assessment-card">
          {renderCurrentStep()}

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="assessment-actions">
            <button
              type="button"
              className="previous-button"
              disabled={currentStep === 1}
              onClick={previousStep}
            >
              ← Previous
            </button>

            <button
              type="button"
              className="continue-button"
              onClick={nextStep}
            >
              {currentStep === 5
                ? "Complete Assessment"
                : "Continue →"}
            </button>
          </div>
        </section>

        <p className="privacy-note">
          🔒 Your responses are used only to personalize
          your CareerBridge experience.
        </p>
      </main>
    </div>
  );
};

export default CareerAssessment;