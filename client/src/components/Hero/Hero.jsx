import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";
import heroGirl from "../../assets/images/hero-girl.png";

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">

        <div className="hero-content">
          <h1>
            From Student
            <br />
            <span>to Professional</span>
          </h1>

          <p>
            Discover your ideal career path, build an ATS-friendly resume,
            prepare for interviews, and become placement ready — all in one
            platform.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="hero-btn primary-btn">
              Get Started
            </Link>

            <Link
              to="/career-assessment"
              className="hero-btn secondary-btn"
            >
              Take Career Test
            </Link>
          </div>
        </div>

        <div className="hero-image-container">
          <img
            src={heroGirl}
            alt="Student building her career"
            className="hero-girl"
          />
        </div>

      </div>
    </section>
  );
}

export default Hero;