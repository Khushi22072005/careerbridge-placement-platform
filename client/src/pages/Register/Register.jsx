import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch("http://localhost:5000/api/auth/register", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fullname,
          email,
          password,
          role,
        }),

      });

      const data = await response.json();

      if (response.ok) {

        alert("Registration Successful!");

        navigate("/login");

      } else {

        alert(data.message);

      }

    } catch (error) {

      alert("Server Error!");

      console.log(error);

    }

  };

  return (

    <div className="register-container">

      <div className="register-card">

        <h2>Create Your CareerBridge Account</h2>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />

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

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >

            <option value="Student">
              Student
            </option>

            <option value="Mentor">
              Mentor
            </option>

            <option value="Recruiter">
              Recruiter
            </option>

          </select>

          <button type="submit">

            Create Account

          </button>

        </form>

        <p>

          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>

        </p>

      </div>

    </div>

  );

}

export default Register;