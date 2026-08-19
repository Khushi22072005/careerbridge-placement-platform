import React, { useState } from "react";
import "./ResumeAnalyzer.css";

const ResumeAnalyzer = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);
    const [resumeScore, setResumeScore] = useState(0);
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // =====================================================
    // HANDLE FILE
    // =====================================================

    const handleFile = (file) => {
        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ];

        const fileExtension = file.name
            .split(".")
            .pop()
            .toLowerCase();

        const allowedExtensions = ["pdf", "doc", "docx"];

        if (
            !allowedTypes.includes(file.type) &&
            !allowedExtensions.includes(fileExtension)
        ) {
            alert("Please upload a PDF or DOC/DOCX file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Resume file must be smaller than 5 MB.");
            return;
        }

        setSelectedFile(file);
        setAnalyzed(false);
        setResumeScore(0);
        setAnalysis(null);
    };

    // =====================================================
    // FILE INPUT
    // =====================================================

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (file) {
            handleFile(file);
        }

        event.target.value = "";
    };

    // =====================================================
    // DRAG & DROP
    // =====================================================

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];

        if (file) {
            handleFile(file);
        }
    };

    // =====================================================
    // ANALYZE RESUME
    // =====================================================

    const handleAnalyze = async () => {
        if (!selectedFile) {
            alert("Please upload your resume first.");
            return;
        }

        setIsAnalyzing(true);
        setAnalyzed(false);
        setAnalysis(null);
        setResumeScore(0);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Login session expired. Please login again.");
                setIsAnalyzing(false);
                return;
            }

            const formData = new FormData();

            // IMPORTANT:
            // This must match upload.single("resume")
            // in your backend route.
            formData.append("resume", selectedFile);

            console.log("Uploading resume:", selectedFile.name);
            console.log("Token exists:", !!token);

            const response = await fetch(
                "http://localhost:5000/api/resume/analyze",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const contentType =
                response.headers.get("content-type") || "";

            let data;

            if (contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();

                console.error(
                    "Server returned non-JSON response:",
                    text
                );

                throw new Error(
                    `Server error (${response.status}). Please check your backend server.`
                );
            }

            console.log(
                "Resume analysis response:",
                data
            );

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    `Analysis failed with status ${response.status}`
                );
            }

            const score = Number(data.resumeScore);

            setResumeScore(
                Number.isFinite(score)
                    ? Math.max(0, Math.min(100, score))
                    : 0
            );

            setAnalysis(
                data.analysis || {}
            );

            setAnalyzed(true);

        } catch (error) {

            console.error(
                "RESUME ANALYZER ERROR:",
                error
            );

            alert(
                error.message ||
                "Failed to analyze resume. Please make sure the backend server is running."
            );

        } finally {
            setIsAnalyzing(false);
        }
    };

    // =====================================================
    // REMOVE FILE
    // =====================================================

    const removeFile = () => {
        setSelectedFile(null);
        setAnalyzed(false);
        setResumeScore(0);
        setAnalysis(null);
    };

    // =====================================================
    // ATS SCORE
    // =====================================================

    const atsScore = analysis
        ? Math.min(
            100,
            Math.round(
                (
                    Number(analysis.contactScore || 0) +
                    Number(analysis.sectionScore || 0) +
                    Number(analysis.contentScore || 0)
                ) / 40 * 100
            )
        )
        : 0;

    // =====================================================
    // KEYWORD SCORE
    // =====================================================

    const keywordScore = analysis
        ? Math.min(
            100,
            Math.round(
                Number(analysis.skillScore || 0) / 20 * 100
            )
        )
        : 0;

    // =====================================================
    // RESUME TITLE
    // =====================================================

    const getResumeTitle = () => {
        if (resumeScore >= 85) {
            return "Excellent Resume";
        }

        if (resumeScore >= 70) {
            return "Good Resume";
        }

        if (resumeScore >= 50) {
            return "Average Resume";
        }

        return "Needs Improvement";
    };

    // =====================================================
    // RESUME DESCRIPTION
    // =====================================================

    const getResumeDescription = () => {
        if (resumeScore >= 85) {
            return "Your resume has strong structure, relevant skills and good overall content.";
        }

        if (resumeScore >= 70) {
            return "Your resume has a solid foundation. A few improvements can make it more competitive.";
        }

        if (resumeScore >= 50) {
            return "Your resume has some good elements, but several areas should be improved.";
        }

        return "Your resume needs significant improvements before it is placement ready.";
    };

    // =====================================================
    // SCORE COLOR
    // =====================================================

    const getScoreClass = () => {
        if (resumeScore >= 85) {
            return "excellent";
        }

        if (resumeScore >= 70) {
            return "good";
        }

        if (resumeScore >= 50) {
            return "average";
        }

        return "poor";
    };

    // =====================================================
    // SCORE CIRCLE
    // =====================================================

    const scoreDegree =
        Math.round((resumeScore / 100) * 360);

    // =====================================================
    // SAFE ANALYSIS VALUES
    // =====================================================

    const sectionsFound =
        Array.isArray(analysis?.sectionsFound)
            ? analysis.sectionsFound
            : [];

    const skillsFound =
        Array.isArray(analysis?.skillsFound)
            ? analysis.skillsFound
            : [];

    return (
        <div className="resume-analyzer-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="analyzer-header">

                <div className="analyzer-title-row">

                    <div className="analyzer-title-icon">
                        🔍
                    </div>

                    <div>
                        <span className="analyzer-eyebrow">
                            CAREER TOOLS
                        </span>

                        <h1>
                            Resume Analyzer
                        </h1>

                        <p>
                            Analyze your resume and improve your
                            chances of getting shortlisted.
                        </p>
                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="analyzer-content">

                {/* =================================================
                    UPLOAD CARD
                ================================================= */}

                <section className="analyzer-card upload-card">

                    <div className="card-heading">

                        <div className="heading-icon">
                            ✨
                        </div>

                        <div>
                            <h2>
                                Analyze Your Resume
                            </h2>

                            <p>
                                Upload your resume to check its ATS
                                compatibility, content quality and
                                overall placement readiness.
                            </p>
                        </div>

                    </div>


                    {/* =================================================
                        UPLOAD BOX
                    ================================================= */}

                    <div
                        className={`resume-upload-box ${
                            isDragging
                                ? "dragging"
                                : ""
                        } ${
                            selectedFile
                                ? "has-file"
                                : ""
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >

                        {!selectedFile ? (

                            <>
                                <div className="upload-icon">
                                    📄
                                </div>

                                <h3>
                                    Upload your resume
                                </h3>

                                <p>
                                    Drag and drop your resume here
                                    or browse from your computer
                                </p>

                                <label className="browse-button">

                                    <span>
                                        📁
                                    </span>

                                    Browse Files

                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />

                                </label>

                                <span className="upload-note">
                                    Supported formats: PDF, DOC, DOCX
                                    <span className="dot-separator">
                                        •
                                    </span>
                                    Maximum size: 5 MB
                                </span>

                            </>

                        ) : (

                            <div className="uploaded-file">

                                <div className="file-icon">
                                    📄
                                </div>

                                <div className="file-information">

                                    <div className="file-name-row">

                                        <h3>
                                            {selectedFile.name}
                                        </h3>

                                        <span className="ready-badge">
                                            Ready
                                        </span>

                                    </div>

                                    <p>
                                        {(
                                            selectedFile.size /
                                            (1024 * 1024)
                                        ).toFixed(2)}{" "}
                                        MB
                                        <span>
                                            •
                                        </span>
                                        Ready to analyze
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="remove-file-button"
                                    onClick={removeFile}
                                    aria-label="Remove file"
                                >
                                    ×
                                </button>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        ANALYZE BUTTON
                    ================================================= */}

                    <div className="upload-actions">

                        <button
                            type="button"
                            className="analyze-button"
                            onClick={handleAnalyze}
                            disabled={
                                !selectedFile ||
                                isAnalyzing
                            }
                        >

                            <span>
                                {isAnalyzing
                                    ? "⏳"
                                    : "✨"}
                            </span>

                            {isAnalyzing
                                ? "Analyzing Resume..."
                                : "Analyze Resume"}

                        </button>

                    </div>

                </section>


                {/* =================================================
                    QUICK CHECKS
                ================================================= */}

                <section className="quick-checks">

                    <div className="quick-check">

                        <div className="quick-icon blue">
                            🎯
                        </div>

                        <div>
                            <h3>
                                ATS Compatibility
                            </h3>

                            <p>
                                Check whether your resume is easy
                                for Applicant Tracking Systems to read.
                            </p>
                        </div>

                    </div>


                    <div className="quick-check">

                        <div className="quick-icon purple">
                            🔑
                        </div>

                        <div>
                            <h3>
                                Keyword Match
                            </h3>

                            <p>
                                Identify important skills and
                                keywords recruiters look for.
                            </p>
                        </div>

                    </div>


                    <div className="quick-check">

                        <div className="quick-icon green">
                            📊
                        </div>

                        <div>
                            <h3>
                                Resume Quality
                            </h3>

                            <p>
                                Review your resume structure,
                                content and overall quality.
                            </p>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    RESULTS
                ================================================= */}

                {analyzed && (

                    <section className="results-section">

                        <div className="results-header">

                            <div>
                                <span className="results-eyebrow">
                                    ANALYSIS REPORT
                                </span>

                                <h2>
                                    Resume Analysis
                                </h2>

                                <p>
                                    Here's how your resume performs
                                    across important hiring criteria.
                                </p>
                            </div>

                            <span className="analysis-status">
                                <span>
                                    ✓
                                </span>
                                Analysis Complete
                            </span>

                        </div>


                        {/* =================================================
                            SCORE OVERVIEW
                        ================================================= */}

                        <div className="score-overview">

                            {/* MAIN SCORE */}

                            <div
                                className={`score-card main-score ${getScoreClass()}`}
                            >

                                <div
                                    className="score-circle"
                                    style={{
                                        "--score-degree":
                                            `${scoreDegree}deg`
                                    }}
                                >

                                    <div className="score-circle-content">

                                        <strong>
                                            {resumeScore}
                                        </strong>

                                        <span>
                                            /100
                                        </span>

                                    </div>

                                </div>


                                <div className="score-details">

                                    <span className="score-small-label">
                                        OVERALL SCORE
                                    </span>

                                    <h3>
                                        {getResumeTitle()}
                                    </h3>

                                    <p>
                                        {getResumeDescription()}
                                    </p>

                                </div>

                            </div>


                            {/* ATS SCORE */}

                            <div className="score-card metric-card">

                                <div className="mini-score-icon blue">
                                    🎯
                                </div>

                                <div className="metric-content">

                                    <span className="metric-label">
                                        ATS Compatibility
                                    </span>

                                    <strong className="metric-score">
                                        {atsScore}%
                                    </strong>

                                    <span
                                        className={`metric-status ${
                                            atsScore >= 70
                                                ? "good"
                                                : "average"
                                        }`}
                                    >
                                        {atsScore >= 70
                                            ? "Good"
                                            : "Needs Work"}
                                    </span>

                                </div>

                            </div>


                            {/* KEYWORD SCORE */}

                            <div className="score-card metric-card">

                                <div className="mini-score-icon purple">
                                    🔑
                                </div>

                                <div className="metric-content">

                                    <span className="metric-label">
                                        Keyword Match
                                    </span>

                                    <strong className="metric-score">
                                        {keywordScore}%
                                    </strong>

                                    <span
                                        className={`metric-status ${
                                            keywordScore >= 70
                                                ? "good"
                                                : "average"
                                        }`}
                                    >
                                        {keywordScore >= 70
                                            ? "Good"
                                            : "Needs Work"}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            DETAILED ANALYSIS
                        ================================================= */}

                        <div className="analysis-grid">

                            {/* WHAT'S WORKING */}

                            <div className="analysis-card">

                                <div className="analysis-card-header">

                                    <div className="analysis-card-icon positive">
                                        ✓
                                    </div>

                                    <div>
                                        <h3>
                                            What's Working
                                        </h3>

                                        <p>
                                            Your resume's strengths
                                        </p>
                                    </div>

                                </div>


                                <ul className="feedback-list">

                                    {sectionsFound.length > 0 && (
                                        <li>
                                            <span className="feedback-icon">
                                                ✓
                                            </span>

                                            Strong resume structure with{" "}
                                            {sectionsFound.length}{" "}
                                            sections detected
                                        </li>
                                    )}

                                    {skillsFound.length > 0 && (
                                        <li>
                                            <span className="feedback-icon">
                                                ✓
                                            </span>

                                            {skillsFound.length}{" "}
                                            relevant technical skills
                                            detected
                                        </li>
                                    )}

                                    {Number(analysis?.wordCount || 0) >= 200 && (
                                        <li>
                                            <span className="feedback-icon">
                                                ✓
                                            </span>

                                            Good amount of resume content
                                        </li>
                                    )}

                                    {Number(analysis?.contactScore || 0) >= 10 && (
                                        <li>
                                            <span className="feedback-icon">
                                                ✓
                                            </span>

                                            Email and phone number detected
                                        </li>
                                    )}

                                    {sectionsFound.length === 0 &&
                                        skillsFound.length === 0 && (
                                            <li>
                                                <span className="feedback-icon neutral">
                                                    !
                                                </span>

                                                Resume sections could not
                                                be detected clearly
                                            </li>
                                        )}

                                </ul>

                            </div>


                            {/* NEEDS IMPROVEMENT */}

                            <div className="analysis-card">

                                <div className="analysis-card-header">

                                    <div className="analysis-card-icon warning">
                                        !
                                    </div>

                                    <div>
                                        <h3>
                                            Needs Improvement
                                        </h3>

                                        <p>
                                            Areas you should work on
                                        </p>
                                    </div>

                                </div>


                                <ul className="feedback-list warning-list">

                                    {Number(
                                        analysis?.achievementScore || 0
                                    ) < 10 && (
                                        <li>
                                            <span className="feedback-icon warning">
                                                !
                                            </span>

                                            Add more measurable achievements
                                            and numbers
                                        </li>
                                    )}

                                    {Number(
                                        analysis?.skillScore || 0
                                    ) < 10 && (
                                        <li>
                                            <span className="feedback-icon warning">
                                                !
                                            </span>

                                            Include more relevant technical
                                            skills
                                        </li>
                                    )}

                                    {Number(
                                        analysis?.projectScore || 0
                                    ) < 10 && (
                                        <li>
                                            <span className="feedback-icon warning">
                                                !
                                            </span>

                                            Add stronger project descriptions
                                            and outcomes
                                        </li>
                                    )}

                                    {Number(
                                        analysis?.contentScore || 0
                                    ) < 10 && (
                                        <li>
                                            <span className="feedback-icon warning">
                                                !
                                            </span>

                                            Add more relevant resume content
                                        </li>
                                    )}

                                    {Number(
                                        analysis?.sectionScore || 0
                                    ) < 15 && (
                                        <li>
                                            <span className="feedback-icon warning">
                                                !
                                            </span>

                                            Improve your resume section
                                            structure
                                        </li>
                                    )}

                                    {analysis &&
                                        Number(
                                            analysis.achievementScore || 0
                                        ) >= 10 &&
                                        Number(
                                            analysis.skillScore || 0
                                        ) >= 10 &&
                                        Number(
                                            analysis.projectScore || 0
                                        ) >= 10 &&
                                        Number(
                                            analysis.contentScore || 0
                                        ) >= 10 &&
                                        Number(
                                            analysis.sectionScore || 0
                                        ) >= 15 && (
                                            <li>
                                                <span className="feedback-icon">
                                                    ✓
                                                </span>

                                                No major issues detected.
                                                Your resume is well structured.
                                            </li>
                                        )}

                                </ul>

                            </div>

                        </div>


                        {/* =================================================
                            DETECTED SKILLS
                        ================================================= */}

                        <div className="keywords-card">

                            <div className="analysis-card-header">

                                <div className="analysis-card-icon keyword">
                                    🔑
                                </div>

                                <div>
                                    <h3>
                                        Detected Skills
                                    </h3>

                                    <p>
                                        Technical skills found in your resume
                                    </p>
                                </div>

                            </div>


                            <div className="keyword-list">

                                {skillsFound.length > 0 ? (

                                    skillsFound.map(
                                        (skill, index) => (
                                            <span key={index}>
                                                {skill}
                                            </span>
                                        )
                                    )

                                ) : (

                                    <span className="no-keywords">
                                        No technical skills detected
                                    </span>

                                )}

                            </div>

                        </div>


                        {/* =================================================
                            ACTION
                        ================================================= */}

                        <div className="improvement-card">

                            <div className="improvement-icon">
                                🚀
                            </div>

                            <div className="improvement-content">

                                <h3>
                                    Ready to improve your resume?
                                </h3>

                                <p>
                                    Use our Resume Builder to apply these
                                    recommendations and create a stronger,
                                    placement-ready resume.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="builder-button"
                                onClick={() =>
                                    window.location.href =
                                        "/resume-builder"
                                }
                            >
                                Open Resume Builder
                                <span>
                                    →
                                </span>
                            </button>

                        </div>

                    </section>

                )}

            </div>

        </div>
    );
};

export default ResumeAnalyzer;