import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CareerAssessment.css";

// =====================================================
// API
// =====================================================

const API_BASE_URL = "http://localhost:5000/api";
const REQUIRED_QUESTIONS = 20;

// =====================================================
// ROLE INFORMATION
// =====================================================

const ROLE_TITLES = {
    "software-developer": "Software Developer",
    "data-analyst": "Data Analyst",
    cybersecurity: "Cybersecurity",
    "cloud-devops": "Cloud / DevOps",
    "ui-ux": "UI/UX Designer",
};

const ROLE_DESCRIPTIONS = {
    "software-developer":
        "Programming, software development, algorithms, databases and core technical concepts.",

    "data-analyst":
        "Data analysis, SQL, statistics, visualization and data interpretation.",

    cybersecurity:
        "Network security, threats, vulnerabilities, authentication and security concepts.",

    "cloud-devops":
        "Cloud computing, DevOps, CI/CD, containers, deployment and infrastructure.",

    "ui-ux":
        "UI design, UX principles, usability, interaction design and user research.",
};

const ROLE_ICONS = {
    "software-developer": "💻",
    "data-analyst": "📊",
    cybersecurity: "🔐",
    "cloud-devops": "☁️",
    "ui-ux": "🎨",
};

const ROLES = [
    "software-developer",
    "data-analyst",
    "cybersecurity",
    "cloud-devops",
    "ui-ux",
];

// Only combinations with exactly 20 questions are enabled.
// The skill text must match the backend question category exactly.
const AVAILABLE_SKILLS = {
    "software-developer": [
        "Java",
        "Python",
        "JavaScript",
        "C++",
        "C#",
        "TypeScript"
    ],

    "data-analyst": [
        "SQL",
        "Python",
        "Excel",
        "Power BI",
        "Tableau",
        "R"
    ],

    cybersecurity: [
        "Python",
        "Linux",
        "Networking",
        "SQL",
        "Bash/Shell",
        "PowerShell"
    ],

    "cloud-devops": [
        "Linux",
        "AWS",
        "Azure",
        "Docker",
        "Kubernetes",
        "Terraform",
        "Python",
        "Bash/Shell"
    ],

    "ui-ux": [
        "Figma",
        "UI Design",
        "UX Design",
        "User Research",
        "Prototyping",
        "HTML/CSS",
        "Design Systems"
    ]
};

// =====================================================
// HELPERS
// =====================================================

const getToken = () => localStorage.getItem("token");

const getAuthHeaders = () => {
    const token = getToken();

    return token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {};
};

const readResponse = async (response) => {
    try {
        return await response.json();
    } catch {
        throw new Error("Server returned an invalid response.");
    }
};

const getErrorMessage = (data, fallback) => {
    return data?.message || data?.error || fallback;
};

// =====================================================
// COMPONENT
// =====================================================

