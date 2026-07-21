import "./HowItWorks.css";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create Account",
      description:
        "Register and build your student profile with academic details, skills and career interests.",
    },
    {
      number: "02",
      title: "Take Career Assessment",
      description:
        "Answer career assessment questions to identify suitable career paths.",
    },
    {
      number: "03",
      title: "Get Personalized Roadmap",
      description:
        "Receive a learning roadmap with skills, projects and certifications.",
    },
    {
      number: "04",
      title: "Become Placement Ready",
      description:
        "Build your resume, practice interviews and apply for internships and jobs.",
    },
  ];

  return (
    <section className="how-it-works">

      <h2>How CareerBridge Works</h2>

      <div className="steps">

        {steps.map((step) => (

          <div className="step-card" key={step.number}>

            <span>{step.number}</span>

            <h3>{step.title}</h3>

            <p>{step.description}</p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default HowItWorks;