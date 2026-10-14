
import React, { useState } from "react";
import "./ResumeAnalyzer.css";

const API_URL = "http://localhost:5000/api/resume/analyze";

export default function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        setError("");
        setResult(null);

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const extension = selectedFile.name
            .split(".")
            .pop()
            .toLowerCase();

        if (!["pdf", "docx"].includes(extension)) {
            setError("Please upload a PDF or DOCX resume.");
            setFile(null);
            event.target.value = "";
            return;
        }

        setFile(selectedFile);
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError("Please choose a resume first.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("resume", file);

            const token = localStorage.getItem("token");

            const response = await fetch(API_URL, {
                method: "POST",
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {},
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to analyze this resume."
                );
            }

            if (!data.analysis) {
                throw new Error("The server returned an invalid analysis.");
            }

            setResult(data);
        } catch (err) {
            setError(
                err.message ||
                "Unable to analyze the resume. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const analysis = result?.analysis;

    const skills = analysis?.skillsFound || [];
    const sections = analysis?.sectionsFound || [];
    const strengths = analysis?.strengths || [];
    const improvements = analysis?.improvements || [];

    return (
        <main className="ra-page">
            <header className="ra-header">
                <div>
                    <p className="ra-eyebrow">CAREERBRIDGE · CAREER TOOLS</p>
                    <h1>Resume Analyzer</h1>
                    <p className="ra-subtitle">
                        Check your resume quality and discover areas to improve
                        before applying for opportunities.
                    </p>
                </div>
            </header>

            <section className="ra-card">
                <div className="ra-step">
                    <span>01</span>
                    <div>
                        <h2>Upload your resume</h2>
                        <p>Supported formats: PDF and DOCX</p>
                    </div>
                </div>

                <label className="ra-upload" htmlFor="resume-file">
                    <span className="ra-upload-icon">↑</span>
                    <strong>
                        {file ? file.name : "Choose your resume"}
                    </strong>
                    <span>
                        {file
                            ? `${(file.size / 1024).toFixed(1)} KB · Ready to analyze`
                            : "Select a PDF or DOCX file from your device"}
                    </span>
                    <span className="ra-browse">
                        {file ? "Choose a different file" : "Browse files"}
                    </span>
                    <input
                        id="resume-file"
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                    />
                </label>

                {error && (
                    <div className="ra-error" role="alert">
                        <strong>!</strong>
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="button"
                    className="ra-button"
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                >
                    {loading ? "Analyzing resume..." : "Analyze Resume →"}
                </button>

                <p className="ra-note">
                    Upload a text-based PDF or DOCX for best results.
                </p>
            </section>

            {analysis && (
                <section className="ra-results">
                    <div className="ra-results-heading">
                        <div>
                            <p className="ra-eyebrow">YOUR RESULTS</p>
                            <h2>Resume analysis</h2>
                            <p>
                                {result.message ||
                                    "Your resume analysis is complete."}
                            </p>
                        </div>
                        <span className="ra-file-name">
                            {file?.name}
                        </span>
                    </div>

                    <div className="ra-score-card">
                        <div className="ra-score-circle">
                            <strong>
                                {analysis.resumeScore ?? analysis.score ?? 0}
                            </strong>
                            <span>/100</span>
                        </div>
                        <div>
                            <h3>Resume Quality Score</h3>
                            <p>
                                This score reflects the content and structure
                                detected in your resume. It is a guideline,
                                not a guarantee of selection.
                            </p>
                        </div>
                    </div>

                    <div className="ra-result-grid">
                        <article className="ra-result-card">
                            <h3>Skills detected</h3>
                            {skills.length ? (
                                <div className="ra-chips">
                                    {skills.map((skill, index) => (
                                        <span key={`${skill}-${index}`}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p>No common skills were detected.</p>
                            )}
                        </article>

                        <article className="ra-result-card">
                            <h3>Resume sections</h3>
                            {sections.length ? (
                                <ul className="ra-list">
                                    {sections.map((section, index) => (
                                        <li key={`${section}-${index}`}>
                                            <span>{section}</span>
                                            <span className="ra-check">✓</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No standard sections were detected.</p>
                            )}
                        </article>

                        <article className="ra-result-card">
                            <h3>Strengths</h3>
                            {strengths.length ? (
                                <ul className="ra-bullet-list">
                                    {strengths.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Review the suggestions to improve your resume.</p>
                            )}
                        </article>

                        <article className="ra-result-card">
                            <h3>Suggestions for improvement</h3>
                            {improvements.length ? (
                                <ul className="ra-bullet-list">
                                    {improvements.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No additional suggestions were returned.</p>
                            )}
                        </article>
                    </div>

                    <button
                        className="ra-secondary-button"
                        type="button"
                        onClick={() => {
                            setFile(null);
                            setResult(null);
                            setError("");
                            const input = document.getElementById("resume-file");
                            if (input) input.value = "";
                        }}
                    >
                        Analyze another resume
                    </button>
                </section>
            )}
        </main>
    );
}