function CareerAssessment() {
    const navigate = useNavigate();

    // =================================================
    // STEP
    // =================================================

    const [step, setStep] = useState(1);

    // =================================================
    // ROLE AND SKILL
    // =================================================

    const [selectedRole, setSelectedRole] = useState("");
    const [selectedSkill, setSelectedSkill] = useState("");

    const availableSkills = selectedRole
        ? AVAILABLE_SKILLS[selectedRole] || []
        : [];

    // =================================================
    // QUESTIONS AND ANSWERS
    // =================================================

    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    // =================================================
    // LOADING
    // =================================================

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // =================================================
    // ERROR
    // =================================================

    const [error, setError] = useState("");

    // =================================================
    // SELECT ROLE
    // =================================================

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setSelectedSkill("");
        setError("");
    };

    // =================================================
    // SELECT SKILL
    // =================================================

    const handleSkillSelect = (skill) => {
        setSelectedSkill(skill);
        setError("");
    };

    // =================================================
    // HANDLE UNAUTHORIZED RESPONSE
    // =================================================

    const handleUnauthorized = () => {
        localStorage.removeItem("token");

        setError(
            "Your login session has expired. Please login again."
        );

        navigate("/login");
    };

    // =================================================
    // START TEST
    // =================================================

    const handleStartTest = async () => {
        if (!selectedRole) {
            setError("Please select a career role first.");
            return;
        }

        if (!ROLE_TITLES[selectedRole]) {
            setError("Please select a valid career role.");
            return;
        }

        if (!selectedSkill) {
            setError("Please select a technical skill.");
            return;
        }

        if (!availableSkills.includes(selectedSkill)) {
            setError(
                "This role and skill combination is not available yet."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            localStorage.setItem("selectedRole", selectedRole);
            localStorage.setItem("selectedSkill", selectedSkill);

            // Backend route requires both role and skill.
            const url =
                `${API_BASE_URL}/assessment/questions/` +
                `${encodeURIComponent(selectedRole)}/` +
                `${encodeURIComponent(selectedSkill)}`;

            console.log("Loading Career Assessment");
            console.log("Role:", selectedRole);
            console.log("Skill:", selectedSkill);
            console.log("URL:", url);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    ...getAuthHeaders(),
                },
            });

            const data = await readResponse(response);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(
                        data,
                        "Unable to load assessment questions."
                    )
                );
            }

            if (!Array.isArray(data.questions)) {
                throw new Error(
                    "No assessment questions were returned."
                );
            }

            if (data.questions.length !== REQUIRED_QUESTIONS) {
                throw new Error(
                    `This skill currently has ${data.questions.length} questions. Exactly ${REQUIRED_QUESTIONS} questions are required.`
                );
            }

            const hasInvalidQuestion = data.questions.some(
                (question) =>
                    question?.id === undefined ||
                    question?.id === null ||
                    !question?.question
            );

            if (hasInvalidQuestion) {
                throw new Error(
                    "Some questions are missing required information. Please try again."
                );
            }

            setQuestions(data.questions);
            setCurrentQuestion(0);
            setAnswers({});
            setStep(2);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (err) {
            console.error("Load Assessment Error:", err);

            setError(
                err.message ||
                    "Unable to load assessment questions."
            );
        } finally {
            setLoading(false);
        }
    };

    // =================================================
    // SELECT ANSWER
    // =================================================

    const handleAnswer = (questionId, selectedOption) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: selectedOption,
        }));

        setError("");
    };

    // =================================================
    // NEXT QUESTION
    // =================================================

    const handleNext = () => {
        const currentQuestionData = questions[currentQuestion];

        if (!currentQuestionData) {
            return;
        }

        const currentQuestionId = currentQuestionData.id;

        if (!answers[currentQuestionId]) {
            setError(
                "Please select an answer before continuing."
            );
            return;
        }

        setError("");

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((previous) => previous + 1);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // =================================================
    // PREVIOUS QUESTION
    // =================================================

    const handlePrevious = () => {
        setError("");

        if (currentQuestion > 0) {
            setCurrentQuestion((previous) => previous - 1);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // =================================================
    // BACK TO ROLE AND SKILL SELECTION
    // =================================================

    const handleBackToRoleSelection = () => {
        setStep(1);
        setQuestions([]);
        setCurrentQuestion(0);
        setAnswers({});
        setError("");
    };

    // =================================================
    // GO TO A QUESTION FROM THE NAVIGATOR
    // =================================================

    const handleQuestionNavigation = (index) => {
        setError("");
        setCurrentQuestion(index);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =================================================
    // SUBMIT ASSESSMENT
    // =================================================

    const handleSubmit = async () => {
        if (submitting) {
            return;
        }

        const token = getToken();

        if (!token) {
            setError(
                "Your login session has expired. Please login again."
            );

            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        if (!selectedRole || !selectedSkill) {
            setError(
                "The selected role or skill is missing. Please restart the assessment."
            );
            return;
        }

        const unansweredQuestions = questions.filter(
            (question) => !answers[question.id]
        );

        if (unansweredQuestions.length > 0) {
            setError(
                `Please answer all ${REQUIRED_QUESTIONS} questions. ${unansweredQuestions.length} question(s) remaining.`
            );
            return;
        }

        if (questions.length !== REQUIRED_QUESTIONS) {
            setError(
                `The assessment must contain exactly ${REQUIRED_QUESTIONS} questions. Please restart the test.`
            );
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const answerList = questions.map((question) => ({
                questionId: question.id,
                selectedOption: answers[question.id],
            }));

            console.log("Submitting Career Assessment");
            console.log({
                role: selectedRole,
                skill: selectedSkill,
                totalQuestions: answerList.length,
                answers: answerList,
            });

            const response = await fetch(
                `${API_BASE_URL}/assessment/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        role: selectedRole,
                        skill: selectedSkill,
                        answers: answerList,
                    }),
                }
            );

            const data = await readResponse(response);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(
                        data,
                        "Assessment submission failed."
                    )
                );
            }

            if (!data.result || typeof data.result !== "object") {
                throw new Error(
                    "Assessment result was not returned by the server."
                );
            }

            sessionStorage.setItem(
                "assessmentResult",
                JSON.stringify(data.result)
            );

            localStorage.setItem("selectedRole", selectedRole);
            localStorage.setItem("selectedSkill", selectedSkill);

            navigate("/assessment-result");
        } catch (err) {
            console.error("Submit Assessment Error:", err);

            setError(
                err.message ||
                    "Unable to submit assessment."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =====================================================
    // STEP 1: ROLE AND SKILL SELECTION
    // =====================================================

    if (step === 1) {
        return (
            <div className="assessment-page">
                <header className="assessment-header">
                    <button
                        type="button"
                        className="back-dashboard"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>

                    <div className="assessment-brand">
                        <div className="brand-logo">C</div>

                        <div>
                            <strong>Career Assessment</strong>
                            <span>Technical Knowledge Test</span>
                        </div>
                    </div>

                    <div className="assessment-badge">
                        Step 1 of 2
                    </div>
                </header>

                <main className="assessment-main">
                    <div className="assessment-intro">
                        <p className="intro-label">
                            CAREER ASSESSMENT
                        </p>

                        <h1>Choose Your Career Role</h1>

                        <p>
                            Select a career role and a technical
                            skill to evaluate your knowledge.
                            Each available test contains exactly
                            20 questions.
                        </p>
                    </div>

                    <div className="assessment-flow">
                        <div className="flow-item active">
                            <div className="flow-number">1</div>

                            <div>
                                <strong>Select Role</strong>
                                <span>Choose your career path</span>
                            </div>
                        </div>

                        <div className="flow-line"></div>

                        <div className="flow-item">
                            <div className="flow-number">2</div>

                            <div>
                                <strong>Technical Test</strong>
                                <span>Answer 20 questions</span>
                            </div>
                        </div>
                    </div>

                    <div className="assessment-card">
                        <section className="assessment-section">
                            <div className="section-heading">
                                <div className="section-icon">
                                    🎯
                                </div>

                                <div>
                                    <h2>Select your role</h2>
                                    <p>
                                        Choose the career role you
                                        want to assess.
                                    </p>
                                </div>
                            </div>

                            <div className="role-grid">
                                {ROLES.map((role) => (
                                    <button
                                        type="button"
                                        key={role}
                                        className={`role-card ${
                                            selectedRole === role
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleRoleSelect(role)
                                        }
                                        aria-pressed={
                                            selectedRole === role
                                        }
                                    >
                                        <div className="role-icon">
                                            {ROLE_ICONS[role]}
                                        </div>

                                        <div className="role-content">
                                            <h3>
                                                {ROLE_TITLES[role]}
                                            </h3>

                                            <p>
                                                {ROLE_DESCRIPTIONS[role]}
                                            </p>
                                        </div>

                                        <div className="radio-circle">
                                            {selectedRole === role
                                                ? "✓"
                                                : ""}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {selectedRole && (
                                <div className="selected-role-info">
                                    <div className="selected-role-icon">
                                        ✓
                                    </div>

                                    <div>
                                        <strong>Selected Role</strong>
                                        <span>
                                            {ROLE_TITLES[selectedRole]}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* SKILL SELECTION */}

                            {selectedRole && (
                                <div className="skill-selection">
                                    <div className="section-heading">
                                        <div className="section-icon">
                                            📘
                                        </div>

                                        <div>
                                            <h2>Select a technical skill</h2>
                                            <p>
                                                Choose the topic for
                                                your assessment.
                                            </p>
                                        </div>
                                    </div>

                                    {availableSkills.length > 0 ? (
                                        <div className="skill-options">
                                            {availableSkills.map(
                                                (skill) => (
                                                    <button
                                                        type="button"
                                                        key={skill}
                                                        className={`skill-option ${
                                                            selectedSkill ===
                                                            skill
                                                                ? "selected"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            handleSkillSelect(
                                                                skill
                                                            )
                                                        }
                                                        aria-pressed={
                                                            selectedSkill ===
                                                            skill
                                                        }
                                                    >
                                                        {skill}
                                                        {selectedSkill ===
                                                            skill && (
                                                            <span>
                                                                {" "}✓
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="assessment-note">
                                            <strong>Not available yet:</strong>
                                            <span>
                                                This role does not
                                                currently have a skill
                                                with 20 questions.
                                                Please select Data
                                                Analyst and Python to
                                                try the available test.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="assessment-note">
                                <strong>Note:</strong>
                                <span>
                                    Only role and skill combinations
                                    with exactly 20 questions are
                                    available to take. More options
                                    can be enabled after their
                                    question sets are completed.
                                </span>
                            </div>

                            {error && (
                                <div
                                    className="submit-error"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}
                        </section>

                        <div className="assessment-actions">
                            <button
                                type="button"
                                className="previous-button"
                                onClick={() =>
                                    navigate("/dashboard")
                                }
                                disabled={loading}
                            >
                                ← Dashboard
                            </button>

                            <button
                                type="button"
                                className="continue-button"
                                onClick={handleStartTest}
                                disabled={
                                    !selectedRole ||
                                    !selectedSkill ||
                                    loading
                                }
                            >
                                {loading
                                    ? "Preparing Test..."
                                    : "Continue →"}
                            </button>
                        </div>
                    </div>

                    <p className="privacy-note">
                        Your selected role, skill and answers are
                        used to evaluate your technical knowledge.
                    </p>
                </main>
            </div>
        );
    }

    // =====================================================
    // STEP 2: LOADING STATE
    // =====================================================

    if (loading) {
        return (
            <div className="assessment-page">
                <div className="assessment-loading">
                    <div className="loading-spinner"></div>

                    <h2>Preparing your assessment...</h2>

                    <p>
                        Loading 20 questions for{" "}
                        <strong>
                            {ROLE_TITLES[selectedRole]}
                        </strong>
                        {" — "}
                        <strong>{selectedSkill}</strong>
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // STEP 2: LOAD ERROR
    // =====================================================

    if (step === 2 && error && questions.length === 0) {
        return (
            <div className="assessment-page">
                <div className="assessment-error">
                    <div className="error-icon">!</div>

                    <h2>Unable to load assessment</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={handleBackToRoleSelection}
                    >
                        ← Choose Role Again
                    </button>
                </div>
            </div>
        );
    }

    // =====================================================
    // SAFETY CHECK
    // =====================================================

    if (!questions.length) {
        return null;
    }

    // =====================================================
    // CURRENT QUESTION
    // =====================================================

    const question = questions[currentQuestion];

    if (!question) {
        return null;
    }

    // =====================================================
    // CURRENT ANSWER AND PROGRESS
    // =====================================================

    const selectedAnswer = answers[question.id];

    const isLastQuestion =
        currentQuestion === questions.length - 1;

    const answeredCount = questions.filter(
        (item) => Boolean(answers[item.id])
    ).length;

    const progress =
        ((currentQuestion + 1) / questions.length) * 100;

    // =====================================================
    // STEP 2: TECHNICAL TEST
    // =====================================================

    return (
        <div className="assessment-page">
            <header className="assessment-header">
                <button
                    type="button"
                    className="back-dashboard"
                    onClick={handleBackToRoleSelection}
                    disabled={submitting}
                >
                    ← Change Role / Skill
                </button>

                <div className="assessment-brand">
                    <div className="brand-logo">C</div>

                    <div>
                        <strong>Career Assessment</strong>
                        <span>Technical Knowledge Test</span>
                    </div>
                </div>

                <div className="step-indicator">
                    Step 2 of 2 {" • "}
                    {currentQuestion + 1}
                    {" / "}
                    {questions.length}
                </div>
            </header>

            <main className="assessment-main">
                <div className="assessment-intro">
                    <p className="intro-label">
                        TECHNICAL ASSESSMENT
                    </p>

                    <h1>{ROLE_TITLES[selectedRole]}</h1>

                    <p>
                        Skill: <strong>{selectedSkill}</strong>.
                        Answer the 20 questions to complete
                        your assessment.
                    </p>
                </div>

                <div className="assessment-flow">
                    <div className="flow-item active">
                        <div className="flow-number">✓</div>

                        <div>
                            <strong>Select Role</strong>
                            <span>
                                {ROLE_TITLES[selectedRole]}
                                {" — "}
                                {selectedSkill}
                            </span>
                        </div>
                    </div>

                    <div className="flow-line"></div>

                    <div className="flow-item active">
                        <div className="flow-number">2</div>

                        <div>
                            <strong>Technical Test</strong>
                            <span>20 questions</span>
                        </div>
                    </div>
                </div>

                {/* PROGRESS */}

                <div className="question-progress">
                    <div className="question-progress-top">
                        <span>
                            Question{" "}
                            <strong>{currentQuestion + 1}</strong>
                            {" "}of{" "}
                            <strong>{REQUIRED_QUESTIONS}</strong>
                        </span>

                        <span>
                            <strong>{answeredCount}</strong>
                            {" "}answered
                        </span>
                    </div>

                    <div className="question-progress-bar">
                        <div
                            className="question-progress-filled"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

                {/* QUESTION CARD */}

                <div className="question-card">
                    <div className="question-card-top">
                        <span className="question-number">
                            Q{currentQuestion + 1}
                        </span>

                    </div>

                    <h2 className="question-text">
                        {question.question}
                    </h2>

                    <div className="question-options">
                        {[
                            ["A", question.option_a],
                            ["B", question.option_b],
                            ["C", question.option_c],
                            ["D", question.option_d],
                        ].map(([optionLetter, optionText]) => (
                            <button
                                type="button"
                                key={optionLetter}
                                className={`question-option ${
                                    selectedAnswer === optionLetter
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleAnswer(
                                        question.id,
                                        optionLetter
                                    )
                                }
                                aria-pressed={
                                    selectedAnswer === optionLetter
                                }
                            >
                                <span className="option-letter">
                                    {optionLetter}
                                </span>

                                <span className="option-text">
                                    {optionText}
                                </span>
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div
                            className="submit-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {/* QUESTION ACTIONS */}

                    <div className="question-actions">
                        <button
                            type="button"
                            className="previous-question"
                            onClick={handlePrevious}
                            disabled={
                                currentQuestion === 0 ||
                                submitting
                            }
                        >
                            ← Previous
                        </button>

                        {!isLastQuestion ? (
                            <button
                                type="button"
                                className="next-question"
                                onClick={handleNext}
                                disabled={submitting}
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="submit-assessment"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Assessment"}
                            </button>
                        )}
                    </div>
                </div>

                {/* QUESTION NAVIGATOR */}

                <div className="question-navigator">
                    <div className="navigator-title">
                        Questions
                    </div>

                    <div className="question-dots">
                        {questions.map((item, index) => (
                            <button
                                type="button"
                                key={item.id}
                                aria-label={`Go to question ${
                                    index + 1
                                }`}
                                aria-current={
                                    index === currentQuestion
                                        ? "step"
                                        : undefined
                                }
                                className={`question-dot ${
                                    index === currentQuestion
                                        ? "current"
                                        : ""
                                } ${
                                    answers[item.id]
                                        ? "answered"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleQuestionNavigation(index)
                                }
                                disabled={submitting}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <div className="navigator-legend">
                        <span>
                            <i className="legend-current"></i>
                            Current
                        </span>

                        <span>
                            <i className="legend-answered"></i>
                            Answered
                        </span>

                        <span>
                            <i className="legend-unanswered"></i>
                            Unanswered
                        </span>
                    </div>
                </div>

                <p className="assessment-privacy">
                    Your answers are used to evaluate your
                    knowledge of the selected role and skill.
                </p>
            </main>
        </div>
    );
}

export default CareerAssessment;