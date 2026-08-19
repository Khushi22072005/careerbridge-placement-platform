import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CareerAssessment.css";

// =====================================================
// API
// =====================================================

const API_BASE_URL = "http://localhost:5000/api";

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

// =====================================================
// CONSTANT
// =====================================================

const REQUIRED_QUESTIONS = 20;

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
    // ROLE
    // =================================================

    const [selectedRole, setSelectedRole] = useState("");

    // =================================================
    // QUESTIONS
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
    // GET TOKEN
    // =================================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =================================================
    // SELECT ROLE
    // =================================================

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setError("");
    };

    // =================================================
    // START TEST
    // =================================================

    const handleStartTest = async () => {
        if (!selectedRole) {
            setError("Please select a career role first.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            localStorage.setItem(
                "selectedRole",
                selectedRole
            );

            const url =
                `${API_BASE_URL}/assessment/questions/` +
                encodeURIComponent(selectedRole);

            console.log("=================================");
            console.log("Loading Career Assessment");
            console.log("Role:", selectedRole);
            console.log("URL:", url);
            console.log("=================================");

            const response = await fetch(url);

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "Server returned an invalid response."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load assessment questions."
                );
            }

            if (
                !data.questions ||
                !Array.isArray(data.questions)
            ) {
                throw new Error(
                    "No assessment questions were returned."
                );
            }

            // =================================================
            // EXACTLY 20 QUESTIONS REQUIRED
            // =================================================

            if (
                data.questions.length !==
                REQUIRED_QUESTIONS
            ) {
                throw new Error(
                    `This role currently has ${data.questions.length} questions. Exactly ${REQUIRED_QUESTIONS} questions are required.`
                );
            }

            console.log(
                `Successfully loaded ${data.questions.length} questions.`
            );

            // =================================================
            // STORE QUESTIONS
            // =================================================

            setQuestions(data.questions);

            // =================================================
            // RESET TEST
            // =================================================

            setCurrentQuestion(0);
            setAnswers({});

            // =================================================
            // GO TO STEP 2
            // =================================================

            setStep(2);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

        } catch (err) {
            console.error(
                "Load Assessment Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load assessment questions."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // SELECT ANSWER
    // =====================================================

    const handleAnswer = (
        questionId,
        selectedOption
    ) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: selectedOption,
        }));

        setError("");
    };

    // =====================================================
    // NEXT QUESTION
    // =====================================================

    const handleNext = () => {
        const currentQuestionData =
            questions[currentQuestion];

        if (!currentQuestionData) {
            return;
        }

        const currentQuestionId =
            currentQuestionData.id;

        if (!answers[currentQuestionId]) {
            setError(
                "Please select an answer before continuing."
            );

            return;
        }

        setError("");

        if (
            currentQuestion <
            questions.length - 1
        ) {
            setCurrentQuestion(
                (previous) => previous + 1
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // =====================================================
    // PREVIOUS QUESTION
    // =====================================================

    const handlePrevious = () => {
        setError("");

        if (currentQuestion > 0) {
            setCurrentQuestion(
                (previous) => previous - 1
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // =====================================================
    // BACK TO ROLE SELECTION
    // =====================================================

    const handleBackToRoleSelection = () => {
        setStep(1);
        setQuestions([]);
        setCurrentQuestion(0);
        setAnswers({});
        setError("");
    };

    // =====================================================
    // SUBMIT ASSESSMENT
    // =====================================================

    const handleSubmit = async () => {

        // =================================================
        // CHECK TOKEN
        // =================================================

        const token = getToken();

        console.log(
            "Authentication token exists:",
            !!token
        );

        if (!token) {
            setError(
                "Your login session has expired. Please login again."
            );

            localStorage.removeItem("token");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

            return;
        }

        // =================================================
        // CHECK ALL QUESTIONS
        // =================================================

        const unansweredQuestions =
            questions.filter(
                (question) =>
                    !answers[question.id]
            );

        if (unansweredQuestions.length > 0) {
            setError(
                `Please answer all ${REQUIRED_QUESTIONS} questions. ${unansweredQuestions.length} question(s) remaining.`
            );

            return;
        }

        try {
            setSubmitting(true);
            setError("");

            // =================================================
            // CONVERT ANSWERS OBJECT TO ARRAY
            // =================================================

            const answerList = questions.map(
                (question) => ({
                    questionId: question.id,
                    selectedOption:
                        answers[question.id],
                })
            );

            console.log(
                "================================="
            );

            console.log(
                "Submitting Career Assessment"
            );

            console.log({
                role: selectedRole,
                totalQuestions:
                    answerList.length,
                answers: answerList,
            });

            console.log(
                "Token being sent:",
                token ? "YES" : "NO"
            );

            console.log(
                "================================="
            );

            // =================================================
            // POST SUBMISSION
            // =================================================

            const response = await fetch(
                `${API_BASE_URL}/assessment/submit`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        // =================================================
                        // IMPORTANT FIX
                        // SEND JWT TOKEN TO BACKEND
                        // =================================================

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        role: selectedRole,
                        answers: answerList,
                    }),
                }
            );

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "Server returned an invalid response."
                );
            }

            // =================================================
            // TOKEN EXPIRED / UNAUTHORIZED
            // =================================================

            if (response.status === 401) {

                console.error(
                    "401 Unauthorized:",
                    data
                );

                localStorage.removeItem("token");

                setError(
                    "Your login session has expired. Please login again."
                );

                setTimeout(() => {
                    navigate("/login");
                }, 1500);

                return;
            }

            // =================================================
            // OTHER API ERROR
            // =================================================

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Assessment submission failed."
                );
            }

            // =================================================
            // VALIDATE RESULT
            // =================================================

            if (!data.result) {
                throw new Error(
                    "Assessment result was not returned by the server."
                );
            }

            // =================================================
            // SAVE RESULT
            // =================================================

            sessionStorage.setItem(
                "assessmentResult",
                JSON.stringify(data.result)
            );

            localStorage.setItem(
                "selectedRole",
                selectedRole
            );

            // =================================================
            // GO TO RESULT PAGE
            // =================================================

            navigate("/assessment-result");

        } catch (err) {

            console.error(
                "Submit Assessment Error:",
                err
            );

            setError(
                err.message ||
                "Unable to submit assessment."
            );

        } finally {
            setSubmitting(false);
        }
    };

    // =====================================================
    // STEP 1
    // ROLE SELECTION
    // =====================================================

    if (step === 1) {
        return (
            <div className="assessment-page">

                {/* HEADER */}

                <header className="assessment-header">

                    <button
                        type="button"
                        className="back-dashboard"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                    <div className="assessment-brand">

                        <div className="brand-logo">
                            C
                        </div>

                        <div>
                            <strong>
                                Career Assessment
                            </strong>

                            <span>
                                Technical Knowledge Test
                            </span>
                        </div>

                    </div>

                    <div className="assessment-badge">
                        Step 1 of 2
                    </div>

                </header>

                {/* MAIN */}

                <main className="assessment-main">

                    {/* INTRO */}

                    <div className="assessment-intro">

                        <p className="intro-label">
                            CAREER ASSESSMENT
                        </p>

                        <h1>
                            Choose Your Career Role
                        </h1>

                        <p>
                            Select the role you want
                            to evaluate your technical
                            knowledge for. You will
                            receive exactly 20
                            role-specific questions.
                        </p>

                    </div>

                    {/* FLOW */}

                    <div className="assessment-flow">

                        <div className="flow-item active">

                            <div className="flow-number">
                                1
                            </div>

                            <div>
                                <strong>
                                    Select Role
                                </strong>

                                <span>
                                    Choose your career path
                                </span>
                            </div>

                        </div>

                        <div className="flow-line">
                        </div>

                        <div className="flow-item">

                            <div className="flow-number">
                                2
                            </div>

                            <div>
                                <strong>
                                    Technical Test
                                </strong>

                                <span>
                                    Answer 20 questions
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* CARD */}

                    <div className="assessment-card">

                        <section className="assessment-section">

                            <div className="section-heading">

                                <div className="section-icon">
                                    🎯
                                </div>

                                <div>

                                    <h2>
                                        Select your role
                                    </h2>

                                    <p>
                                        Your questions will be
                                        based only on the role
                                        you select.
                                    </p>

                                </div>

                            </div>

                            {/* ROLE GRID */}

                            <div className="role-grid">

                                {ROLES.map(
                                    (role) => (
                                        <button
                                            type="button"
                                            key={role}
                                            className={
                                                `role-card ${
                                                    selectedRole === role
                                                        ? "selected"
                                                        : ""
                                                }`
                                            }
                                            onClick={() =>
                                                handleRoleSelect(
                                                    role
                                                )
                                            }
                                        >

                                            <div className="role-icon">
                                                {
                                                    ROLE_ICONS[
                                                        role
                                                    ]
                                                }
                                            </div>

                                            <div className="role-content">

                                                <h3>
                                                    {
                                                        ROLE_TITLES[
                                                            role
                                                        ]
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        ROLE_DESCRIPTIONS[
                                                            role
                                                        ]
                                                    }
                                                </p>

                                            </div>

                                            <div className="radio-circle">

                                                {
                                                    selectedRole === role
                                                        ? "✓"
                                                        : ""
                                                }

                                            </div>

                                        </button>
                                    )
                                )}

                            </div>

                            {/* SELECTED ROLE */}

                            {selectedRole && (
                                <div className="selected-role-info">

                                    <div className="selected-role-icon">
                                        ✓
                                    </div>

                                    <div>

                                        <strong>
                                            Selected Role
                                        </strong>

                                        <span>
                                            {
                                                ROLE_TITLES[
                                                    selectedRole
                                                ]
                                            }
                                        </span>

                                    </div>

                                </div>
                            )}

                            {/* NOTE */}

                            <div className="assessment-note">

                                <strong>
                                    Note:
                                </strong>

                                <span>
                                    The technical test contains
                                    exactly 20 questions and all
                                    questions will belong to the
                                    selected role.
                                </span>

                            </div>

                            {/* ERROR */}

                            {error && (
                                <div className="submit-error">
                                    {error}
                                </div>
                            )}

                        </section>

                        {/* ACTIONS */}

                        <div className="assessment-actions">

                            <button
                                type="button"
                                className="previous-button"
                                onClick={() =>
                                    navigate("/dashboard")
                                }
                            >
                                ← Dashboard
                            </button>

                            <button
                                type="button"
                                className="continue-button"
                                onClick={
                                    handleStartTest
                                }
                                disabled={
                                    !selectedRole ||
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
                        Your selected role and answers are
                        used only to evaluate your technical
                        knowledge.
                    </p>

                </main>

            </div>
        );
    }

    // =====================================================
    // STEP 2 LOADING
    // =====================================================

    if (step === 2 && loading) {
        return (
            <div className="assessment-page">

                <div className="assessment-loading">

                    <div className="loading-spinner">
                    </div>

                    <h2>
                        Preparing your assessment...
                    </h2>

                    <p>
                        Loading 20 questions for{" "}
                        <strong>
                            {
                                ROLE_TITLES[
                                    selectedRole
                                ]
                            }
                        </strong>
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // STEP 2 ERROR
    // =====================================================

    if (
        step === 2 &&
        error &&
        questions.length === 0
    ) {
        return (
            <div className="assessment-page">

                <div className="assessment-error">

                    <div className="error-icon">
                        !
                    </div>

                    <h2>
                        Unable to load assessment
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={
                            handleBackToRoleSelection
                        }
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

    const question =
        questions[currentQuestion];

    if (!question) {
        return null;
    }

    // =====================================================
    // CURRENT ANSWER
    // =====================================================

    const selectedAnswer =
        answers[question.id];

    // =====================================================
    // QUESTION STATE
    // =====================================================

    const isLastQuestion =
        currentQuestion ===
        questions.length - 1;

    const answeredCount =
        Object.keys(answers).length;

    const progress =
        ((currentQuestion + 1) /
            questions.length) *
        100;

    // =====================================================
    // STEP 2
    // TECHNICAL TEST
    // =====================================================

    return (
        <div className="assessment-page">

            {/* HEADER */}

            <header className="assessment-header">

                <button
                    type="button"
                    className="back-dashboard"
                    onClick={
                        handleBackToRoleSelection
                    }
                >
                    ← Change Role
                </button>

                <div className="assessment-brand">

                    <div className="brand-logo">
                        C
                    </div>

                    <div>

                        <strong>
                            Career Assessment
                        </strong>

                        <span>
                            Technical Knowledge Test
                        </span>

                    </div>

                </div>

                <div className="step-indicator">
                    Step 2 of 2
                    {" • "}
                    {currentQuestion + 1}
                    {" / "}
                    {questions.length}
                </div>

            </header>

            {/* MAIN */}

            <main className="assessment-main">

                {/* INTRO */}

                <div className="assessment-intro">

                    <p className="intro-label">
                        TECHNICAL ASSESSMENT
                    </p>

                    <h1>
                        {
                            ROLE_TITLES[
                                selectedRole
                            ]
                        }
                    </h1>

                    <p>
                        Test your technical knowledge
                        through 20 role-specific
                        questions.
                    </p>

                </div>

                {/* FLOW */}

                <div className="assessment-flow">

                    <div className="flow-item active">

                        <div className="flow-number">
                            ✓
                        </div>

                        <div>

                            <strong>
                                Select Role
                            </strong>

                            <span>
                                {
                                    ROLE_TITLES[
                                        selectedRole
                                    ]
                                }
                            </span>

                        </div>

                    </div>

                    <div className="flow-line">
                    </div>

                    <div className="flow-item active">

                        <div className="flow-number">
                            2
                        </div>

                        <div>

                            <strong>
                                Technical Test
                            </strong>

                            <span>
                                20 questions
                            </span>

                        </div>

                    </div>

                </div>

                {/* PROGRESS */}

                <div className="question-progress">

                    <div className="question-progress-top">

                        <span>
                            Question{" "}
                            <strong>
                                {currentQuestion + 1}
                            </strong>
                            {" "}of{" "}
                            <strong>
                                {REQUIRED_QUESTIONS}
                            </strong>
                        </span>

                        <span>
                            <strong>
                                {answeredCount}
                            </strong>
                            {" "}answered
                        </span>

                    </div>

                    <div className="question-progress-bar">

                        <div
                            className="question-progress-filled"
                            style={{
                                width:
                                    `${progress}%`,
                            }}
                        />

                    </div>

                </div>

                {/* QUESTION CARD */}

                <div className="question-card">

                    {/* TOP */}

                    <div className="question-card-top">

                        <span className="question-number">
                            Q{currentQuestion + 1}
                        </span>

                        <div className="question-meta">

                            <span className="question-category">
                                {question.category}
                            </span>

                            {question.difficulty && (
                                <span
                                    className={
                                        `difficulty-${String(
                                            question.difficulty
                                        ).toLowerCase()}`
                                    }
                                >
                                    {question.difficulty}
                                </span>
                            )}

                        </div>

                    </div>

                    {/* QUESTION */}

                    <h2 className="question-text">
                        {question.question}
                    </h2>

                    {/* OPTIONS */}

                    <div className="question-options">

                        {/* OPTION A */}

                        <button
                            type="button"
                            className={
                                `question-option ${
                                    selectedAnswer === "A"
                                        ? "selected"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                handleAnswer(
                                    question.id,
                                    "A"
                                )
                            }
                        >

                            <span className="option-letter">
                                A
                            </span>

                            <span className="option-text">
                                {question.option_a}
                            </span>

                        </button>

                        {/* OPTION B */}

                        <button
                            type="button"
                            className={
                                `question-option ${
                                    selectedAnswer === "B"
                                        ? "selected"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                handleAnswer(
                                    question.id,
                                    "B"
                                )
                            }
                        >

                            <span className="option-letter">
                                B
                            </span>

                            <span className="option-text">
                                {question.option_b}
                            </span>

                        </button>

                        {/* OPTION C */}

                        <button
                            type="button"
                            className={
                                `question-option ${
                                    selectedAnswer === "C"
                                        ? "selected"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                handleAnswer(
                                    question.id,
                                    "C"
                                )
                            }
                        >

                            <span className="option-letter">
                                C
                            </span>

                            <span className="option-text">
                                {question.option_c}
                            </span>

                        </button>

                        {/* OPTION D */}

                        <button
                            type="button"
                            className={
                                `question-option ${
                                    selectedAnswer === "D"
                                        ? "selected"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                handleAnswer(
                                    question.id,
                                    "D"
                                )
                            }
                        >

                            <span className="option-letter">
                                D
                            </span>

                            <span className="option-text">
                                {question.option_d}
                            </span>

                        </button>

                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="submit-error">
                            {error}
                        </div>
                    )}

                    {/* ACTIONS */}

                    <div className="question-actions">

                        <button
                            type="button"
                            className="previous-question"
                            onClick={
                                handlePrevious
                            }
                            disabled={
                                currentQuestion === 0
                            }
                        >
                            ← Previous
                        </button>

                        {!isLastQuestion ? (
                            <button
                                type="button"
                                className="next-question"
                                onClick={
                                    handleNext
                                }
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="submit-assessment"
                                onClick={
                                    handleSubmit
                                }
                                disabled={
                                    submitting
                                }
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

                        {questions.map(
                            (item, index) => (
                                <button
                                    type="button"
                                    key={item.id}
                                    aria-label={
                                        `Go to question ${index + 1}`
                                    }
                                    className={
                                        `question-dot ${
                                            index ===
                                            currentQuestion
                                                ? "current"
                                                : ""
                                        } ${
                                            answers[item.id]
                                                ? "answered"
                                                : ""
                                        }`
                                    }
                                    onClick={() => {
                                        setError("");

                                        setCurrentQuestion(
                                            index
                                        );

                                        window.scrollTo({
                                            top: 0,
                                            behavior:
                                                "smooth",
                                        });
                                    }}
                                >
                                    {index + 1}
                                </button>
                            )
                        )}

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

                {/* PRIVACY */}

                <p className="assessment-privacy">

                    Your answers are used only to
                    evaluate your knowledge of the
                    selected role.

                </p>

            </main>

        </div>
    );
}

export default CareerAssessment;