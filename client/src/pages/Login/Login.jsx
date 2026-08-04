import "./Login.css";

function Login() {
  return (
    <div className="login-page">

      {/* Left Section */}

      <div className="login-left">

        <h1>CareerBridge</h1>

        <h2>Welcome Back 👋</h2>

        <p>
          Continue your journey towards your dream career with AI-powered
          guidance.
        </p>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="student"
        />

      </div>

      {/* Right Section */}

      <div className="login-right">

        <div className="login-card">

          <h2>Login</h2>

          <p>Sign in to continue</p>

          <form>

            <input
              type="email"
              placeholder="Email Address"
            />

            <input
              type="password"
              placeholder="Password"
            />

            <div className="options">

              <label>

                <input type="checkbox" />

                Remember Me

              </label>

              <a href="#">Forgot Password?</a>

            </div>

            <button className="login-btn">

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

              Don't have an account?

              <span> Register</span>

            </p>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;