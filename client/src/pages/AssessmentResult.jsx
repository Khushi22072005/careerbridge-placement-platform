
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AssessmentResult.css";

const ROLE_TITLES = {
  "software-developer": "Software Developer",
  "data-analyst": "Data Analyst",
  cybersecurity: "Cybersecurity Analyst",
  "cloud-devops": "Cloud / DevOps Engineer",
  "ui-ux": "UI/UX Designer",
};

const getRoleTitle = (role, backendTitle) => {
  if (backendTitle) return backendTitle;
  if (!role) return "Technical";

  return (
    ROLE_TITLES[role] ||
    role
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};

const getNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getScore = (result) => {
  if (!result) return 0;

  const value =
    result.percentage ??
    result.overallPercentage ??
    result.scorePercentage ??
    result.accuracy ??
    result.score;

  if (value !== undefined && value !== null && value !== "") {
    const score = Number(value);

    if (Number.isFinite(score)) {
      return Math.max(0, Math.min(100, Math.round(score)));
    }
  }

  const correct = getNumber(
    result.correctAnswers ?? result.correct,
    0
  );

  const total = getNumber(
    result.totalQuestions ?? result.total,
    0
  );

  return total > 0
    ? Math.round((correct / total) * 100)
    : 0;
};

const getSavedResult = () => {
  const keysToCheck = [
    ["session", "assessmentResult"],
    ["local", "assessmentResult"],
    ["local", "technicalAssessmentResult"],
  ];

  for (const [storageType, key] of keysToCheck) {
    const storage =
      storageType === "session" ? sessionStorage : localStorage;

    const stored = storage.getItem(key);

    if (!stored) continue;

    try {
      const parsed = JSON.parse(stored);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        continue;
      }

      const savedResult =
        parsed.result &&
        typeof parsed.result === "object" &&
        !Array.isArray(parsed.result)
          ? parsed.result
          : parsed;

      // Preserve answer details stored beside the result.
     
const answers = [
  savedResult.evaluatedQuestions,
  savedResult.answers,
  savedResult.answerDetails,
  savedResult.questionResults,
  savedResult.questions,
  parsed.evaluatedQuestions,
  parsed.answers,
  parsed.answerDetails,
  parsed.questionResults,
  parsed.questions,
].find(
  (item) => Array.isArray(item) && item.length > 0
) || [];


      return {
        ...savedResult,
        answers,
      };
    } catch (error) {
      console.error(`Could not parse ${key}:`, error);
    }
  }

  return null;
};

const formatCompletedDate = (dateValue) => {
  if (!dateValue) return "Date not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getPerformanceMessage = (score) => {
  if (score >= 90) {
    return "You answered most questions correctly in this attempt. Keep practising to maintain your understanding.";
  }

  if (score >= 75) {
    return "You answered a large share of the questions correctly. Continued practice can help reinforce your knowledge.";
  }

  if (score >= 60) {
    return "Your answers show some understanding of the assessed material. Reviewing the questions you missed may help you prepare for another attempt.";
  }

  if (score >= 40) {
    return "This attempt indicates that there are several questions to revisit. Review the relevant learning material and consider retaking the assessment.";
  }

  return "";
};

const getAnswerDetails = (answer) => {
  const selected =
    answer.selectedAnswer ??
    answer.selected_answer ??
    answer.selectedOption ??
    answer.selected_option ??
    answer.userAnswer ??
    answer.user_answer;

  const correct =
    answer.correctAnswer ??
    answer.correct_answer ??
    answer.correctOption ??
    answer.correct_option ??
    answer.answerKey ??
    answer.answer_key;

  let isCorrect = null;

  if (typeof answer.isCorrect === "boolean") {
    isCorrect = answer.isCorrect;
  } else if (typeof answer.is_correct === "boolean") {
    isCorrect = answer.is_correct;
  } else if (
    selected !== undefined &&
    selected !== null &&
    correct !== undefined &&
    correct !== null
  ) {
    isCorrect =
      String(selected).trim().toLowerCase() ===
      String(correct).trim().toLowerCase();
  }

  return { selected, correct, isCorrect };
};

