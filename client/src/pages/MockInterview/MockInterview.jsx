import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MockInterview.css";

/* =========================================================
   INTERVIEW QUESTIONS
========================================================= */

const INTERVIEW_QUESTIONS = {
    "software-developer": [
        {
            id: 1,
            type: "intro",
            question:
                "Tell me about yourself and your background in software development.",
            focus: "Introduction & Communication",
        },
        {
            id: 2,
            type: "technical",
            question:
                "What is the difference between a process and a thread?",
            focus: "Operating Systems",
        },
        {
            id: 3,
            type: "technical",
            question:
                "Explain the concept of object-oriented programming and its main principles.",
            focus: "Programming Fundamentals",
        },
        {
            id: 4,
            type: "problem-solving",
            question:
                "Suppose an application suddenly becomes very slow in production. How would you investigate the problem?",
            focus: "Problem Solving",
        },
        {
            id: 5,
            type: "behavioral",
            question:
                "Tell me about a technical problem you faced and how you solved it.",
            focus: "Behavioral",
        },
    ],

    "data-analyst": [
        {
            id: 1,
            type: "intro",
            question:
                "Tell me about yourself and why you are interested in becoming a Data Analyst.",
            focus: "Introduction & Communication",
        },
        {
            id: 2,
            type: "technical",
            question:
                "What is the difference between WHERE and HAVING in SQL?",
            focus: "SQL",
        },
        {
            id: 3,
            type: "technical",
            question:
                "How would you handle missing values in a dataset?",
            focus: "Data Cleaning",
        },
        {
            id: 4,
            type: "problem-solving",
            question:
                "Imagine that sales suddenly dropped by 20 percent this month. How would you investigate the reason?",
            focus: "Analytical Thinking",
        },
        {
            id: 5,
            type: "behavioral",
            question:
                "Tell me about a project where you used data to make a decision.",
            focus: "Behavioral",
        },
    ],

    cybersecurity: [
        {
            id: 1,
            type: "intro",
            question:
                "Tell me about yourself and why you are interested in cybersecurity.",
            focus: "Introduction & Communication",
        },
        {
            id: 2,
            type: "technical",
            question:
                "What is the difference between authentication and authorization?",
            focus: "Security Fundamentals",
        },
        {
            id: 3,
            type: "technical",
            question:
                "What is SQL injection and how can it be prevented?",
            focus: "Application Security",
        },
        {
            id: 4,
            type: "problem-solving",
            question:
                "You notice unusual login activity on a company's system. What would you do first?",
            focus: "Incident Response",
        },
        {
            id: 5,
            type: "behavioral",
            question:
                "Tell me about a time when you had to investigate a difficult technical issue.",
            focus: "Behavioral",
        },
    ],

    "cloud-devops": [
        {
            id: 1,
            type: "intro",
            question:
                "Tell me about yourself and your interest in Cloud and DevOps.",
            focus: "Introduction & Communication",
        },
        {
            id: 2,
            type: "technical",
            question:
                "What is the difference between Docker containers and virtual machines?",
            focus: "Cloud Fundamentals",
        },
        {
            id: 3,
            type: "technical",
            question:
                "What is CI/CD and why is it important?",
            focus: "DevOps",
        },
        {
            id: 4,
            type: "problem-solving",
            question:
                "A deployment works locally but fails in production. How would you debug it?",
            focus: "Troubleshooting",
        },
        {
            id: 5,
            type: "behavioral",
            question:
                "Tell me about a time you worked with a team to solve a technical problem.",
            focus: "Behavioral",
        },
    ],

    "ui-ux": [
        {
            id: 1,
            type: "intro",
            question:
                "Tell me about yourself and what interests you about UI/UX design.",
            focus: "Introduction & Communication",
        },
        {
            id: 2,
            type: "technical",
            question:
                "What is the difference between UX design and UI design?",
            focus: "Design Fundamentals",
        },
        {
            id: 3,
            type: "technical",
            question:
                "How would you approach designing a new mobile application?",
            focus: "Design Process",
        },
        {
            id: 4,
            type: "problem-solving",
            question:
                "Users are abandoning an important screen in your application. How would you investigate the problem?",
            focus: "User Research",
        },
        {
            id: 5,
            type: "behavioral",
            question:
                "Tell me about a design decision you made that received criticism. How did you respond?",
            focus: "Communication",
        },
    ],
};

