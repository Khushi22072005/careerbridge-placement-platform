import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TechnicalAssessment.css";

const TechnicalAssessment = () => {

    const navigate = useNavigate();

    const [questions, setQuestions] =
        useState([]);

    const [assessmentId, setAssessmentId] =
        useState(null);

    const [currentQuestion, setCurrentQuestion] =
        useState(0);

    const [answers, setAnswers] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [timeLeft, setTimeLeft] =
        useState(20 * 60);


    // =====================================================
    // START ASSESSMENT
    // =====================================================

    useEffect(() => {

        startAssessment();

    }, []);


    const startAssessment = async () => {

        try {

            setLoading(true);
            setError("");

            const email =
                localStorage.getItem("userEmail") ||
                localStorage.getItem("email");

            if (!email) {

                setError(
                    "Please login again."
                );

                return;
            }

            const response =
                await fetch(
                    `http://localhost:5000/api/technical-assessment/questions/${encodeURIComponent(email)}`
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to start assessment"
                );
            }

            setQuestions(
                data.questions
            );

            setAssessmentId(
                data.assessmentId
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // TIMER
    // =====================================================

    useEffect(() => {

        if (
            loading ||
            submitting ||
            questions.length === 0
        ) {
            return;
        }

        if (timeLeft <= 0) {

            submitAssessment();

            return;
        }

        const timer =
            setInterval(() => {

                setTimeLeft(
                    (previous) =>
                        previous - 1
                );

            }, 1000);

        return () => clearInterval(timer);

    }, [
        timeLeft,
        loading,
        submitting,
        questions.length,
    ]);


    // =====================================================
    // FORMAT TIMER
    // =====================================================

    const formatTime = () => {

        const minutes =
            Math.floor(
                timeLeft / 60
            );

        const seconds =
            timeLeft % 60;

        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(seconds).padStart(
            2,
            "0"
        )}`;
    };


    // =====================================================
    // SELECT ANSWER
    // =====================================================

    const selectAnswer = (
        option
    ) => {

        const question =
            questions[currentQuestion];

        setAnswers(
            (previous) => ({
                ...previous,

                [question.id]:
                    option,
            })
        );
    };


    // =====================================================
    // NEXT QUESTION
    // =====================================================

    const nextQuestion = () => {

        if (
            currentQuestion <
            questions.length - 1
        ) {

            setCurrentQuestion(
                currentQuestion + 1
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

    const previousQuestion = () => {

        if (
            currentQuestion > 0
        ) {

            setCurrentQuestion(
                currentQuestion - 1
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const submitAssessment = async () => {

        if (submitting) {
            return;
        }

        try {

            setSubmitting(true);

            const formattedAnswers =
                questions.map(
                    (question) => ({
                        questionId:
                            question.id,

                        selectedOption:
                            answers[
                                question.id
                            ] || null,
                    })
                );

            const response =
                await fetch(
                    "http://localhost:5000/api/technical-assessment/submit",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            assessmentId,
                            answers:
                                formattedAnswers,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to submit assessment"
                );
            }

            // Save result temporarily
            sessionStorage.setItem(
                "technicalAssessmentResult",
                JSON.stringify(
                    data.result
                )
            );

            navigate(
                "/technical-assessment/result"
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to submit assessment"
            );

            setSubmitting(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="technical-loading">

                <div className="assessment-spinner">
                </div>

                <h2>
                    Preparing your assessment...
                </h2>

                <p>
                    Selecting questions based on
                    different difficulty levels.
                </p>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (
            <div className="technical-error">

                <div className="technical-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to start assessment
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={
                        startAssessment
                    }
                >
                    Try Again
                </button>

            </div>
        );
    }


    // =====================================================
    // NO QUESTIONS
    // =====================================================

    if (
        questions.length === 0
    ) {

        return (
            <div className="technical-error">

                <h2>
                    No questions available
                </h2>

                <p>
                    Please try again later.
                </p>

            </div>
        );
    }


    // =====================================================
    // CURRENT QUESTION
    // =====================================================

    const question =
        questions[currentQuestion];


    const selectedAnswer =
        answers[question.id];


    const answeredCount =
        Object.keys(answers).length;


    const progress =
        (
            ((currentQuestion + 1) /
                questions.length) *
            100
        );


    // =====================================================
    // MAIN UI
    // =====================================================

    return (
        <div className="technical-page">

            {/* HEADER */}

            <header className="technical-header">

                <div>

                    <span className="technical-label">
                        CAREERBRIDGE
                    </span>

                    <h1>
                        Technical Skill Assessment
                    </h1>

                    <p>
                        Test your programming,
                        DSA and problem-solving
                        fundamentals.
                    </p>

                </div>


                <div className="assessment-timer">

                    <span>
                        TIME LEFT
                    </span>

                    <strong
                        className={
                            timeLeft <= 300
                                ? "timer-warning"
                                : ""
                        }
                    >
                        ⏱ {formatTime()}
                    </strong>

                </div>

            </header>


            {/* PROGRESS */}

            <div className="assessment-progress">

                <div className="progress-info">

                    <span>
                        Question{" "}
                        {currentQuestion + 1}
                        {" "}of{" "}
                        {questions.length}
                    </span>

                    <span>
                        {answeredCount}/
                        {questions.length}
                        {" "}answered
                    </span>

                </div>

                <div className="progress-bar">

                    <div
                        style={{
                            width:
                                `${progress}%`,
                        }}
                    />

                </div>

            </div>


            {/* QUESTION */}

            <main className="assessment-content">

                <div className="question-card">

                    {/* CATEGORY */}

                    <div className="question-meta">

                        <span className="category-badge">
                            {question.category}
                        </span>

                        <span
                            className={`difficulty-badge ${question.difficulty.toLowerCase()}`}
                        >
                            {question.difficulty}
                        </span>

                    </div>


                    {/* QUESTION NUMBER */}

                    <p className="question-number">
                        QUESTION{" "}
                        {String(
                            currentQuestion + 1
                        ).padStart(2, "0")}
                    </p>


                    {/* QUESTION */}

                    <h2>
                        {question.question}
                    </h2>


                    {/* OPTIONS */}

                    <div className="options">

                        <Option
                            letter="A"
                            text={
                                question.option_a
                            }
                            selected={
                                selectedAnswer ===
                                "A"
                            }
                            onClick={() =>
                                selectAnswer(
                                    "A"
                                )
                            }
                        />

                        <Option
                            letter="B"
                            text={
                                question.option_b
                            }
                            selected={
                                selectedAnswer ===
                                "B"
                            }
                            onClick={() =>
                                selectAnswer(
                                    "B"
                                )
                            }
                        />

                        <Option
                            letter="C"
                            text={
                                question.option_c
                            }
                            selected={
                                selectedAnswer ===
                                "C"
                            }
                            onClick={() =>
                                selectAnswer(
                                    "C"
                                )
                            }
                        />

                        <Option
                            letter="D"
                            text={
                                question.option_d
                            }
                            selected={
                                selectedAnswer ===
                                "D"
                            }
                            onClick={() =>
                                selectAnswer(
                                    "D"
                                )
                            }
                        />

                    </div>


                    {/* NAVIGATION */}

                    <div className="question-navigation">

                        <button
                            className="previous-button"
                            disabled={
                                currentQuestion ===
                                0
                            }
                            onClick={
                                previousQuestion
                            }
                        >
                            ← Previous
                        </button>


                        {currentQuestion ===
                        questions.length - 1 ? (

                            <button
                                className="submit-button"
                                onClick={
                                    submitAssessment
                                }
                                disabled={
                                    submitting
                                }
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Assessment ✓"}
                            </button>

                        ) : (

                            <button
                                className="next-button"
                                onClick={
                                    nextQuestion
                                }
                            >
                                Next Question →
                            </button>

                        )}

                    </div>

                </div>


                {/* QUESTION PALETTE */}

                <div className="question-palette">

                    <div className="palette-header">

                        <h3>
                            Questions
                        </h3>

                        <span>
                            {answeredCount}/
                            {questions.length}
                        </span>

                    </div>


                    <div className="palette-grid">

                        {questions.map(
                            (item, index) => (

                                <button
                                    key={
                                        item.id
                                    }
                                    className={`
                                        palette-number
                                        ${
                                            index ===
                                            currentQuestion
                                                ? "current"
                                                : ""
                                        }
                                        ${
                                            answers[
                                                item.id
                                            ]
                                                ? "answered"
                                                : ""
                                        }
                                    `}
                                    onClick={() =>
                                        setCurrentQuestion(
                                            index
                                        )
                                    }
                                >
                                    {index + 1}
                                </button>

                            )
                        )}

                    </div>


                    <div className="palette-legend">

                        <span>
                            <i className="legend-current">
                            </i>
                            Current
                        </span>

                        <span>
                            <i className="legend-answered">
                            </i>
                            Answered
                        </span>

                        <span>
                            <i className="legend-unanswered">
                            </i>
                            Unanswered
                        </span>

                    </div>

                </div>

            </main>

        </div>
    );
};


// =====================================================
// OPTION COMPONENT
// =====================================================

const Option = ({
    letter,
    text,
    selected,
    onClick,
}) => {

    return (
        <button
            className={
                `answer-option ${
                    selected
                        ? "selected"
                        : ""
                }`
            }
            onClick={onClick}
        >

            <span className="option-letter">
                {letter}
            </span>

            <span className="option-text">
                {text}
            </span>

            <span className="option-check">
                {selected
                    ? "✓"
                    : ""}
            </span>

        </button>
    );
};


export default TechnicalAssessment;