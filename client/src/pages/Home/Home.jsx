
import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import heroImage from "../../assets/images/career logo.jpeg";
import logoImg from "../../assets/images/logo.jpeg";

function Home() {
  
const features = [
  {
    number: "01",
    title: "Career Assessment",
    description:
      "Discover your strengths, interests, and personality to identify career paths that match your goals.",
    tag: "Discover yourself",
    path: "/career-assessment",
  },
  {
    number: "02",
    title: "Career Roadmap",
    description:
      "Follow a structured learning journey from fundamental concepts to practical projects and interview preparation.",
    tag: "Learn step by step",
    path: "/career-roadmap",
  },
  {
    number: "03",
    title: "Resume Builder",
    description:
      "Create a professional resume using structured sections and customizable templates.",
    tag: "Build your profile",
    path: "/resume-builder",
  },
  {
    number: "04",
    title: "Resume Analyzer",
    description:
      "Review your resume for relevant skills, missing information, and opportunities to improve it.",
    tag: "Improve your resume",
    path: "/resume-analyzer",
  },
  {
    number: "05",
    title: "Learning Hub",
    description:
      "Explore learning resources, tutorials, and project ideas relevant to your chosen career path.",
    tag: "Build your skills",
    path: "/learning-hub",
  },
  {
    number: "06",
    title: "Mock Interview",
    description:
      "Practice technical and HR interview questions and use feedback to improve your answers.",
    tag: "Practice with confidence",
    path: "/mock-interview",
  },
  {
    number: "07",
    title: "Placement Readiness",
    description:
      "Monitor your preparation across aptitude, technical skills, interviews, and career development.",
    tag: "Track your progress",
    path: "/placement-readiness",
  },
];

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description:
        "Register and add your academic details, skills, interests, and career goals.",
    },
    {
      number: "02",
      title: "Discover Your Career",
      description:
        "Complete the career assessment and explore suitable career options.",
    },
    {
      number: "03",
      title: "Follow Your Roadmap",
      description:
        "Build relevant skills, study learning resources, and complete practical projects.",
    },
    {
      number: "04",
      title: "Prepare for Placement",
      description:
        "Improve your resume, practice interviews, and monitor your placement readiness.",
    },
  ];

  return (
    <main className="home-page" id="home">
      {/* NAVBAR */}
      <header className="home-navbar">
        <Link to="/" className="home-logo">
          <img src={logoImg} alt="CareerBridge logo" />
          <span>
            Career<span className="logo-highlight">Bridge</span>
          </span>
        </Link>

        <nav className="home-nav-links" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          
          <a href="#contact">Contact</a>
        </nav>

        <div className="home-nav-buttons">
          <Link to="/login" className="home-login-btn">
            Login
          </Link>
          <Link to="/register" className="home-register-btn">
            Get Started <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="home-hero">
        <div className="hero-background-shape hero-shape-one" />
        <div className="hero-background-shape hero-shape-two" />

        <div className="home-hero-container">
          <div className="home-hero-content">
            <div className="hero-eyebrow">
              
              
            </div>

            <h1>
              From Student
              <br />
              to <span>Professional.</span>
            </h1>

            <p className="home-hero-description">
              Your career journey starts here. Discover your strengths,
              build the right skills, create a professional resume, and
              prepare for placements — all in one platform.
            </p>

            <div className="home-hero-buttons">
              <Link to="/register" className="hero-primary-btn">
                Start Your Journey <span aria-hidden="true">→</span>
              </Link>

              
            </div>

            
          </div>

          <div className="home-hero-visual">
            <div className="hero-image-glow" />

            <div className="hero-image-frame">
              <img
                src={heroImage}
                alt="Student preparing for her professional career"
                className="home-hero-image"
              />
            </div>

            
            
              
           

            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
          </div>
        </div>

        
      </section>

     

      {/* FEATURES */}
      <section className="home-features-section" id="features">
        <div className="home-section-heading">
          <span className="section-eyebrow">WHAT CAREERBRIDGE OFFERS</span>
          
          
        </div>

        
<div className="home-features-grid">
  {features.map((feature) => (
    <Link
      to={feature.path}
      className="home-feature-card"
      key={feature.number}
      aria-label={`Explore ${feature.title}`}
    >
      <div className="feature-card-top">
        <span className="feature-icon" aria-hidden="true">
          {feature.number === "01" ? "" :
           feature.number === "02" ? "" :
           feature.number === "03" ? "" :
           feature.number === "04" ? "" :
           feature.number === "05" ? "" :
           feature.number === "06" ? "" : ""}
        </span>

        <span className="feature-number">{feature.number}</span>
      </div>

      <h3>{feature.title}</h3>
      <p>{feature.description}</p>

      <div className="feature-card-bottom">
        <span>{feature.tag}</span>
        <span className="feature-card-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
    </Link>
  ))}
</div>


        
      </section>

      {/* HOW IT WORKS */}
      <section className="home-how-section" id="how-it-works">
        <div className="home-section-heading">
          
          <h2>
            Four steps.
            <br />
            <span>One clear direction.</span>
          </h2>
          <p>
            Follow a structured path from understanding yourself to preparing
            for your professional future.
          </p>
        </div>

        <div className="home-journey">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <article className="home-journey-card">
                <div className="journey-number">{step.number}</div>

                <div className="journey-card-content">
                  <span className="journey-label">
                    STEP {step.number}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>

              {index < steps.length - 1 && (
                <div className="journey-connector" aria-hidden="true">
                  <span>→</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      
      {/* FOOTER */}
      <footer className="home-footer" id="contact">
        <div className="home-footer-main">
          <div className="home-footer-brand">
            <Link to="/" className="home-footer-logo">
              <img src={logoImg} alt="" />
              <span>
                Career<span>Bridge</span>
              </span>
            </Link>

            <p>
              From Student to Professional —
              <br />
              Your Complete Career Journey.
            </p>

            <span className="footer-brand-note">
              Discover. Develop. Prepare.
            </span>
          </div>

          <div className="home-footer-column">
            <h3>Explore</h3>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About CareerBridge</a>
          </div>

          <div className="home-footer-column">
            <h3>Career Tools</h3>
            <Link to="/career-assessment">Career Assessment</Link>
            <Link to="/career-roadmap">Career Roadmap</Link>
            <Link to="/resume-builder">Resume Builder</Link>
            <Link to="/nterview">Mock Interview</Link>
          </div>

          <div className="home-footer-column">
            <h3>Get Started</h3>
            <Link to="/register">Create Account</Link>
            <Link to="/login">Login</Link>
            <a href="#features">Explore Features</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="home-footer-column footer-contact-column">
            <h3>Contact</h3>
            <p>CareerBridge Support</p>
            <p>Mumbai, India</p>
            <p className="footer-contact-note">
              Supporting your journey from student to professional.
            </p>
          </div>
        </div>

        <div className="home-footer-bottom">
          <p>© 2026 CareerBridge. All Rights Reserved.</p>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}

export default Home;
