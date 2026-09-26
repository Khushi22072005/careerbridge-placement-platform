import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AssessmentResult.css";

/* =====================================================
   ROLE TITLES
===================================================== */

const ROLE_TITLES = {
  "software-developer": "Software Developer",
  "data-analyst": "Data Analyst",
  cybersecurity: "Cybersecurity Analyst",
  "cloud-devops": "Cloud / DevOps Engineer",
  "ui-ux": "UI/UX Designer",
};

/* =====================================================
   HELPERS
===================================================== */

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

/*
 * The updated backend returns:
 * total, correct, incorrect, score
 *
 * score is treated as a percentage when it is between
 * 0 and 100. If it is missing, calculate it from counts.
 */
const getScore = (result) => {
  if (!result) return 0;

  const scoreValue =
    result.percentage ??
    result.overallPercentage ??
    result.scorePercentage ??
    result.accuracy ??
    result.score;

  if (
    scoreValue !== undefined &&
    scoreValue !== null &&
    scoreValue !== ""
  ) {
    const score = Number(scoreValue);

    if (Number.isFinite(score) && score >= 0 && score <= 100) {
      return Math.round(score);
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

  if (total > 0) {
    return Math.round((correct / total) * 100);
  }

  return 0;
};

const getCorrectAnswers = (result) => {
  return getNumber(
    result?.correctAnswers ?? result?.correct,
    0
  );
};

const getTotalQuestions = (result) => {
  const total = getNumber(
    result?.totalQuestions ?? result?.total,
    0
  );

  return total > 0 ? total : 20;
};

const getIncorrectAnswers = (result, total, correct) => {
  const backendIncorrect =
    result?.incorrectAnswers ?? result?.incorrect;

  if (
    backendIncorrect !== undefined &&
    backendIncorrect !== null &&
    Number.isFinite(Number(backendIncorrect))
  ) {
    return Math.max(0, Number(backendIncorrect));
  }

  return Math.max(0, total - correct);
};

const getPerformanceLabel = (result, score) => {
  if (result?.performanceLevel) {
    return result.performanceLevel;
  }

  if (score >= 90) return "Excellent";
  if (score >= 75) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Improvement";

  return "Needs Attention";
};

const getPerformanceMessage = (score, roleTitle, skill) => {
  const focus = skill
    ? `${skill} for the ${roleTitle} role`
    : `the ${roleTitle} role`;

  if (score >= 90) {
    return `Your result shows a high score in this assessment of ${focus}.`;
  }

  if (score >= 75) {
    return `Your result shows a solid score in this assessment of ${focus}.`;
  }

  if (score >= 60) {
    return `Your result shows some knowledge of ${focus}, with topics you can continue to practise.`;
  }

  if (score >= 40) {
    return `Your result suggests revisiting some fundamentals in ${focus}.`;
  }

  return `Use this result to identify topics in ${focus} that you may want to review and practise.`;
};

const normalizeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

/* =====================================================
   CATEGORY NORMALIZER
===================================================== */

const getCategoryPerformance = (result) => {
  const possibleData =
    result?.categoryResults ??
    result?.categoryPerformance ??
    result?.categoryScores ??
    result?.categories ??
    result?.skillPerformance;

  if (Array.isArray(possibleData)) {
    return possibleData.map((item, index) => {
      const category =
        item?.category ??
        item?.name ??
        item?.title ??
        `Skill ${index + 1}`;

      const correct = getNumber(
        item?.correctAnswers ?? item?.correct ?? item?.right,
        0
      );

      const total = getNumber(
        item?.totalQuestions ?? item?.total ?? item?.questions,
        0
      );

      let score = Number(
        item?.score ?? item?.percentage ?? item?.accuracy
      );

      if (!Number.isFinite(score) && total > 0) {
        score = (correct / total) * 100;
      }

      if (!Number.isFinite(score)) {
        score = 0;
      }

      return {
        category,
        correct,
        total,
        score: Math.max(0, Math.min(100, score)),
      };
    });
  }

  if (possibleData && typeof possibleData === "object") {
    return Object.entries(possibleData).map(
      ([category, value]) => {
        if (value && typeof value === "object") {
          const correct = getNumber(
            value.correctAnswers ?? value.correct ?? value.right,
            0
          );

          const total = getNumber(
            value.totalQuestions ?? value.total ?? value.questions,
            0
          );

          let score = Number(
            value.score ?? value.percentage ?? value.accuracy
          );

          if (!Number.isFinite(score) && total > 0) {
            score = (correct / total) * 100;
          }

          if (!Number.isFinite(score)) {
            score = 0;
          }

          return {
            category: value.category ?? value.name ?? category,
            correct,
            total,
            score: Math.max(0, Math.min(100, score)),
          };
        }

        const numericValue = Number(value);

        return {
          category,
          correct: 0,
          total: 0,
          score: Number.isFinite(numericValue)
            ? Math.max(0, Math.min(100, numericValue))
            : 0,
        };
      }
    );
  }

  return [];
};

/* =====================================================
   STRENGTHS AND IMPROVEMENT AREAS
===================================================== */

const normalizeTextItems = (items, fallbackTitle) => {
  return normalizeArray(items).map((item) => {
    if (typeof item === "string") {
      return {
        title: item,
        description: "",
      };
    }

    return {
      title:
        item?.title ??
        item?.name ??
        item?.category ??
        fallbackTitle,
      description:
        item?.description ??
        item?.details ??
        "",
    };
  });
};

const deriveStrengths = (categoryPerformance) => {
  return categoryPerformance
    .filter((item) => item.score >= 75)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => ({
      title: item.category,
      description:
        item.total > 0
          ? `${item.correct} out of ${item.total} questions were answered correctly in this area.`
          : `Assessment score in this area: ${Math.round(item.score)}%.`,
    }));
};

const deriveImprovementAreas = (categoryPerformance) => {
  return categoryPerformance
    .filter((item) => item.score < 75)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((item) => ({
      title: item.category,
      description:
        item.total > 0
          ? `${item.correct} out of ${item.total} questions were answered correctly in this area. Consider reviewing this topic.`
          : `Consider reviewing this topic and practising related questions.`,
    }));
};

/* =====================================================
   COMPONENT
===================================================== */

function AssessmentResult() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [storedRole, setStoredRole] = useState("");
  const [storedSkill, setStoredSkill] = useState("");
  const [loading, setLoading] = useState(true);

  const [showCategoryAnalysis, setShowCategoryAnalysis] =
    useState(false);

  /* =================================================
     LOAD RESULT
  ================================================= */

  useEffect(() => {
    try {
      /*
       * Updated TechnicalAssessment.jsx saves its response
       * in localStorage using this key.
       */
      const savedResult = localStorage.getItem(
        "technicalAssessmentResult"
      );

      const savedRole =
        localStorage.getItem("selectedCareerRole") || "";

      const savedSkill =
        localStorage.getItem("selectedCareerSkill") || "";

      if (savedRole) setStoredRole(savedRole);
      if (savedSkill) setStoredSkill(savedSkill);

      if (savedResult) {
        const parsedResult = JSON.parse(savedResult);

        if (
          parsedResult &&
          typeof parsedResult === "object" &&
          !Array.isArray(parsedResult)
        ) {
          setResult(parsedResult);
        }
      }
    } catch (error) {
      console.error("Unable to load assessment result:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =================================================
     RESULT DETAILS
  ================================================= */

  const role = result?.role || storedRole;
  const skill = result?.skill || storedSkill;

  const roleTitle = useMemo(
    () => getRoleTitle(role, result?.roleTitle),
    [role, result?.roleTitle]
  );

  const score = useMemo(
    () => getScore(result),
    [result]
  );

  const correctAnswers = useMemo(
    () => getCorrectAnswers(result),
    [result]
  );

  const totalQuestions = useMemo(
    () => getTotalQuestions(result),
    [result]
  );

  const incorrectAnswers = useMemo(
    () =>
      getIncorrectAnswers(
        result,
        totalQuestions,
        correctAnswers
      ),
    [result, totalQuestions, correctAnswers]
  );

  const performance = useMemo(
    () => getPerformanceLabel(result, score),
    [result, score]
  );

  const performanceMessage = useMemo(
    () => getPerformanceMessage(score, roleTitle, skill),
    [score, roleTitle, skill]
  );

  /* =================================================
     CATEGORY PERFORMANCE
  ================================================= */

  const categoryPerformance = useMemo(
    () => getCategoryPerformance(result),
    [result]
  );

  /* =================================================
     STRENGTHS
  ================================================= */

  const strengths = useMemo(() => {
    const backendStrengths =
      result?.strengths ??
      result?.strongAreas ??
      result?.strengthsList;

    const normalized = normalizeTextItems(
      backendStrengths,
      "Technical Strength"
    );

    if (normalized.length > 0) {
      return normalized;
    }

    return deriveStrengths(categoryPerformance);
  }, [result, categoryPerformance]);

  /* =================================================
     AREAS TO IMPROVE
  ================================================= */

  const areasToImprove = useMemo(() => {
    const backendAreas =
      result?.areasToImprove ??
      result?.weakAreas ??
      result?.improvements ??
      result?.weaknesses;

    const normalized = normalizeTextItems(
      backendAreas,
      "Continue Skill Development"
    );

    if (normalized.length > 0) {
      return normalized;
    }

    return deriveImprovementAreas(categoryPerformance);
  }, [result, categoryPerformance]);

  /* =================================================
     NAVIGATION
  ================================================= */

  const handleRetake = () => {
    localStorage.removeItem("technicalAssessmentResult");

    navigate("/career-assessment");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleCareerRoadmap = () => {
    navigate("/career-roadmap");
  };

  /* =================================================
     LOADING
  ================================================= */

  if (loading) {
    return (
      <div className="result-page">
        <div className="result-loading">
          <div className="result-spinner"></div>

          <h2>Preparing your result...</h2>

          <p>
            Please wait while we prepare your assessment report.
          </p>
        </div>
      </div>
    );
  }

  /* =================================================
     NO RESULT
  ================================================= */

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
            <div className="result-brand-logo">C</div>

            <div>
              <strong>CareerBridge</strong>
              <span>Technical Assessment</span>
            </div>
          </div>
        </header>

        <main className="result-empty">
          <div className="empty-icon">!</div>

          <h1>Assessment Result Not Found</h1>

          <p>
            Your assessment result is not available. Please complete
            the assessment again.
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

  /* =================================================
     MAIN RESULT
  ================================================= */

  return (
    <div className="result-page">
      {/* HEADER */}

      <header className="result-header">
        <button
          type="button"
          className="result-dashboard-link"
          onClick={handleDashboard}
        >
          ← Dashboard
        </button>

        <div className="result-brand">
          <div className="result-brand-logo">C</div>

          <div>
            <strong>CareerBridge</strong>
            <span>Technical Assessment</span>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="result-main">
        {/* INTRO */}

        <section className="result-intro">
          <p className="result-intro-label">
            ASSESSMENT COMPLETE
          </p>

          <h1>
            Your {roleTitle} Assessment Result
          </h1>

          <p>
            {skill
              ? `Here is your assessment result for ${skill}, including your score and topic-level performance.`
              : "Here is your technical assessment result, including your score and topic-level performance."}
          </p>
        </section>

        {/* SCORE CARD */}

        <section className="result-score-card">
          <div className="score-circle-wrapper">
            <div
              className="score-circle"
              style={{
                "--score": `${score}%`,
              }}
            >
              <div className="score-circle-inner">
                <strong>{score}%</strong>

                <span>Overall Score</span>
              </div>
            </div>
          </div>

          <div className="score-content">
            <p className="score-small-label">
              OVERALL PERFORMANCE
            </p>

            <h2>{performance}</h2>

            <p>{performanceMessage}</p>

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

        {/* PERFORMANCE OVERVIEW */}

        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon">📈</div>

            <div>
              <h2>Performance Overview</h2>

              <p>
                Your assessment performance at a glance.
              </p>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-card">
              <span>Questions Attempted</span>
              <strong>{totalQuestions}</strong>
            </div>

            <div className="overview-card">
              <span>Correct Answers</span>
              <strong>{correctAnswers}</strong>
            </div>

            <div className="overview-card">
              <span>Accuracy</span>
              <strong>{score}%</strong>
            </div>

            <div className="overview-card">
              <span>Performance</span>
              <strong>{performance}</strong>
            </div>
          </div>
        </section>

        {/* CATEGORY ANALYSIS */}

        <section className="result-section skill-section">
          <button
            type="button"
            className="category-toggle"
            onClick={() =>
              setShowCategoryAnalysis((previous) => !previous)
            }
            aria-expanded={showCategoryAnalysis}
          >
            <div className="category-toggle-left">
              <div className="result-section-icon">📊</div>

              <div>
                <h2>Category Analysis</h2>

                <p>
                  {categoryPerformance.length > 0
                    ? `${categoryPerformance.length} topic areas evaluated`
                    : "Detailed skill analysis"}
                </p>
              </div>
            </div>

            <div className="category-toggle-right">
              <span>
                {showCategoryAnalysis ? "Hide" : "View"}
              </span>

              <span
                className={`category-chevron ${
                  showCategoryAnalysis ? "open" : ""
                }`}
              >
                ▼
              </span>
            </div>
          </button>

          {showCategoryAnalysis && (
            <div className="category-analysis-content">
              {categoryPerformance.length > 0 ? (
                <div className="skill-list">
                  {categoryPerformance.map((item, index) => {
                    const category =
                      item.category || `Skill ${index + 1}`;

                    const categoryScore = Math.round(
                      Math.max(0, Math.min(100, item.score || 0))
                    );

                    const hasQuestionCount = item.total > 0;

                    return (
                      <div
                        className="skill-item"
                        key={`${category}-${index}`}
                      >
                        <div className="skill-top">
                          <div className="skill-name-group">
                            <span className="skill-name">
                              {category}
                            </span>

                            {hasQuestionCount && (
                              <span className="skill-correct-text">
                                {item.correct} / {item.total} correct
                              </span>
                            )}
                          </div>

                          <strong>{categoryScore}%</strong>
                        </div>

                        <div className="skill-bar">
                          <div
                            className={`skill-bar-fill ${
                              categoryScore >= 75
                                ? "high"
                                : categoryScore >= 50
                                ? "medium"
                                : "low"
                            }`}
                            style={{
                              width: `${categoryScore}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="skill-placeholder">
                  <strong>
                    Category analysis is not available.
                  </strong>

                  <span>
                    The assessment response did not include
                    category-level scores for this attempt.
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* STRENGTHS */}

        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon strength-icon">
              💪
            </div>

            <div>
              <h2>Your Strengths</h2>

              <p>
                Areas with higher scores in this assessment.
              </p>
            </div>
          </div>

          {strengths.length > 0 ? (
            <div className="strength-grid">
              {strengths.map((item, index) => (
                <div
                  className="strength-card"
                  key={`${item.title}-${index}`}
                >
                  <div className="strength-check">✓</div>

                  <div>
                    <strong>{item.title}</strong>

                    {item.description && (
                      <p>{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="skill-placeholder">
              <strong>No higher-scoring topic areas identified.</strong>

              <span>
                Topic-level results are needed to show specific strengths.
              </span>
            </div>
          )}
        </section>

        {/* AREAS TO IMPROVE */}

        <section className="result-section">
          <div className="result-section-heading">
            <div className="result-section-icon improve-icon">
              🎯
            </div>

            <div>
              <h2>Areas to Improve</h2>

              <p>
                Topics with lower scores that you may want to review.
              </p>
            </div>
          </div>

          {areasToImprove.length > 0 ? (
            <div className="improve-grid">
              {areasToImprove.map((item, index) => (
                <div
                  className="improve-card"
                  key={`${item.title}-${index}`}
                >
                  <div className="improve-icon-circle">!</div>

                  <div>
                    <strong>{item.title}</strong>

                    {item.description && (
                      <p>{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="skill-placeholder">
              <strong>No lower-scoring topic areas identified.</strong>

              <span>
                Continue practising and use the topic-level scores
                to decide what to review next.
              </span>
            </div>
          )}
        </section>

        {/* ACTIONS */}

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

        {/* FOOTER */}

        <p className="result-footer">
          CareerBridge assessment results are generated from
          your submitted technical assessment responses.
        </p>
      </main>
    </div>
  );
}

export default AssessmentResult;