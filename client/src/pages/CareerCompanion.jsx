
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./CareerCompanion.css";
import logoImg from "../assets/images/logo.jpeg";

const API_URL = "http://localhost:5000/api/career-companion/chat";

// =====================================================
// CHAT SUGGESTIONS
// =====================================================

const SUGGESTIONS = [
    {
        title: "Explore career options",
        prompt: "Help me explore suitable IT career options as a student.",
    },
    {
        title: "Build my skills",
        prompt: "How should I build my technical skills for my first IT job?",
    },
    {
        title: "Choose a project",
        prompt: "Suggest a practical IT project that will improve my resume.",
    },
    {
        title: "Prepare for placements",
        prompt: "How can I prepare for campus placements as a fresher?",
    },
];

// =====================================================
// CAREERBRIDGE MODULES
// =====================================================

const MODULES = [
    {
        label: "Career Roadmap",
        description: "Plan your career journey",
        path: "/career-roadmap",
    },
    {
        label: "Learning Hub",
        description: "Explore learning resources",
        path: "/learning-hub",
    },
    {
        label: "Resume Builder",
        description: "Create your resume",
        path: "/resume-builder",
    },
    {
        label: "Resume Analyzer",
        description: "Review your resume",
        path: "/resume-analyzer",
    },
    {
        label: "Mock Interview",
        description: "Practise interview questions",
        path: "/interview",
    },
];

// =====================================================
// MESSAGE HELPERS
// =====================================================

const makeMessage = (role, content) => ({
    id: `${Date.now()}-${Math.random()}`,
    role,
    content,
});

const WELCOME_MESSAGE = {
    id: "welcome",
    role: "assistant",
    content:
        "Hi! I'm your CareerBridge AI Companion.\n\nI can help you explore career options, understand technical concepts, plan your preparation and find the right resources in CareerBridge.\n\nWhat would you like help with today?",
};

// =====================================================
// FORMAT CHAT MESSAGES
// =====================================================

function formatMessage(text) {
    return text.split("\n").map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
            return <div className="cc-message-spacer" key={index} />;
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
            return (
                <div className="cc-bullet" key={index}>
                    <span>{trimmed.slice(2)}</span>
                </div>
            );
        }

        if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+)\.\s(.*)$/);

            return (
                <div className="cc-numbered" key={index}>
                    <span>{match[1]}.</span>
                    <span>{formatInlineText(match[2])}</span>
                </div>
            );
        }

        return <p key={index}>{formatInlineText(line)}</p>;
    });
}

// =====================================================
// FORMAT BOLD TEXT WITHOUT HTML INJECTION
// =====================================================

function formatInlineText(text) {
    const pieces = text.split(/(\*\*.*?\*\*)/g);

    return pieces.map((piece, index) => {
        if (piece.startsWith("**") && piece.endsWith("**")) {
            return (
                <strong key={index}>
                    {piece.slice(2, -2)}
                </strong>
            );
        }

        return <React.Fragment key={index}>{piece}</React.Fragment>;
    });
}

// =====================================================
// CAREER COMPANION COMPONENT
// =====================================================

