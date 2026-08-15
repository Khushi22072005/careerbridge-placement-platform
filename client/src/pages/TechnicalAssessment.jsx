import React, { useEffect, useState } from "react";
import "./TechnicalAssessment.css";

const TechnicalAssessment = () => {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

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


  /* =====================================================
     LOAD ROLE + QUESTIONS
  ===================================================== */

  useEffect(() => {
    const selectedRole =
      localStorage.getItem(
        "selectedCareerRole"
      );

    if (!selectedRole) {
      window.location.href =
        "/career-assessment";

      return;
    }

    setRole(selectedRole);

    fetchQuestions(selectedRole);
  }, []);


  /* =====================================================
     FETCH QUESTIONS
  ===================================================== */

  const fetchQuestions = async (
    selectedRole
  ) => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/technical-assessment/questions?role=${selectedRole}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load questions."
        );
      }

      setQuestions(data.questions || []);

    } catch (error) {
      console.error(
        "Question loading error:",
        error
      );

      alert(
        error.message ||
          "Unable to load assessment questions."
      );

    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     SELECT ANSWER
  ===================================================== */

  const handleAnswer = (option) => {
    setAnswers((previous) => ({
      ...previous,
      [questions[currentQuestion].id]:
        option,
    }));
  };


  /* =====================================================
     NEXT
  ===================================================== */

  const handleNext = () => {
    const question =
      questions[currentQuestion];

    if (!answers[question.id]) {
      alert(
        "Please select an answer before continuing."
      );

      return;
    }

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1
      );

      return;
    }

    handleSubmit();
  };


  /* =====================================================
     PREVIOUS
  ===================================================== */

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) => previous - 1
      );
    }
  };


  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const email =
        localStorage.getItem("email");

      if (!email) {
        alert(
          "User email not found. Please login again."
        );

        return;
      }


      const formattedAnswers =
        questions.map((question) => ({
          questionId: question.id,

          selectedOption:
            answers[question.id] || null,
        }));


      const payload = {
        email,
        role,
        answers: formattedAnswers,
      };


      console.log(
        "Technical Assessment:",
        payload
      );


      const response = await fetch(
        "http://localhost:5000/api/technical-assessment/submit",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
            "Assessment submission failed."
        );
      }


      localStorage.setItem(
        "technicalAssessmentResult",
        JSON.stringify(data)
      );


      window.location.href =
        "/technical-assessment/result";

    } catch (error) {
      console.error(
        "Assessment submission error:",
        error
      );

      alert(
        error.message ||
          "Unable to submit assessment."
      );

    } finally {
      setSubmitting(false);
    }
  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="technical-loading">

        <div className="loading-spinner" />

        <h2>
          Preparing your assessment...
        </h2>

        <p>
          Loading questions for your selected role.
        </p>

      </div>
    );
  }


  /* =====================================================
     NO QUESTIONS
  ===================================================== */

  if (!questions.length) {
    return (
      <div className="technical-empty">

        <div className="empty-icon">
          📚
        </div>

        <h2>
          Assessment questions are not available yet.
        </h2>

        <p>
          Questions for this role are currently
          being prepared.
        </p>

        <button
          onClick={() =>
            (window.location.href =
              "/career-assessment")
          }
        >
          ← Choose Another Role
        </button>

      </div>
    );
  }


  const question =
    questions[currentQuestion];


  const selectedAnswer =
    answers[question.id];


  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;


  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="technical-page">

      {/* HEADER */}

      <header className="technical-header">

        <div className="technical-brand">

          <div className="brand-logo">
            C
          </div>

          <div>
            <strong>
              CareerBridge
            </strong>

            <span>
              Technical Assessment
            </span>
          </div>

        </div>


        <div className="role-badge">
          {roleNames[role] || role}
        </div>

      </header>


      {/* MAIN */}

      <main className="technical-main">

        {/* TITLE */}

        <div className="technical-intro">

          <p>
            ROLE-SPECIFIC KNOWLEDGE TEST
          </p>

          <h1>
            Test your technical knowledge.
          </h1>

          <span>
            Answer all {questions.length} questions
            to evaluate your preparation for the
            selected role.
          </span>

        </div>


        {/* PROGRESS */}

        <div className="question-progress">

          <div className="progress-info">

            <span>
              Question{" "}
              {currentQuestion + 1} of{" "}
              {questions.length}
            </span>

            <strong>
              {Math.round(progress)}%
            </strong>

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
              Question{" "}
              {currentQuestion + 1}
            </span>

            <span
              className={`difficulty ${String(
                question.difficulty || ""
              ).toLowerCase()}`}
            >
              {question.difficulty}
            </span>

          </div>


          <h2>
            {question.question}
          </h2>


          {/* OPTIONS */}

          <div className="answers-list">

            {[
              ["A", question.option_a],
              ["B", question.option_b],
              ["C", question.option_c],
              ["D", question.option_d],
            ].map(([option, text]) => (

              <button
                type="button"
                key={option}
                className={`answer-option ${
                  selectedAnswer === option
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  handleAnswer(option)
                }
              >

                <span className="answer-letter">
                  {option}
                </span>

                <span className="answer-text">
                  {text}
                </span>

                <span className="answer-check">
                  {selectedAnswer === option
                    ? "✓"
                    : ""}
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
            disabled={
              currentQuestion === 0 ||
              submitting
            }
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
              : currentQuestion ===
                  questions.length - 1
              ? "Submit Assessment ✓"
              : "Next Question →"}
          </button>

        </div>


        <p className="assessment-security">
          🔒 Your answers are securely used to
          calculate your role preparation score.
        </p>

      </main>

    </div>
  );
};

export default TechnicalAssessment;