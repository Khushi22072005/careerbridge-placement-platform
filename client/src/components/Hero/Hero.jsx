import "./Hero.css";
import heroImage from "../../assets/images/hero.svg";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-left">
        <h1>
          From Student <br />
          to Professional
        </h1>

        <p>
          Discover your ideal career path,
          build an ATS-friendly resume,
          prepare for interviews,
          and become placement ready —
          all in one platform.
        </p>

        <div className="hero-buttons">
          <button className="primary">
            Get Started
          </button>

          <button className="secondary">
            Take Career Test
          </button>
        </div>
      </div>

      <div className="hero-right">
        <img src={heroImage} alt="CareerBridge Hero" />
      </div>

    </section>
  );
}

export default Hero;