const getOptionText = (answer, value) => {
  if (value === undefined || value === null || value === "") {
    return "Not answered";
  }

  const options = {
    A: answer.optionA ?? answer.option_a,
    B: answer.optionB ?? answer.option_b,
    C: answer.optionC ?? answer.option_c,
    D: answer.optionD ?? answer.option_d,
  };

  const normalized = String(value).trim();
  const letter = normalized.toUpperCase();

  if (
    options[letter] !== undefined &&
    options[letter] !== null &&
    options[letter] !== ""
  ) {
    return `${letter}. ${options[letter]}`;
  }

  return normalized;
};

function AssessmentResult() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answersOpen, setAnswersOpen] = useState(false);
  const [storedRole, setStoredRole] = useState("");
  const [storedSkill, setStoredSkill] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = getSavedResult();

      const role =
        localStorage.getItem("selectedRole") ||
        localStorage.getItem("selectedCareerRole") ||
        "";

      const skill =
        localStorage.getItem("selectedSkill") ||
        localStorage.getItem("selectedCareerSkill") ||
        "";

      setStoredRole(role);
      setStoredSkill(skill);

      if (saved) {
        setResult(saved);
        setAnswers(saved.answers || []);

        console.log("Assessment result loaded:", saved);
        console.log("Assessment answers loaded:", saved.answers || []);
      } else {
        console.warn("No saved assessment result found.");
      }
    } catch (error) {
      console.error("Unable to load assessment result:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const role = result?.role || storedRole;
  const skill = result?.skill || storedSkill;

  const roleTitle = useMemo(
    () => getRoleTitle(role, result?.roleTitle || result?.roleName),
    [role, result?.roleTitle, result?.roleName]
  );

  const score = useMemo(() => getScore(result), [result]);

  const totalQuestions = Math.max(
    0,
    getNumber(result?.totalQuestions ?? result?.total, 20)
  );

  const correctAnswers = Math.max(
    0,
    getNumber(result?.correctAnswers ?? result?.correct, 0)
  );

  const incorrectAnswers = Math.max(
    0,
    getNumber(
      result?.incorrectAnswers ?? result?.incorrect,
      totalQuestions - correctAnswers
    )
  );

  const completedAt = formatCompletedDate(
    result?.completedAt ?? result?.completed_at
  );

  const performance =
    result?.performanceLevel ||
    result?.performance ||
    (score >= 90
      ? "Excellent"
      : score >= 75
      ? "Very Good"
      : score >= 60
      ? "Good"
      : score >= 40
      ? "Needs Improvement"
      : "Needs Attention");

  const correctWidth =
    totalQuestions > 0
      ? `${(correctAnswers / totalQuestions) * 100}%`
      : "0%";

  const incorrectWidth =
    totalQuestions > 0
      ? `${(incorrectAnswers / totalQuestions) * 100}%`
      : "0%";

  const handleRetake = () => {
    sessionStorage.removeItem("assessmentResult");
    localStorage.removeItem("assessmentResult");
    localStorage.removeItem("technicalAssessmentResult");

    navigate("/career-assessment");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleCareerRoadmap = () => {
    navigate("/career-roadmap");
  };

  if (loading) {
    return (
      <div className="result-page">
        <div className="result-loading">
          <div className="result-spinner" />
          <h2>Preparing your result...</h2>
          <p>Please wait while your assessment report loads.</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-page">
        <header className="result-header">
          <button
            type="button"
            className="result-dashboard-link"
            onClick={handleDashboard}
          >
            ← Dashboard
          </button>

          <div className="result-brand">
            
            <div>
              <strong>CareerBridge</strong>
              <span>Assessment Report</span>
            </div>
          </div>
        </header>

        <main className="result-empty">
          <div className="empty-icon">!</div>
          <h1>Assessment Result Not Found</h1>
          <p>
            We could not find a saved result for this attempt.
            Please complete the assessment again to generate
            your report.
          </p>

          <button
            type="button"
            className="primary-result-button"
            onClick={handleRetake}
          >
            Start Assessment
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="result-page">
      <header className="result-header">
        <button
          type="button"
          className="result-dashboard-link"
          onClick={handleDashboard}
        >
          ← Dashboard
        </button>

        <div className="result-brand">
          
          <div>
            <strong>CareerBridge</strong>
            <span>Assessment Report</span>
          </div>
        </div>
      </header>

      <main className="result-main">
        {/* REPORT INTRO */}
        <section className="result-intro">
          <p className="result-intro-label">ASSESSMENT REPORT</p>
          
          <p>
            Review your score and answer summary for the completed
            assessment.
          </p>
        </section>

        {/* ASSESSMENT SUMMARY */}
        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon"></div>
            <div>
              <h2>Assessment Summary</h2>
              
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-card">
              <span>Career Role</span>
              <strong>{roleTitle}</strong>
            </div>

            <div className="overview-card">
              <span>Skill Assessed</span>
              <strong>{skill || "Not specified"}</strong>
            </div>

            <div className="overview-card">
              <span>Total Questions</span>
              <strong>{totalQuestions}</strong>
            </div>

            <div className="overview-card">
              <span>Completed On</span>
              <strong>{completedAt}</strong>
            </div>
          </div>
        </section>

        {/* OVERALL SCORE */}
        <section className="result-score-card">
          <div className="score-circle-wrapper">
            <div
              className="score-circle"
              style={{ "--score": `${score}%` }}
              role="img"
              aria-label={`Overall score: ${score}%`}
            >
              <div className="score-circle-inner">
                <strong>{score}%</strong>
                <span>Overall Score</span>
              </div>
            </div>
          </div>

          <div className="score-content">
            <p className="score-small-label">
              ASSESSMENT PERFORMANCE
            </p>
            <h2>{performance}</h2>
            <p>{getPerformanceMessage(score)}</p>

            <div className="score-mini-stats">
              <div>
                <strong>{correctAnswers}</strong>
                <span>Correct</span>
              </div>

              <div>
                <strong>{incorrectAnswers}</strong>
                <span>Incorrect</span>
              </div>

              <div>
                <strong>{totalQuestions}</strong>
                <span>Total</span>
              </div>
            </div>
          </div>
        </section>

        {/* ANSWER BREAKDOWN */}
        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon"></div>
            <div>
              <h2>Answer Breakdown</h2>
              
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-card">
              <span>Correct Answers</span>
              <strong>{correctAnswers}</strong>
            </div>

            <div className="overview-card">
              <span>Incorrect Answers</span>
              <strong>{incorrectAnswers}</strong>
            </div>
          </div>

          <div className="answer-progress-bar">
            <div
              className="answer-progress-correct"
              style={{ width: correctWidth }}
            />
            <div
              className="answer-progress-incorrect"
              style={{ width: incorrectWidth }}
            />
          </div>

          <div className="answer-progress-legend">
            <span>
              <i className="legend-dot correct-dot" />
              Correct: {correctAnswers}
            </span>

            <span>
              <i className="legend-dot incorrect-dot" />
              Incorrect: {incorrectAnswers}
            </span>
          </div>

          {/* COLLAPSIBLE ANSWER REVIEW */}
          <div className="answer-review">
            <button
              type="button"
              className="answer-review-toggle"
              onClick={() =>
                setAnswersOpen((previous) => !previous)
              }
              aria-expanded={answersOpen}
            >
              <span className="answer-review-title">
                <span className="answer-review-icon"></span>

                <span>
                  <strong>Review Your Answers</strong>
                  <small>
                    View questions, your answers, and correct answers
                  </small>
                </span>
              </span>

              <span
                className={`answer-review-chevron ${
                  answersOpen ? "is-open" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {answersOpen && (
              <div className="answer-review-content">
                {answers.length === 0 ? (
                  <div className="answer-review-empty">
                    <strong>
                      Individual answer details are not available.
                    </strong>
                    <p>
                      Your score summary is available, but the saved
                      result does not contain the individual questions
                      and answers. The technical assessment API must
                      return those details to display them here.
                    </p>
                  </div>
                ) : (
                  <div className="answer-review-list">
                    {answers.map((answer, index) => {
                      const {
                        selected,
                        correct,
                        isCorrect,
                      } = getAnswerDetails(answer);

                      return (
                        <article
                          key={
                            answer.questionId ??
                            answer.question_id ??
                            index
                          }
                          className={`answer-review-card ${
                            isCorrect === true
                              ? "answer-review-correct"
                              : isCorrect === false
                              ? "answer-review-incorrect"
                              : ""
                          }`}
                        >
                          <div className="answer-review-card-heading">
                            <span>Question {index + 1}</span>

                            <span
                              className={`answer-review-status ${
                                isCorrect === true
                                  ? "status-correct"
                                  : isCorrect === false
                                  ? "status-incorrect"
                                  : "status-unknown"
                              }`}
                            >
                              {isCorrect === true
                                ? "✓ Correct"
                                : isCorrect === false
                                ? "✕ Incorrect"
                                : "Unverified"}
                            </span>
                          </div>

                          <h3>
                            {answer.question ??
                              answer.questionText ??
                              answer.question_text ??
                              `Question ${index + 1}`}
                          </h3>

                          <div className="answer-review-detail">
                            <span>Your Answer</span>
                            <strong>
                              {getOptionText(answer, selected)}
                            </strong>
                          </div>

                          <div className="answer-review-detail correct-answer-detail">
                            <span>Correct Answer</span>
                            <strong>
                              {getOptionText(answer, correct)}
                            </strong>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SCORE INTERPRETATION */}
        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon"></div>
            <div>
              <h2>Score Interpretation</h2>
             
            </div>
          </div>

          <div className="skill-placeholder">
            <strong>{performance}</strong>
            <span>
              You scored {score}% by answering {correctAnswers} out
              of {totalQuestions} questions correctly. This result
              reflects your performance on this assessment attempt
              only. It is not a complete measure of your overall
              ability or career readiness.
            </span>
          </div>
        </section>

        {/* NEXT STEPS */}
        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon"></div>
            <div>
              <h2>What You Can Do Next</h2>
             
            </div>
          </div>

          <div className="improve-grid">
            <div className="improve-card">
              <div className="improve-icon-circle">1</div>
              <div>
                <strong>Review the assessed skill</strong>
                <p>
                  Revisit the learning material for{" "}
                  {skill || "this skill"} and practise questions
                  related to the assessment.
                </p>
              </div>
            </div>

            <div className="improve-card">
              <div className="improve-icon-circle">2</div>
              <div>
                <strong>Continue your career preparation</strong>
                <p>
                  Explore your career roadmap and keep working
                  toward your learning goals.
                </p>
              </div>
            </div>

            <div className="improve-card">
              <div className="improve-icon-circle">3</div>
              <div>
                <strong>Retake when you are ready</strong>
                <p>
                  After practising, take the assessment again to
                  review your performance on a new attempt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <div className="result-actions">
          <button
            type="button"
            className="secondary-result-button"
            onClick={handleRetake}
          >
            Retake Assessment
          </button>

          <button
            type="button"
            className="secondary-result-button roadmap-button"
            onClick={handleCareerRoadmap}
          >
            View Career Roadmap
          </button>

          <button
            type="button"
            className="primary-result-button"
            onClick={handleDashboard}
          >
            Back to Dashboard →
          </button>
        </div>

        <p className="result-footer">
          This report is based on the answers submitted for this
          assessment attempt.
        </p>
      </main>
    </div>
  );
}

export default AssessmentResult;
