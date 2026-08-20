import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./CareerRoadmap.css";

/* =========================================================
   CAREER ROADMAP DATA
========================================================= */

const ROADMAPS = {
    "data-analyst": {
        title: "Data Analyst",
        shortTitle: "Data Analyst",
        subtitle:
            "A structured journey from data fundamentals to SQL, Python, visualization, real-world projects and placement readiness.",
        totalDuration: "24–30 weeks",

        stages: [
            {
                number: "01",
                title: "Data & Excel Foundations",
                category: "FOUNDATION",
                duration: "2–3 weeks",
                description:
                    "Build the foundation required to understand, clean and summarize business data.",
                skills: [
                    "Data types",
                    "Excel formulas",
                    "Filtering & sorting",
                    "Pivot tables",
                    "Data cleaning",
                ],
                milestone:
                    "Clean and summarize a real-world dataset.",
                project:
                    "Build an Excel Sales Performance Dashboard",
                outcome:
                    "You can confidently inspect, clean and summarize structured datasets.",
            },

            {
                number: "02",
                title: "SQL & Databases",
                category: "CORE SKILL",
                duration: "4–5 weeks",
                description:
                    "Learn to extract meaningful information from relational databases using SQL.",
                skills: [
                    "SELECT",
                    "WHERE",
                    "JOINs",
                    "GROUP BY",
                    "Subqueries",
                    "CTEs",
                    "Window functions",
                ],
                milestone:
                    "Solve business questions using SQL queries.",
                project:
                    "Analyze Customer & Sales Data using SQL",
                outcome:
                    "You can retrieve, transform and analyze data stored in relational databases.",
            },

            {
                number: "03",
                title: "Statistics & Analytical Thinking",
                category: "ANALYTICS",
                duration: "3–4 weeks",
                description:
                    "Develop the statistical reasoning required to interpret data and identify meaningful patterns.",
                skills: [
                    "Mean & median",
                    "Variance",
                    "Probability",
                    "Distributions",
                    "Correlation",
                    "Hypothesis testing",
                ],
                milestone:
                    "Interpret statistical patterns and relationships.",
                project:
                    "Customer Behaviour Statistical Analysis",
                outcome:
                    "You can explain patterns in data and support conclusions with statistical reasoning.",
            },

            {
                number: "04",
                title: "Python for Data Analysis",
                category: "TECHNICAL SKILL",
                duration: "4–5 weeks",
                description:
                    "Use Python to automate data preparation, exploration and analysis.",
                skills: [
                    "Python",
                    "NumPy",
                    "Pandas",
                    "Data cleaning",
                    "Data transformation",
                    "Exploratory Data Analysis",
                ],
                milestone:
                    "Perform an end-to-end analysis using Python.",
                project:
                    "Python EDA on a Real-World Dataset",
                outcome:
                    "You can perform repeatable data analysis using Python and Pandas.",
            },

            {
                number: "05",
                title: "Data Visualization & Power BI",
                category: "VISUALIZATION",
                duration: "3–4 weeks",
                description:
                    "Transform analytical results into dashboards that communicate insights clearly.",
                skills: [
                    "Chart selection",
                    "Power BI",
                    "KPIs",
                    "Dashboard design",
                    "Data storytelling",
                ],
                milestone:
                    "Create an interactive decision-making dashboard.",
                project:
                    "Power BI Business Intelligence Dashboard",
                outcome:
                    "You can communicate analytical findings through clear and interactive dashboards.",
            },

            {
                number: "06",
                title: "End-to-End Analytics Projects",
                category: "PROJECT",
                duration: "4–6 weeks",
                description:
                    "Combine SQL, Python, Excel and visualization skills to solve realistic analytical problems.",
                skills: [
                    "Business problem",
                    "Data extraction",
                    "Data cleaning",
                    "Exploratory analysis",
                    "Visualization",
                    "Recommendations",
                ],
                milestone:
                    "Complete a complete analytics workflow from raw data to business recommendations.",
                project:
                    "Healthcare / Sales / Customer Analytics Project",
                outcome:
                    "You have portfolio-ready evidence of practical Data Analyst skills.",
            },

            {
                number: "07",
                title: "Portfolio & Job Readiness",
                category: "JOB READY",
                duration: "Ongoing",
                description:
                    "Convert your technical skills and projects into a professional profile for analyst opportunities.",
                skills: [
                    "SQL interview questions",
                    "Case studies",
                    "Resume",
                    "Portfolio",
                    "Business communication",
                    "Mock interviews",
                ],
                milestone:
                    "Successfully complete a simulated Data Analyst interview.",
                project:
                    "Professional Data Analyst Portfolio",
                outcome:
                    "You are prepared for Data Analyst internships and entry-level opportunities.",
            },
        ],
    },

    /* =========================================================
       SOFTWARE DEVELOPER
    ========================================================= */

    "software-developer": {
        title: "Software Developer",
        shortTitle: "Software Developer",
        subtitle:
            "A structured progression from programming fundamentals to application development, engineering practices and job-ready projects.",
        totalDuration: "26–32 weeks",

        stages: [
            {
                number: "01",
                title: "Programming Foundations",
                category: "FOUNDATION",
                duration: "3–5 weeks",
                description:
                    "Build strong programming fundamentals using a primary programming language.",
                skills: [
                    "Variables",
                    "Conditions",
                    "Loops",
                    "Functions",
                    "Error handling",
                    "OOP basics",
                ],
                milestone:
                    "Build small programs without relying heavily on tutorials.",
                project:
                    "Console-Based Student Management System",
                outcome:
                    "You can write structured programs using core programming concepts.",
            },

            {
                number: "02",
                title: "Data Structures & Algorithms",
                category: "CORE SKILL",
                duration: "5–7 weeks",
                description:
                    "Develop problem-solving skills required for software development and technical interviews.",
                skills: [
                    "Arrays",
                    "Strings",
                    "Stacks",
                    "Queues",
                    "Hash maps",
                    "Trees",
                    "Searching & sorting",
                ],
                milestone:
                    "Solve programming problems using appropriate data structures.",
                project:
                    "DSA Problem-Solving Portfolio",
                outcome:
                    "You can approach programming problems systematically.",
            },

            {
                number: "03",
                title: "Web & Application Development",
                category: "DEVELOPMENT",
                duration: "5–7 weeks",
                description:
                    "Learn how frontend, backend, APIs and databases work together.",
                skills: [
                    "HTML/CSS",
                    "JavaScript",
                    "React",
                    "REST APIs",
                    "Backend",
                    "Databases",
                ],
                milestone:
                    "Build a functional full-stack application.",
                project:
                    "Full-Stack Web Application",
                outcome:
                    "You can develop and connect application components.",
            },

            {
                number: "04",
                title: "Engineering Practices",
                category: "ENGINEERING",
                duration: "3–4 weeks",
                description:
                    "Learn professional practices used to develop maintainable software.",
                skills: [
                    "Git",
                    "GitHub",
                    "Testing",
                    "Debugging",
                    "Code reviews",
                    "Clean code",
                ],
                milestone:
                    "Collaborate using Git and maintain a structured codebase.",
                project:
                    "Collaborative GitHub Project",
                outcome:
                    "You understand professional software development workflows.",
            },

            {
                number: "05",
                title: "Real-World Projects",
                category: "PROJECT",
                duration: "5–8 weeks",
                description:
                    "Apply your development skills to substantial applications.",
                skills: [
                    "Application architecture",
                    "Database design",
                    "API integration",
                    "Authentication",
                    "Deployment",
                    "Testing",
                ],
                milestone:
                    "Deploy a complete working application.",
                project:
                    "Production-Style Full-Stack Application",
                outcome:
                    "You have serious projects demonstrating software engineering ability.",
            },

            {
                number: "06",
                title: "Portfolio & Interview Preparation",
                category: "JOB READY",
                duration: "3–4 weeks",
                description:
                    "Prepare your projects, GitHub profile and technical interview skills.",
                skills: [
                    "GitHub",
                    "DSA",
                    "Project explanation",
                    "Technical communication",
                    "Resume",
                    "Mock interviews",
                ],
                milestone:
                    "Complete a simulated software developer interview.",
                project:
                    "Professional Developer Portfolio",
                outcome:
                    "You are ready for software developer opportunities.",
            },
        ],
    },

    /* =========================================================
       UI / UX
    ========================================================= */

    "ui-ux": {
        title: "UI/UX Designer",
        shortTitle: "UI/UX",
        subtitle:
            "A practical progression from design fundamentals to UX research, product design and professional portfolio readiness.",
        totalDuration: "20–26 weeks",

        stages: [
            {
                number: "01",
                title: "Design Foundations",
                category: "FOUNDATION",
                duration: "2–3 weeks",
                description:
                    "Build the visual principles required for effective interface design.",
                skills: [
                    "Design principles",
                    "Typography",
                    "Color theory",
                    "Layout",
                    "Visual hierarchy",
                ],
                milestone:
                    "Create a consistent visual design system.",
                project:
                    "Mobile App Visual Redesign",
                outcome:
                    "You understand the principles behind effective visual interfaces.",
            },

            {
                number: "02",
                title: "UX Research",
                category: "RESEARCH",
                duration: "3–4 weeks",
                description:
                    "Learn to understand users and define meaningful product problems.",
                skills: [
                    "User interviews",
                    "Personas",
                    "User journeys",
                    "Information architecture",
                    "Usability testing",
                ],
                milestone:
                    "Convert user research into clear UX requirements.",
                project:
                    "User Research Case Study",
                outcome:
                    "You can identify and communicate user problems.",
            },

            {
                number: "03",
                title: "Wireframing & Prototyping",
                category: "CORE SKILL",
                duration: "3–4 weeks",
                description:
                    "Move from ideas to interactive product experiences.",
                skills: [
                    "Wireframes",
                    "User flows",
                    "Figma",
                    "Prototypes",
                    "Design iteration",
                ],
                milestone:
                    "Create an interactive prototype.",
                project:
                    "Complete Mobile/Web App Prototype",
                outcome:
                    "You can convert product requirements into usable experiences.",
            },

            {
                number: "04",
                title: "UI Design & Design Systems",
                category: "UI DESIGN",
                duration: "3–5 weeks",
                description:
                    "Create polished and consistent interfaces.",
                skills: [
                    "UI patterns",
                    "Responsive design",
                    "Components",
                    "Design systems",
                    "Accessibility",
                ],
                milestone:
                    "Build a reusable design system.",
                project:
                    "Responsive Product UI",
                outcome:
                    "You can design scalable and consistent interfaces.",
            },

            {
                number: "05",
                title: "Real Product Projects",
                category: "PROJECT",
                duration: "4–6 weeks",
                description:
                    "Apply the complete UX process to realistic product problems.",
                skills: [
                    "Research",
                    "Problem definition",
                    "Wireframes",
                    "Prototype",
                    "Testing",
                ],
                milestone:
                    "Complete an end-to-end product design case study.",
                project:
                    "End-to-End Product Design Case Study",
                outcome:
                    "You have practical UX work for your portfolio.",
            },

            {
                number: "06",
                title: "Portfolio & Job Readiness",
                category: "JOB READY",
                duration: "2–3 weeks",
                description:
                    "Present your design decisions through professional case studies.",
                skills: [
                    "Case studies",
                    "Portfolio",
                    "Design challenges",
                    "UX interviews",
                    "Communication",
                ],
                milestone:
                    "Complete a professional portfolio review.",
                project:
                    "Professional UX Portfolio",
                outcome:
                    "You are ready for UI/UX internships and entry-level roles.",
            },
        ],
    },

    /* =========================================================
       CYBERSECURITY
    ========================================================= */

    cybersecurity: {
        title: "Cybersecurity",
        shortTitle: "Cybersecurity",
        subtitle:
            "A structured security journey from networking and systems fundamentals to defensive security, hands-on labs and job readiness.",
        totalDuration: "25–32 weeks",

        stages: [
            {
                number: "01",
                title: "IT & Networking Foundations",
                category: "FOUNDATION",
                duration: "4–6 weeks",
                description:
                    "Understand the systems and networks that security professionals protect.",
                skills: [
                    "TCP/IP",
                    "DNS",
                    "HTTP",
                    "Ports",
                    "Routing",
                    "Operating systems",
                ],
                milestone:
                    "Explain how a network communication flows.",
                project:
                    "Network Traffic Analysis Lab",
                outcome:
                    "You understand fundamental network communication.",
            },

            {
                number: "02",
                title: "Security Fundamentals",
                category: "CORE SKILL",
                duration: "3–4 weeks",
                description:
                    "Learn the fundamental principles of information security.",
                skills: [
                    "CIA triad",
                    "Authentication",
                    "Authorization",
                    "Threats",
                    "Vulnerabilities",
                    "Risk",
                ],
                milestone:
                    "Perform a basic security risk assessment.",
                project:
                    "Security Risk Assessment Report",
                outcome:
                    "You understand fundamental cybersecurity concepts.",
            },

            {
                number: "03",
                title: "Linux & Security Tools",
                category: "TECHNICAL SKILL",
                duration: "4–5 weeks",
                description:
                    "Develop command-line and security-tool proficiency through controlled labs.",
                skills: [
                    "Linux",
                    "Shell",
                    "Logs",
                    "Network analysis",
                    "Security tools",
                ],
                milestone:
                    "Investigate a controlled security event.",
                project:
                    "Linux Security Investigation Lab",
                outcome:
                    "You can investigate systems using practical security tools.",
            },

            {
                number: "04",
                title: "Defensive Security",
                category: "DEFENSE",
                duration: "4–6 weeks",
                description:
                    "Understand how security teams detect and respond to suspicious activity.",
                skills: [
                    "Log analysis",
                    "SIEM",
                    "Incident response",
                    "Threat detection",
                    "Security monitoring",
                ],
                milestone:
                    "Analyze and document a simulated incident.",
                project:
                    "SOC Incident Investigation",
                outcome:
                    "You understand the workflow of defensive security teams.",
            },

            {
                number: "05",
                title: "Hands-On Security Labs",
                category: "PROJECT",
                duration: "5–8 weeks",
                description:
                    "Apply security concepts through legal and controlled environments.",
                skills: [
                    "CTF labs",
                    "Incident investigation",
                    "Network analysis",
                    "Detection exercises",
                    "Security reports",
                ],
                milestone:
                    "Complete multiple controlled security labs.",
                project:
                    "Cybersecurity Lab Portfolio",
                outcome:
                    "You have practical evidence of security skills.",
            },

            {
                number: "06",
                title: "Specialization & Job Readiness",
                category: "JOB READY",
                duration: "Ongoing",
                description:
                    "Choose a direction such as SOC, cloud security or application security.",
                skills: [
                    "Specialization",
                    "Security projects",
                    "Resume",
                    "Portfolio",
                    "Interview preparation",
                ],
                milestone:
                    "Complete a simulated cybersecurity interview.",
                project:
                    "Professional Cybersecurity Portfolio",
                outcome:
                    "You are prepared for entry-level cybersecurity opportunities.",
            },
        ],
    },

    /* =========================================================
       CLOUD / DEVOPS
    ========================================================= */

    "cloud-devops": {
        title: "Cloud / DevOps",
        shortTitle: "Cloud / DevOps",
        subtitle:
            "A practical progression from Linux and networking to cloud infrastructure, automation, containers, CI/CD and production practices.",
        totalDuration: "26–34 weeks",

        stages: [
            {
                number: "01",
                title: "Linux & Networking",
                category: "FOUNDATION",
                duration: "4–5 weeks",
                description:
                    "Understand the operating systems and networking concepts behind infrastructure.",
                skills: [
                    "Linux",
                    "Shell",
                    "Processes",
                    "TCP/IP",
                    "DNS",
                    "SSH",
                ],
                milestone:
                    "Manage a Linux environment using the command line.",
                project:
                    "Linux Server Administration Lab",
                outcome:
                    "You can work comfortably with Linux and networking fundamentals.",
            },

            {
                number: "02",
                title: "Git & Automation",
                category: "AUTOMATION",
                duration: "2–3 weeks",
                description:
                    "Learn version control and scripting practices used by engineering teams.",
                skills: [
                    "Git",
                    "Branches",
                    "Shell scripting",
                    "Automation",
                    "Environment variables",
                ],
                milestone:
                    "Automate a repetitive development task.",
                project:
                    "Shell Automation Project",
                outcome:
                    "You can automate repeatable development tasks.",
            },

            {
                number: "03",
                title: "Cloud Fundamentals",
                category: "CLOUD",
                duration: "4–6 weeks",
                description:
                    "Understand cloud compute, storage, networking and identity services.",
                skills: [
                    "Compute",
                    "Storage",
                    "Networking",
                    "IAM",
                    "Monitoring",
                    "Cloud architecture",
                ],
                milestone:
                    "Deploy an application to the cloud.",
                project:
                    "Cloud-Hosted Web Application",
                outcome:
                    "You can deploy and manage basic cloud infrastructure.",
            },

            {
                number: "04",
                title: "Docker & Infrastructure as Code",
                category: "INFRASTRUCTURE",
                duration: "4–5 weeks",
                description:
                    "Learn how modern infrastructure is packaged and reproduced.",
                skills: [
                    "Docker",
                    "Container images",
                    "Docker Compose",
                    "Terraform",
                    "Infrastructure as Code",
                ],
                milestone:
                    "Containerize and reproduce an application environment.",
                project:
                    "Dockerized Application",
                outcome:
                    "You can build repeatable containerized environments.",
            },

            {
                number: "05",
                title: "CI/CD & Kubernetes",
                category: "ADVANCED",
                duration: "5–7 weeks",
                description:
                    "Build automated deployment workflows and understand orchestration.",
                skills: [
                    "CI/CD",
                    "Build pipelines",
                    "Deployment strategies",
                    "Kubernetes",
                    "Services",
                    "Secrets",
                ],
                milestone:
                    "Create an automated deployment pipeline.",
                project:
                    "CI/CD Deployment Pipeline",
                outcome:
                    "You understand modern application deployment workflows.",
            },

            {
                number: "06",
                title: "Production Projects & Job Readiness",
                category: "JOB READY",
                duration: "5–8 weeks",
                description:
                    "Combine cloud, automation and monitoring skills into production-style projects.",
                skills: [
                    "Cloud project",
                    "CI/CD",
                    "Monitoring",
                    "Logging",
                    "Security",
                    "Documentation",
                ],
                milestone:
                    "Deploy and monitor a production-style application.",
                project:
                    "End-to-End DevOps Project",
                outcome:
                    "You have a practical DevOps portfolio for entry-level opportunities.",
            },
        ],
    },
};


