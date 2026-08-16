import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./CareerRoadmap.css";

/* =====================================================
   ROLE ROADMAP DATA
===================================================== */

const ROADMAPS = {
    "ui-ux": {
        title: "UI/UX Designer",
        subtitle:
            "A practical progression from design fundamentals to professional UX case studies and portfolio readiness.",

        stages: [
            {
                number: "01",
                title: "Design Foundations",
                duration: "2–3 weeks",
                description:
                    "Build the visual and design-thinking foundation required before moving into product design.",
                skills: [
                    "Design principles",
                    "Typography",
                    "Color theory",
                    "Layout & composition",
                    "Visual hierarchy",
                ],
                outcome:
                    "Understand why an interface looks and feels effective."
            },

            {
                number: "02",
                title: "UX Research & Information Architecture",
                duration: "3–4 weeks",
                description:
                    "Learn how to understand users, define problems and structure digital experiences.",
                skills: [
                    "User interviews",
                    "User personas",
                    "User journeys",
                    "Information architecture",
                    "Usability testing",
                ],
                outcome:
                    "Turn user problems into structured UX decisions."
            },

            {
                number: "03",
                title: "Wireframing & Prototyping",
                duration: "3–4 weeks",
                description:
                    "Move from ideas to low and high-fidelity interactive product designs.",
                skills: [
                    "Wireframes",
                    "User flows",
                    "Figma",
                    "Interactive prototypes",
                    "Design iteration",
                ],
                outcome:
                    "Create complete user flows and interactive prototypes."
            },

            {
                number: "04",
                title: "UI Design & Design Systems",
                duration: "3–5 weeks",
                description:
                    "Develop polished interfaces and learn how professional products maintain visual consistency.",
                skills: [
                    "UI patterns",
                    "Responsive design",
                    "Components",
                    "Design systems",
                    "Accessibility",
                ],
                outcome:
                    "Design scalable and consistent product interfaces."
            },

            {
                number: "05",
                title: "Real Product Projects",
                duration: "4–6 weeks",
                description:
                    "Apply the complete UX process to realistic product problems.",
                skills: [
                    "Problem definition",
                    "Research",
                    "Wireframes",
                    "Prototype",
                    "Usability testing",
                ],
                outcome:
                    "Complete 2–3 end-to-end product design projects."
            },

            {
                number: "06",
                title: "Portfolio & Case Studies",
                duration: "2–3 weeks",
                description:
                    "Convert your projects into professional case studies that communicate your thinking.",
                skills: [
                    "Case study writing",
                    "Problem → solution story",
                    "Design decisions",
                    "Before / after",
                    "Portfolio presentation",
                ],
                outcome:
                    "Build a portfolio that demonstrates design thinking."
            },

            {
                number: "07",
                title: "Job Readiness",
                duration: "Ongoing",
                description:
                    "Prepare for interviews, portfolio reviews and real-world product design discussions.",
                skills: [
                    "Portfolio review",
                    "Design challenges",
                    "UX interviews",
                    "Product thinking",
                    "Communication",
                ],
                outcome:
                    "Become ready for UI/UX Designer internship and job applications."
            },
        ],
    },

    "data-analyst": {
        title: "Data Analyst",
        subtitle:
            "A practical path from data fundamentals to SQL, Python, visualization, portfolio projects and analyst job readiness.",

        stages: [
            {
                number: "01",
                title: "Data & Excel Foundations",
                duration: "2–3 weeks",
                description:
                    "Understand how business data is structured and learn the spreadsheet skills used in everyday analysis.",
                skills: [
                    "Data types",
                    "Excel formulas",
                    "Filtering & sorting",
                    "Pivot tables",
                    "Data cleaning",
                ],
                outcome:
                    "Comfortably inspect, clean and summarize business datasets."
            },

            {
                number: "02",
                title: "SQL & Relational Databases",
                duration: "4–5 weeks",
                description:
                    "Build the most important querying skills for extracting information from databases.",
                skills: [
                    "SELECT",
                    "WHERE",
                    "JOINs",
                    "GROUP BY",
                    "Subqueries",
                    "CTEs",
                    "Window functions",
                ],
                outcome:
                    "Answer real business questions using SQL."
            },

            {
                number: "03",
                title: "Statistics & Analytical Thinking",
                duration: "3–4 weeks",
                description:
                    "Develop the statistical reasoning needed to interpret data correctly.",
                skills: [
                    "Mean / median",
                    "Variance",
                    "Probability",
                    "Distributions",
                    "Correlation",
                    "Hypothesis testing",
                ],
                outcome:
                    "Interpret patterns and make statistically informed conclusions."
            },

            {
                number: "04",
                title: "Python for Data Analysis",
                duration: "4–5 weeks",
                description:
                    "Use Python to automate analysis and work with larger datasets.",
                skills: [
                    "Python fundamentals",
                    "NumPy",
                    "Pandas",
                    "Data cleaning",
                    "Data transformation",
                    "Exploratory analysis",
                ],
                outcome:
                    "Perform repeatable analysis using Python."
            },

            {
                number: "05",
                title: "Visualization & BI",
                duration: "3–4 weeks",
                description:
                    "Learn how to convert analysis into dashboards and decision-ready reports.",
                skills: [
                    "Chart selection",
                    "Power BI",
                    "Dashboard design",
                    "KPIs",
                    "Data storytelling",
                ],
                outcome:
                    "Create dashboards that communicate useful business insights."
            },

            {
                number: "06",
                title: "End-to-End Analytics Projects",
                duration: "4–6 weeks",
                description:
                    "Combine SQL, Python and BI skills to solve realistic analytical problems.",
                skills: [
                    "Business problem",
                    "Data extraction",
                    "Data cleaning",
                    "Analysis",
                    "Dashboard",
                    "Recommendations",
                ],
                outcome:
                    "Build 2–3 portfolio-ready analytics projects."
            },

            {
                number: "07",
                title: "Portfolio & Job Readiness",
                duration: "Ongoing",
                description:
                    "Prepare projects, resume and interview skills for analyst roles.",
                skills: [
                    "SQL interviews",
                    "Case studies",
                    "Portfolio",
                    "Resume",
                    "Business communication",
                ],
                outcome:
                    "Become ready for Data Analyst internships and job applications."
            },
        ],
    },

    "software-developer": {
        title: "Software Developer",
        subtitle:
            "A structured progression from programming fundamentals to application development, engineering practices and job-ready projects.",

        stages: [
            {
                number: "01",
                title: "Programming Foundations",
                duration: "3–5 weeks",
                description:
                    "Build strong programming fundamentals using one primary language.",
                skills: [
                    "Variables",
                    "Conditions",
                    "Loops",
                    "Functions",
                    "Error handling",
                    "OOP basics",
                ],
                outcome:
                    "Write clean programs without relying heavily on tutorials."
            },

            {
                number: "02",
                title: "Data Structures & Algorithms",
                duration: "5–7 weeks",
                description:
                    "Develop problem-solving skills needed for software engineering work and interviews.",
                skills: [
                    "Arrays",
                    "Strings",
                    "Stacks",
                    "Queues",
                    "Hash maps",
                    "Trees",
                    "Searching & sorting",
                ],
                outcome:
                    "Solve programming problems with appropriate data structures."
            },

            {
                number: "03",
                title: "Web & Application Development",
                duration: "5–7 weeks",
                description:
                    "Learn how complete applications are structured and communicate with backend services.",
                skills: [
                    "HTTP",
                    "REST APIs",
                    "Frontend basics",
                    "Backend basics",
                    "Authentication",
                    "Databases",
                ],
                outcome:
                    "Build functional full-stack or application-level features."
            },

            {
                number: "04",
                title: "Engineering Practices",
                duration: "3–4 weeks",
                description:
                    "Move from simply writing code to developing maintainable software.",
                skills: [
                    "Git",
                    "Testing",
                    "Debugging",
                    "Code reviews",
                    "Environment management",
                    "Clean code",
                ],
                outcome:
                    "Work with codebases using professional development practices."
            },

            {
                number: "05",
                title: "Real-World Applications",
                duration: "5–8 weeks",
                description:
                    "Build substantial projects that demonstrate engineering ability.",
                skills: [
                    "Application architecture",
                    "Database design",
                    "API integration",
                    "Authentication",
                    "Deployment",
                    "Testing",
                ],
                outcome:
                    "Complete 2–3 serious software projects."
            },

            {
                number: "06",
                title: "Portfolio & Interview Preparation",
                duration: "3–4 weeks",
                description:
                    "Present your projects effectively and prepare for technical interviews.",
                skills: [
                    "GitHub",
                    "Project documentation",
                    "DSA practice",
                    "System basics",
                    "Technical communication",
                ],
                outcome:
                    "Become ready for software developer interviews."
            },
        ],
    },

    cybersecurity: {
        title: "Cybersecurity",
        subtitle:
            "A practical security path covering networking, systems, security fundamentals, defensive skills and hands-on security projects.",

        stages: [
            {
                number: "01",
                title: "IT & Networking Foundations",
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
                outcome:
                    "Understand how computers and networks communicate."
            },

            {
                number: "02",
                title: "Security Fundamentals",
                duration: "3–4 weeks",
                description:
                    "Learn core security concepts and common attack categories.",
                skills: [
                    "CIA triad",
                    "Authentication",
                    "Authorization",
                    "Threats",
                    "Vulnerabilities",
                    "Risk",
                ],
                outcome:
                    "Understand the foundations of information security."
            },

            {
                number: "03",
                title: "Linux & Security Tools",
                duration: "4–5 weeks",
                description:
                    "Build command-line and security-tool proficiency through controlled labs.",
                skills: [
                    "Linux",
                    "Shell",
                    "Logs",
                    "Network analysis",
                    "Security tooling",
                    "Lab environments",
                ],
                outcome:
                    "Investigate systems and security events using practical tools."
            },

            {
                number: "04",
                title: "Defensive Security & Monitoring",
                duration: "4–6 weeks",
                description:
                    "Learn how security teams detect, investigate and respond to suspicious activity.",
                skills: [
                    "Log analysis",
                    "SIEM concepts",
                    "Incident response",
                    "Threat detection",
                    "Indicators of compromise",
                    "Security monitoring",
                ],
                outcome:
                    "Understand the workflow of a defensive security team."
            },

            {
                number: "05",
                title: "Hands-On Security Labs",
                duration: "5–8 weeks",
                description:
                    "Apply security concepts through legal and controlled practice environments.",
                skills: [
                    "CTF labs",
                    "Incident investigations",
                    "Network analysis",
                    "Security reports",
                    "Detection exercises",
                ],
                outcome:
                    "Build practical evidence of security skills."
            },

            {
                number: "06",
                title: "Specialization & Job Readiness",
                duration: "Ongoing",
                description:
                    "Choose a direction such as SOC, cloud security, application security or security testing.",
                skills: [
                    "Specialization",
                    "Security projects",
                    "Resume",
                    "Portfolio",
                    "Interview preparation",
                ],
                outcome:
                    "Prepare for entry-level cybersecurity opportunities."
            },
        ],
    },

    "cloud-devops": {
        title: "Cloud / DevOps",
        subtitle:
            "A practical progression from Linux and networking to cloud infrastructure, automation, containers, CI/CD and production practices.",

        stages: [
            {
                number: "01",
                title: "Linux & Networking Foundations",
                duration: "4–5 weeks",
                description:
                    "Understand the operating systems and networking concepts behind modern infrastructure.",
                skills: [
                    "Linux",
                    "Shell",
                    "Processes",
                    "TCP/IP",
                    "DNS",
                    "SSH",
                ],
                outcome:
                    "Comfortably work from a Linux command line and understand network fundamentals."
            },

            {
                number: "02",
                title: "Git & Automation",
                duration: "2–3 weeks",
                description:
                    "Learn the version-control and scripting practices used in engineering teams.",
                skills: [
                    "Git",
                    "Branches",
                    "Shell scripting",
                    "Automation",
                    "Environment variables",
                ],
                outcome:
                    "Automate repeatable development and infrastructure tasks."
            },

            {
                number: "03",
                title: "Cloud Fundamentals",
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
                outcome:
                    "Deploy and manage basic cloud infrastructure."
            },

            {
                number: "04",
                title: "Containers & Infrastructure as Code",
                duration: "4–5 weeks",
                description:
                    "Learn how modern infrastructure is packaged, provisioned and reproduced.",
                skills: [
                    "Docker",
                    "Container images",
                    "Docker Compose",
                    "Terraform",
                    "Infrastructure as Code",
                ],
                outcome:
                    "Create repeatable infrastructure and containerized applications."
            },

            {
                number: "05",
                title: "CI/CD & Kubernetes",
                duration: "5–7 weeks",
                description:
                    "Build deployment pipelines and understand container orchestration.",
                skills: [
                    "CI/CD",
                    "Build pipelines",
                    "Deployment strategies",
                    "Kubernetes",
                    "Services",
                    "Secrets",
                ],
                outcome:
                    "Build automated deployment workflows."
            },

            {
                number: "06",
                title: "Production Projects & Job Readiness",
                duration: "5–8 weeks",
                description:
                    "Combine cloud, automation and monitoring skills into production-style projects.",
                skills: [
                    "Cloud project",
                    "CI/CD pipeline",
                    "Monitoring",
                    "Logging",
                    "Security",
                    "Documentation",
                ],
                outcome:
                    "Build a DevOps portfolio demonstrating practical infrastructure skills."
            },
        ],
    },
};