/* =========================================================
   ROLE NAMES
========================================================= */

const ROLE_NAMES = {
    "software-developer": "Software Developer",
    "data-analyst": "Data Analyst",
    cybersecurity: "Cybersecurity",
    "cloud-devops": "Cloud / DevOps",
    "ui-ux": "UI/UX Designer",
};

/* =========================================================
   AI INTERVIEWER PROFILE
========================================================= */

const AI_INTERVIEWER = {
    firstName: "Alex",
    // fullName: "Alex Morgan",
    role: "AI Interviewer",
};

/* =========================================================
   TEXT TO SPEECH
========================================================= */

const speakText = (text, setIsSpeaking) => {
    if (!window.speechSynthesis) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
        voices.find((voice) =>
            voice.lang?.toLowerCase().includes("en-in")
        ) ||
        voices.find((voice) =>
            voice.lang?.toLowerCase().includes("en-us")
        ) ||
        voices.find((voice) =>
            voice.lang?.toLowerCase().includes("en-gb")
        );

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
        if (setIsSpeaking) {
            setIsSpeaking(true);
        }
    };

    utterance.onend = () => {
        if (setIsSpeaking) {
            setIsSpeaking(false);
        }
    };

    utterance.onerror = () => {
        if (setIsSpeaking) {
            setIsSpeaking(false);
        }
    };

    window.speechSynthesis.speak(utterance);
};

/* =========================================================
   STOP AI
========================================================= */

const stopAI = (setIsSpeaking) => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    if (setIsSpeaking) {
        setIsSpeaking(false);
    }
};

/* =========================================================
   LOCAL INTERVIEW EVALUATION
========================================================= */

const evaluateAnswer = (answer, question) => {
    const text = answer.trim();

    const words = text.length > 0 ? text.split(/\s+/) : [];

    const wordCount = words.length;

    /* -------------------------
       COMMUNICATION SCORE
    ------------------------- */

    let communication = 30;

    if (wordCount >= 20) {
        communication += 15;
    }

    if (wordCount >= 50) {
        communication += 15;
    }

    if (wordCount >= 90) {
        communication += 10;
    }

    if (
        /because|therefore|however|for example|first|then|finally/i.test(
            text
        )
    ) {
        communication += 10;
    }

    communication = Math.min(communication, 100);

    /* -------------------------
       COMPLETENESS SCORE
    ------------------------- */

    let completeness = 25;

    if (wordCount >= 30) {
        completeness += 20;
    }

    if (wordCount >= 60) {
        completeness += 20;
    }

    if (wordCount >= 100) {
        completeness += 20;
    }

    completeness = Math.min(completeness, 100);

    /* -------------------------
       STRUCTURE SCORE
    ------------------------- */

    let structure = 40;

    if (
        /first|second|then|finally|because|for example|in my experience|overall/i.test(
            text
        )
    ) {
        structure += 25;
    }

    if (wordCount >= 60) {
        structure += 20;
    }

    structure = Math.min(structure, 100);

    /* -------------------------
       TECHNICAL / RELEVANCE
    ------------------------- */

    let relevance = 45;

    const questionWords = question.question
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 5);

    const answerLower = text.toLowerCase();

    const matchingWords = questionWords.filter((word) =>
        answerLower.includes(
            word.replace(/[^a-z]/gi, "")
        )
    );

    if (matchingWords.length >= 1) {
        relevance += 10;
    }

    if (matchingWords.length >= 2) {
        relevance += 15;
    }

    if (matchingWords.length >= 3) {
        relevance += 20;
    }

    relevance = Math.min(relevance, 100);

    /* -------------------------
       OVERALL
    ------------------------- */

    const overall = Math.round(
        communication * 0.25 +
            completeness * 0.25 +
            structure * 0.2 +
            relevance * 0.3
    );

    let feedback =
        "Good attempt. Try to provide a more structured and detailed response.";

    if (overall >= 85) {
        feedback =
            "Excellent response. Your answer was clear, structured and relevant.";
    } else if (overall >= 70) {
        feedback =
            "Good response. Add a little more detail and structure to make it stronger.";
    } else if (overall >= 55) {
        feedback =
            "Decent response. Try explaining your reasoning with a concrete example.";
    }

    return {
        overall,
        communication,
        completeness,
        structure,
        relevance,
        feedback,
    };
};

