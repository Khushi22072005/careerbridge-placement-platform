import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import logoImg from "../assets/images/logo.jpeg";

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("email");
        localStorage.removeItem("token");

        navigate("/login");
    };

    return (
        <aside className="sidebar">

            {/* ======================================
                LOGO
            ====================================== */}

            <div className="sidebar-logo">

                <img
                    src={logoImg}
                    alt="CareerBridge Logo"
                    style={{
                        width: "45px",
                        height: "45px",
                        objectFit: "contain",
                        borderRadius: "8px"
                    }}
                />

                <div className="logo-text">
                    <h2>CareerBridge</h2>
                    <span>Career & Placement</span>
                </div>

            </div>


            {/* ======================================
                NAVIGATION
            ====================================== */}

            <nav className="sidebar-nav">

                {/* ================= MAIN ================= */}

                <p className="sidebar-section-title">
                    MAIN
                </p>

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-icon"></span>
                    <span>Dashboard</span>
                </NavLink>


                {/* ================= CAREER ================= */}

                <p className="sidebar-section-title">
                    CAREER
                </p>

                <NavLink
                    to="/career-assessment"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-icon"></span>
                    <span>Career Assessment</span>
                </NavLink>

                <NavLink
                    to="/career-roadmap"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-icon"></span>
                    <span>Career Roadmap</span>
                </NavLink>


                {/* ================= LEARNING ================= */}

                <p className="sidebar-section-title">
                    LEARNING
                </p>

                <NavLink
                    to="/learning-hub"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-icon"></span>
                    <span>Learning Hub</span>
                </NavLink>

                <NavLink
                    to="/career-development"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-icon"></span>
                    <span>Career Development</span>
                </NavLink>


                {/* ================= CAREER TOOLS ================= */}

                <p className="sidebar-section-title">
                    CAREER TOOLS
                </p>

                <NavLink
                    to="/resume-builder"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-icon"></span>
                    <span>Resume Builder</span>
                </NavLink>

                <NavLink
                    to="/resume-analyzer"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-icon"></span>
                    <span>Resume Analyzer</span>
                </NavLink>

             


                {/* ================= PLACEMENT ================= */}

                <p className="sidebar-section-title">
                    PLACEMENT
                </p>

               

                <NavLink
                    to="/interview"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-icon"></span>
                    <span>Mock Interview</span>
                </NavLink>


                {/* ================= ACCOUNT ================= */}

                <p className="sidebar-section-title">
                    ACCOUNT
                </p>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-icon"></span>
                    <span>My Profile</span>
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    <span className="sidebar-icon"></span>
                    <span>Settings</span>
                </NavLink>

            </nav>


            {/* ======================================
                LOGOUT
            ====================================== */}

            <div className="sidebar-bottom">

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <span className="sidebar-icon"></span>
                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
};

export default Sidebar;