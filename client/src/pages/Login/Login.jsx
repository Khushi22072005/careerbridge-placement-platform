import "./Login.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      alert(res.data.message);

      // Save JWT token
      localStorage.setItem("token", res.data.token);

      // Save logged-in user
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      // Save email
      localStorage.setItem(
        "userEmail",
        formData.email
      );

      // Go to dashboard
      navigate("/dashboard");

    } catch (err) {
      alert(
        err.response?.data?.message || "Login Failed"
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">

        <h1>CareerBridge</h1>

        <h2>Welcome Back 👋</h2>

        <p>
          Continue your journey towards your dream career
          with AI-powered guidance.
        </p>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="student"
        />

      </div>

      <div className="login-right">

        <div className="login-card">

          <h2>Login</h2>

          <p>Sign in to continue</p>

          <form onSubmit={handleLogin}>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="options">

              <label>
                <input
                  type="checkbox"
                  className="remember-checkbox"
                />
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
              onClick={() =>
                alert("Google Login will be added soon.")
              }
            >
              Continue with Google
            </button>

            <p className="register-link">
              Don't have an account?{" "}

              <Link to="/register">
                <span>Register</span>
              </Link>
            </p>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;