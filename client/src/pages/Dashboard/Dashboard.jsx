import "./Dashboard.css";
import {
  FaUserGraduate,
  FaFileAlt,
  FaChartLine,
  FaClipboardCheck,
  FaBriefcase,
  FaRobot,
  FaBook,
  FaCog,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";

function Dashboard() {
  return (
    <div className="dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <h2 className="logo">🎓 CareerBridge</h2>

        <ul>

          <li><FaHome /> Dashboard</li>

          <li><FaUserGraduate /> Profile</li>

          <li><FaClipboardCheck /> Career Assessment</li>

          <li><FaRobot /> AI Recommendation</li>

          <li><FaFileAlt /> Resume Builder</li>

          <li><FaChartLine /> Resume Analyzer</li>

          <li><FaBook /> Learning Hub</li>

          <li><FaBriefcase /> Jobs</li>

          <li><FaCog /> Settings</li>

          <li><FaSignOutAlt /> Logout</li>

        </ul>

      </aside>

      {/* Main Content */}

      <main className="main-content">

        <div className="top-bar">

          <div>

            <h1>Welcome Back, Khushi 👋</h1>

            <p>Let's continue your placement preparation.</p>

          </div>

          <img
            src="https://i.pravatar.cc/100"
            alt="profile"
            className="profile-img"
          />

        </div>

        {/* Dashboard Cards */}

        <div className="cards">

          <div className="card">
            <h3>Profile Completion</h3>
            <h2>65%</h2>
          </div>

          <div className="card">
            <h3>Resume Score</h3>
            <h2>82%</h2>
          </div>

          <div className="card">
            <h3>Jobs Applied</h3>
            <h2>5</h2>
          </div>

          <div className="card">
            <h3>Mock Interviews</h3>
            <h2>3</h2>
          </div>

        </div>

        {/* Quick Actions */}

        <div className="section">

          <h2>Quick Actions</h2>

          <div className="action-grid">

            <button>🎯 Take Assessment</button>

            <button>📄 Build Resume</button>

            <button>🤖 AI Career Advice</button>

            <button>💼 Find Jobs</button>

          </div>

        </div>

        {/* Learning Progress */}

        <div className="section">

          <h2>Learning Progress</h2>

          <div className="progress-box">

            <p>Java</p>

            <progress value="80" max="100"></progress>

            <p>React</p>

            <progress value="60" max="100"></progress>

            <p>SQL</p>

            <progress value="75" max="100"></progress>

          </div>

        </div>

        {/* Upcoming Tasks */}

        <div className="section">

          <h2>Upcoming Tasks</h2>

          <ul className="tasks">

            <li>✔ Complete Career Assessment</li>

            <li>✔ Upload Resume</li>

            <li>✔ Attend Mock Interview</li>

            <li>✔ Apply for Internship</li>

          </ul>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;