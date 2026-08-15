import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import heroImage from "../../assets/images/hero-girl.png";

function Home() {
  return (
    <div className="home-page">

      {/* ================= NAVBAR ================= */}
      <nav className="home-navbar">
        <div className="home-logo">
          <span className="logo-cap">🎓</span>
          <span>Career<span>Bridge</span></span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-buttons">
          <Link to="/login" className="nav-login">
            Login
          </Link>

          <Link to="/register" className="nav-get-started">
            Get Started
          </Link>
        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="hero-section" id="home">
        <div className="hero-content">

          <div className="hero-left">
            <h1>
              From Student
              <br />
              <span>to Professional</span>
            </h1>

            <p>
              Discover your ideal career path, build an ATS-friendly
              resume, prepare for interviews, and become placement
              ready — all in one platform.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="primary-btn">
                Get Started
              </Link>

              <Link to="/career-assessment" className="secondary-btn">
                Take Career Test
              </Link>
            </div>
          </div>

          <div className="hero-right">
            <img src={heroImage} alt="CareerBridge career journey" />
          </div>

        </div>
      </section>


      {/* ================= WHY CAREERBRIDGE ================= */}
      <section className="why-section">
        <h2>Why Students Choose CareerBridge</h2>

        <div className="why-grid">

          <div className="why-card">
            <div className="round-icon blue-icon">●</div>
            <h3>Personalized Guidance</h3>
            <p>
              Get career recommendations based on your skills,
              interests and assessment.
            </p>
          </div>

          <div className="why-card">
            <div className="round-icon green-icon">◆</div>
            <h3>Clear Roadmaps</h3>
            <p>
              Step-by-step learning roadmaps with skills,
              projects and certifications.
            </p>
          </div>

          <div className="why-card">
            <div className="round-icon orange-icon">★</div>
            <h3>Placement Focused</h3>
            <p>
              Prepare resume, practice interviews and track
              your placement readiness.
            </p>
          </div>

          <div className="why-card">
            <div className="round-icon purple-icon">◆</div>
            <h3>All-in-One Platform</h3>
            <p>
              Everything you need for your career journey
              in one powerful platform.
            </p>
          </div>

        </div>
      </section>


      {/* ================= FEATURES ================= */}
      <section className="features-section" id="features">
        <h2>Our Features</h2>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon blue-bg">▣</div>
            <div>
              <h3>Career Assessment</h3>
              <p>
                Analyze your skills, interests, and personality
                to discover the most suitable career path.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon green-bg">💡</div>
            <div>
              <h3>Career Recommendation</h3>
              <p>
                Receive AI-powered career suggestions based on
                your profile, skills, and assessment results.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon light-blue-bg">▤</div>
            <div>
              <h3>Resume Builder</h3>
              <p>
                Create a professional ATS-friendly resume with
                customizable templates in minutes.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange-bg">⌁</div>
            <div>
              <h3>Resume Analyzer</h3>
              <p>
                Upload your resume and receive instant feedback
                with suggestions to improve your ATS score.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple-bg">◎</div>
            <div>
              <h3>Placement Readiness</h3>
              <p>
                Track your interview preparation, aptitude,
                coding progress, and overall placement readiness.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon pink-bg">♙</div>
            <div>
              <h3>Mock Interview</h3>
              <p>
                Practice technical and HR interviews with
                AI-generated questions and personalized feedback.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ================= CAREER JOURNEY ================= */}
      <section className="journey-section">
        <h2>Your Career Journey with CareerBridge</h2>

        <div className="journey-container">

          <div className="journey-step">
            <div className="journey-icon">◎</div>
            <h3>Discover</h3>
            <p>
              Take assessment and discover career paths
              that fit you.
            </p>
          </div>

          <div className="journey-arrow">→</div>

          <div className="journey-step">
            <div className="journey-icon">▣</div>
            <h3>Develop</h3>
            <p>
              Follow personalized roadmaps and build
              in-demand skills.
            </p>
          </div>

          <div className="journey-arrow">→</div>

          <div className="journey-step">
            <div className="journey-icon">▤</div>
            <h3>Prepare</h3>
            <p>
              Build resume, practice interviews and improve
              your strengths.
            </p>
          </div>

          <div className="journey-arrow">→</div>

          <div className="journey-step">
            <div className="journey-icon">🚀</div>
            <h3>Achieve</h3>
            <p>
              Become placement ready and achieve your
              dream career.
            </p>
          </div>

        </div>
      </section>


      {/* ================= CAREER MATCH ================= */}
      <section className="career-match-section">

        <div className="career-match-left">
          <h2>Find a Career That Fits You</h2>

          <p>
            Take our smart assessment and get a list of
            careers that match your skills, personality
            and interests.
          </p>

          <div className="check-list">
            <div>✓ Quick & Easy Assessment</div>
            <div>✓ AI-Powered Career Matching</div>
            <div>✓ Personalized Career Suggestions</div>
          </div>

          <Link to="/career-assessment" className="assessment-btn">
            Take the Assessment →
          </Link>
        </div>


        <div className="career-match-card">

          <div className="career-results">
            <h3>Your Top Career Matches</h3>

            <div className="career-row">
              <div className="career-label">
                <span>Data Analyst</span>
                <b>92%</b>
              </div>
              <div className="progress">
                <div style={{ width: "92%" }}></div>
              </div>
            </div>

            <div className="career-row">
              <div className="career-label">
                <span>Business Analyst</span>
                <b>87%</b>
              </div>
              <div className="progress">
                <div style={{ width: "87%" }}></div>
              </div>
            </div>

            <div className="career-row">
              <div className="career-label">
                <span>Product Analyst</span>
                <b>81%</b>
              </div>
              <div className="progress">
                <div style={{ width: "81%" }}></div>
              </div>
            </div>

            <div className="career-row">
              <div className="career-label">
                <span>Marketing Analyst</span>
                <b>76%</b>
              </div>
              <div className="progress">
                <div style={{ width: "76%" }}></div>
              </div>
            </div>
          </div>


          <div className="match-circle-area">
            <div className="match-circle">
              <span>92%</span>
            </div>

            <p>Best Match</p>
            <strong>Data Analyst</strong>
          </div>

        </div>
      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="how-section" id="how-it-works">
        <h2>How CareerBridge Works</h2>

        <div className="how-grid">

          <div className="how-card">
            <span>01</span>
            <div>
              <h3>Create Account</h3>
              <p>
                Sign up and build your student profile
                in seconds.
              </p>
            </div>
          </div>

          <div className="how-arrow">→</div>

          <div className="how-card">
            <span>02</span>
            <div>
              <h3>Take Assessment</h3>
              <p>
                Answer assessment questions to identify
                your career path.
              </p>
            </div>
          </div>

          <div className="how-arrow">→</div>

          <div className="how-card">
            <span>03</span>
            <div>
              <h3>Get Roadmap</h3>
              <p>
                Receive personalized roadmap with skills,
                projects & more.
              </p>
            </div>
          </div>

          <div className="how-arrow">→</div>

          <div className="how-card">
            <span>04</span>
            <div>
              <h3>Become Ready</h3>
              <p>
                Follow, practice and become 100% placement
                ready.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ================= PLACEMENT READY ================= */}
      <section className="placement-section">

        <div className="placement-illustration">
          <div className="person-placeholder">
            👨‍💻
          </div>
        </div>

        <div className="placement-content">
          <h2>Get Placement Ready</h2>

          <div className="placement-list">
            <p>✓ Build ATS-friendly resume that stands out</p>
            <p>✓ Analyze and improve your resume score</p>
            <p>✓ Practice mock interviews with AI feedback</p>
            <p>✓ Track your progress and stay on top</p>
          </div>
        </div>

        <Link to="/dashboard" className="prepare-btn">
          Start Preparing →
        </Link>

      </section>


      {/* ================= STATS ================= */}
      <section className="stats-section">

        <div className="stat">
          <strong>6+</strong>
          <h3>Career Paths</h3>
          <p>To explore</p>
        </div>

        <div className="stat">
          <strong>100+</strong>
          <h3>Skills</h3>
          <p>To learn</p>
        </div>

        <div className="stat">
          <strong>1000+</strong>
          <h3>Practice Questions</h3>
          <p>For interview prep</p>
        </div>

        <div className="stat">
          <strong>100%</strong>
          <h3>Placement Focused</h3>
          <p>For your success</p>
        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="cta-section">

        <div>
          <h2>Your Career Starts With the Right Direction.</h2>
          <p>
            Discover your strengths, explore opportunities
            and build your future with CareerBridge.
          </p>
        </div>

        <div className="cta-buttons">
          <Link to="/career-assessment" className="cta-white">
            Take Career Test
          </Link>

          <Link to="/register" className="cta-outline">
            Get Started
          </Link>
        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="home-footer" id="contact">

        <div className="footer-brand">
          <h2>🎓 CareerBridge</h2>
          <p>
            From Student to Professional —
            <br />
            Your Complete Career Journey.
          </p>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer-column">
          <h3>Features</h3>
          <a href="#features">Career Assessment</a>
          <a href="#features">Roadmap</a>
          <a href="#features">Resume Builder</a>
          <a href="#features">Mock Interview</a>
          <a href="#features">Placement Readiness</a>
        </div>

        <div className="footer-column">
          <h3>Resources</h3>
          <a href="#features">Career Blog</a>
          <a href="#features">Interview Tips</a>
          <a href="#features">Resume Tips</a>
          <a href="#features">Guides & Tutorials</a>
          <a href="#features">FAQs</a>
        </div>

        <div className="footer-column">
          <h3>Contact Us</h3>
          <p>✉ support@careerbridge.com</p>
          <p>☎ +91 98765 43210</p>
          <p>📍 Mumbai, India</p>
        </div>

        <div className="footer-bottom">
          © 2026 CareerBridge. All Rights Reserved.
        </div>

      </footer>

    </div>
  );
}

export default Home;