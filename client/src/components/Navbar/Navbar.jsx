import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        🎓 CareerBridge
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#resources">Resources</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
<div className="buttons">

<Link to="/login">
<button className="login">
Login
</button>
</Link>

<Link to="/register">
<button className="started">
Get Started
</button>
</Link>

</div>

    </nav>
  );
}

export default Navbar;