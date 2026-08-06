import "./Features.css";

function Features() {

  const features = [
    {
      title: "Career Assessment",
      description:
        "Analyze your skills, interests, and personality to discover the most suitable career path.",
    },
    {
      title: "Career Recommendation",
      description:
        "Receive AI-powered career suggestions based on your profile, skills, and assessment results.",
    },
    {
      title: "Resume Builder",
      description:
        "Create a professional ATS-friendly resume with customizable templates in minutes.",
    },
    {
      title: "Resume Analyzer",
      description:
        "Upload your resume and receive instant feedback with suggestions to improve your ATS score.",
    },
    {
      title: "Placement Readiness",
      description:
        "Track your interview preparation, aptitude, coding progress, and placement readiness.",
    },
    {
      title: "Mock Interview",
      description:
        "Practice technical and HR interviews with AI-generated questions and personalized feedback.",
    },
  ];

  return (
    <section className="features">
      <h2>Our Features</h2>

      <div className="feature-grid">
        {features.map((feature, index) => (
          <div key={index} className="card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;