export default function CareerCompanion() {
    const navigate = useNavigate();

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const controllerRef = useRef(null);

    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // =====================================================
    // AUTO-SCROLL TO LATEST MESSAGE
    // =====================================================

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, loading]);

    // =====================================================
    // ABORT PENDING REQUEST WHEN COMPONENT UNMOUNTS
    // =====================================================

    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
        };
    }, []);

    // =====================================================
    // START NEW CHAT
    // =====================================================

    const startNewChat = () => {
        controllerRef.current?.abort();
        controllerRef.current = null;

        setMessages([WELCOME_MESSAGE]);
        setInput("");
        setError("");
        setLoading(false);
        setSidebarOpen(false);

        inputRef.current?.focus();
    };

    // =====================================================
    // SEND MESSAGE TO BACKEND
    // =====================================================

    const sendMessage = async (messageText = input) => {
        const text = messageText.trim();

        if (!text || loading) {
            return;
        }

        setError("");

        const userMessage = makeMessage("user", text);
        const nextMessages = [...messages, userMessage];

        setMessages(nextMessages);
        setInput("");
        setLoading(true);

        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            const history = nextMessages
                .filter((message) => message.id !== "welcome")
                .map(({ role, content }) => ({
                    role,
                    content,
                }));

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: history,
                }),
                signal: controller.signal,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "The assistant could not respond. Please try again."
                );
            }

            if (!data.reply || typeof data.reply !== "string") {
                throw new Error(
                    "The assistant returned an empty response."
                );
            }

            setMessages((current) => [
                ...current,
                makeMessage("assistant", data.reply),
            ]);
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(
                    err.message ||
                        "Unable to connect. Check that the chatbot server is running."
                );
            }
        } finally {
            if (controllerRef.current === controller) {
                controllerRef.current = null;
                setLoading(false);
            }
        }
    };

    // =====================================================
    // FORM HANDLERS
    // =====================================================

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage();
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    // =====================================================
    // RETRY LAST MESSAGE
    // =====================================================

    const handleRetry = () => {
        const lastUserMessage = [...messages]
            .reverse()
            .find((message) => message.role === "user");

        if (lastUserMessage) {
            sendMessage(lastUserMessage.content);
        }
    };

    // =====================================================
    // NAVIGATION
    // =====================================================

    const openModule = (path) => {
        setSidebarOpen(false);
        navigate(path);
    };

    const showWelcome = messages.length === 1;

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <main className="cc-page">

            {/* SIDEBAR */}

            <aside
                className={`cc-sidebar ${
                    sidebarOpen ? "cc-sidebar-open" : ""
                }`}
                aria-label="Career tools navigation"
            >
                {/* BRAND */}

                <div className="cc-brand">
                    <img
                        src={logoImg}
                        alt="CareerBridge Logo"
                        className="cc-brand-logo"
                    />

                    <div className="cc-brand-copy">
                        <h2>CareerBridge</h2>
                        <span>AI Career Companion</span>
                    </div>

                    <button
                        type="button"
                        className="cc-mobile-close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close navigation"
                    >
                        Close
                    </button>
                </div>

                {/* NEW CONVERSATION */}

                <button
                    type="button"
                    className="cc-new-chat"
                    onClick={startNewChat}
                >
                    New conversation
                </button>

                {/* CAREER TOOLS */}

                <div className="cc-sidebar-label">
                    YOUR CAREER TOOLS
                </div>

                <nav className="cc-module-list">
                    {MODULES.map((module) => (
                        <button
                            type="button"
                            className="cc-module-link"
                            key={module.path}
                            onClick={() => openModule(module.path)}
                        >
                            <span className="cc-module-copy">
                                <strong>{module.label}</strong>
                                <small>{module.description}</small>
                            </span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* MOBILE OVERLAY */}

            {sidebarOpen && (
                <button
                    type="button"
                    className="cc-sidebar-overlay"
                    aria-label="Close navigation overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* MAIN CHAT AREA */}

            <section className="cc-main">

                {/* TOP BAR */}

                <header className="cc-topbar">
                    <button
                        type="button"
                        className="cc-menu-button"
                        onClick={() =>
                            setSidebarOpen((previous) => !previous)
                        }
                        aria-label={
                            sidebarOpen
                                ? "Close navigation"
                                : "Open navigation"
                        }
                        aria-expanded={sidebarOpen}
                    >
                        {sidebarOpen ? "Close" : "Menu"}
                    </button>

                    <div className="cc-topbar-title">
                        <div>
                            <strong>Career Companion</strong>
                            <small>
                                AI-powered career guidance
                            </small>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="cc-reset-button"
                        onClick={startNewChat}
                    >
                        <span className="cc-reset-text">
                            New chat
                        </span>
                    </button>
                </header>

                {/* CHAT CONTENT */}

                <div className="cc-chat-area">

                    {/* WELCOME AND SUGGESTIONS */}

                    {showWelcome && (
                        <section className="cc-welcome">
                            <h1>
                                Your career journey starts here.
                            </h1>

                            <p className="cc-welcome-description">
                                Ask questions, explore possibilities and
                                get practical guidance for your journey
                                from student to professional.
                            </p>

                            <div className="cc-suggestions">
                                {SUGGESTIONS.map((suggestion) => (
                                    <button
                                        type="button"
                                        className="cc-suggestion-card"
                                        key={suggestion.title}
                                        onClick={() =>
                                            sendMessage(suggestion.prompt)
                                        }
                                        disabled={loading}
                                    >
                                        <span className="cc-suggestion-copy">
                                            <strong>
                                                {suggestion.title}
                                            </strong>

                                            <small>
                                                {suggestion.prompt}
                                            </small>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* CHAT MESSAGES */}

                    <section
                        className="cc-messages"
                        aria-live="polite"
                        aria-relevant="additions"
                    >
                        {messages
                            .filter(
                                (message) => message.id !== "welcome"
                            )
                            .map((message) => (
                                <article
                                    className={`cc-message cc-message-${message.role}`}
                                    key={message.id}
                                >
                                    <div className="cc-message-content">
                                        <div className="cc-message-author">
                                            {message.role === "user"
                                                ? "You"
                                                : "Career Companion"}
                                        </div>

                                        <div className="cc-message-bubble">
                                            {formatMessage(message.content)}
                                        </div>
                                    </div>
                                </article>
                            ))}

                        {/* LOADING INDICATOR */}

                        {loading && (
                            <div className="cc-message cc-message-assistant">
                                <div className="cc-message-content">
                                    <div className="cc-message-author">
                                        Career Companion
                                    </div>

                                    <div className="cc-message-bubble cc-thinking">
                                        <span />
                                        <span />
                                        <span />

                                        <small>
                                            Thinking through your question...
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ERROR MESSAGE */}

                        {error && (
                            <div className="cc-error" role="alert">
                                <div>
                                    <strong>
                                        Couldn't get a response
                                    </strong>

                                    <p>{error}</p>

                                    <button
                                        type="button"
                                        onClick={handleRetry}
                                        disabled={loading}
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </section>
                </div>

                {/* MESSAGE COMPOSER */}

                <footer className="cc-composer-wrap">
                    <form
                        className="cc-composer"
                        onSubmit={handleSubmit}
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(event) =>
                                setInput(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about your career..."
                            rows={1}
                            maxLength={4000}
                            aria-label="Write your message"
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            className="cc-send-button"
                            disabled={!input.trim() || loading}
                            aria-label="Send message"
                        >
                            Send
                        </button>
                    </form>

                    <div className="cc-composer-meta">
                        <span>
                            Enter to send · Shift + Enter for a new line
                        </span>

                        <span>{input.length}/4000</span>
                    </div>

                    <p className="cc-disclaimer">
                        AI can make mistakes. Verify important information
                        before making career decisions.
                    </p>
                </footer>
            </section>
        </main>
    );
}
