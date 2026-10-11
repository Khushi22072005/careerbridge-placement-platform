
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResumeAnalyzer.css";

const API_URL = "http://localhost:5000/api/resume/analyze";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const STOP_WORDS = new Set([
    "the", "and", "for", "with", "from", "this", "that",
    "you", "your", "are", "our", "will", "have", "has",
    "was", "were", "can", "all", "who", "what", "when",
    "where", "how", "into", "about", "using", "use",
    "work", "working", "role", "job", "team", "skills",
    "ability", "strong", "good", "excellent", "required",
    "preferred", "responsibilities", "responsibility",
    "experience", "candidate", "candidates", "knowledge",
    "including", "such", "must", "should", "would",
]);

const normalize = (value) =>
    String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9+#.]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const unique = (items) => [
    ...new Set(
        items
            .map((item) => String(item || "").trim())
            .filter(Boolean)
    ),
];

const extractKeywords = (text) => {
    const words = normalize(text)
        .split(" ")
        .filter(
            (word) =>
                word.length > 2 &&
                !STOP_WORDS.has(word) &&
                !/^\d+$/.test(word)
        );

    return unique(words);
};

const toArray = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string" && value.trim()) {
        return value
            .split(/[,;\n•]/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const getAnalysisText = (analysis) => {
    if (!analysis) return "";

    if (typeof analysis === "string") return analysis;

    return [
        ...toArray(analysis.detectedSkills),
        ...toArray(analysis.detected_skills),
        ...toArray(analysis.skills),
        ...toArray(analysis.sectionsFound),
        ...toArray(analysis.sections_found),
        ...toArray(analysis.strengths),
        ...toArray(analysis.improvements),
        ...toArray(analysis.suggestions),
        ...toArray(analysis.keywords),
        analysis.summary,
        analysis.feedback,
    ]
        .filter(Boolean)
        .join(" ");
};

const findField = (object, names, fallback = undefined) => {
    for (const name of names) {
        if (object?.[name] !== undefined && object[name] !== null) {
            return object[name];
        }
    }

    return fallback;
};

const clampScore = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) return null;

    return Math.max(0, Math.min(100, Math.round(number)));
};

const getScoreLabel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Needs improvement";
    return "Needs attention";
};

const getMatchScore = (resumeText, jobDescription) => {
    const resumeKeywords = new Set(extractKeywords(resumeText));
    const jobKeywords = extractKeywords(jobDescription);

    if (!jobKeywords.length || !resumeKeywords.size) {
        return {
            score: null,
            matched: [],
            missing: jobKeywords,
            total: jobKeywords.length,
        };
    }

    const matched = jobKeywords.filter((word) =>
        resumeKeywords.has(word)
    );

    const missing = jobKeywords.filter(
        (word) => !resumeKeywords.has(word)
    );

    return {
        score: Math.round((matched.length / jobKeywords.length) * 100),
        matched,
        missing,
        total: jobKeywords.length,
    };
};

function ScoreRing({ score, label }) {
    const safeScore = score ?? 0;

    return (
        <div
            className="ra-score-ring"
            style={{ "--score-progress": `${safeScore * 3.6}deg` }}
            role="img"
            aria-label={`${label}: ${
                score === null ? "not available" : `${score} out of 100`
            }`}
        >
            <div className="ra-score-ring-inner">
                <strong>{score === null ? "—" : score}</strong>
                <span>/ 100</span>
            </div>
        </div>
    );
}

function ScoreCard({ title, score, description, icon }) {
    return (
        <article className="ra-score-card">
            <div className="ra-score-card-heading">
                <span className="ra-icon-box">{icon}</span>
                <span>{title}</span>
            </div>

            <ScoreRing score={score} label={title} />

            <strong className="ra-score-label">
                {score === null ? "Not available" : getScoreLabel(score)}
            </strong>

            <p>{description}</p>
        </article>
    );
}

function TagList({ items, emptyMessage, variant = "" }) {
    const cleanedItems = unique(toArray(items));

    if (!cleanedItems.length) {
        return <p className="ra-empty-message">{emptyMessage}</p>;
    }

    return (
        <div className={`ra-tag-list ${variant}`}>
            {cleanedItems.map((item, index) => (
                <span className="ra-tag" key={`${item}-${index}`}>
                    {item}
                </span>
            ))}
        </div>
    );
}

function ResultSection({ title, icon, children, className = "" }) {
    return (
        <section className={`ra-result-section ${className}`}>
            <h3>
                <span aria-hidden="true">{icon}</span>
                {title}
            </h3>
            {children}
        </section>
    );
}

