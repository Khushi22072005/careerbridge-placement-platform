import React, { useState } from "react";
import "./ResumeAnalyzer.css";

const ResumeAnalyzer = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);

    const handleFile = (file) => {
        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Please upload a PDF or DOC/DOCX file.");
            return;
        }

        setSelectedFile(file);
        setAnalyzed(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        handleFile(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        handleFile(file);
    };

    const handleAnalyze = () => {
        if (!selectedFile) {
            alert("Please upload your resume first.");
            return;
        }

        setAnalyzed(true);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setAnalyzed(false);
    };

    return (
        <div className="resume-analyzer-page">

            {/* ================= HEADER ================= */}

            <div className="analyzer-header">
                <div>
                    <div className="analyzer-title-row">
                        <div className="analyzer-title-icon">
                            🔍
                        </div>

                        <div>
                            <h1>Resume Analyzer</h1>
                            <p>
                                Analyze your resume and improve your chances of
                                getting shortlisted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* ================= MAIN CONTENT ================= */}

            <div className="analyzer-content">

                {/* ================= UPLOAD CARD ================= */}

                <section className="analyzer-card upload-card">

                    <div className="card-heading">
                        <div>
                            <h2>Analyze Your Resume</h2>
                            <p>
                                Upload your resume to check its ATS compatibility,
                                content quality and overall readiness.
                            </p>
                        </div>
                    </div>


                    <div
                        className={`resume-upload-box ${
                            isDragging ? "dragging" : ""
                        }`}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >

                        {!selectedFile ? (
                            <>
                                <div className="upload-icon">
                                    📄
                                </div>

                                <h3>Upload your resume</h3>

                                <p>
                                    Drag and drop your resume here or browse
                                    from your computer
                                </p>

                                <label className="browse-button">
                                    Browse Files
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />
                                </label>

                                <span className="upload-note">
                                    Supported formats: PDF, DOC, DOCX · Maximum
                                    size: 5 MB
                                </span>
                            </>
                        ) : (
                            <div className="uploaded-file">

                                <div className="file-icon">
                                    📄
                                </div>

                                <div className="file-information">
                                    <h3>{selectedFile.name}</h3>

                                    <p>
                                        {(
                                            selectedFile.size /
                                            (1024 * 1024)
                                        ).toFixed(2)}{" "}
                                        MB · Ready to analyze
                                    </p>
                                </div>

                                <button
                                    className="remove-file-button"
                                    onClick={removeFile}
                                >
                                    ×
                                </button>

                            </div>
                        )}

                    </div>


                    <div className="upload-actions">
                        <button
                            className="analyze-button"
                            onClick={handleAnalyze}
                            disabled={!selectedFile}
                        >
                            <span>✨</span>
                            Analyze Resume
                        </button>
                    </div>

                </section>


                {/* ================= QUICK CHECKS ================= */}

                <section className="quick-checks">

                    <div className="quick-check">
                        <div className="quick-icon">🎯</div>
                        <div>
                            <h3>ATS Compatibility</h3>
                            <p>
                                Check whether your resume is easy for ATS systems
                                to read.
                            </p>
                        </div>
                    </div>

                    <div className="quick-check">
                        <div className="quick-icon">🔑</div>
                        <div>
                            <h3>Keyword Match</h3>
                            <p>
                                Identify important skills and keywords missing
                                from your resume.
                            </p>
                        </div>
                    </div>

                    <div className="quick-check">
                        <div className="quick-icon">📊</div>
                        <div>
                            <h3>Resume Quality</h3>
                            <p>
                                Review your resume structure, content and
                                formatting.
                            </p>
                        </div>
                    </div>

                </section>


                {/* ================= RESULTS ================= */}

                {analyzed && (
                    <section className="results-section">

                        <div className="results-header">
                            <div>
                                <h2>Resume Analysis</h2>
                                <p>
                                    Here's how your resume performs across
                                    important hiring criteria.
                                </p>
                            </div>

                            <span className="analysis-status">
                                Analysis Complete
                            </span>
                        </div>


                        {/* ================= SCORE ================= */}

                        <div className="score-overview">

                            <div className="score-card main-score">

                                <div className="score-circle">
                                    <div>
                                        <strong>78</strong>
                                        <span>/100</span>
                                    </div>
                                </div>

                                <div className="score-details">
                                    <h3>Good Resume</h3>
                                    <p>
                                        Your resume has a solid foundation.
                                        A few improvements can make it more
                                        competitive.
                                    </p>

                                    <span className="score-label">
                                        Overall Resume Score
                                    </span>
                                </div>

                            </div>


                            <div className="score-card">

                                <div className="mini-score-icon">
                                    🎯
                                </div>

                                <div>
                                    <span className="metric-label">
                                        ATS Compatibility
                                    </span>

                                    <strong className="metric-score">
                                        82%
                                    </strong>

                                    <span className="metric-status good">
                                        Good
                                    </span>
                                </div>

                            </div>


                            <div className="score-card">

                                <div className="mini-score-icon">
                                    🔑
                                </div>

                                <div>
                                    <span className="metric-label">
                                        Keyword Match
                                    </span>

                                    <strong className="metric-score">
                                        74%
                                    </strong>

                                    <span className="metric-status average">
                                        Needs Work
                                    </span>
                                </div>

                            </div>

                        </div>


                        {/* ================= DETAILED ANALYSIS ================= */}

                        <div className="analysis-grid">

                            <div className="analysis-card">

                                <div className="analysis-card-header">
                                    <div className="analysis-card-icon positive">
                                        ✓
                                    </div>

                                    <div>
                                        <h3>What's Working</h3>
                                        <p>Your resume's strengths</p>
                                    </div>
                                </div>

                                <ul className="feedback-list">
                                    <li>
                                        <span>✓</span>
                                        Clear resume structure and sections
                                    </li>

                                    <li>
                                        <span>✓</span>
                                        Professional and readable formatting
                                    </li>

                                    <li>
                                        <span>✓</span>
                                        Relevant technical skills included
                                    </li>

                                    <li>
                                        <span>✓</span>
                                        Contact information is easy to find
                                    </li>
                                </ul>

                            </div>


                            <div className="analysis-card">

                                <div className="analysis-card-header">
                                    <div className="analysis-card-icon warning">
                                        !
                                    </div>

                                    <div>
                                        <h3>Needs Improvement</h3>
                                        <p>Areas you should work on</p>
                                    </div>
                                </div>

                                <ul className="feedback-list warning-list">
                                    <li>
                                        <span>!</span>
                                        Add more measurable achievements
                                    </li>

                                    <li>
                                        <span>!</span>
                                        Include more job-specific keywords
                                    </li>

                                    <li>
                                        <span>!</span>
                                        Strengthen your professional summary
                                    </li>

                                    <li>
                                        <span>!</span>
                                        Add relevant project outcomes
                                    </li>
                                </ul>

                            </div>

                        </div>


                        {/* ================= KEYWORDS ================= */}

                        <div className="keywords-card">

                            <div className="analysis-card-header">
                                <div className="analysis-card-icon keyword">
                                    🔑
                                </div>

                                <div>
                                    <h3>Recommended Keywords</h3>
                                    <p>
                                        Skills that could strengthen your resume
                                    </p>
                                </div>
                            </div>

                            <div className="keyword-list">
                                <span>SQL</span>
                                <span>Power BI</span>
                                <span>Data Analysis</span>
                                <span>Excel</span>
                                <span>Python</span>
                                <span>Dashboard</span>
                                <span>Data Visualization</span>
                            </div>

                        </div>


                        {/* ================= ACTIONS ================= */}

                        <div className="improvement-card">

                            <div>
                                <h3>Ready to improve your resume?</h3>
                                <p>
                                    Use our Resume Builder to apply these
                                    recommendations and create a stronger,
                                    placement-ready resume.
                                </p>
                            </div>

                            <button
                                className="builder-button"
                                onClick={() =>
                                    window.location.href = "/resume-builder"
                                }
                            >
                                Open Resume Builder →
                            </button>

                        </div>

                    </section>
                )}

            </div>

        </div>
    );
};

export default ResumeAnalyzer;