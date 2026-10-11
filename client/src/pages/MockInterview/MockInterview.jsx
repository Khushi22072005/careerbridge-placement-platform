import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MockInterview.css";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const MAX_QUESTIONS = 10;

const FIRST_QUESTIONS = {
    technical: [
        {
            question:
                "Tell me about yourself and the technical skills you have developed.",
            category: "Introduction",
        },
        {
            question:
                "Explain a technical project you have worked on and the problem it solves.",
            category: "Projects",
        },
    ],
    hr: [
        {
            question: "Tell me about yourself.",
            category: "Introduction",
        },
        {
            question: "What are your strengths and weaknesses?",
            category: "Self-awareness",
        },
        {
            question: "Why should we hire you?",
            category: "Motivation",
        },
        {
            question: "Why do you want to join our company?",
            category: "Career goals",
        },
        {
            question:
                "Tell me about a challenge you faced and how you handled it.",
            category: "Problem-solving",
        },
        {
            question: "How do you handle pressure and tight deadlines?",
            category: "Work habits",
        },
        {
            question: "Describe a situation where you worked in a team.",
            category: "Teamwork",
        },
        {
            question: "Where do you see yourself in five years?",
            category: "Career goals",
        },
        {
            question: "How do you respond to feedback or criticism?",
            category: "Adaptability",
        },
        {
            question: "Do you have any questions for the interviewer?",
            category: "Closing",
        },
    ],
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

const TECHNICAL_ROLES = [
    {
        id: "software-developer",
        label: "Software Developer",
        description: "Programming, OOP, DSA, databases and software concepts",
        
    },
    {
        id: "data-analyst",
        label: "Data Analyst",
        description: "SQL, Excel, data analysis, dashboards and business insights",
      
    },
    {
        id: "web-developer",
        label: "Web Developer",
        description: "HTML, CSS, JavaScript, React and APIs",
        
    },
    {
        id: "ui-ux",
        label: "UI/UX Designer",
        description: "Design principles, user research, wireframes and usability",
        
    },
    {
        id: "cloud-devops",
        label: "Cloud / DevOps Engineer",
        description: "Linux, networking, cloud, deployment and automation",
        
    },
];

const TECHNICAL_SKILLS = {
    "software-developer": [
        "Programming Fundamentals",
        "Object-Oriented Programming",
        "Data Structures and Algorithms",
        "DBMS and SQL",
        "Operating Systems",
        "Computer Networks",
        "Software Engineering",
    ],
    "data-analyst": [
        "Excel",
        "SQL",
        "Power BI",
        "Data Cleaning",
        "Data Visualization",
        "Business Analysis",
    ],
    "web-developer": [
        "HTML and CSS",
        "JavaScript",
        "React",
        "Backend and APIs",
        "Database Integration",
        "Web Development Fundamentals",
    ],
    "ui-ux": [
        "UI Design Fundamentals",
        "UX Research",
        "Wireframing and Prototyping",
        "Figma",
        "Usability and Accessibility",
    ],
    "cloud-devops": [
        "Linux and Networking",
        "Cloud Fundamentals",
        "Git and GitHub",
        "CI/CD",
        "Containers and Deployment",
        "Monitoring and Troubleshooting",
    ],
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeQuestion(questionData) {
    if (typeof questionData === "string") {
        return {
            question: questionData,
            category: "Interview",
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
            category: questionData.category || "Interview",
        };
    }

    return {
        question: "",
        category: "Interview",
    };
}

function getAnswerText(answer) {
    if (typeof answer === "string") return answer;

    if (answer && typeof answer === "object") {
        return answer.answer || answer.text || "";
    }

    return "";
}

function calculateFallbackScore(answer) {
    const text = String(answer || "").trim();

    if (!text) return 0;

    const words = text.split(/\s+/).filter(Boolean).length;

    if (words < 5) return 25;
    if (words < 15) return 45;
    if (words < 30) return 60;
    if (words < 60) return 75;

    return 85;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MockInterview() {
    const navigate = useNavigate();

    /* ---------- Interview setup ---------- */

    const [interviewMode, setInterviewMode] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedSkill, setSelectedSkill] = useState("");

    /* ---------- Interview state ---------- */

    const [interviewStarted, setInterviewStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
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

    const availableSkills = selectedRole
        ? TECHNICAL_SKILLS[selectedRole] || []
        : [];

    const isHR = interviewMode === "hr";

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
                    // Ignore an already stopped recognition instance.
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
       SELECT INTERVIEW MODE
    ===================================================== */

    const handleInterviewTypeSelect = (mode) => {
        resetInterview();

        setInterviewMode(mode);

        if (mode !== "technical") {
            setSelectedRole("");
            setSelectedSkill("");
        }
    };

    /* =====================================================
       START INTERVIEW
    ===================================================== */

    const startInterview = async () => {
        if (!interviewMode) {
            setError("Please select an interview type first.");
            return;
        }

        if (
            interviewMode === "technical" &&
            (!selectedRole || !selectedSkill)
        ) {
            setError(
                "Please select your technical role and skill before starting."
            );
            return;
        }

        resetInterview();
        setLoading(true);
        setError("");

        try {
            let firstQuestion;

            if (interviewMode === "hr") {
                firstQuestion = FIRST_QUESTIONS.hr[0];
            } else {
                firstQuestion = FIRST_QUESTIONS.technical[0];
            }

            setCurrentQuestion(firstQuestion);
            setCurrentQuestionNumber(1);
            setInterviewStarted(true);

            answerRef.current = "";
            answersRef.current = [];

            speakQuestion(firstQuestion.question);
        } catch {
            setError("Unable to start the interview. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       EVALUATE ANSWER
    ===================================================== */

    const evaluateAnswer = async () => {
        const submittedAnswer = answer.trim();

        if (!submittedAnswer) {
            setError("Please enter or record an answer before continuing.");
            return;
        }

        if (evaluating || requestRef.current) return;

        stopListening();
        stopSpeaking();

        setEvaluating(true);
        setError("");

        const answerRecord = {
            questionNumber: currentQuestionNumber,
            question: currentQuestion?.question || "",
            category: currentQuestion?.category || "Interview",
            answer: submittedAnswer,
            score: 0,
            feedback: "",
            strengths: [],
            improvements: [],
        };

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
                        role: selectedRole,
                        skill: selectedSkill,
                        question: currentQuestion?.question || "",
                        answer: submittedAnswer,
                        questionNumber: currentQuestionNumber,
                        maxQuestions: MAX_QUESTIONS,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Evaluation service unavailable.");
            }

            const data = await response.json();

            answerRecord.score =
                Number(data.score ?? data.rating ?? 0) ||
                calculateFallbackScore(submittedAnswer);

            answerRecord.feedback =
                data.feedback ||
                data.explanation ||
                "Your answer has been recorded.";

            answerRecord.strengths = Array.isArray(data.strengths)
                ? data.strengths
                : [];

            answerRecord.improvements = Array.isArray(data.improvements)
                ? data.improvements
                : Array.isArray(data.suggestions)
                ? data.suggestions
                : [];

            answerRecord.modelAnswer =
                data.modelAnswer || data.sampleAnswer || "";

            answerRecord.communicationScore =
                data.communicationScore ?? null;

            answerRecord.relevanceScore =
                data.relevanceScore ?? null;
        } catch {
            answerRecord.score =
                calculateFallbackScore(submittedAnswer);

            answerRecord.feedback =
                "Your answer was saved, but detailed AI feedback could not be retrieved. Review your answer for relevance, clarity, examples, and completeness.";
        }

        const updatedAnswers = [
            ...answersRef.current,
            answerRecord,
        ];

        answersRef.current = updatedAnswers;

        setAnswers(updatedAnswers);
        setEvaluation(answerRecord);
        setAnswer("");
        answerRef.current = "";

        setEvaluating(false);
    };

    /* =====================================================
       BUILD FINAL REPORT
    ===================================================== */

    const buildReport = useCallback((completedAnswers) => {
        const safeAnswers = Array.isArray(completedAnswers)
            ? completedAnswers
            : [];

        const totalScore = safeAnswers.reduce(
            (total, item) =>
                total + (Number(item.score) || 0),
            0
        );

        const averageScore = safeAnswers.length
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
            role: selectedRole,
            skill: selectedSkill,
            totalQuestions: safeAnswers.length,
            maxQuestions: MAX_QUESTIONS,
            averageScore,
            answers: safeAnswers,
            strengths: [...new Set(strengths)],
            improvements: [...new Set(improvements)],
            completedAt: new Date().toISOString(),
            summary:
                averageScore >= 80
                    ? "Excellent performance. Continue practising to maintain your interview readiness."
                    : averageScore >= 60
                    ? "Good progress. Work on the improvement areas to make your answers stronger."
                    : "Keep practising. Focus on relevant examples, clear explanations, and structured answers.",
        };

        setReport(completedReport);
        setShowReport(true);
        setInterviewStarted(false);
        setEvaluation(null);
    }, [interviewMode, selectedRole, selectedSkill]);

    /* =====================================================
       NEXT QUESTION
    ===================================================== */

    const nextQuestion = async () => {
        if (!evaluation) {
            setError("Please evaluate your answer before continuing.");
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

            if (interviewMode === "hr") {
                const fallbackIndex = nextNumber - 1;

                if (fallbackIndex < HR_FALLBACK_QUESTIONS.length) {
                    nextQuestionData = {
                        question:
                            HR_FALLBACK_QUESTIONS[fallbackIndex],
                        category: "HR Interview",
                    };
                }
            }

            if (!nextQuestionData) {
                const response = await fetch(
                    `${API_BASE}/api/mock-interview/next-question`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            interviewMode,
                            role: selectedRole,
                            skill: selectedSkill,
                            currentQuestion:
                                currentQuestion?.question || "",
                            currentAnswer:
                                answersRef.current[
                                    answersRef.current.length - 1
                                ]?.answer || "",
                            questionNumber: nextNumber,
                            maxQuestions: MAX_QUESTIONS,
                            previousQuestions:
                                answersRef.current.map(
                                    (item) => item.question
                                ),
                            previousAnswers:
                                answersRef.current.map(
                                    (item) => item.answer
                                ),
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Could not retrieve the next question.");
                }

                const data = await response.json();

                nextQuestionData = normalizeQuestion(
                    data.question
                        ? data.question
                        : data
                );
            }

            if (
                !nextQuestionData ||
                !nextQuestionData.question
            ) {
                throw new Error("No next question was returned.");
            }

            setCurrentQuestion(nextQuestionData);
            setCurrentQuestionNumber(nextNumber);
            setEvaluation(null);
            setAnswer("");
            answerRef.current = "";

            speakQuestion(nextQuestionData.question);
        } catch {
            if (interviewMode === "hr") {
                const fallbackIndex = nextNumber - 1;
                const fallbackText =
                    HR_FALLBACK_QUESTIONS[fallbackIndex];

                if (fallbackText) {
                    const fallbackQuestion = {
                        question: fallbackText,
                        category: "HR Interview",
                    };

                    setCurrentQuestion(fallbackQuestion);
                    setCurrentQuestionNumber(nextNumber);
                    setEvaluation(null);
                    setAnswer("");
                    answerRef.current = "";

                    speakQuestion(fallbackQuestion.question);
                } else {
                    buildReport(answersRef.current);
                }
            } else {
                setError(
                    "Unable to load the next technical question. Please try again."
                );
            }
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
            report.role ? `Role: ${report.role}` : "",
            report.skill ? `Skill: ${report.skill}` : "",
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
        return (
            <main className="mock-interview-page">
                <section className="mock-interview-report">
                    <div className="report-header">
                        <div className="report-success-icon">
                            
                        </div>

                        
                        <h1>Interview Completed!</h1>

                        
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
                                    width: `${report.averageScore}%`,
                                }}
                            />
                        </div>

                        <p>{report.summary}</p>
                    </div>

                    <div className="report-stats-grid">
                        <div className="report-stat">
                            <span>Interview Type</span>
                            <strong>
                                {report.interviewMode === "hr"
                                    ? "HR Interview"
                                    : "Technical"}
                            </strong>
                        </div>

                        <div className="report-stat">
                            <span>Questions Answered</span>
                            <strong>
                                {report.totalQuestions}/{MAX_QUESTIONS}
                            </strong>
                        </div>

                        {report.role && (
                            <div className="report-stat">
                                <span>Selected Role</span>
                                <strong>
                                    {
                                        TECHNICAL_ROLES.find(
                                            (role) =>
                                                role.id === report.role
                                        )?.label
                                    }
                                </strong>
                            </div>
                        )}

                        {report.skill && (
                            <div className="report-stat">
                                <span>Focus Area</span>
                                <strong>{report.skill}</strong>
                            </div>
                        )}
                    </div>

                    {report.strengths.length > 0 && (
                        <section className="report-detail-card">
                            <h2>What You Did Well</h2>

                            <ul>
                                {report.strengths.map(
                                    (strength, index) => (
                                        <li key={`${strength}-${index}`}>
                                            {strength}
                                        </li>
                                    )
                                )}
                            </ul>
                        </section>
                    )}

                    {report.improvements.length > 0 && (
                        <section className="report-detail-card">
                            <h2>Areas to Improve</h2>

                            <ul>
                                {report.improvements.map(
                                    (improvement, index) => (
                                        <li
                                            key={`${improvement}-${index}`}
                                        >
                                            {improvement}
                                        </li>
                                    )
                                )}
                            </ul>
                        </section>
                    )}

                    <section className="report-detail-card">
                        <h2>Question-wise Feedback</h2>

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
                                            <strong>Improve:</strong>

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
                    </section>

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
                                setSelectedRole("");
                                setSelectedSkill("");
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
                            className={`interview-mode-card ${
                                interviewMode === "technical"
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() =>
                                handleInterviewTypeSelect("technical")
                            }
                        >
                            <span className="mode-card-icon">
                                
                            </span>

                            <span className="mode-card-content">
                                <strong>
                                    Technical Mock Interview
                                </strong>

                                

                                <span className="mode-card-meta">
                                    Role + skill selection
                                </span>
                            </span>

                            <span className="mode-card-arrow">
                                →
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`interview-mode-card ${
                                interviewMode === "hr"
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() =>
                                handleInterviewTypeSelect("hr")
                            }
                        >
                            <span className="mode-card-icon">
                                
                            </span>

                            <span className="mode-card-content">
                                <strong>HR Interview</strong>
                            </span>

                            <span className="mode-card-arrow">
                                →
                            </span>
                        </button>
                    </div>

                    {interviewMode === "technical" && (
                        <section className="technical-setup-section">
                            <div className="setup-heading">
                                <span className="setup-step">
                                    STEP 02
                                </span>

                                <h2>Choose your technical role</h2>

                
                            </div>

                            <div className="role-selector">
                                {TECHNICAL_ROLES.map((role) => (
                                    <button
                                        type="button"
                                        key={role.id}
                                        className={`role-card ${
                                            selectedRole === role.id
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setSelectedRole(role.id);
                                            setSelectedSkill("");
                                            setError("");
                                        }}
                                    >
                                        <span className="role-card-icon">
                                            {role.icon}
                                        </span>

                                        <strong>{role.label}</strong>

                                        <span>{role.description}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedRole && (
                                <>
                                    <div className="setup-heading skill-heading">
                                        <span className="setup-step">
                                            STEP 03
                                        </span>

                                        <h2>Choose your focus area</h2>

                                        
                                    </div>

                                    <div className="skill-selector">
                                        {availableSkills.map((skill) => (
                                            <button
                                                type="button"
                                                key={skill}
                                                className={`skill-option ${
                                                    selectedSkill === skill
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    setSelectedSkill(skill);
                                                    setError("");
                                                }}
                                            >
                                                <span>
                                                    {selectedSkill === skill
                                                        ? "✓"
                                                        : "+"}
                                                </span>

                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {error && (
                                <div className="interview-error">
                                    {error}
                                </div>
                            )}

                            <button
                                type="button"
                                className="primary-button start-interview-button"
                                disabled={
                                    loading ||
                                    !selectedRole ||
                                    !selectedSkill
                                }
                                onClick={startInterview}
                            >
                                {loading
                                    ? "Starting..."
                                    : "Start Technical Interview →"}
                            </button>
                        </section>
                    )}

                    {interviewMode === "hr" && (
                        <section className="hr-start-section">
                            <div className="hr-start-info">
                                <span className="hr-start-icon">
                                    
                                </span>

                                <div>
                                    <h3>Ready for your HR round?</h3>

                                </div>
                            </div>

                            {error && (
                                <div className="interview-error">
                                    {error}
                                </div>
                            )}

                            <button
                                type="button"
                                className="primary-button start-interview-button"
                                disabled={loading}
                                onClick={startInterview}
                            >
                                {loading
                                    ? "Starting..."
                                    : "Start HR Interview →"}
                            </button>
                        </section>
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
                                : `${
                                      TECHNICAL_ROLES.find(
                                          (role) =>
                                              role.id === selectedRole
                                      )?.label || "Technical"
                                  } · ${selectedSkill}`}
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
                                    🔊 Repeat
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
                                        ? answer
                                              .trim()
                                              .split(/\s+/).length
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
                                             Start Speaking
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

