import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

     <div className="logo">
    🎓 CareerBridge
</div>

      <ul className="nav-links">

        <li>Home</li>

        <li>Features</li>

        <li>Resources</li>

        <li>About</li>

        <li>Contact</li>

      </ul>

      <div className="buttons">

        <button className="login">

          Login

        </button>

        <button className="started">

          Get Started

        </button>

      </div>

    </nav>
  );
}

export default Navbar;