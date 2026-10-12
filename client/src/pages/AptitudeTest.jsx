
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./AptitudeTest.css";

const API_URL = "http://localhost:5000/api/aptitude";

function AptitudeTest() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        try {
            const savedQuestions = sessionStorage.getItem(
                `aptitudeQuestions_${assessmentId}`
            );

            if (!savedQuestions) {
                setError(
                    "Test questions were not found. Please start a new test."
                );
                return;
            }

            const parsedQuestions = JSON.parse(savedQuestions);

            if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
                setError("No questions are available for this test.");
                return;
            }

            setQuestions(parsedQuestions);
        } catch {
            setError("Unable to load the test questions.");
        } finally {
            setLoading(false);
        }
    }, [assessmentId]);

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;

    const handleAnswer = (questionId, selectedOption) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: selectedOption,
        }));
    };

    const handleSubmit = async () => {
        if (answeredCount !== questions.length) {
            setError(
                `Please answer all questions. You have answered ${answeredCount} of ${questions.length}.`
            );
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to submit your aptitude test?"
        );

        if (!confirmed) return;

        setSubmitting(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            const formattedAnswers = questions.map((question) => ({
                questionId: question.id,
                selectedOption: answers[question.id],
            }));

            const response = await axios.post(
                `${API_URL}/submit`,
                {
                    assessmentId: Number(assessmentId),
                    answers: formattedAnswers,
                },
                {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {},
                }
            );

            if (!response.data.success) {
                throw new Error("The test could not be submitted.");
            }

            // Save the returned result for the result page.
            sessionStorage.setItem(
                `aptitudeResult_${assessmentId}`,
                JSON.stringify(response.data.result)
            );

            sessionStorage.removeItem(
                `aptitudeQuestions_${assessmentId}`
            );

            navigate(`/aptitude-result/${assessmentId}`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to submit your test. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="aptitude-test-page">
                <div className="aptitude-test-message">
                    Loading your questions...
                </div>
            </div>
        );
    }

    if (error && questions.length === 0) {
        return (
            <div className="aptitude-test-page">
                <div className="aptitude-test-card aptitude-test-message">
                    <h2>Unable to open test</h2>
                    <p>{error}</p>
                    <button
                        className="aptitude-primary-button"
                        onClick={() => navigate("/aptitude-practice")}
                    >
                        Choose a Category
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    const options = [
        { key: "A", text: currentQuestion.option_a },
        { key: "B", text: currentQuestion.option_b },
        { key: "C", text: currentQuestion.option_c },
        { key: "D", text: currentQuestion.option_d },
    ];

    return (
        <div className="aptitude-test-page">
            <div className="aptitude-test-container">
                <header className="aptitude-test-header">
                    <div>
                        <span className="aptitude-test-eyebrow">
                            CAREERBRIDGE PRACTICE CENTER
                        </span>
                        <h1>{currentQuestion.category || "Aptitude Practice"}</h1>
                        <p>Read each question carefully and select one answer.</p>
                    </div>

                    <div className="aptitude-progress-summary">
                        <strong>
                            {answeredCount}/{questions.length}
                        </strong>
                        <span>Answered</span>
                    </div>
                </header>

                <div
                    className="aptitude-progress-track"
                    role="progressbar"
                    aria-valuenow={answeredCount}
                    aria-valuemin={0}
                    aria-valuemax={questions.length}
                >
                    <div
                        className="aptitude-progress-fill"
                        style={{
                            width: `${(answeredCount / questions.length) * 100}%`,
                        }}
                    />
                </div>

                {error && (
                    <div className="aptitude-test-error" role="alert">
                        {error}
                    </div>
                )}

                <div className="aptitude-test-layout">
                    <aside className="aptitude-question-sidebar">
                        <h3>Questions</h3>

                        <div className="aptitude-question-numbers">
                            {questions.map((question, index) => {
                                const isAnswered =
                                    answers[question.id] !== undefined;

                                return (
                                    <button
                                        type="button"
                                        key={question.id}
                                        className={[
                                            "aptitude-question-number",
                                            index === currentIndex ? "active" : "",
                                            isAnswered ? "answered" : "",
                                        ].filter(Boolean).join(" ")}
                                        onClick={() => {
                                            setCurrentIndex(index);
                                            setError("");
                                        }}
                                        aria-label={`Question ${index + 1}${
                                            isAnswered ? ", answered" : ", unanswered"
                                        }`}
                                        aria-current={
                                            index === currentIndex ? "step" : undefined
                                        }
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="aptitude-question-legend">
                            <span><i className="legend-current" /> Current</span>
                            <span><i className="legend-answered" /> Answered</span>
                            <span><i className="legend-unanswered" /> Unanswered</span>
                        </div>
                    </aside>

                    <main className="aptitude-question-card">
                        <div className="aptitude-question-meta">
                            <span>
                                QUESTION {currentIndex + 1} OF {questions.length}
                            </span>
                            <span className="aptitude-difficulty">
                                {currentQuestion.difficulty}
                            </span>
                        </div>

                        <h2>{currentQuestion.question}</h2>

                        <p className="aptitude-select-hint">
                            Choose the correct answer.
                        </p>

                        <div className="aptitude-options">
                            {options.map((option) => {
                                const selected =
                                    answers[currentQuestion.id] === option.key;

                                return (
                                    <button
                                        type="button"
                                        key={option.key}
                                        className={[
                                            "aptitude-option",
                                            selected ? "selected" : "",
                                        ].filter(Boolean).join(" ")}
                                        onClick={() => {
                                            handleAnswer(
                                                currentQuestion.id,
                                                option.key
                                            );
                                            setError("");
                                        }}
                                        aria-pressed={selected}
                                    >
                                        <span className="aptitude-option-letter">
                                            {option.key}
                                        </span>
                                        <span className="aptitude-option-text">
                                            {option.text}
                                        </span>
                                        <span className="aptitude-option-check">
                                            {selected ? "✓" : ""}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="aptitude-test-navigation">
                            <button
                                type="button"
                                className="aptitude-secondary-button"
                                disabled={currentIndex === 0 || submitting}
                                onClick={() => {
                                    setCurrentIndex((index) => index - 1);
                                    setError("");
                                }}
                            >
                                Previous
                            </button>

                            {currentIndex < questions.length - 1 ? (
                                <button
                                    type="button"
                                    className="aptitude-primary-button"
                                    onClick={() => {
                                        setCurrentIndex((index) => index + 1);
                                        setError("");
                                    }}
                                >
                                    Next Question →
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="aptitude-primary-button"
                                    disabled={submitting}
                                    onClick={handleSubmit}
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Test"}
                                </button>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default AptitudeTest;