/* =========================================================
   FALLBACK ROLE
========================================================= */

const DEFAULT_ROLE = "data-analyst";


/* =========================================================
   COMPONENT
========================================================= */

function CareerRoadmap() {
    const navigate = useNavigate();

    /*
     * Read the selected role from localStorage.
     * If nothing exists, Data Analyst is used.
     */
    const role =
        localStorage.getItem("selectedRole") ||
        DEFAULT_ROLE;

    /*
     * Select the roadmap based on the selected role.
     */
    const roadmap = useMemo(() => {
        return (
            ROADMAPS[role] ||
            ROADMAPS[DEFAULT_ROLE]
        );
    }, [role]);


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const handleDashboard = () => {
        navigate("/dashboard");
    };


    const handleAssessment = () => {
        navigate("/assessment-result");
    };


    /*
     * CHANGE CAREER ROADMAP
     *
     * IMPORTANT:
     * This is the function that changes the roadmap.
     */
    const handleRoadmapChange = (selectedRole) => {
        localStorage.setItem(
            "selectedRole",
            selectedRole
        );

        /*
         * Reload the page so the new localStorage
         * value is read by the component.
         */
        window.location.reload();
    };


    /* =====================================================
       PROGRESS
    ===================================================== */

    const currentStage = 0;

    const completedStages = currentStage;

    const progress = Math.round(
        (completedStages /
            roadmap.stages.length) *
            100
    );


    return (
        <div className="career-roadmap-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="roadmap-sidebar">

                {/* BRAND */}

                <div className="roadmap-sidebar-brand">

                    <div className="roadmap-brand-logo">
                        C
                    </div>

                    <div className="roadmap-brand-text">

                        <strong>
                            CareerBridge
                        </strong>

                        <span>
                            Career Development
                        </span>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="roadmap-navigation">

                    <button
                        type="button"
                        onClick={handleDashboard}
                        className="roadmap-nav-item"
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>


                    <button
                        type="button"
                        onClick={handleAssessment}
                        className="roadmap-nav-item"
                    >
                        <span>✓</span>
                        Career Assessment
                    </button>


                    <button
                        type="button"
                        className="roadmap-nav-item active"
                    >
                        <span>◆</span>
                        Career Roadmap
                    </button>

                </nav>


                {/* =================================================
                    CAREER PATH SELECTOR
                ================================================= */}

                <div className="roadmap-sidebar-bottom">

                    {/* CURRENT CAREER */}

                    <div className="roadmap-role-box">

                        <span>
                            YOUR CAREER PATH
                        </span>

                        <strong>
                            {roadmap.shortTitle}
                        </strong>

                    </div>


                    {/* ALL CAREER ROADMAPS */}

                    <div className="roadmap-selector">

                        <span className="roadmap-selector-title">
                            CAREER ROADMAPS
                        </span>


                        {Object.entries(ROADMAPS).map(
                            ([roadmapKey, roadmapData]) => (

                                <button
                                    key={roadmapKey}
                                    type="button"
                                    className={`roadmap-option ${
                                        role === roadmapKey
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleRoadmapChange(
                                            roadmapKey
                                        )
                                    }
                                >

                                    <span className="roadmap-option-dot">
                                        {role === roadmapKey
                                            ? "●"
                                            : "○"}
                                    </span>

                                    <span>
                                        {roadmapData.shortTitle}
                                    </span>

                                </button>

                            )
                        )}

                    </div>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="career-roadmap-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="roadmap-page-header">

                    <div>

                        <p className="roadmap-eyebrow">
                            PERSONALIZED CAREER PATH
                        </p>


                        <h1>

                            {roadmap.title}

                            <span>
                                {" "}Roadmap
                            </span>

                        </h1>


                        <p className="roadmap-subtitle">
                            {roadmap.subtitle}
                        </p>

                    </div>


                    <button
                        type="button"
                        className="roadmap-back-button"
                        onClick={handleAssessment}
                    >
                        ← Assessment Result
                    </button>

                </header>


                {/* =================================================
                    VISUAL ROADMAP
                ================================================= */}

                <section className="roadmap-journey">

                    <div className="journey-line" />


                    {roadmap.stages.map(
                        (stage, index) => {

                            const isCurrent =
                                index === currentStage;

                            const isCompleted =
                                index < currentStage;


                            return (
                                <React.Fragment
                                    key={stage.number}
                                >

                                    {/* =================================================
                                        STAGE
                                    ================================================= */}

                                    <article
                                        className={`journey-stage ${
                                            isCurrent
                                                ? "current-stage"
                                                : ""
                                        } ${
                                            isCompleted
                                                ? "completed-stage"
                                                : ""
                                        }`}
                                    >

                                        {/* TIMELINE NODE */}

                                        <div className="journey-node">

                                            {isCompleted
                                                ? "✓"
                                                : stage.number}

                                        </div>


                                        {/* STAGE CARD */}

                                        <div className="journey-card">

                                            {/* CARD TOP */}

                                            <div className="journey-card-top">

                                                <div>

                                                    <span className="stage-category">
                                                        {
                                                            stage.category
                                                        }
                                                    </span>


                                                    <h3>
                                                        {
                                                            stage.title
                                                        }
                                                    </h3>

                                                </div>


                                                <span className="stage-time">
                                                    ⏱{" "}
                                                    {
                                                        stage.duration
                                                    }
                                                </span>

                                            </div>


                                            {/* DESCRIPTION */}

                                            <p className="journey-description">
                                                {
                                                    stage.description
                                                }
                                            </p>


                                            {/* =================================================
                                                SKILLS
                                            ================================================= */}

                                            <div className="journey-section">

                                                <div className="journey-section-label">

                                                    <span>
                                                        ✦
                                                    </span>

                                                    SKILLS TO DEVELOP

                                                </div>


                                                <div className="journey-skills">

                                                    {stage.skills.map(
                                                        (skill) => (

                                                            <span
                                                                key={
                                                                    skill
                                                                }
                                                            >
                                                                {
                                                                    skill
                                                                }
                                                            </span>

                                                        )
                                                    )}

                                                </div>

                                            </div>


                                            {/* =================================================
                                                PROJECT
                                            ================================================= */}

                                            <div className="journey-project">

                                                <div className="project-icon">
                                                    ↗
                                                </div>


                                                <div>

                                                    <span>
                                                        PRACTICAL PROJECT
                                                    </span>


                                                    <strong>
                                                        {
                                                            stage.project
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* =================================================
                                                OUTCOME
                                            ================================================= */}

                                            <div className="journey-outcome">

                                                <span>
                                                    OUTCOME
                                                </span>


                                                <p>
                                                    {
                                                        stage.outcome
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                    </article>


                                    {/* =================================================
                                        CONNECTOR
                                    ================================================= */}

                                    {index <
                                        roadmap.stages.length -
                                            1 && (

                                        <div className="journey-connector">

                                            <span>
                                                ↓
                                            </span>

                                        </div>

                                    )}

                                </React.Fragment>
                            );
                        }
                    )}

                </section>


                {/* =================================================
                    FINAL DESTINATION
                ================================================= */}

                <section className="roadmap-finish">

                    <div className="finish-icon">
                        ✓
                    </div>


                    <div className="finish-content">

                        <span>
                            FINAL DESTINATION
                        </span>


                        <h2>
                            Job Ready
                        </h2>


                        <p>
                            Complete the roadmap, build your
                            portfolio, strengthen your resume
                            and practice interviews to become
                            ready for {roadmap.title} opportunities.
                        </p>

                    </div>


                    <div className="finish-badge">

                        <span>
                            CAREER
                        </span>

                        <strong>
                            READY
                        </strong>

                    </div>

                </section>


                {/* =================================================
                    FOOTER NOTE
                ================================================= */}

                <div className="roadmap-footer-note">

                    <span>
                        CareerBridge
                    </span>


                    <p>
                        Your career path is a journey.
                        Build one skill at a time.
                    </p>

                </div>

            </main>

        </div>
    );
}


export default CareerRoadmap;