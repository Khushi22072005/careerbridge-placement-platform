import "./ForgotPassword.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Later connect this with backend API
    console.log("Reset password request for:", email);

    alert("Password reset link sent to your email!");
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">

        <h2>Forgot Password?</h2>

        <p>
          Enter your email address and we will send you a password reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">
            Send Reset Link
          </button>
        </form>

        <Link to="/login">
          Back to Login
        </Link>

      </div>
    </div>
  );
}

export default ForgotPassword;