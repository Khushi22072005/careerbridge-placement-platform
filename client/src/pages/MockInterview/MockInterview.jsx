import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./MockInterview.css";


/* =========================================================
   ROLE NAMES
========================================================= */

const ROLE_NAMES = {
    "software-developer":
        "Software Developer",

    "data-analyst":
        "Data Analyst",

    cybersecurity:
        "Cybersecurity",

    "cloud-devops":
        "Cloud / DevOps",

    "ui-ux":
        "UI/UX Designer",
};


/* =========================================================
   INITIAL QUESTIONS
========================================================= */

const INITIAL_QUESTIONS = {
    "software-developer": {
        question:
            "Tell me about yourself and your background in software development.",

        type: "intro",

        focus:
            "Introduction & Communication",

        difficulty:
            "easy",
    },

    "data-analyst": {
        question:
            "Tell me about yourself and why you are interested in becoming a Data Analyst.",

        type: "intro",

        focus:
            "Introduction & Communication",

        difficulty:
            "easy",
    },

    cybersecurity: {
        question:
            "Tell me about yourself and why you are interested in cybersecurity.",

        type: "intro",

        focus:
            "Introduction & Communication",

        difficulty:
            "easy",
    },

    "cloud-devops": {
        question:
            "Tell me about yourself and your interest in Cloud and DevOps.",

        type: "intro",

        focus:
            "Introduction & Communication",

        difficulty:
            "easy",
    },

    "ui-ux": {
        question:
            "Tell me about yourself and what interests you about UI/UX design.",

        type: "intro",

        focus:
            "Introduction & Communication",

        difficulty:
            "easy",
    },
};


/* =========================================================
   AI INTERVIEWER
========================================================= */

const AI_INTERVIEWER = {
    fullName: "Alex",
    role: "AI Interviewer",
};


/* =========================================================
   API BASE URL
========================================================= */

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


/* =========================================================
   SPEAK TEXT
========================================================= */

const speakText = (
    text,
    setIsSpeaking
) => {
    if (
        !(
            "speechSynthesis" in
            window
        )
    ) {
        return;
    }

    try {
        window.speechSynthesis.cancel();

        const utterance =
            new window.SpeechSynthesisUtterance(
                text
            );

        utterance.lang =
            "en-IN";

        utterance.rate =
            0.9;

        utterance.pitch =
            1;

        const voices =
            window.speechSynthesis.getVoices();

        const preferredVoice =
            voices.find(
                (voice) =>
                    voice.lang
                        ?.toLowerCase()
                        .startsWith(
                            "en-in"
                        )
            ) ||
            voices.find(
                (voice) =>
                    voice.lang
                        ?.toLowerCase()
                        .startsWith(
                            "en-us"
                        )
            ) ||
            voices.find(
                (voice) =>
                    voice.lang
                        ?.toLowerCase()
                        .startsWith(
                            "en-gb"
                        )
            );

        if (preferredVoice) {
            utterance.voice =
                preferredVoice;
        }

        utterance.onstart = () => {
            setIsSpeaking?.(
                true
            );
        };

        utterance.onend = () => {
            setIsSpeaking?.(
                false
            );
        };

        utterance.onerror = () => {
            setIsSpeaking?.(
                false
            );
        };

        window.speechSynthesis.speak(
            utterance
        );
    } catch (error) {
        console.error(
            "Speech synthesis error:",
            error
        );

        setIsSpeaking?.(
            false
        );
    }
};


/* =========================================================
   STOP AI
========================================================= */

const stopAI = (
    setIsSpeaking
) => {
    if (
        "speechSynthesis" in
        window
    ) {
        window.speechSynthesis.cancel();
    }

    setIsSpeaking?.(
        false
    );
};


/* =========================================================
   COMPONENT
========================================================= */