/* =========================================================
   COMPONENT
========================================================= */

const MockInterview = () => {
    const navigate = useNavigate();

    /* =====================================================
       STATE
    ===================================================== */

    const [selectedRole, setSelectedRole] = useState(
        localStorage.getItem("selectedRole") ||
            "data-analyst"
    );

    const [interviewStarted, setInterviewStarted] =
        useState(false);

    const [currentQuestion, setCurrentQuestion] =
        useState(0);

    const [transcript, setTranscript] = useState("");

    const [isListening, setIsListening] =
        useState(false);

    const [isSpeaking, setIsSpeaking] =
        useState(false);

    const [isThinking, setIsThinking] =
        useState(false);

    const [answerSubmitted, setAnswerSubmitted] =
        useState(false);

    const [answers, setAnswers] = useState([]);

    const [interviewFinished, setInterviewFinished] =
        useState(false);

    const [currentEvaluation, setCurrentEvaluation] =
        useState(null);

    const [elapsedTime, setElapsedTime] =
        useState(0);

    const recognitionRef = useRef(null);

    const finalTranscriptRef = useRef("");

    /* =====================================================
       QUESTIONS
    ===================================================== */

    const questions =
        INTERVIEW_QUESTIONS[selectedRole] ||
        INTERVIEW_QUESTIONS["data-analyst"];

    const question = questions[currentQuestion];

    /* =====================================================
       PROGRESS
    ===================================================== */

    const progress =
        (currentQuestion / questions.length) * 100;

    /* =====================================================
       SPEECH RECOGNITION
    ===================================================== */

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN";

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error(
                "Speech recognition error:",
                event.error
            );

            setIsListening(false);
        };

        recognition.onresult = (event) => {
            let finalText = "";
            let interimText = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                const result = event.results[i];

                const text = result[0].transcript;

                if (result.isFinal) {
                    finalText += text + " ";
                } else {
                    interimText += text;
                }
            }

            if (finalText.trim()) {
                finalTranscriptRef.current =
                    `${finalTranscriptRef.current} ${finalText}`.trim();
            }

            setTranscript(
                `${finalTranscriptRef.current} ${interimText}`.trim()
            );
        };

        recognitionRef.current = recognition;

        return () => {
            try {
                recognition.stop();
            } catch (error) {
                console.log(
                    "Recognition cleanup"
                );
            }

            stopAI(setIsSpeaking);
        };
    }, []);

    /* =====================================================
       LOAD SPEECH VOICES
    ===================================================== */

    useEffect(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.getVoices();
        }
    }, []);

    /* =====================================================
       INTERVIEW TIMER
    ===================================================== */

    useEffect(() => {
        if (
            !interviewStarted ||
            interviewFinished
        ) {
            return;
        }

        const interval = setInterval(() => {
            setElapsedTime(
                (previous) => previous + 1
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [
        interviewStarted,
        interviewFinished,
    ]);

    /* =====================================================
       SPEAK CURRENT QUESTION
    ===================================================== */

    useEffect(() => {
        if (
            interviewStarted &&
            !interviewFinished &&
            question?.question
        ) {
            const timer = setTimeout(() => {
                speakText(
                    question.question,
                    setIsSpeaking
                );
            }, 700);

            return () => {
                clearTimeout(timer);

                stopAI(setIsSpeaking);
            };
        }
    }, [
        interviewStarted,
        interviewFinished,
        currentQuestion,
    ]);

    /* =====================================================
       FORMAT TIME
    ===================================================== */

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);

        const remaining = seconds % 60;

        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(remaining).padStart(
            2,
            "0"
        )}`;
    };

    /* =====================================================
       START INTERVIEW
    ===================================================== */

    const startInterview = () => {
        stopAI(setIsSpeaking);

        setInterviewStarted(true);

        setCurrentQuestion(0);

        setTranscript("");

        finalTranscriptRef.current = "";

        setAnswers([]);

        setInterviewFinished(false);

        setAnswerSubmitted(false);

        setCurrentEvaluation(null);

        setElapsedTime(0);
    };

    /* =====================================================
       START LISTENING
    ===================================================== */

    const startListening = () => {
        if (!recognitionRef.current) {
            alert(
                "Speech recognition is not supported in this browser. Please use Google Chrome."
            );

            return;
        }

        stopAI(setIsSpeaking);

        finalTranscriptRef.current = "";

        setTranscript("");

        try {
            recognitionRef.current.start();
        } catch (error) {
            console.log(
                "Recognition already running."
            );
        }
    };

    /* =====================================================
       STOP LISTENING
    ===================================================== */

    const stopListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.log(
                    "Recognition already stopped."
                );
            }
        }

        setIsListening(false);
    };

    /* =====================================================
       SUBMIT ANSWER
    ===================================================== */

    const submitAnswer = () => {
        stopListening();

        stopAI(setIsSpeaking);

        const cleanAnswer =
            finalTranscriptRef.current ||
            transcript;

        if (!cleanAnswer.trim()) {
            return;
        }

        setIsThinking(true);

        const evaluation = evaluateAnswer(
            cleanAnswer,
            question
        );

        const newAnswer = {
            question: question.question,
            answer: cleanAnswer.trim(),
            focus: question.focus,
            type: question.type,
            evaluation,
        };

        setAnswers((previous) => [
            ...previous,
            newAnswer,
        ]);

        setTimeout(() => {
            setCurrentEvaluation(evaluation);

            setIsThinking(false);

            setAnswerSubmitted(true);
        }, 1000);
    };

    /* =====================================================
       NEXT QUESTION
    ===================================================== */

    const nextQuestion = () => {
        stopAI(setIsSpeaking);

        if (
            currentQuestion >=
            questions.length - 1
        ) {
            setInterviewFinished(true);

            return;
        }

        setCurrentQuestion(
            (previous) => previous + 1
        );

        setTranscript("");

        finalTranscriptRef.current = "";

        setAnswerSubmitted(false);

        setIsThinking(false);

        setCurrentEvaluation(null);
    };

    /* =====================================================
       EXIT INTERVIEW
    ===================================================== */

    const exitInterview = () => {
        stopListening();

        stopAI(setIsSpeaking);

        navigate("/dashboard");
    };

    /* =====================================================
       START SCREEN
    ===================================================== */

    if (!interviewStarted) {
        return (
            <div className="mock-interview-page">

                <div className="interview-hero">

                    <button
                        className="interview-back"
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        ← Dashboard
                    </button>

                    <div className="interview-hero-content">

                        <div className="interview-badge">
                            AI MOCK INTERVIEW
                        </div>

                        <h1>
                            Practice like it's
                            a real interview.
                        </h1>

                        <p>
                            Meet your CareerBridge
                            AI interviewer. Listen
                            to questions, answer
                            naturally using your
                            voice, and receive
                            instant performance
                            feedback.
                        </p>

                    </div>

                </div>

                <main className="interview-start-card">

                    <div className="start-card-icon">
                        🎙️
                    </div>

                    <p className="interview-label">
                        SELECT YOUR TARGET ROLE
                    </p>

                    <h2>
                        AI Mock Interview
                    </h2>

                    <p className="start-description">
                        Your AI interviewer will
                        conduct a role-specific
                        interview and evaluate
                        your communication,
                        completeness, structure
                        and relevance.
                    </p>

                    <div className="role-selector">

                        {Object.entries(
                            ROLE_NAMES
                        ).map(
                            ([
                                value,
                                label,
                            ]) => (
                                <button
                                    key={value}
                                    className={
                                        selectedRole ===
                                        value
                                            ? "role-option selected"
                                            : "role-option"
                                    }
                                    onClick={() =>
                                        setSelectedRole(
                                            value
                                        )
                                    }
                                >
                                    {label}
                                </button>
                            )
                        )}

                    </div>

                    <div className="interview-features">

                        <div>
                            <span>
                                🔊
                            </span>

                            <strong>
                                AI Speaking
                            </strong>

                            <p>
                                Hear each
                                interview
                                question
                                naturally.
                            </p>
                        </div>

                        <div>
                            <span>
                                🎙
                            </span>

                            <strong>
                                Voice Answers
                            </strong>

                            <p>
                                Answer using
                                your
                                microphone.
                            </p>
                        </div>

                        <div>
                            <span>
                                📊
                            </span>

                            <strong>
                                AI Feedback
                            </strong>

                            <p>
                                Get a score
                                after every
                                answer.
                            </p>
                        </div>

                    </div>

                    <button
                        className="start-interview-button"
                        onClick={
                            startInterview
                        }
                    >
                        Start AI Interview →
                    </button>

                    <span className="interview-note">
                        Use Google Chrome and allow
                        microphone access for the
                        best experience.
                    </span>

                </main>

            </div>
        );
    }

    /* =====================================================
       FINAL REPORT
    ===================================================== */

    if (interviewFinished) {
        const overallScore =
            answers.length
                ? Math.round(
                      answers.reduce(
                          (
                              total,
                              answer
                          ) =>
                              total +
                              answer
                                  .evaluation
                                  .overall,
                          0
                      ) /
                          answers.length
                  )
                : 0;

        const communicationScore =
            answers.length
                ? Math.round(
                      answers.reduce(
                          (
                              total,
                              answer
                          ) =>
                              total +
                              answer
                                  .evaluation
                                  .communication,
                          0
                      ) /
                          answers.length
                  )
                : 0;

        const relevanceScore =
            answers.length
                ? Math.round(
                      answers.reduce(
                          (
                              total,
                              answer
                          ) =>
                              total +
                              answer
                                  .evaluation
                                  .relevance,
                          0
                      ) /
                          answers.length
                  )
                : 0;

        return (
            <div className="mock-interview-page">

                <main className="interview-complete">

                    <div className="complete-icon">
                        ✓
                    </div>

                    <p className="interview-label">
                        INTERVIEW COMPLETE
                    </p>

                    <h1>
                        Your interview
                        performance report
                    </h1>

                    <p>
                        You completed a
                        simulated interview
                        for the{" "}
                        <strong>
                            {
                                ROLE_NAMES[
                                    selectedRole
                                ]
                            }
                        </strong>{" "}
                        role.
                    </p>

                    <div className="final-score">

                        <strong>
                            {
                                overallScore
                            }
                        </strong>

                        <span>
                            Overall Score
                        </span>

                    </div>

                    <div className="complete-stats">

                        <div>
                            <strong>
                                {
                                    answers.length
                                }
                            </strong>

                            <span>
                                Questions
                            </span>
                        </div>

                        <div>
                            <strong>
                                {
                                    communicationScore
                                }
                            </strong>

                            <span>
                                Communication
                            </span>
                        </div>

                        <div>
                            <strong>
                                {
                                    relevanceScore
                                }
                            </strong>

                            <span>
                                Relevance
                            </span>
                        </div>

                        <div>
                            <strong>
                                {
                                    formatTime(
                                        elapsedTime
                                    )
                                }
                            </strong>

                            <span>
                                Interview Time
                            </span>
                        </div>

                    </div>

                    <div className="final-feedback">

                        <h3>
                            AI Interview Summary
                        </h3>

                        <p>
                            {overallScore >= 85
                                ? "Excellent performance. You demonstrated strong communication and relevant responses."
                                : overallScore >= 70
                                ? "Good performance. Your answers were generally relevant. Continue improving structure and depth."
                                : overallScore >= 55
                                ? "You are making progress. Focus on giving more detailed, structured and confident answers."
                                : "Keep practicing. Try giving longer, more structured answers and support your responses with examples."}
                        </p>

                    </div>

                    <div className="complete-actions">

                        <button
                            className="secondary-interview-button"
                            onClick={() =>
                                setInterviewStarted(
                                    false
                                )
                            }
                        >
                            Practice Again
                        </button>

                        <button
                            className="primary-interview-button"
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                        >
                            Back to Dashboard →
                        </button>

                    </div>

                </main>

            </div>
        );
    }

    /* =====================================================
       INTERVIEW SCREEN
    ===================================================== */

    return (
        <div className="mock-interview-page">

            <header className="interview-topbar">

                <div className="interview-brand">

                    <div>
                        C
                    </div>

                    <span>
                        CareerBridge
                    </span>

                </div>

                <div className="interview-role">

                    {ROLE_NAMES[selectedRole]}{" "}
                    AI Interview

                </div>

                <div className="interview-header-right">

                    <div className="interview-timer">
                        ⏱{" "}
                        {formatTime(
                            elapsedTime
                        )}
                    </div>

                    <button
                        className="exit-interview"
                        onClick={
                            exitInterview
                        }
                    >
                        Exit
                    </button>

                </div>

            </header>

            <main className="interview-workspace">

                {/* =========================================
                    PROGRESS
                ========================================= */}

                <div className="interview-progress-area">

                    <div className="progress-header">

                        <span>
                            Question{" "}
                            {currentQuestion + 1}{" "}
                            of{" "}
                            {questions.length}
                        </span>

                        <span>
                            {Math.round(
                                progress
                            )}
                            %
                        </span>

                    </div>

                    <div className="interview-progress">

                        <div
                            style={{
                                width: `${progress}%`,
                            }}
                        />

                    </div>

                </div>

                {/* =========================================
                    QUESTION
                ========================================= */}

                <section className="question-card">

                    <div className="question-meta">

                        <span>
                            {question.type.toUpperCase()}
                        </span>

                        <span>
                            {question.focus}
                        </span>

                    </div>

                    {/* =====================================
                        AI INTERVIEWER PROFILE
                    ===================================== */}

                    <div className="interviewer-profile-row">

                        <div
                            className={
                                isSpeaking
                                    ? "ai-profile speaking"
                                    : "ai-profile"
                            }
                        >

                            <div className="ai-profile-face">

                                <div className="ai-face-hair" />

                                <div className="ai-face">

                                    <span className="ai-eye left" />

                                    <span className="ai-eye right" />

                                    <span className="ai-nose" />

                                    <span
                                        className={
                                            isSpeaking
                                                ? "ai-mouth speaking-mouth"
                                                : "ai-mouth"
                                        }
                                    />

                                </div>

                            </div>

                            <span className="ai-online-dot" />

                        </div>

                        <div className="interviewer-info">

                            <p className="ai-label">
                                CAREERBRIDGE AI INTERVIEWER
                            </p>

                            <div className="ai-interviewer-name">
                                {AI_INTERVIEWER.fullName}
                            </div>

                            <div className="ai-speaking-status">

                                <span
                                    className={
                                        isSpeaking
                                            ? "voice-indicator active"
                                            : "voice-indicator"
                                    }
                                >
                                    ●
                                </span>

                                {isSpeaking
                                    ? "Speaking..."
                                    : isListening
                                    ? "Listening to you..."
                                    : isThinking
                                    ? "Evaluating your response..."
                                    : "Your AI interviewer is ready"}

                            </div>

                        </div>

                    </div>

                    <h1>
                        {question.question}
                    </h1>

                    <p className="question-hint">
                        Take a moment to think,
                        then answer naturally.
                        Speak as if you were
                        sitting in a real
                        interview.
                    </p>

                    <button
                        className="repeat-question-button"
                        onClick={() =>
                            speakText(
                                question.question,
                                setIsSpeaking
                            )
                        }
                    >
                        🔊 Repeat Question
                    </button>

                </section>

                {/* =========================================
                    ANSWER AREA
                ========================================= */}

                <section className="answer-area">

                    <div className="answer-header">

                        <div>

                            <p>
                                YOUR ANSWER
                            </p>

                            <span>
                                Speak clearly and
                                explain your
                                reasoning.
                            </span>

                        </div>

                        {isListening && (
                            <div className="listening-status">

                                <span className="pulse-dot" />

                                Listening...

                            </div>
                        )}

                    </div>

                    {/* LIVE TRANSCRIPT */}

                    <div
                        className={
                            isListening
                                ? "answer-box listening"
                                : "answer-box"
                        }
                    >

                        {transcript ? (
                            <div>

                                <div className="live-transcript-label">
                                    LIVE TRANSCRIPT
                                </div>

                                <p>
                                    {transcript}
                                </p>

                            </div>
                        ) : (
                            <div className="answer-placeholder">

                                <div className="microphone-large">
                                    🎙️
                                </div>

                                <strong>
                                    Your spoken
                                    answer will
                                    appear here
                                </strong>

                                <span>
                                    Click Start
                                    Speaking and
                                    answer the
                                    question
                                    naturally.
                                </span>

                            </div>
                        )}

                    </div>

                    {/* CONTROLS */}

                    <div className="answer-controls">

                        <button
                            className={
                                isListening
                                    ? "mic-button recording"
                                    : "mic-button"
                            }
                            onClick={
                                isListening
                                    ? stopListening
                                    : startListening
                            }
                            disabled={
                                isThinking ||
                                answerSubmitted
                            }
                        >

                            <span>
                                {isListening
                                    ? "■"
                                    : "🎙"}
                            </span>

                            {isListening
                                ? "Stop Recording"
                                : "Start Speaking"}

                        </button>

                        <button
                            className="submit-answer-button"
                            disabled={
                                !transcript.trim() ||
                                isThinking ||
                                answerSubmitted
                            }
                            onClick={
                                submitAnswer
                            }
                        >

                            {isThinking
                                ? "AI is evaluating..."
                                : answerSubmitted
                                ? "Answer Evaluated ✓"
                                : "Submit Answer →"}

                        </button>

                    </div>

                </section>

                {/* =========================================
                    FEEDBACK
                ========================================= */}

                {answerSubmitted &&
                    currentEvaluation && (
                        <section className="answer-feedback">

                            <div className="feedback-icon">
                                ✓
                            </div>

                            <div className="feedback-content">

                                <strong>
                                    AI Feedback
                                </strong>

                                <p>
                                    {
                                        currentEvaluation.feedback
                                    }
                                </p>

                                <div className="feedback-scores">

                                    <span>
                                        Overall{" "}
                                        <strong>
                                            {
                                                currentEvaluation.overall
                                            }
                                        </strong>
                                    </span>

                                    <span>
                                        Communication{" "}
                                        <strong>
                                            {
                                                currentEvaluation.communication
                                            }
                                        </strong>
                                    </span>

                                    <span>
                                        Relevance{" "}
                                        <strong>
                                            {
                                                currentEvaluation.relevance
                                            }
                                        </strong>
                                    </span>

                                </div>

                            </div>

                            <button
                                onClick={
                                    nextQuestion
                                }
                            >
                                {currentQuestion ===
                                questions.length - 1
                                    ? "Finish Interview"
                                    : "Next Question →"}
                            </button>

                        </section>
                    )}

            </main>

        </div>
    );
};

export default MockInterview;