export default function ResumeAnalyzer() {
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [analyzed, setAnalyzed] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState("");
    const [analysis, setAnalysis] = useState(null);
    const [resumeScore, setResumeScore] = useState(null);
    const [jobMatchScore, setJobMatchScore] = useState(null);
    const [matchResults, setMatchResults] = useState({
        matched: [],
        missing: [],
        total: 0,
    });
    const [scoreSource, setScoreSource] = useState("unavailable");

    const skillsFound = useMemo(() => {
        if (!analysis) return [];

        return unique([
            ...toArray(analysis.detectedSkills),
            ...toArray(analysis.detected_skills),
            ...toArray(analysis.skills),
        ]);
    }, [analysis]);

    const sectionsFound = useMemo(() => {
        if (!analysis) return [];

        return unique([
            ...toArray(analysis.sectionsFound),
            ...toArray(analysis.sections_found),
        ]);
    }, [analysis]);

    const strengths = useMemo(() => {
        if (!analysis) return [];

        return unique([
            ...toArray(analysis.strengths),
            ...toArray(analysis.whatIsWorking),
            ...toArray(analysis.what_is_working),
        ]);
    }, [analysis]);

    const improvements = useMemo(() => {
        if (!analysis) return [];

        return unique([
            ...toArray(analysis.improvements),
            ...toArray(analysis.needsImprovement),
            ...toArray(analysis.needs_improvement),
            ...toArray(analysis.suggestions),
            ...toArray(analysis.recommendations),
        ]);
    }, [analysis]);

    const handleFile = (file) => {
        setError("");
        setAnalyzed(false);
        setAnalysis(null);
        setResumeScore(null);
        setJobMatchScore(null);
        setMatchResults({ matched: [], missing: [], total: 0 });

        if (!file) return;

        const extension = file.name.split(".").pop()?.toLowerCase();
        const allowedExtensions = ["pdf", "doc", "docx"];

        if (!allowedExtensions.includes(extension)) {
            setSelectedFile(null);
            setError("Please upload a PDF, DOC, or DOCX file.");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setSelectedFile(null);
            setError("Your resume must be 5 MB or smaller.");
            return;
        }

        if (file.size === 0) {
            setSelectedFile(null);
            setError("The selected file is empty. Please choose another file.");
            return;
        }

        setSelectedFile(file);
    };

    const handleAnalyze = async (event) => {
        event?.preventDefault();

        setError("");

        if (!selectedFile) {
            setError("Please upload your resume before analyzing it.");
            return;
        }

        if (!jobDescription.trim()) {
            setError(
                "Please paste the job description to check how your resume matches the role."
            );
            return;
        }

        if (jobDescription.trim().length < 30) {
            setError(
                "Please enter a more detailed job description (at least 30 characters)."
            );
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please log in and try again.");
            return;
        }

        setIsAnalyzing(true);
        setAnalyzed(false);

        try {
            const formData = new FormData();
            formData.append("resume", selectedFile);
            formData.append("jobTitle", jobTitle.trim());
            formData.append("jobDescription", jobDescription.trim());

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    `Analysis failed (${response.status}). Please try again.`
                );
            }

            const returnedAnalysis =
                data.analysis ||
                data.result?.analysis ||
                data.data?.analysis ||
                {};

            setAnalysis(returnedAnalysis);

            const returnedScore = findField(
                data,
                ["resumeScore", "resume_score", "overallScore", "overall_score"],
                findField(
                    data.result,
                    ["resumeScore", "resume_score", "overallScore", "overall_score"]
                )
            );

            const contactScore = Number(
                findField(returnedAnalysis, ["contactScore", "contact_score"], 0)
            );

            const sectionScore = Number(
                findField(returnedAnalysis, ["sectionScore", "section_score"], 0)
            );

            const contentScore = Number(
                findField(returnedAnalysis, ["contentScore", "content_score"], 0)
            );

            let finalResumeScore = clampScore(returnedScore);

            // Retain compatibility with the earlier response structure.
            // Confirm the backend's score scales before relying on this fallback.
            if (
                finalResumeScore === null &&
                [contactScore, sectionScore, contentScore].every(
                    Number.isFinite
                ) &&
                (
                    contactScore > 0 ||
                    sectionScore > 0 ||
                    contentScore > 0
                )
            ) {
                finalResumeScore = clampScore(
                    ((contactScore + sectionScore + contentScore) / 40) * 100
                );
            }

            setResumeScore(finalResumeScore);

            const returnedMatch = findField(
                data,
                ["jobMatch", "job_match", "jdMatch", "jd_match", "matchResults"],
                findField(
                    data.result,
                    ["jobMatch", "job_match", "jdMatch", "jd_match", "matchResults"]
                )
            );

            const returnedMatchScore = findField(
                returnedMatch,
                ["score", "matchScore", "match_score", "percentage"]
            );

            const directMatchScore = findField(
                data,
                ["jobMatchScore", "job_match_score", "jdMatchScore", "jd_match_score"],
                findField(
                    data.result,
                    ["jobMatchScore", "job_match_score", "jdMatchScore", "jd_match_score"]
                )
            );

            const finalReturnedMatchScore = clampScore(
                returnedMatchScore ?? directMatchScore
            );

            const returnedMatched = unique([
                ...toArray(findField(returnedMatch, [
                    "matchedSkills", "matched_skills", "matchedKeywords",
                    "matched_keywords", "matched"
                ])),
                ...toArray(findField(data, ["matchedSkills", "matched_skills"])),
            ]);

            const returnedMissing = unique([
                ...toArray(findField(returnedMatch, [
                    "missingSkills", "missing_skills", "missingKeywords",
                    "missing_keywords", "missing"
                ])),
                ...toArray(findField(data, ["missingSkills", "missing_skills"])),
            ]);

            if (finalReturnedMatchScore !== null) {
                setJobMatchScore(finalReturnedMatchScore);
                setMatchResults({
                    matched: returnedMatched,
                    missing: returnedMissing,
                    total: returnedMatched.length + returnedMissing.length,
                });
                setScoreSource("backend");
            } else {
                // Fallback compares JD keywords with skills and text returned
                // by the backend. This is a rough keyword estimate, not AI scoring.
                const resumeText = [
                    getAnalysisText(returnedAnalysis),
                    ...skillsFound,
                    ...sectionsFound,
                ].join(" ");

                const comparison = getMatchScore(
                    resumeText,
                    jobDescription.trim()
                );

                setJobMatchScore(comparison.score);
                setMatchResults({
                    matched: comparison.matched,
                    missing: comparison.missing,
                    total: comparison.total,
                });
                setScoreSource("keyword-estimate");
            }

            setAnalyzed(true);
        } catch (err) {
            setError(
                err.message ||
                "Something went wrong while analyzing your resume. Please try again."
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setJobTitle("");
        setJobDescription("");
        setAnalyzed(false);
        setAnalysis(null);
        setResumeScore(null);
        setJobMatchScore(null);
        setMatchResults({ matched: [], missing: [], total: 0 });
        setScoreSource("unavailable");
        setError("");
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
    };

    return (
        <main className="ra-page">
            <div className="ra-container">
                <header className="ra-header">
                    <div className="ra-eyebrow">
                        
                    </div>

                    <h1>
                        Resume <span>Analyzer</span>
                    </h1>

                    <p>
                        Understand your resume, compare it with a job
                        description, and discover what you can improve before
                        applying.
                    </p>
                </header>

                <form className="ra-form" onSubmit={handleAnalyze}>
                    <section className="ra-panel">
                        <div className="ra-panel-heading">
                            <span className="ra-step-number">01</span>
                            <div>
                                <h2>Upload your resume</h2>
                                <p>
                                    Add the resume you want to evaluate.
                                    Supported formats: PDF, DOC, DOCX.
                                </p>
                            </div>
                        </div>

                        <label
                            className={`ra-upload-zone ${
                                isDragging ? "is-dragging" : ""
                            } ${selectedFile ? "has-file" : ""}`}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(event) => {
                                    handleFile(event.target.files?.[0]);
                                    event.target.value = "";
                                }}
                            />

                            <span className="ra-upload-icon" aria-hidden="true">
                                {selectedFile ? "✓" : "↑"}
                            </span>

                            {selectedFile ? (
                                <>
                                    <strong>{selectedFile.name}</strong>
                                    <span>
                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                        {" · "}Ready to analyze
                                    </span>
                                    <span className="ra-change-file">
                                        Choose a different file
                                    </span>
                                </>
                            ) : (
                                <>
                                    <strong>Drag and drop your resume here</strong>
                                    <span>
                                        or click to browse files · Maximum 5 MB
                                    </span>
                                </>
                            )}
                        </label>
                    </section>

                    <section className="ra-panel">
                        <div className="ra-panel-heading">
                            <span className="ra-step-number">02</span>
                            <div>
                                <h2>Add the job description</h2>
                                
                            </div>
                        </div>

                        <div className="ra-field">
                            <label htmlFor="ra-job-title">
                                Target job title{" "}
                                <span className="ra-optional">(optional)</span>
                            </label>

                            <input
                                id="ra-job-title"
                                type="text"
                                value={jobTitle}
                                onChange={(event) =>
                                    setJobTitle(event.target.value)
                                }
                                placeholder="e.g. Data Analyst Intern"
                                maxLength={150}
                            />
                        </div>

                        <div className="ra-field">
                            <div className="ra-label-row">
                                <label htmlFor="ra-job-description">
                                    Job description
                                </label>
                                <span className="ra-character-count">
                                    {jobDescription.length} characters
                                </span>
                            </div>

                            <textarea
                                id="ra-job-description"
                                value={jobDescription}
                                onChange={(event) =>
                                    setJobDescription(event.target.value)
                                }
                                placeholder={
                                    "Paste the job description here...\n\nInclude the responsibilities, required skills, qualifications, and experience from the job posting."
                                }
                                rows={8}
                                maxLength={15000}
                                required
                            />

                            
                        </div>
                    </section>

                    {error && (
                        <div className="ra-error" role="alert">
                            <span aria-hidden="true">!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <button
                        className="ra-primary-button"
                        type="submit"
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="ra-spinner" />
                                Analyzing your resume...
                            </>
                        ) : (
                            <>
                                Analyze Resume & Match Job
                                <span aria-hidden="true">→</span>
                            </>
                        )}
                    </button>

                    
                </form>

                {analyzed && (
                    <section className="ra-results" aria-live="polite">
                        <div className="ra-results-heading">
                            <div>
                                <span className="ra-eyebrow">
                                    YOUR ANALYSIS REPORT
                                </span>
                                <h2>Here is your result</h2>
                                <p>
                                    {jobTitle.trim()
                                        ? `Target role: ${jobTitle.trim()}`
                                        : "Your resume compared with the provided job description."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="ra-secondary-button"
                                onClick={handleReset}
                            >
                                Analyze another
                            </button>
                        </div>

                        <div className="ra-score-grid">
                            <ScoreCard
                                title="Resume Quality"
                                score={resumeScore}
                                icon="▤"
                                description="General resume structure and content based on the analysis returned by your backend."
                            />

                            <ScoreCard
                                title="Job Match"
                                score={jobMatchScore}
                                icon="⌕"
                                description={
                                    scoreSource === "backend"
                                        ? "Match score returned by your backend."
                                        : "Estimated keyword overlap. Not a full semantic ATS evaluation."
                                }
                            />
                        </div>

                        {scoreSource === "keyword-estimate" && (
                            <p className="ra-estimate-note">
                                <strong>Keyword estimate:</strong> This fallback
                                uses the resume skills and analysis text
                                returned by the backend. It may not represent
                                every word in your uploaded document. For an
                                accurate job-match score, implement JD matching
                                in the backend.
                            </p>
                        )}

                        <div className="ra-results-grid">
                            <ResultSection
                                title="Skills matching the job"
                                icon="✓"
                                className="ra-success-section"
                            >
                                <p className="ra-section-description">
                                    Keywords found in the available resume
                                    analysis and job description.
                                </p>

                                <TagList
                                    items={matchResults.matched}
                                    emptyMessage="No matching keywords were identified yet. Check whether your backend returns the resume's detected skills."
                                />
                            </ResultSection>

                            <ResultSection
                                title="Skills and keywords to review"
                                icon="＋"
                                className="ra-improvement-section"
                            >
                                <p className="ra-section-description">
                                    Job-description keywords not found in the
                                    available resume analysis.
                                </p>

                                <TagList
                                    items={matchResults.missing}
                                    emptyMessage="No missing keywords were identified. This does not guarantee that every job requirement is satisfied."
                                />
                            </ResultSection>

                            <ResultSection
                                title="What's working"
                                icon="✦"
                            >
                                <TagList
                                    items={strengths}
                                    emptyMessage="Your backend did not return specific strengths for this resume."
                                />
                            </ResultSection>

                            <ResultSection
                                title="Areas to improve"
                                icon="↗"
                            >
                                <TagList
                                    items={improvements}
                                    emptyMessage="Your backend did not return improvement suggestions. Consider adding specific resume recommendations to the analysis service."
                                />
                            </ResultSection>

                            <ResultSection
                                title="Detected skills"
                                icon="⌘"
                            >
                                <TagList
                                    items={skillsFound}
                                    emptyMessage="No skills were returned by the resume analysis."
                                />
                            </ResultSection>

                            <ResultSection
                                title="Resume sections detected"
                                icon="▦"
                            >
                                <TagList
                                    items={sectionsFound}
                                    emptyMessage="No section information was returned by the resume analysis."
                                />
                            </ResultSection>
                        </div>

                        <div className="ra-next-step">
                            <div className="ra-next-step-icon" aria-hidden="true">
                                ↗
                            </div>
                            <div>
                                <h3>Ready to improve your resume?</h3>
                                <p>
                                    Update your resume using CareerBridge's
                                    Resume Builder, then analyze it again
                                    against the same job description.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="ra-primary-button ra-builder-button"
                                onClick={() => navigate("/resume-builder")}
                            >
                                Open Resume Builder
                                <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
