
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "./MockInterview.css";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const MAX_QUESTIONS = 10;

/* =========================================================
   INITIAL QUESTIONS
========================================================= */

const FIRST_QUESTIONS = {
    technical: {
        question:
            "Tell me about yourself and the technical skills you have developed.",
        category: "Introduction",
        type: "technical-intro",
        focus: "Technical Introduction",
        difficulty: "easy",
    },

    hr: {
        question: "Tell me about yourself.",
        category: "Introduction",
        type: "hr",
        focus: "Introduction",
        difficulty: "easy",
    },
};

const HR_FALLBACK_QUESTIONS = [
    "Tell me about yourself.",
    "What are your strengths and weaknesses?",
    "Why should we hire you?",
    "Why do you want to join our company?",
    "Tell me about a challenge you faced and how you handled it.",
    "How do you handle pressure and tight deadlines?",
    "Describe a situation where you worked in a team.",
    "Where do you see yourself in five years?",
    "How do you respond to feedback or criticism?",
    "Do you have any questions for the interviewer?",
];

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function normalizeQuestion(questionData) {
    if (typeof questionData === "string") {
        return {
            question: questionData,
            category: "Interview",
            type: "technical",
        };
    }

    if (questionData && typeof questionData === "object") {
        return {
            ...questionData,
            question:
                questionData.question ||
                questionData.text ||
                questionData.nextQuestion ||
                "",
            category:
                questionData.category ||
                questionData.focus ||
                "Interview",
        };
    }

    return {
        question: "",
        category: "Interview",
        type: "technical",
    };
}

function averageScore(values) {
    const validValues = values
        .map(Number)
        .filter(
            (value) =>
                Number.isFinite(value) &&
                value >= 0 &&
                value <= 100
        );

    if (!validValues.length) return null;

    return Math.round(
        validValues.reduce((total, value) => total + value, 0) /
            validValues.length
    );
}