const MockInterview = () => {
    const navigate =
        useNavigate();


    /* =====================================================
       STATE
    ===================================================== */

    const [
        selectedRole,
        setSelectedRole,
    ] = useState(
        localStorage.getItem(
            "selectedRole"
        ) ||
            "data-analyst"
    );


    const [
        interviewStarted,
        setInterviewStarted,
    ] = useState(false);


    const [
        currentQuestion,
        setCurrentQuestion,
    ] = useState(
        INITIAL_QUESTIONS[
            localStorage.getItem(
                "selectedRole"
            ) ||
                "data-analyst"
        ] ||
            INITIAL_QUESTIONS[
                "data-analyst"
            ]
    );


    const [
        questionNumber,
        setQuestionNumber,
    ] = useState(1);


    const [
        transcript,
        setTranscript,
    ] = useState("");


    const [
        isListening,
        setIsListening,
    ] = useState(false);


    const [
        isSpeaking,
        setIsSpeaking,
    ] = useState(false);


    const [
        isThinking,
        setIsThinking,
    ] = useState(false);


    const [
        answerSubmitted,
        setAnswerSubmitted,
    ] = useState(false);


    const [
        answers,
        setAnswers,
    ] = useState([]);


    const [
        interviewFinished,
        setInterviewFinished,
    ] = useState(false);


    const [
        currentEvaluation,
        setCurrentEvaluation,
    ] = useState(null);


    const [
        elapsedTime,
        setElapsedTime,
    ] = useState(0);


    const [
        speechError,
        setSpeechError,
    ] = useState("");


    const [
        speechSupported,
        setSpeechSupported,
    ] = useState(true);


    /* =====================================================
       REFS
    ===================================================== */

    const recognitionRef =
        useRef(null);

    const recognitionRunningRef =
        useRef(false);

    const finalTranscriptRef =
        useRef("");

    const isMountedRef =
        useRef(true);


    /* =====================================================
       CLEANUP
    ===================================================== */

    useEffect(() => {
        isMountedRef.current =
            true;

        return () => {
            isMountedRef.current =
                false;

            try {
                recognitionRef.current?.abort();
            } catch (error) {}

            stopAI(
                setIsSpeaking
            );
        };
    }, []);


    /* =====================================================
       SPEECH RECOGNITION SUPPORT
    ===================================================== */

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSpeechSupported(
                false
            );

            setSpeechError(
                "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
            );
        }
    }, []);


    /* =====================================================
       TIMER
    ===================================================== */

    useEffect(() => {
        if (
            !interviewStarted ||
            interviewFinished
        ) {
            return;
        }

        const interval =
            setInterval(() => {
                setElapsedTime(
                    (previous) =>
                        previous + 1
                );
            }, 1000);

        return () =>
            clearInterval(
                interval
            );
    }, [
        interviewStarted,
        interviewFinished,
    ]);


    /* =====================================================
       SPEAK CURRENT QUESTION
    ===================================================== */

    useEffect(() => {
        if (
            !interviewStarted ||
            interviewFinished ||
            !currentQuestion?.question
        ) {
            return;
        }

        const timer =
            setTimeout(() => {
                speakText(
                    currentQuestion.question,
                    setIsSpeaking
                );
            }, 600);

        return () => {
            clearTimeout(
                timer
            );

            stopAI(
                setIsSpeaking
            );
        };
    }, [
        interviewStarted,
        interviewFinished,
        currentQuestion,
    ]);


    /* =====================================================
       FORMAT TIME
    ===================================================== */

    const formatTime = (
        seconds
    ) => {
        const minutes =
            Math.floor(
                seconds / 60
            );

        const remaining =
            seconds % 60;

        return `${String(
            minutes
        ).padStart(
            2,
            "0"
        )}:${String(
            remaining
        ).padStart(
            2,
            "0"
        )}`;
    };


    /* =====================================================
       START INTERVIEW
    ===================================================== */

    const startInterview =
        () => {
            const firstQuestion =
                INITIAL_QUESTIONS[
                    selectedRole
                ] ||
                INITIAL_QUESTIONS[
                    "data-analyst"
                ];

            stopAI(
                setIsSpeaking
            );

            setInterviewStarted(
                true
            );

            setCurrentQuestion(
                firstQuestion
            );

            setQuestionNumber(
                1
            );

            setTranscript(
                ""
            );

            finalTranscriptRef.current =
                "";

            setAnswers([]);

            setInterviewFinished(
                false
            );

            setAnswerSubmitted(
                false
            );

            setCurrentEvaluation(
                null
            );

            setElapsedTime(
                0
            );

            setSpeechError("");
        };


    /* =====================================================
       START LISTENING
    ===================================================== */

    const startListening =
        () => {
            setSpeechError("");

            const SpeechRecognition =
                window.SpeechRecognition ||
                window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                setSpeechSupported(
                    false
                );

                setSpeechError(
                    "Speech recognition is not available in this browser. Please use Google Chrome or Microsoft Edge."
                );

                return;
            }

            if (
                recognitionRunningRef.current
            ) {
                return;
            }

            stopAI(
                setIsSpeaking
            );

            finalTranscriptRef.current =
                transcript || "";

            const recognition =
                new SpeechRecognition();

            recognition.continuous =
                true;

            recognition.interimResults =
                true;

            recognition.lang =
                "en-IN";

            recognition.maxAlternatives =
                1;


            recognition.onstart =
                () => {
                    recognitionRunningRef.current =
                        true;

                    setIsListening(
                        true
                    );

                    setSpeechError(
                        ""
                    );

                    console.log(
                        "Microphone listening started."
                    );
                };


            recognition.onresult =
                (event) => {
                    let finalText =
                        finalTranscriptRef.current;

                    let interimText =
                        "";

                    for (
                        let i =
                            event.resultIndex;
                        i <
                        event.results.length;
                        i++
                    ) {
                        const result =
                            event
                                .results[
                                i
                            ];

                        const text =
                            result[
                                0
                            ]
                                ?.transcript ||
                            "";

                        if (
                            result.isFinal
                        ) {
                            finalText =
                                `${finalText} ${text}`.trim();

                            finalTranscriptRef.current =
                                finalText;
                        } else {
                            interimText +=
                                text;
                        }
                    }

                    const combined =
                        `${finalText} ${interimText}`.trim();

                    if (
                        isMountedRef.current
                    ) {
                        setTranscript(
                            combined
                        );
                    }
                };


            recognition.onerror =
                (event) => {
                    console.error(
                        "Speech recognition error:",
                        event.error
                    );

                    recognitionRunningRef.current =
                        false;

                    setIsListening(
                        false
                    );

                    if (
                        event.error ===
                            "not-allowed" ||
                        event.error ===
                            "permission-denied"
                    ) {
                        setSpeechError(
                            "Microphone permission was denied. Allow microphone access for this site."
                        );
                    } else if (
                        event.error ===
                        "audio-capture"
                    ) {
                        setSpeechError(
                            "Microphone could not be accessed. Check your microphone."
                        );
                    } else if (
                        event.error ===
                        "network"
                    ) {
                        setSpeechError(
                            "Speech recognition could not connect to the browser speech service. Check your internet connection and try again."
                        );
                    } else if (
                        event.error ===
                        "no-speech"
                    ) {
                        setSpeechError(
                            "No speech was detected. Please speak clearly and try again."
                        );
                    } else if (
                        event.error !==
                        "aborted"
                    ) {
                        setSpeechError(
                            `Speech recognition error: ${event.error}`
                        );
                    }
                };


            recognition.onend =
                () => {
                    recognitionRunningRef.current =
                        false;

                    setIsListening(
                        false
                    );

                    console.log(
                        "Microphone listening ended."
                    );
                };


            recognitionRef.current =
                recognition;

            try {
                recognition.start();
            } catch (error) {
                console.error(
                    "Could not start recognition:",
                    error
                );

                recognitionRunningRef.current =
                    false;

                setIsListening(
                    false
                );

                setSpeechError(
                    "Could not start speech recognition. Please try again."
                );
            }
        };


    /* =====================================================
       STOP LISTENING
    ===================================================== */

    const stopListening =
        () => {
            try {
                recognitionRef.current?.stop();
            } catch (error) {}

            recognitionRunningRef.current =
                false;

            setIsListening(
                false
            );
        };


    /* =====================================================
       EVALUATE ANSWER WITH AI
    ===================================================== */

    const submitAnswer =
        async () => {
            stopListening();

            stopAI(
                setIsSpeaking
            );

            const cleanAnswer =
                transcript.trim();

            if (!cleanAnswer) {
                setSpeechError(
                    "Please speak or type an answer before submitting."
                );

                return;
            }

            setSpeechError("");

            setIsThinking(
                true
            );

            try {
                const response =
                    await fetch(
                        `${API_BASE_URL}/api/mock-interview/evaluate`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify(
                                {
                                    role:
                                        selectedRole,

                                    question:
                                        currentQuestion.question,

                                    questionType:
                                        currentQuestion.type,

                                    answer:
                                        cleanAnswer,

                                    previousAnswers:
                                        answers,
                                }
                            ),
                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok
                ) {
                    throw new Error(
                        data.message ||
                            "AI evaluation failed."
                    );
                }

                const newAnswer =
                    {
                        question:
                            currentQuestion.question,

                        answer:
                            cleanAnswer,

                        type:
                            currentQuestion.type,

                        focus:
                            currentQuestion.focus,

                        evaluation:
                            data,
                    };

                setAnswers(
                    (previous) => [
                        ...previous,
                        newAnswer,
                    ]
                );

                setCurrentEvaluation(
                    data
                );

                setAnswerSubmitted(
                    true
                );
            } catch (error) {
                console.error(
                    "AI evaluation error:",
                    error
                );

                setSpeechError(
                    `AI evaluation failed: ${error.message}`
                );
            } finally {
                setIsThinking(
                    false
                );
            }
        };


    /* =====================================================
       NEXT QUESTION
    ===================================================== */

    const nextQuestion =
        async () => {
            stopListening();

            stopAI(
                setIsSpeaking
            );

            if (
                !currentEvaluation
            ) {
                return;
            }

            setIsThinking(
                true
            );

            try {
                const latestAnswer =
                    {
                        question:
                            currentQuestion.question,

                        answer:
                            transcript.trim(),
                    };

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/mock-interview/next-question`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify(
                                {
                                    role:
                                        selectedRole,

                                    previousAnswers:
                                        [
                                            ...answers,
                                            latestAnswer,
                                        ],

                                    currentQuestion:
                                        currentQuestion.question,

                                    currentAnswer:
                                        transcript.trim(),

                                    questionNumber:
                                        questionNumber +
                                        1,
                                }
                            ),
                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok
                ) {
                    throw new Error(
                        data.message ||
                            "Could not generate next question."
                    );
                }

                setCurrentQuestion(
                    data
                );

                setQuestionNumber(
                    (previous) =>
                        previous + 1
                );

                setTranscript(
                    ""
                );

                finalTranscriptRef.current =
                    "";

                setAnswerSubmitted(
                    false
                );

                setCurrentEvaluation(
                    null
                );

                setSpeechError("");
            } catch (error) {
                console.error(
                    "Next question error:",
                    error
                );

                setSpeechError(
                    `Could not generate next question: ${error.message}`
                );
            } finally {
                setIsThinking(
                    false
                );
            }
        };


    /* =====================================================
       FINISH INTERVIEW
    ===================================================== */

    const finishInterview =
        () => {
            stopListening();

            stopAI(
                setIsSpeaking
            );

            setInterviewFinished(
                true
            );
        };


    /* =====================================================
       EXIT
    ===================================================== */

    const exitInterview =
        () => {
            stopListening();

            stopAI(
                setIsSpeaking
            );

            navigate(
                "/dashboard"
            );
        };


    /* =====================================================
       PROGRESS
    ===================================================== */

    const MAX_QUESTIONS =
        8;

    const progress =
        Math.min(
            ((questionNumber -
                1) /
                MAX_QUESTIONS) *
                100,
            100
        );


    /* =====================================================
       START SCREEN
    ===================================================== */

    if (
        !interviewStarted
    ) {
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
                            AI interviewer. Answer
                            using your voice or
                            keyboard and receive
                            personalized AI feedback.
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
                        Your interview adapts to
                        your answers. Questions,
                        difficulty and feedback are
                        generated according to your
                        performance.
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
                                    key={
                                        value
                                    }
                                    className={
                                        selectedRole ===
                                        value
                                            ? "role-option selected"
                                            : "role-option"
                                    }
                                    onClick={() => {
                                        setSelectedRole(
                                            value
                                        );

                                        localStorage.setItem(
                                            "selectedRole",
                                            value
                                        );
                                    }}
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
                                Hear interview
                                questions naturally.
                            </p>
                        </div>

                        <div>
                            <span>
                                🎙
                            </span>

                            <strong>
                                Voice + Typing
                            </strong>

                            <p>
                                Speak and edit
                                your answer.
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
                                Receive personalized
                                evaluation.
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
                        Use Google Chrome or
                        Microsoft Edge and allow
                        microphone access.
                    </span>

                </main>

            </div>
        );
    }


    /* =====================================================
       FINAL REPORT
    ===================================================== */

    if (
        interviewFinished
    ) {
        const overallScore =
            answers.length
                ? Math.round(
                      answers.reduce(
                          (
                              total,
                              item
                          ) =>
                              total +
                              Number(
                                  item
                                      .evaluation
                                      ?.overall ||
                                  0
                              ),
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
                              item
                          ) =>
                              total +
                              Number(
                                  item
                                      .evaluation
                                      ?.communication ||
                                  0
                              ),
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
                              item
                          ) =>
                              total +
                              Number(
                                  item
                                      .evaluation
                                      ?.relevance ||
                                  0
                              ),
                          0
                      ) /
                          answers.length
                  )
                : 0;


        const technicalScore =
            answers.length
                ? Math.round(
                      answers.reduce(
                          (
                              total,
                              item
                          ) =>
                              total +
                              Number(
                                  item
                                      .evaluation
                                      ?.technicalAccuracy ||
                                  0
                              ),
                          0
                      ) /
                          answers.length
                  )
                : 0;


        const allStrengths =
            answers.flatMap(
                (item) =>
                    item.evaluation
                        ?.strengths ||
                    []
            );


        const allImprovements =
            answers.flatMap(
                (item) =>
                    item.evaluation
                        ?.improvements ||
                    []
            );


        const uniqueStrengths =
            [
                ...new Set(
                    allStrengths
                ),
            ].slice(0, 6);


        const uniqueImprovements =
            [
                ...new Set(
                    allImprovements
                ),
            ].slice(0, 6);


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
                        You completed an
                        adaptive AI interview
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
                                    technicalScore
                                }
                            </strong>

                            <span>
                                Technical
                            </span>
                        </div>

                    </div>


                    {uniqueStrengths.length >
                        0 && (
                        <div className="final-feedback">

                            <h3>
                                💪 Your Strengths
                            </h3>

                            <ul>
                                {uniqueStrengths.map(
                                    (
                                        strength,
                                        index
                                    ) => (
                                        <li
                                            key={
                                                index
                                            }
                                        >
                                            {
                                                strength
                                            }
                                        </li>
                                    )
                                )}
                            </ul>

                        </div>
                    )}


                    {uniqueImprovements.length >
                        0 && (
                        <div className="final-feedback">

                            <h3>
                                📌 Areas to Improve
                            </h3>

                            <ul>
                                {uniqueImprovements.map(
                                    (
                                        improvement,
                                        index
                                    ) => (
                                        <li
                                            key={
                                                index
                                            }
                                        >
                                            {
                                                improvement
                                            }
                                        </li>
                                    )
                                )}
                            </ul>

                        </div>
                    )}


                    <div className="final-feedback">

                        <h3>
                            🤖 AI Interview Summary
                        </h3>

                        <p>
                            {overallScore >=
                            85
                                ? "Excellent performance. You demonstrated strong knowledge, communication and adaptability."
                                : overallScore >=
                                  70
                                ? "Good performance. Your answers were generally strong. Continue improving depth and examples."
                                : overallScore >=
                                  55
                                ? "You are making progress. Focus on technical depth, structure and supporting answers with examples."
                                : "Keep practicing. Work on giving clearer, more relevant and technically detailed answers."}
                        </p>

                    </div>


                    <div className="complete-actions">

                        <button
                            className="secondary-interview-button"
                            onClick={() => {
                                setInterviewStarted(
                                    false
                                );

                                setInterviewFinished(
                                    false
                                );

                                setAnswers(
                                    []
                                );

                                setCurrentQuestion(
                                    INITIAL_QUESTIONS[
                                        selectedRole
                                    ]
                                );

                                setQuestionNumber(
                                    1
                                );

                                setElapsedTime(
                                    0
                                );

                                setTranscript(
                                    ""
                                );

                                finalTranscriptRef.current =
                                    "";

                                setCurrentEvaluation(
                                    null
                                );

                                setAnswerSubmitted(
                                    false
                                );
                            }}
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
                    {
                        ROLE_NAMES[
                            selectedRole
                        ]
                    }{" "}
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
                            {
                                questionNumber
                            }{" "}
                            of{" "}
                            {MAX_QUESTIONS}
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
                    QUESTION CARD
                ========================================= */}

                <section className="question-card">

                    <div className="question-meta">

                        <span>
                            {(
                                currentQuestion.type ||
                                "question"
                            ).toUpperCase()}
                        </span>

                        <span>
                            {
                                currentQuestion.focus ||
                                "Interview"
                            }
                        </span>

                        {currentQuestion.difficulty && (
                            <span>
                                Difficulty:{" "}
                                {
                                    currentQuestion.difficulty
                                }
                            </span>
                        )}

                    </div>


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
                                {
                                    AI_INTERVIEWER.fullName
                                }
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
                                    ? "Thinking..."
                                    : "Your AI interviewer is ready"}

                            </div>

                        </div>

                    </div>


                    <h1>
                        {
                            currentQuestion.question
                        }
                    </h1>


                    <p className="question-hint">
                        Take a moment to think,
                        then answer naturally.
                        You can speak or type your
                        answer and edit the transcript
                        before submitting.
                    </p>


                    <button
                        className="repeat-question-button"
                        onClick={() =>
                            speakText(
                                currentQuestion.question,
                                setIsSpeaking
                            )
                        }
                        disabled={
                            isListening ||
                            isThinking
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
                                Speak naturally or
                                type your answer.
                                You can edit the
                                transcript before
                                submitting.
                            </span>

                        </div>


                        {isListening && (
                            <div className="listening-status">

                                <span className="pulse-dot" />

                                Listening...

                            </div>
                        )}

                    </div>


                    {speechError && (
                        <div
                            className="speech-error"
                            role="alert"
                        >
                            ⚠️{" "}
                            {speechError}
                        </div>
                    )}


                    {/* =====================================
                        EDITABLE TRANSCRIPT
                    ===================================== */}

                    <div
                        className={
                            isListening
                                ? "answer-box listening"
                                : "answer-box"
                        }
                    >

                        <div className="transcript-editor-container">

                            <div className="live-transcript-label">
                                {isListening
                                    ? "LIVE TRANSCRIPT"
                                    : "YOUR EDITABLE ANSWER"}
                            </div>


                            <textarea
                                className="transcript-editor"
                                value={
                                    transcript
                                }
                                onChange={(
                                    event
                                ) => {
                                    const value =
                                        event
                                            .target
                                            .value;

                                    setTranscript(
                                        value
                                    );

                                    finalTranscriptRef.current =
                                        value;
                                }}
                                placeholder="Start speaking or type your answer here..."
                                rows={8}
                                disabled={
                                    isThinking ||
                                    answerSubmitted
                                }
                            />


                            <div className="transcript-help">
                                ✏️ You can correct
                                speech-to-text
                                mistakes before
                                submitting.
                            </div>

                        </div>

                    </div>


                    {/* =====================================
                        CONTROLS
                    ===================================== */}

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
                                !speechSupported ||
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


                                    <span>
                                        Technical{" "}
                                        <strong>
                                            {
                                                currentEvaluation.technicalAccuracy
                                            }
                                        </strong>
                                    </span>


                                    <span>
                                        Completeness{" "}
                                        <strong>
                                            {
                                                currentEvaluation.completeness
                                            }
                                        </strong>
                                    </span>

                                </div>


                                {currentEvaluation.strengths?.length >
                                    0 && (
                                    <div>
                                        <strong>
                                            💪 Strengths
                                        </strong>

                                        <ul>
                                            {currentEvaluation.strengths.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <li
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {
                                                            item
                                                        }
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}


                                {currentEvaluation.improvements?.length >
                                    0 && (
                                    <div>
                                        <strong>
                                            📌 Improve
                                        </strong>

                                        <ul>
                                            {currentEvaluation.improvements.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <li
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {
                                                            item
                                                        }
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}

                            </div>


                            <button
                                onClick={
                                    questionNumber >=
                                    MAX_QUESTIONS
                                        ? finishInterview
                                        : nextQuestion
                                }
                            >
                                {questionNumber >=
                                MAX_QUESTIONS
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