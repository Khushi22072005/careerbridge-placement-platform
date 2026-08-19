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

        if (!allowedTypes.includes(file.type)) {
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
        const file = event.target.files[0];
        handleFile(file);
    };

    // =====================================================
    // DRAG & DROP
    // =====================================================

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        handleFile(file);
    };

    // =====================================================
    // ANALYZE RESUME
    // =====================================================

    const handleAnalyze = async () => {
        if (!selectedFile) {
            alert("Please upload your resume first.");
            return;
        }

        try {
            setIsAnalyzing(true);

            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login again.");
                return;
            }

            const formData = new FormData();

            // IMPORTANT:
            // This name must match upload.single("resume")
            // in resumeRoutes.js
            formData.append("resume", selectedFile);

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

            const data = await response.json();

            console.log("Resume analysis result:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to analyze resume"
                );
            }

            setResumeScore(
                Number(data.resumeScore) || 0
            );

            setAnalysis(
                data.analysis || null
            );

            setAnalyzed(true);

        } catch (error) {
            console.error(
                "Resume analysis error:",
                error
            );

            alert(
                error.message ||
                "Failed to analyze resume."
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
                        <h1>Resume Analyzer</h1>

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

                        <div>
                            <h2>
                                Analyze Your Resume
                            </h2>

                            <p>
                                Upload your resume to check its ATS
                                compatibility, content quality and
                                overall readiness.
                            </p>
                        </div>

                    </div>


                    {/* =================================================
                        UPLOAD BOX
                    ================================================= */}

                    <div
                        className={`resume-upload-box ${
                            isDragging ? "dragging" : ""
                        }`}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() =>
                            setIsDragging(false)
                        }
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

                                    Browse Files

                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />

                                </label>

                                <span className="upload-note">
                                    Supported formats: PDF, DOC, DOCX ·
                                    Maximum size: 5 MB
                                </span>

                            </>

                        ) : (

                            <div className="uploaded-file">

                                <div className="file-icon">
                                    📄
                                </div>

                                <div className="file-information">

                                    <h3>
                                        {selectedFile.name}
                                    </h3>

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


                    {/* =================================================
                        ANALYZE BUTTON
                    ================================================= */}

                    <div className="upload-actions">

                        <button
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
                                ? "Analyzing..."
                                : "Analyze Resume"}

                        </button>

                    </div>

                </section>


                {/* =================================================
                    QUICK CHECKS
                ================================================= */}

                <section className="quick-checks">

                    <div className="quick-check">

                        <div className="quick-icon">
                            🎯
                        </div>

                        <div>
                            <h3>
                                ATS Compatibility
                            </h3>

                            <p>
                                Check whether your resume is easy
                                for ATS systems to read.
                            </p>
                        </div>

                    </div>


                    <div className="quick-check">

                        <div className="quick-icon">
                            🔑
                        </div>

                        <div>
                            <h3>
                                Keyword Match
                            </h3>

                            <p>
                                Identify important skills and
                                keywords in your resume.
                            </p>
                        </div>

                    </div>


                    <div className="quick-check">

                        <div className="quick-icon">
                            📊
                        </div>

                        <div>
                            <h3>
                                Resume Quality
                            </h3>

                            <p>
                                Review your resume structure,
                                content and formatting.
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

                                <h2>
                                    Resume Analysis
                                </h2>

                                <p>
                                    Here's how your resume performs
                                    across important hiring criteria.
                                </p>

                            </div>

                            <span className="analysis-status">
                                Analysis Complete
                            </span>

                        </div>


                        {/* =================================================
                            SCORE OVERVIEW
                        ================================================= */}

                        <div className="score-overview">

                            {/* MAIN SCORE */}

                            <div className="score-card main-score">

                                <div className="score-circle">

                                    <div>

                                        <strong>
                                            {resumeScore}
                                        </strong>

                                        <span>
                                            /100
                                        </span>

                                    </div>

                                </div>


                                <div className="score-details">

                                    <h3>
                                        {getResumeTitle()}
                                    </h3>

                                    <p>
                                        {getResumeDescription()}
                                    </p>

                                    <span className="score-label">
                                        Overall Resume Score
                                    </span>

                                </div>

                            </div>


                            {/* ATS SCORE */}

                            <div className="score-card">

                                <div className="mini-score-icon">
                                    🎯
                                </div>

                                <div>

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

                            <div className="score-card">

                                <div className="mini-score-icon">
                                    🔑
                                </div>

                                <div>

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

                                    {analysis?.sectionsFound?.length > 0 && (
                                        <li>
                                            <span>✓</span>
                                            Strong resume structure with{" "}
                                            {analysis.sectionsFound.length}{" "}
                                            sections detected
                                        </li>
                                    )}

                                    {analysis?.skillsFound?.length > 0 && (
                                        <li>
                                            <span>✓</span>
                                            {analysis.skillsFound.length}{" "}
                                            relevant technical skills detected
                                        </li>
                                    )}

                                    {analysis?.wordCount >= 200 && (
                                        <li>
                                            <span>✓</span>
                                            Good amount of resume content
                                        </li>
                                    )}

                                    {analysis?.contactScore >= 10 && (
                                        <li>
                                            <span>✓</span>
                                            Email and phone number detected
                                        </li>
                                    )}

                                    {analysis?.sectionsFound?.length === 0 && (
                                        <li>
                                            <span>!</span>
                                            Resume sections could not be
                                            detected clearly
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

                                    {analysis?.achievementScore < 10 && (
                                        <li>
                                            <span>!</span>
                                            Add more measurable achievements
                                            and numbers
                                        </li>
                                    )}

                                    {analysis?.skillScore < 10 && (
                                        <li>
                                            <span>!</span>
                                            Include more relevant technical
                                            skills
                                        </li>
                                    )}

                                    {analysis?.projectScore < 10 && (
                                        <li>
                                            <span>!</span>
                                            Add stronger project descriptions
                                            and outcomes
                                        </li>
                                    )}

                                    {analysis?.contentScore < 10 && (
                                        <li>
                                            <span>!</span>
                                            Add more relevant resume content
                                        </li>
                                    )}

                                    {analysis?.sectionScore < 15 && (
                                        <li>
                                            <span>!</span>
                                            Improve your resume section
                                            structure
                                        </li>
                                    )}

                                    {analysis &&
                                        analysis.achievementScore >= 10 &&
                                        analysis.skillScore >= 10 &&
                                        analysis.projectScore >= 10 &&
                                        analysis.contentScore >= 10 &&
                                        analysis.sectionScore >= 15 && (
                                            <li>
                                                <span>✓</span>
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

                                {analysis?.skillsFound?.length > 0 ? (

                                    analysis.skillsFound.map(
                                        (skill, index) => (
                                            <span key={index}>
                                                {skill}
                                            </span>
                                        )
                                    )

                                ) : (

                                    <span>
                                        No technical skills detected
                                    </span>

                                )}

                            </div>

                        </div>


                        {/* =================================================
                            ACTION
                        ================================================= */}

                        <div className="improvement-card">

                            <div>

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
                                className="builder-button"
                                onClick={() =>
                                    window.location.href =
                                        "/resume-builder"
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