/* =====================================================
   FALLBACK
===================================================== */

const DEFAULT_ROLE = "data-analyst";


/* =====================================================
   COMPONENT
===================================================== */

function CareerRoadmap() {
    const navigate = useNavigate();

    const role =
        localStorage.getItem("selectedRole") ||
        DEFAULT_ROLE;

    const roadmap = useMemo(() => {
        return (
            ROADMAPS[role] ??
            ROADMAPS[DEFAULT_ROLE]
        );
    }, [role]);

    const handleDashboard = () => {
        navigate("/dashboard");
    };

    const handleAssessment = () => {
        navigate("/assessment-result");
    };

    return (
        <div className="career-roadmap-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="roadmap-sidebar">

                <div className="roadmap-sidebar-brand">

                    <div className="roadmap-brand-logo">
                        C
                    </div>

                    <div>
                        <strong>
                            CareerBridge
                        </strong>

                        <span>
                            Career Development
                        </span>
                    </div>

                </div>


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
                        Assessment
                    </button>

                    <button
                        type="button"
                        className="roadmap-nav-item active"
                    >
                        <span>◆</span>
                        Career Roadmap
                    </button>

                </nav>


                <div className="roadmap-sidebar-bottom">

                    <div className="roadmap-role-box">

                        <span>
                            YOUR SELECTED ROLE
                        </span>

                        <strong>
                            {roadmap.title}
                        </strong>

                    </div>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="career-roadmap-main">

                {/* HEADER */}

                <header className="roadmap-page-header">

                    <div>

                        <p className="roadmap-eyebrow">
                            CAREER DEVELOPMENT
                        </p>

                        <h1>
                            {roadmap.title} Roadmap
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
                    ROADMAP OVERVIEW
                ================================================= */}

                <section className="roadmap-overview">

                    <div className="roadmap-overview-card">

                        <span className="overview-number">
                            {roadmap.stages.length}
                        </span>

                        <div>
                            <strong>
                                Learning Stages
                            </strong>

                            <span>
                                From foundation to job readiness
                            </span>
                        </div>

                    </div>


                    <div className="roadmap-overview-card">

                        <span className="overview-icon">
                            →
                        </span>

                        <div>
                            <strong>
                                Progressive Path
                            </strong>

                            <span>
                                Each stage builds on the previous one
                            </span>
                        </div>

                    </div>


                    <div className="roadmap-overview-card">

                        <span className="overview-icon">
                            ◆
                        </span>

                        <div>
                            <strong>
                                Project Based
                            </strong>

                            <span>
                                Practical outcomes at every stage
                            </span>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    VISUAL FLOWCHART
                ================================================= */}

                <section className="roadmap-flow-section">

                    <div className="roadmap-section-title">

                        <div>
                            <h2>
                                Your Learning Journey
                            </h2>

                            <p>
                                Follow the stages in order. Each stage
                                gives you the skills needed for the next.
                            </p>
                        </div>

                    </div>


                    <div className="roadmap-flow">

                        {roadmap.stages.map(
                            (stage, index) => (

                                <React.Fragment
                                    key={stage.number}
                                >

                                    <article
                                        className={`roadmap-stage ${
                                            index === 0
                                                ? "first-stage"
                                                : ""
                                        }`}
                                    >

                                        <div className="stage-number">
                                            {stage.number}
                                        </div>

                                        <div className="stage-content">

                                            <div className="stage-header">

                                                <div>

                                                    <h3>
                                                        {stage.title}
                                                    </h3>

                                                    <span className="stage-duration">
                                                        {stage.duration}
                                                    </span>

                                                </div>

                                            </div>


                                            <p className="stage-description">
                                                {stage.description}
                                            </p>


                                            <div className="stage-skills">

                                                {stage.skills.map(
                                                    (skill) => (
                                                        <span
                                                            key={
                                                                skill
                                                            }
                                                        >
                                                            {skill}
                                                        </span>
                                                    )
                                                )}

                                            </div>


                                            <div className="stage-outcome">

                                                <span>
                                                    OUTCOME
                                                </span>

                                                <p>
                                                    {stage.outcome}
                                                </p>

                                            </div>

                                        </div>

                                    </article>


                                    {index <
                                        roadmap.stages.length -
                                            1 && (

                                        <div className="roadmap-connector">

                                            <div className="connector-line"></div>

                                            <div className="connector-arrow">
                                                ↓
                                            </div>

                                        </div>

                                    )}

                                </React.Fragment>

                            )
                        )}

                    </div>

                </section>


                {/* =================================================
                    FINAL READINESS
                ================================================= */}

                <section className="roadmap-finish">

                    <div className="finish-icon">
                        ✓
                    </div>

                    <div>

                        <p>
                            FINAL DESTINATION
                        </p>

                        <h2>
                            Ready for {roadmap.title} Opportunities
                        </h2>

                        <span>
                            Complete the roadmap with practical
                            projects, a strong portfolio and focused
                            interview preparation.
                        </span>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default CareerRoadmap;