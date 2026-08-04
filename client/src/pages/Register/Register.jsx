import "./Register.css";

function Register() {
  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>

        <input type="text" placeholder="Full Name" />

        <input type="email" placeholder="Email" />

        <input type="password" placeholder="Password" />

        <button>Create Account</button>

        <p>
          Already have an account? <span>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;