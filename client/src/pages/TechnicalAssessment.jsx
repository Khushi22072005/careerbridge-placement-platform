import React, { useEffect, useState } from "react";
import "./TechnicalAssessment.css";

const TechnicalAssessment = () => {
  const [role, setRole] = useState("");
  const [skill, setSkill] = useState("");
  const [questions, setQuestions] = useState([]);
  const [assessmentId, setAssessmentId] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const roleNames = {
    "software-developer": "Software Developer",
    "data-analyst": "Data Analyst",
    cybersecurity: "Cybersecurity Analyst",
    "cloud-devops": "Cloud / DevOps Engineer",
    "ui-ux": "UI/UX Designer",
  };

  useEffect(() => {
    const selectedRole = localStorage.getItem("selectedCareerRole");
    const selectedSkill = localStorage.getItem("selectedCareerSkill");
    const email = localStorage.getItem("email");

    if (!selectedRole || !selectedSkill) {
      alert("Please select a career role and skill first.");
      window.location.href = "/career-assessment";
      return;
    }

    if (!email) {
      alert("User email not found. Please login again.");
      window.location.href = "/login";
      return;
    }

    setRole(selectedRole);
    setSkill(selectedSkill);

    fetchQuestions(email, selectedRole, selectedSkill);
  }, []);

  /*
   * FETCH ROLE- AND SKILL-SPECIFIC QUESTIONS
   *
   * Backend route:
   * GET /api/technical-assessment/questions/:email?role=...&skill=...
   */
  const fetchQuestions = async (email, selectedRole, selectedSkill) => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        role: selectedRole,
        skill: selectedSkill,
      });

      const response = await fetch(
        `http://localhost:5000/api/technical-assessment/questions/${encodeURIComponent(
          email
        )}?${query.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load questions.");
      }

      if (!data.assessmentId) {
        throw new Error(
          "Assessment ID was not returned by the server. Please try again."
        );
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions are available for this role and skill.");
      }

      setAssessmentId(data.assessmentId);
      setQuestions(data.questions);
      setCurrentQuestion(0);
      setAnswers({});
    } catch (error) {
      console.error("Question loading error:", error);

      alert(
        error.message || "Unable to load assessment questions."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * SELECT ANSWER
   */
  const handleAnswer = (option) => {
    const question = questions[currentQuestion];

    if (!question) return;

    setAnswers((previous) => ({
      ...previous,
      [question.id]: option,
    }));
  };

  /*
   * NEXT QUESTION OR SUBMIT
   */
  const handleNext = () => {
    const question = questions[currentQuestion];

    if (!question) return;

    if (!answers[question.id]) {
      alert("Please select an answer before continuing.");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      return;
    }

    handleSubmit();
  };

  /*
   * PREVIOUS QUESTION
   */
  const handlePrevious = () => {
    if (currentQuestion > 0 && !submitting) {
      setCurrentQuestion((previous) => previous - 1);
    }
  };

  /*
   * SUBMIT ANSWERS
   *
   * Backend expects:
   * {
   *   assessmentId,
   *   answers: [{ questionId, selectedOption }]
   * }
   */
  const handleSubmit = async () => {
    if (submitting) return;

    if (!assessmentId) {
      alert("Assessment information is missing. Please reload the assessment.");
      return;
    }

    const unansweredQuestion = questions.find(
      (question) => !answers[question.id]
    );

    if (unansweredQuestion) {
      const unansweredIndex = questions.findIndex(
        (question) => question.id === unansweredQuestion.id
      );

      setCurrentQuestion(unansweredIndex);
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const formattedAnswers = questions.map((question) => ({
        questionId: question.id,
        selectedOption: answers[question.id],
      }));

      const payload = {
        assessmentId,
        answers: formattedAnswers,
      };

      console.log("Technical Assessment submission:", payload);

      const response = await fetch(
        "http://localhost:5000/api/technical-assessment/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Assessment submission failed."
        );
      }

      localStorage.setItem(
        "technicalAssessmentResult",
        JSON.stringify(data)
      );

      window.location.href = "/technical-assessment/result";
    } catch (error) {
      console.error("Assessment submission error:", error);

      alert(
        error.message || "Unable to submit assessment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * LOADING SCREEN
   */
  if (loading) {
    return (
      <div className="technical-loading">
        <div className="loading-spinner" />

        <h2>Preparing your assessment...</h2>

        <p>
          Loading questions for your selected role and skill.
        </p>
      </div>
    );
  }

  /*
   * NO QUESTIONS / FETCH FAILURE
   */
  if (!questions.length) {
    return (
      <div className="technical-empty">
        <div className="empty-icon">📚</div>

        <h2>Assessment questions are not available.</h2>

        <p>
          Questions for this role and skill may still be
          under preparation. Please choose another option or try again later.
        </p>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/career-assessment";
          }}
        >
          ← Choose Another Role
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  if (!question) {
    return (
      <div className="technical-empty">
        <h2>Unable to display this question.</h2>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/career-assessment";
          }}
        >
          ← Back to Career Assessment
        </button>
      </div>
    );
  }

  const selectedAnswer = answers[question.id];

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  /*
   * MAIN ASSESSMENT SCREEN
   */
  return (
    <div className="technical-page">
      {/* HEADER */}
      <header className="technical-header">
        <div className="technical-brand">
          <div className="brand-logo">C</div>

          <div>
            <strong>CareerBridge</strong>
            <span>Technical Assessment</span>
          </div>
        </div>

        <div className="role-badge">
          {roleNames[role] || role}
          {skill ? ` · ${skill}` : ""}
        </div>
      </header>

      {/* MAIN */}
      <main className="technical-main">
        {/* TITLE */}
        <div className="technical-intro">
          <p>ROLE-SPECIFIC KNOWLEDGE TEST</p>

          <h1>Test your technical knowledge.</h1>

          <span>
            Answer all {questions.length} questions to evaluate
            your preparation for the selected role and skill.
          </span>
        </div>

        {/* PROGRESS */}
        <div className="question-progress">
          <div className="progress-info">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>

            <strong>{Math.round(progress)}%</strong>
          </div>

          <div className="question-progress-bar">
            <div
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* QUESTION CARD */}
        <section className="question-card">
          <div className="question-top">
            <span className="question-number">
              Question {currentQuestion + 1}
            </span>

            {question.difficulty && (
              <span
                className={`difficulty ${String(
                  question.difficulty
                ).toLowerCase()}`}
              >
                {question.difficulty}
              </span>
            )}
          </div>

          <h2>{question.question}</h2>

          {/* OPTIONS */}
          <div className="answers-list">
            {[
              ["A", question.option_a],
              ["B", question.option_b],
              ["C", question.option_c],
              ["D", question.option_d],
            ]
              .filter(([, optionText]) => optionText != null)
              .map(([option, optionText]) => (
                <button
                  type="button"
                  key={option}
                  className={`answer-option ${
                    selectedAnswer === option ? "selected" : ""
                  }`}
                  disabled={submitting}
                  onClick={() => handleAnswer(option)}
                >
                  <span className="answer-letter">{option}</span>

                  <span className="answer-text">{optionText}</span>

                  <span className="answer-check">
                    {selectedAnswer === option ? "✓" : ""}
                  </span>
                </button>
              ))}
          </div>
        </section>

        {/* ACTIONS */}
        <div className="technical-actions">
          <button
            type="button"
            className="previous-question"
            disabled={currentQuestion === 0 || submitting}
            onClick={handlePrevious}
          >
            ← Previous
          </button>

          <button
            type="button"
            className="next-question"
            disabled={submitting}
            onClick={handleNext}
          >
            {submitting
              ? "Submitting..."
              : currentQuestion === questions.length - 1
              ? "Submit Assessment ✓"
              : "Next Question →"}
          </button>
        </div>

        <p className="assessment-security">
          🔒 Your answers are used to calculate your role
          preparation score.
        </p>
      </main>
    </div>
  );
};

export default TechnicalAssessment;