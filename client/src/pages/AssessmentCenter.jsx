

import { useNavigate } from "react-router-dom";
import "./AssessmentCenter.css";

function AssessmentCenter() {
    const navigate = useNavigate();

    return (
        <div className="assessment-center">
            <header className="assessment-center-header">
                <span className="assessment-center-eyebrow">
                    CAREERBRIDGE • PRACTICE CENTER
                </span>

                <h1>Assessments</h1>

                <p>
                    Test your technical knowledge, reasoning skills,
                    and programming abilities. Choose an assessment
                    to begin your practice.
                </p>
            </header>

            <div className="assessment-center-grid">
                {/* TECHNICAL ASSESSMENT */}

                <article className="assessment-center-card">
                    <span className="assessment-center-tag">
                        TECHNICAL SKILLS
                    </span>

                    <h2>Technical Assessment</h2>

                    <p>
                        Assess your knowledge of role-specific concepts,
                        technical subjects, and professional skills.
                    </p>

                    <ul>
                        <li>Role-based technical questions</li>
                        <li>Skill-focused practice</li>
                        <li>Independent assessment results</li>
                    </ul>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/technical-assessment")
                        }
                    >
                        Start Technical Assessment →
                    </button>
                </article>

                {/* APTITUDE ASSESSMENT */}

                <article className="assessment-center-card">
                    <span className="assessment-center-tag">
                        REASONING SKILLS
                    </span>

                    <h2>Aptitude Assessment</h2>

                    <p>
                        Improve your reasoning ability through focused
                        aptitude tests designed for placement preparation.
                    </p>

                    <ul>
                        <li>Numerical Reasoning</li>
                        <li>Logical and Verbal Reasoning</li>
                        <li>Analytical Reasoning</li>
                    </ul>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/aptitude-practice")
                        }
                    >
                        Start Aptitude Assessment →
                    </button>
                </article>

                {/* CODING ASSESSMENT */}

                <article className="assessment-center-card">
                    <span className="assessment-center-tag">
                        PROGRAMMING SKILLS
                    </span>

                    <h2>Coding Assessment</h2>

                    <p>
                        Practice coding problems to improve your
                        problem-solving skills and prepare for
                        technical placement interviews.
                    </p>

                    <ul>
                        <li>Easy, Medium, and Hard problems</li>
                        <li>Online code editor and test cases</li>
                        <li>Run code and submit solutions</li>
                        <li>Track your coding progress</li>
                    </ul>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/coding-assessment")
                        }
                    >
                        Start Coding Assessment →
                    </button>
                </article>
            </div>
        </div>
    );
}

export default AssessmentCenter;
