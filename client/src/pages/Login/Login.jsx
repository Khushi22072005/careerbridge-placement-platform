import "./Login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login Successful!");

        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/home");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server Error!");
      console.log(error);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">

        <h1>CareerBridge</h1>

        <h2>Welcome Back 👋</h2>

        <p>
          Continue your journey towards your dream career with AI-powered
          guidance.
        </p>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Student"
        />

      </div>

      <div className="login-right">

        <div className="login-card">

          <h2>Login</h2>

          <p>Sign in to continue</p>

          <form onSubmit={handleLogin}>

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="options">

              <label>
                <input type="checkbox" />
                Remember Me
              </label>

              <Link to="/forgot-password">
                Forgot Password?
              </Link>

            </div>

            <button
              type="submit"
              className="login-btn"
            >
              Login
            </button>

            <div className="divider">
              OR
            </div>

            <button
              type="button"
              className="google-btn"
            >
              Continue with Google
            </button>

            <p className="register-link">
              Don't have an account?{" "}
              <Link to="/register">
                Register
              </Link>
            </p>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;