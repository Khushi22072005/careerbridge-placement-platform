import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import "./Sidebar.css";
import logoImg from "../assets/images/logo.jpeg";

// =====================================================
// SIDEBAR MENU SECTIONS
// =====================================================

const menuSections = [
    {
        title: "MAIN",
        items: [
            {
                name: "Dashboard",
                path: "/dashboard",
                end: true,
            },
        ],
    },
    {
        title: "CAREER",
        items: [
            {
                name: "Career Assessment",
                path: "/career-assessment",
            },
            {
                name: "Career Roadmap",
                path: "/career-roadmap",
            },
            {
                name: "AI Career Companion",
                path: "/career-companion",
            },
        ],
    },
    {
        title: "LEARNING",
        items: [
            {
                name: "Learning Hub",
                path: "/learning-hub",
            },
        ],
    },
    {
        title: "CAREER TOOLS",
        items: [
            {
                name: "Resume Builder",
                path: "/resume-builder",
            },
            {
                name: "Resume Analyzer",
                path: "/resume-analyzer",
            },
        ],
    },
    {
        title: "PLACEMENT",
        items: [
            {
                name: "Mock Interviews",
                path: "/interview",
            },
        ],
    },
    {
        title: "ACCOUNT",
        items: [
            {
                name: "My Profile",
                path: "/profile",
            },
            {
                name: "Settings",
                path: "/settings",
            },
        ],
    },
];

// =====================================================
// SIDEBAR COMPONENT
// =====================================================

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" &&
        window.innerWidth <= 700
    );

    // =====================================================
    // RESPONSIVE SIDEBAR
    // =====================================================

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 700;

            setIsMobile(mobile);

            if (!mobile) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Close mobile sidebar after navigation.

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    // Close mobile sidebar using Escape.

    useEffect(() => {
        if (!isMobileOpen || !isMobile) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isMobileOpen, isMobile]);

    // =====================================================
    // SIDEBAR ACTIONS
    // =====================================================

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("email");
        localStorage.removeItem("token");

        setIsMobileOpen(false);

        navigate("/login", { replace: true });
    };

    const toggleCollapse = () => {
        setIsCollapsed((previous) => !previous);
    };

    const toggleMobileMenu = () => {
        setIsMobileOpen((previous) => !previous);
    };

    const closeMobileMenu = () => {
        setIsMobileOpen(false);
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <>
            {/* MOBILE TOP BAR */}

            <header className="cb-mobile-topbar">
                <button
                    type="button"
                    className="cb-mobile-menu-button"
                    onClick={toggleMobileMenu}
                    aria-label={
                        isMobileOpen
                            ? "Close navigation"
                            : "Open navigation"
                    }
                    aria-expanded={isMobileOpen}
                    aria-controls="careerbridge-sidebar"
                >
                    {isMobileOpen ? "✕" : "☰"}
                </button>

                <div className="cb-mobile-brand">
                    <img src={logoImg} alt="" />
                    <span>CareerBridge</span>
                </div>

                <span
                    className="cb-mobile-brand-spacer"
                    aria-hidden="true"
                />
            </header>

            {/* MOBILE OVERLAY */}

            {isMobile && isMobileOpen && (
                <button
                    type="button"
                    className="cb-sidebar-overlay"
                    onClick={closeMobileMenu}
                    aria-label="Close navigation menu"
                    tabIndex={-1}
                />
            )}

            {/* SIDEBAR */}

            <aside
                id="careerbridge-sidebar"
                className={[
                    "sidebar",
                    isCollapsed && !isMobile
                        ? "sidebar-collapsed"
                        : "",
                    isMobileOpen
                        ? "sidebar-mobile-open"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                aria-label="Main navigation"
            >
                {/* BRAND */}

                <div className="sidebar-logo">
                    <NavLink
                        to="/dashboard"
                        className="sidebar-brand-link"
                        aria-label="CareerBridge dashboard"
                        onClick={closeMobileMenu}
                    >
                        <img
                            src={logoImg}
                            alt="CareerBridge Logo"
                            className="sidebar-logo-image"
                        />

                        <div className="logo-text">
                            <h2>CareerBridge</h2>
                            <span>Career &amp; Placement</span>
                        </div>
                    </NavLink>

                    {/* DESKTOP COLLAPSE BUTTON */}

                    {!isMobile && (
                        <button
                            type="button"
                            className="sidebar-collapse-button"
                            onClick={toggleCollapse}
                            title={
                                isCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                            aria-label={
                                isCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                        >
                            {isCollapsed ? "›" : "‹"}
                        </button>
                    )}
                </div>

                {/* NAVIGATION */}

                <nav className="sidebar-nav">
                    {menuSections.map((section) => (
                        <div
                            className="sidebar-section"
                            key={section.title}
                        >
                            <p className="sidebar-section-title">
                                {section.title}
                            </p>

                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    title={
                                        isCollapsed && !isMobile
                                            ? item.name
                                            : undefined
                                    }
                                    className={({ isActive }) =>
                                        [
                                            "sidebar-link",
                                            isActive ? "active" : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")
                                    }
                                    onClick={closeMobileMenu}
                                >
                                    <span className="sidebar-link-text">
                                        {item.name}
                                    </span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* LOGOUT */}

                <div className="sidebar-bottom">
                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                        title={
                            isCollapsed && !isMobile
                                ? "Logout"
                                : undefined
                        }
                    >
                        <span className="sidebar-link-text">
                            Logout
                        </span>
                    </button>

                    <div className="sidebar-footer-note">
                        

                       
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;