function getUniqueItems(items) {
    return [
        ...new Set(
            items
                .filter(Boolean)
                .map((item) => String(item).trim())
                .filter(Boolean)
        ),
    ];
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MockInterview() {
    const navigate = useNavigate();

    /* ---------- Interview setup ---------- */

    const [interviewMode, setInterviewMode] = useState("");

    /* ---------- Interview state ---------- */

    const [interviewStarted, setInterviewStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentQuestionNumber, setCurrentQuestionNumber] =
        useState(1);

    const [answer, setAnswer] = useState("");
    const [answers, setAnswers] = useState([]);
    const [evaluation, setEvaluation] = useState(null);
    const [report, setReport] = useState(null);

    /* ---------- UI state ---------- */

    const [loading, setLoading] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showReport, setShowReport] = useState(false);

    /* ---------- Refs ---------- */

    const recognitionRef = useRef(null);
    const answerRef = useRef("");
    const answersRef = useRef([]);
    const requestRef = useRef(false);
    const speakingRef = useRef(false);

    const isHR = interviewMode === "hr";

    /* =====================================================
       BUILD PREVIOUS ANSWER HISTORY
       Matches the backend's expected object structure.
    ===================================================== */

    const getPreviousAnswersPayload = useCallback(() => {
        return answersRef.current.map((item) => ({
            question: item.question,
            answer: item.answer,
            evaluation: {
                overall: item.score,
                communication: item.communicationScore,
                relevance: item.relevanceScore,
                technicalAccuracy: item.technicalScore,
                answerStructure: item.answerStructure,
                confidence: item.confidence,
                completeness: item.completeness,
                structure: item.answerStructure,
                feedback: item.feedback,
                strengths: item.strengths,
                improvements: item.improvements,
                understanding: item.understanding,
            },
        }));
    }, []);

    /* =====================================================
       SPEECH SYNTHESIS
    ===================================================== */

    const stopSpeaking = useCallback(() => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        speakingRef.current = false;
        setIsSpeaking(false);
    }, []);

    const speakQuestion = useCallback(
        (text) => {
            if (!text || !("speechSynthesis" in window)) return;

            stopSpeaking();

            const utterance = new SpeechSynthesisUtterance(text);

            utterance.rate = 0.95;
            utterance.pitch = 1;
            utterance.lang = "en-IN";

            utterance.onstart = () => {
                speakingRef.current = true;
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                speakingRef.current = false;
                setIsSpeaking(false);
            };

            utterance.onerror = () => {
                speakingRef.current = false;
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        },
        [stopSpeaking]
    );

    /* =====================================================
       SPEECH RECOGNITION
    ===================================================== */

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // Recognition may already have stopped.
            }
        }

        setIsListening(false);
    }, []);

    const startListening = useCallback(() => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError(
                "Speech recognition is not supported by this browser. Please type your answer instead."
            );
            return;
        }

        setError("");

        try {
            stopSpeaking();

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // Ignore an already stopped instance.
                }
            }

            const recognition = new SpeechRecognition();

            recognition.lang = "en-IN";
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                let finalTranscript = "";
                let interimTranscript = "";

                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i += 1
                ) {
                    const transcript =
                        event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + " ";
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    const updatedAnswer = (
                        answerRef.current +
                        " " +
                        finalTranscript
                    )
                        .replace(/\s+/g, " ")
                        .trim();

                    answerRef.current = updatedAnswer;
                    setAnswer(updatedAnswer);
                }

                if (interimTranscript) {
                    setAnswer(
                        (
                            answerRef.current +
                            " " +
                            interimTranscript
                        )
                            .replace(/\s+/g, " ")
                            .trim()
                    );
                }
            };

            recognition.onerror = (event) => {
                setIsListening(false);

                if (
                    event.error !== "no-speech" &&
                    event.error !== "aborted"
                ) {
                    setError(
                        "Microphone recognition failed. Please check microphone permissions or type your answer."
                    );
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch {
            setIsListening(false);
            setError(
                "Unable to start speech recognition. Please type your answer instead."
            );
        }
    }, [stopSpeaking]);

    /* =====================================================
       RESET INTERVIEW
    ===================================================== */

    const resetInterview = useCallback(() => {
        stopListening();
        stopSpeaking();

        setInterviewStarted(false);
        setCurrentQuestion(null);
        setCurrentQuestionNumber(1);
        setAnswer("");
        setAnswers([]);
        setEvaluation(null);
        setReport(null);
        setShowReport(false);
        setLoading(false);
        setEvaluating(false);
        setError("");

        answerRef.current = "";
        answersRef.current = [];
        requestRef.current = false;
    }, [stopListening, stopSpeaking]);

    /* =====================================================
       START INTERVIEW
    ===================================================== */

    const startInterview = (mode) => {
        if (loading) return;

        if (mode !== "technical" && mode !== "hr") {
            setError("Please select a valid interview type.");
            return;
        }

        resetInterview();
        setInterviewMode(mode);
        setError("");

        const firstQuestion =
            mode === "hr"
                ? FIRST_QUESTIONS.hr
                : FIRST_QUESTIONS.technical;

        setCurrentQuestion(firstQuestion);
        setCurrentQuestionNumber(1);
        setInterviewStarted(true);

        answerRef.current = "";
        answersRef.current = [];

        speakQuestion(firstQuestion.question);
    };

    /* =====================================================
       EVALUATE ANSWER
       Reads the backend's actual response field names.
    ===================================================== */

    const evaluateAnswer = async () => {
        const submittedAnswer = answer.trim();

        if (!submittedAnswer) {
            setError(
                "Please enter or record an answer before continuing."
            );
            return;
        }

        if (evaluating || requestRef.current) return;

        stopListening();
        stopSpeaking();

        setEvaluating(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE}/api/mock-interview/evaluate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        interviewMode,
                        question:
                            currentQuestion?.question || "",
                        questionType:
                            currentQuestion?.type ||
                            currentQuestion?.category ||
                            "technical",
                        answer: submittedAnswer,
                        previousAnswers:
                            getPreviousAnswersPayload(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        data.message ||
                        "Unable to evaluate your answer."
                );
            }

            /*
             * The backend returns:
             * overall, communication, relevance,
             * technicalAccuracy, answerStructure,
             * feedback, strengths, improvements.
             */
            const answerRecord = {
                questionNumber: currentQuestionNumber,
                question: currentQuestion?.question || "",
                category:
                    currentQuestion?.category || "Interview",
                answer: submittedAnswer,

                score: Number(
                    data.overall ?? data.score ?? 0
                ),

                feedback:
                    data.feedback ||
                    "Your answer has been evaluated.",

                strengths: Array.isArray(data.strengths)
                    ? data.strengths
                    : [],

                improvements: Array.isArray(data.improvements)
                    ? data.improvements
                    : [],

                modelAnswer:
                    data.modelAnswer ||
                    data.sampleAnswer ||
                    "",

                communicationScore:
                    data.communication ?? null,

                relevanceScore:
                    data.relevance ?? null,

                technicalScore:
                    interviewMode === "hr"
                        ? null
                        : data.technicalAccuracy ?? null,

                answerStructure:
                    data.answerStructure ??
                    data.structure ??
                    null,

                confidence: data.confidence ?? null,
                completeness: data.completeness ?? null,
                understanding: data.understanding || "",
            };

            const updatedAnswers = [
                ...answersRef.current,
                answerRecord,
            ];

            answersRef.current = updatedAnswers;

            setAnswers(updatedAnswers);
            setEvaluation(answerRecord);
            setAnswer("");
            answerRef.current = "";
        } catch (error) {
            console.error("Answer evaluation failed:", error);

            /*
             * Do not fabricate an AI score when the request fails.
             * Preserve the typed answer so the user can retry.
             */
            setError(
                error.message ||
                    "Unable to evaluate your answer. Please try again."
            );
        } finally {
            setEvaluating(false);
        }
    };

    /* =====================================================
       BUILD FINAL REPORT
    ===================================================== */

    const buildReport = useCallback(
        (completedAnswers) => {
            const safeAnswers = Array.isArray(completedAnswers)
                ? completedAnswers
                : [];

            const totalScore = safeAnswers.reduce(
                (total, item) =>
                    total + (Number(item.score) || 0),
                0
            );

            const average = safeAnswers.length
                ? Math.round(totalScore / safeAnswers.length)
                : 0;

            const strengths = safeAnswers.flatMap((item) =>
                Array.isArray(item.strengths)
                    ? item.strengths
                    : []
            );

            const improvements = safeAnswers.flatMap((item) =>
                Array.isArray(item.improvements)
                    ? item.improvements
                    : []
            );

            const completedReport = {
                interviewMode,
                totalQuestions: safeAnswers.length,
                maxQuestions: MAX_QUESTIONS,
                averageScore: average,
                answers: safeAnswers,
                strengths: getUniqueItems(strengths),
                improvements: getUniqueItems(improvements),
                completedAt: new Date().toISOString(),
                summary:
                    average >= 80
                        ? "Excellent performance. Continue practising to maintain your interview readiness."
                        : average >= 60
                        ? "Good progress. Work on the improvement areas to make your answers stronger."
                        : "Keep practising. Focus on relevant examples, clear explanations, and structured answers.",
            };

            setReport(completedReport);
            setShowReport(true);
            setInterviewStarted(false);
            setEvaluation(null);
        },
        [interviewMode]
    );

    /* =====================================================
       NEXT QUESTION
       Sends complete answer history to the backend.
    ===================================================== */

    const nextQuestion = async () => {
        if (!evaluation) {
            setError(
                "Please evaluate your answer before continuing."
            );
            return;
        }

        if (requestRef.current) return;

        if (currentQuestionNumber >= MAX_QUESTIONS) {
            buildReport(answersRef.current);
            return;
        }

        requestRef.current = true;
        setLoading(true);
        setError("");

        const nextNumber = currentQuestionNumber + 1;

        try {
            let nextQuestionData = null;

            /*
             * Keep the existing predefined HR questions.
             */
            if (interviewMode === "hr") {
                const fallbackIndex = nextNumber - 1;

                if (
                    fallbackIndex <
                    HR_FALLBACK_QUESTIONS.length
                ) {
                    nextQuestionData = {
                        question:
                            HR_FALLBACK_QUESTIONS[fallbackIndex],
                        category: "HR Interview",
                        type: "hr",
                    };
                }
            }

            /*
             * Technical questions are generated adaptively.
             * HR uses the API after its predefined questions.
             */
            if (!nextQuestionData) {
                const latestAnswer =
                    answersRef.current[
                        answersRef.current.length - 1
                    ];

                const response = await fetch(
                    `${API_BASE}/api/mock-interview/next-question`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            interviewMode,

                            currentQuestion:
                                latestAnswer?.question ||
                                currentQuestion?.question ||
                                "",

                            currentAnswer:
                                latestAnswer?.answer || "",

                            /*
                             * The backend uses this as the
                             * question that was just answered.
                             */
                            questionNumber: currentQuestionNumber,
                            maxQuestions: MAX_QUESTIONS,

                            /*
                             * Send objects, not arrays of strings.
                             */
                            previousAnswers:
                                getPreviousAnswersPayload(),
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                            data.message ||
                            "Could not retrieve the next question."
                    );
                }

                nextQuestionData = normalizeQuestion(data);
            }

            if (
                !nextQuestionData ||
                !nextQuestionData.question
            ) {
                throw new Error(
                    "No next question was returned."
                );
            }

            setCurrentQuestion(nextQuestionData);
            setCurrentQuestionNumber(nextNumber);
            setEvaluation(null);
            setAnswer("");
            answerRef.current = "";

            speakQuestion(nextQuestionData.question);
        } catch (error) {
            console.error("Next question failed:", error);

            setError(
                error.message ||
                    "Unable to load the next question. Please try again."
            );
        } finally {
            setLoading(false);
            requestRef.current = false;
        }
    };

    /* =====================================================
       FINISH INTERVIEW
    ===================================================== */

    const finishInterview = () => {
        stopListening();
        stopSpeaking();
        buildReport(answersRef.current);
    };

    /* =====================================================
       DOWNLOAD REPORT
    ===================================================== */

    const downloadReport = () => {
        if (!report) return;

        const reportText = [
            "CAREERBRIDGE MOCK INTERVIEW REPORT",
            "===================================",
            "",
            `Interview type: ${
                report.interviewMode === "hr"
                    ? "HR Interview"
                    : "Technical Mock Interview"
            }`,
            `Questions answered: ${report.totalQuestions}/${MAX_QUESTIONS}`,
            `Average score: ${report.averageScore}/100`,
            "",
            "SUMMARY",
            report.summary,
            "",
            "QUESTION-WISE FEEDBACK",
            ...report.answers.flatMap((item, index) => [
                "",
                `${index + 1}. ${item.question}`,
                `Answer: ${item.answer}`,
                `Score: ${item.score}/100`,
                `Feedback: ${item.feedback}`,
                item.strengths?.length
                    ? `Strengths: ${item.strengths.join(", ")}`
                    : "",
                item.improvements?.length
                    ? `Improvements: ${item.improvements.join(", ")}`
                    : "",
                item.modelAnswer
                    ? `Sample answer: ${item.modelAnswer}`
                    : "",
            ]),
        ]
            .filter((line) => line !== undefined)
            .join("\n");

        const blob = new Blob([reportText], {
            type: "text/plain;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "CareerBridge-Mock-Interview-Report.txt";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    };

    /* =====================================================
       CLEANUP
    ===================================================== */

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // Ignore cleanup errors.
                }
            }

            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    /* =====================================================
       REPORT SCREEN
    ===================================================== */

    if (showReport && report) {
        const communication = averageScore(
            report.answers.map(
                (item) => item.communicationScore
            )
        );

        const relevance = averageScore(
            report.answers.map(
                (item) => item.relevanceScore
            )
        );

        const technical = averageScore(
            report.answers.map(
                (item) => item.technicalScore
            )
        );

        const metrics = [
            {
                label: "Questions",
                value: `${report.totalQuestions}/${MAX_QUESTIONS}`,
            },
            {
                label: "Communication",
                value: communication,
            },
            {
                label: "Relevance",
                value: relevance,
            },
            {
                label: "Technical",
                value: technical,
            },
        ].filter((metric) => metric.value !== null);

        return (
            <main className="mock-interview-page">
                <section className="mock-interview-report report-compact">
                    <div className="report-header">
                        <div className="report-success-icon">✓</div>

                        <h1>Interview Completed!</h1>

                        <p>
                            Your{" "}
                            {report.interviewMode === "hr"
                                ? "HR Interview"
                                : "Technical Interview"}{" "}
                            performance report
                        </p>
                    </div>

                    <div className="report-score-card">
                        <span className="report-score-label">
                            Overall Score
                        </span>

                        <div className="report-score">
                            {report.averageScore}
                            <span>/100</span>
                        </div>

                        <div className="report-progress-track">
                            <div
                                className="report-progress-fill"
                                style={{
                                    width: `${Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            report.averageScore
                                        )
                                    )}%`,
                                }}
                            />
                        </div>

                        <p>{report.summary}</p>
                    </div>

                    <div className="report-stats-grid report-metrics-grid">
                        {metrics.map((metric) => (
                            <div
                                className="report-stat"
                                key={metric.label}
                            >
                                <span>{metric.label}</span>
                                <strong>{metric.value}</strong>
                            </div>
                        ))}
                    </div>

                    {report.strengths.length > 0 && (
                        <section className="report-detail-card">
                            <h2>Your Strengths</h2>

                            <ul>
                                {report.strengths
                                    .slice(0, 4)
                                    .map((strength, index) => (
                                        <li key={`${strength}-${index}`}>
                                            {strength}
                                        </li>
                                    ))}
                            </ul>
                        </section>
                    )}

                    {report.improvements.length > 0 && (
                        <section className="report-detail-card">
                            <h2>Areas to Improve</h2>

                            <ul>
                                {report.improvements
                                    .slice(0, 4)
                                    .map((improvement, index) => (
                                        <li key={`${improvement}-${index}`}>
                                            {improvement}
                                        </li>
                                    ))}
                            </ul>
                        </section>
                    )}

                    <section className="report-detail-card report-summary-card">
                        <h2>AI Interview Summary</h2>
                        <p>{report.summary}</p>
                    </section>

                    <details className="report-detail-card report-question-details">
                        <summary>
                            View Question-wise Feedback (
                            {report.totalQuestions})
                        </summary>

                        <div className="report-answer-list">
                            {report.answers.map((item, index) => (
                                <article
                                    className="report-answer-item"
                                    key={`${item.questionNumber}-${index}`}
                                >
                                    <div className="report-answer-heading">
                                        <span className="report-question-number">
                                            Q{index + 1}
                                        </span>

                                        <span className="report-answer-score">
                                            {item.score}/100
                                        </span>
                                    </div>

                                    <h3>{item.question}</h3>

                                    <p className="report-answer-text">
                                        <strong>Your answer:</strong>{" "}
                                        {item.answer}
                                    </p>

                                    <p className="report-feedback-text">
                                        <strong>Feedback:</strong>{" "}
                                        {item.feedback}
                                    </p>

                                    {item.improvements?.length > 0 && (
                                        <div className="report-improvements">
                                            <strong>
                                                Areas to improve:
                                            </strong>

                                            <ul>
                                                {item.improvements.map(
                                                    (suggestion, i) => (
                                                        <li
                                                            key={`${suggestion}-${i}`}
                                                        >
                                                            {suggestion}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {item.modelAnswer && (
                                        <details className="model-answer-details">
                                            <summary>
                                                View sample answer
                                            </summary>

                                            <p>{item.modelAnswer}</p>
                                        </details>
                                    )}
                                </article>
                            ))}
                        </div>
                    </details>

                    <div className="report-actions">
                        <button
                            className="primary-button"
                            onClick={downloadReport}
                        >
                            Download Report
                        </button>

                        <button
                            className="secondary-button"
                            onClick={() => {
                                resetInterview();
                                setInterviewMode("");
                            }}
                        >
                            Practise Again
                        </button>

                        <button
                            className="text-button"
                            onClick={() => navigate("/dashboard")}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    /* =====================================================
       INTERVIEW SETUP SCREEN
    ===================================================== */

    if (!interviewStarted) {
        return (
            <main className="mock-interview-page">
                <header className="mock-interview-topbar">
                    <button
                        className="back-button"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>

                    <span className="topbar-brand">
                        CareerBridge
                    </span>
                </header>

                <section className="mock-interview-hero">
                    <span className="hero-badge">
                        AI-POWERED INTERVIEW PRACTICE
                    </span>
                </section>

                <section className="interview-setup-container">
                    <div className="setup-heading">
                        <span className="setup-step">STEP 01</span>
                        <h2>Choose your interview type</h2>
                    </div>

                    <div className="interview-mode-grid">
                        <button
                            type="button"
                            className="interview-mode-card"
                            disabled={loading}
                            onClick={() => startInterview("technical")}
                        >
                            <span className="mode-card-icon"></span>

                            <span className="mode-card-content">
                                <strong>
                                    Technical Mock Interview
                                </strong>

                                <span className="mode-card-meta">
                                    Technical concepts, programming and projects
                                </span>
                            </span>

                            <span className="mode-card-arrow">→</span>
                        </button>

                        <button
                            type="button"
                            className="interview-mode-card"
                            disabled={loading}
                            onClick={() => startInterview("hr")}
                        >
                            <span className="mode-card-icon"></span>

                            <span className="mode-card-content">
                                <strong>HR Interview</strong>

                                <span className="mode-card-meta">
                                    Behavioural and communication practice
                                </span>
                            </span>

                            <span className="mode-card-arrow">→</span>
                        </button>
                    </div>

                    {error && (
                        <div className="interview-error">
                            {error}
                        </div>
                    )}
                </section>
            </main>
        );
    }

    /* =====================================================
       LIVE INTERVIEW SCREEN
    ===================================================== */

    return (
        <main className="mock-interview-page">
            <header className="mock-interview-topbar">
                <button
                    className="back-button"
                    onClick={() => {
                        if (
                            window.confirm(
                                "Are you sure you want to leave this interview? Your current session will end."
                            )
                        ) {
                            resetInterview();
                            setInterviewMode("");
                        }
                    }}
                >
                    ← Exit Interview
                </button>

                <span className="interview-type-label">
                    {isHR
                        ? "HR INTERVIEW"
                        : "TECHNICAL MOCK INTERVIEW"}
                </span>
            </header>

            <section className="interview-workspace">
                <div className="interview-workspace-header">
                    <div>
                        <h1>
                            {isHR
                                ? "HR Interview"
                                : "Technical Mock Interview"}
                        </h1>

                        <p>
                            {isHR
                                ? "Practise your communication and behavioural answers."
                                : "Practise technical concepts, problem-solving and project-related questions."}
                        </p>
                    </div>

                    <div className="question-counter">
                        <span>QUESTION</span>

                        <strong>
                            {currentQuestionNumber}
                            <span> / {MAX_QUESTIONS}</span>
                        </strong>
                    </div>
                </div>

                <div className="question-progress-track">
                    <div
                        className="question-progress-fill"
                        style={{
                            width: `${
                                (currentQuestionNumber /
                                    MAX_QUESTIONS) *
                                100
                            }%`,
                        }}
                    />
                </div>

                <div className="interview-layout">
                    <section className="interview-main-panel">
                        <article className="question-card">
                            <div className="question-card-top">
                                <span className="question-label">
                                    INTERVIEWER ASKS
                                </span>

                                <span className="question-category">
                                    {currentQuestion?.category ||
                                        "Interview Question"}
                                </span>
                            </div>

                            <div className="interviewer-profile">
                                <div
                                    className={`interviewer-avatar ${
                                        isSpeaking ? "speaking" : ""
                                    }`}
                                >
                                    <span>AI</span>

                                    {isSpeaking && (
                                        <span className="speaking-pulse" />
                                    )}
                                </div>

                                <div>
                                    <strong>AI Interviewer</strong>

                                    <span>
                                        {isSpeaking
                                            ? "Speaking..."
                                            : "CareerBridge Interview Coach"}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="repeat-question-button"
                                    onClick={() =>
                                        speakQuestion(
                                            currentQuestion?.question
                                        )
                                    }
                                    title="Read the question aloud"
                                >
                                    Repeat
                                </button>
                            </div>

                            <h2 className="interview-question-text">
                                {currentQuestion?.question}
                            </h2>
                        </article>

                        <article className="answer-card">
                            <div className="answer-card-header">
                                <div>
                                    <h2>Your Answer</h2>

                                    <p>
                                        Type your answer or speak using
                                        your microphone.
                                    </p>
                                </div>

                                <span className="answer-word-count">
                                    {answer.trim()
                                        ? answer.trim().split(/\s+/).length
                                        : 0}{" "}
                                    words
                                </span>
                            </div>

                            <textarea
                                className="interview-answer-input"
                                value={answer}
                                onChange={(event) => {
                                    setAnswer(event.target.value);
                                    answerRef.current =
                                        event.target.value;
                                }}
                                placeholder="Start typing your answer here..."
                                rows={7}
                                disabled={evaluating}
                            />

                            <div className="answer-toolbar">
                                <div className="voice-controls">
                                    {!isListening ? (
                                        <button
                                            type="button"
                                            className="voice-button"
                                            onClick={startListening}
                                            disabled={evaluating}
                                        >
                                            🎙 Start Speaking
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="voice-button listening"
                                            onClick={stopListening}
                                        >
                                            Stop Recording
                                        </button>
                                    )}

                                    {isListening && (
                                        <span className="listening-indicator">
                                            <span className="listening-dot" />
                                            Listening...
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="clear-answer-button"
                                    onClick={() => {
                                        setAnswer("");
                                        answerRef.current = "";
                                    }}
                                    disabled={
                                        !answer.trim() || evaluating
                                    }
                                >
                                    Clear answer
                                </button>
                            </div>

                            {error && (
                                <div className="interview-error">
                                    {error}
                                </div>
                            )}

                            <div className="answer-submit-row">
                                <span className="answer-submit-hint">
                                    Your answer will be reviewed before
                                    the next question.
                                </span>

                                <button
                                    type="button"
                                    className="primary-button evaluate-answer-button"
                                    onClick={evaluateAnswer}
                                    disabled={
                                        evaluating ||
                                        !answer.trim() ||
                                        Boolean(evaluation)
                                    }
                                >
                                    {evaluating
                                        ? "Evaluating..."
                                        : evaluation
                                        ? "Answer Evaluated ✓"
                                        : "Submit Answer →"}
                                </button>
                            </div>
                        </article>

                        {evaluation && (
                            <section className="evaluation-card">
                                <div className="evaluation-header">
                                    <div>
                                        <span className="workspace-eyebrow">
                                            ANSWER REVIEW
                                        </span>

                                        <h2>Your Feedback</h2>
                                    </div>

                                    <div className="evaluation-score">
                                        <strong>
                                            {evaluation.score}
                                        </strong>

                                        <span>/100</span>
                                    </div>
                                </div>

                                <div className="evaluation-score-track">
                                    <div
                                        className="evaluation-score-fill"
                                        style={{
                                            width: `${Math.max(
                                                0,
                                                Math.min(
                                                    100,
                                                    Number(
                                                        evaluation.score
                                                    ) || 0
                                                )
                                            )}%`,
                                        }}
                                    />
                                </div>

                                <p className="evaluation-feedback">
                                    {evaluation.feedback}
                                </p>

                                {evaluation.strengths?.length > 0 && (
                                    <div className="evaluation-list">
                                        <h3>What went well</h3>

                                        <ul>
                                            {evaluation.strengths.map(
                                                (item, index) => (
                                                    <li
                                                        key={`${item}-${index}`}
                                                    >
                                                        {item}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {evaluation.improvements?.length > 0 && (
                                    <div className="evaluation-list">
                                        <h3>How to improve</h3>

                                        <ul>
                                            {evaluation.improvements.map(
                                                (item, index) => (
                                                    <li
                                                        key={`${item}-${index}`}
                                                    >
                                                        {item}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {evaluation.modelAnswer && (
                                    <details className="model-answer-details">
                                        <summary>
                                            View a sample answer
                                        </summary>

                                        <p>{evaluation.modelAnswer}</p>
                                    </details>
                                )}

                                <div className="next-question-actions">
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={finishInterview}
                                    >
                                        Finish Interview
                                    </button>

                                    <button
                                        type="button"
                                        className="primary-button"
                                        onClick={nextQuestion}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Loading..."
                                            : currentQuestionNumber >=
                                              MAX_QUESTIONS
                                            ? "View Final Report →"
                                            : "Next Question →"}
                                    </button>
                                </div>
                            </section>
                        )}
                    </section>
                </div>
            </section>
        </main>
    );
}





