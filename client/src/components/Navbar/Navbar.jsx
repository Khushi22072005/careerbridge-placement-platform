
import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionClick = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        🎓 CareerBridge
      </Link>

      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <button onClick={() => handleSectionClick("features")}>
            Features
          </button>
        </li>

        <li>
          <button onClick={() => handleSectionClick("how-it-works")}>
            How It Works
          </button>
        </li>

        <li>
          <button onClick={() => handleSectionClick("about")}>
            About
          </button>
        </li>

        <li>
          <button onClick={() => handleSectionClick("contact")}>
            Contact
          </button>
        </li>
      </ul>

      <div className="buttons">
        <Link to="/login" className="login">
          Login
        </Link>

        <Link to="/register" className="started">
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
