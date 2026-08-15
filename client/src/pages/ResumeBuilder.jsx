import React, { useState } from "react";
import "./ResumeBuilder.css";

const ResumeBuilder = () => {
    const [activeSection, setActiveSection] = useState("personal");

    const [resume, setResume] = useState({
        fullName: "Your Name",
        jobTitle: "Aspiring Data Analyst",
        email: "your.email@example.com",
        phone: "+91 98765 43210",
        location: "Mumbai, India",
        linkedin: "linkedin.com/in/yourname",
        github: "github.com/yourname",

        summary:
            "Motivated student with a strong interest in data analytics, technology and problem solving. Looking to apply technical and analytical skills in a professional environment.",

        education: [
            {
                degree: "Bachelor of Engineering in Information Technology",
                institution: "Your College Name",
                year: "2023 - 2027",
                description: "Relevant coursework: Data Structures, DBMS, Computer Networks, Data Analytics"
            }
        ],

        experience: [
            {
                role: "Project / Internship Role",
                company: "Company Name",
                duration: "2025 - Present",
                description:
                    "Worked on projects involving data analysis, research, reporting and technology. Collaborated with team members to deliver project objectives."
            }
        ],

        skills: [
            "Python",
            "SQL",
            "Excel",
            "Power BI",
            "Pandas",
            "Data Analysis"
        ],

        projects: [
            {
                name: "Project Name",
                technologies: "Python, Pandas, SQL",
                description:
                    "Built a project that solved a practical problem using data analysis and technology."
            }
        ],

        certifications: [
            {
                name: "Certification Name",
                issuer: "Issuing Organization",
                year: "2026"
            }
        ]
    });

    const updateField = (field, value) => {
        setResume({
            ...resume,
            [field]: value
        });
    };

    const updateArrayItem = (section, index, field, value) => {
        const updated = [...resume[section]];

        updated[index] = {
            ...updated[index],
            [field]: value
        };

        setResume({
            ...resume,
            [section]: updated
        });
    };

    const addItem = (section, newItem) => {
        setResume({
            ...resume,
            [section]: [...resume[section], newItem]
        });
    };

    const removeItem = (section, index) => {
        const updated = resume[section].filter(
            (_, itemIndex) => itemIndex !== index
        );

        setResume({
            ...resume,
            [section]: updated
        });
    };

    const sections = [
        {
            id: "personal",
            title: "Personal Information",
            icon: "👤"
        },
        {
            id: "summary",
            title: "Professional Summary",
            icon: "📝"
        },
        {
            id: "education",
            title: "Education",
            icon: "🎓"
        },
        {
            id: "experience",
            title: "Experience",
            icon: "💼"
        },
        {
            id: "skills",
            title: "Skills",
            icon: "🧠"
        },
        {
            id: "projects",
            title: "Projects",
            icon: "🚀"
        },
        {
            id: "certifications",
            title: "Certifications",
            icon: "🏆"
        }
    ];

    return (
        <div className="resume-builder-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="resume-builder-header">

                <div>
                    <p className="resume-breadcrumb">
                        Career Tools / Resume Builder
                    </p>

                    <h1>Resume Builder</h1>

                    <p className="resume-subtitle">
                        Build a professional, ATS-friendly resume in minutes.
                    </p>
                </div>

                <div className="resume-header-actions">
                    <button
                        className="resume-secondary-button"
                        onClick={() => window.print()}
                    >
                        🖨 Print
                    </button>

                    <button
                        className="resume-primary-button"
                        onClick={() => window.print()}
                    >
                        ↓ Download Resume
                    </button>
                </div>

            </div>


            {/* =========================================
                BUILDER
            ========================================= */}

            <div className="resume-builder-container">

                {/* =====================================
                    LEFT FORM PANEL
                ===================================== */}

                <div className="resume-form-panel">

                    <div className="form-panel-header">
                        <div>
                            <h2>Build Your Resume</h2>
                            <p>Fill in your details below</p>
                        </div>

                        <div className="completion-badge">
                            85% Complete
                        </div>
                    </div>


                    {/* SECTION NAVIGATION */}

                    <div className="resume-section-tabs">

                        {sections.map((section) => (
                            <button
                                key={section.id}
                                className={
                                    activeSection === section.id
                                        ? "resume-section-tab active"
                                        : "resume-section-tab"
                                }
                                onClick={() =>
                                    setActiveSection(section.id)
                                }
                            >
                                <span>{section.icon}</span>
                                {section.title}
                            </button>
                        ))}

                    </div>


                    {/* =====================================
                        PERSONAL INFORMATION
                    ===================================== */}

                    {activeSection === "personal" && (
                        <div className="resume-form-content">

                            <div className="form-section-title">
                                <h3>Personal Information</h3>
                                <p>
                                    Add your contact information and professional title.
                                </p>
                            </div>

                            <div className="form-grid">

                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        value={resume.fullName}
                                        onChange={(e) =>
                                            updateField(
                                                "fullName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Professional Title</label>
                                    <input
                                        value={resume.jobTitle}
                                        onChange={(e) =>
                                            updateField(
                                                "jobTitle",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Data Analyst"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        value={resume.email}
                                        onChange={(e) =>
                                            updateField(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        value={resume.phone}
                                        onChange={(e) =>
                                            updateField(
                                                "phone",
                                                e.target.value
                                            )
                                        }
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        value={resume.location}
                                        onChange={(e) =>
                                            updateField(
                                                "location",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Mumbai, India"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>LinkedIn</label>
                                    <input
                                        value={resume.linkedin}
                                        onChange={(e) =>
                                            updateField(
                                                "linkedin",
                                                e.target.value
                                            )
                                        }
                                        placeholder="linkedin.com/in/yourname"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>GitHub</label>
                                    <input
                                        value={resume.github}
                                        onChange={(e) =>
                                            updateField(
                                                "github",
                                                e.target.value
                                            )
                                        }
                                        placeholder="github.com/yourname"
                                    />
                                </div>

                            </div>

                        </div>
                    )}


                    {/* =====================================
                        SUMMARY
                    ===================================== */}

                    {activeSection === "summary" && (
                        <div className="resume-form-content">

                            <div className="form-section-title">
                                <h3>Professional Summary</h3>
                                <p>
                                    Write a short summary that highlights your
                                    strengths and career goals.
                                </p>
                            </div>

                            <div className="form-group">
                                <label>Summary</label>

                                <textarea
                                    rows="8"
                                    value={resume.summary}
                                    onChange={(e) =>
                                        updateField(
                                            "summary",
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="character-count">
                                    {resume.summary.length} characters
                                </span>
                            </div>

                        </div>
                    )}


                    {/* =====================================
                        EDUCATION
                    ===================================== */}

                    {activeSection === "education" && (
                        <div className="resume-form-content">

                            <div className="form-section-title-row">

                                <div>
                                    <h3>Education</h3>
                                    <p>Add your academic background.</p>
                                </div>

                                <button
                                    className="add-button"
                                    onClick={() =>
                                        addItem("education", {
                                            degree: "",
                                            institution: "",
                                            year: "",
                                            description: ""
                                        })
                                    }
                                >
                                    + Add Education
                                </button>

                            </div>

                            {resume.education.map((item, index) => (
                                <div
                                    className="repeatable-form-card"
                                    key={index}
                                >

                                    <div className="repeatable-card-header">
                                        <strong>
                                            Education {index + 1}
                                        </strong>

                                        {resume.education.length > 1 && (
                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    removeItem(
                                                        "education",
                                                        index
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>

                                    <div className="form-grid">

                                        <div className="form-group full-width">
                                            <label>Degree / Course</label>
                                            <input
                                                value={item.degree}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "education",
                                                        index,
                                                        "degree",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Institution</label>
                                            <input
                                                value={item.institution}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "education",
                                                        index,
                                                        "institution",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Year</label>
                                            <input
                                                value={item.year}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "education",
                                                        index,
                                                        "year",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Description</label>
                                            <textarea
                                                rows="4"
                                                value={item.description}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "education",
                                                        index,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}


                    {/* =====================================
                        EXPERIENCE
                    ===================================== */}

                    {activeSection === "experience" && (
                        <div className="resume-form-content">

                            <div className="form-section-title-row">

                                <div>
                                    <h3>Experience</h3>
                                    <p>Add internships, jobs or work experience.</p>
                                </div>

                                <button
                                    className="add-button"
                                    onClick={() =>
                                        addItem("experience", {
                                            role: "",
                                            company: "",
                                            duration: "",
                                            description: ""
                                        })
                                    }
                                >
                                    + Add Experience
                                </button>

                            </div>

                            {resume.experience.map((item, index) => (
                                <div
                                    className="repeatable-form-card"
                                    key={index}
                                >

                                    <div className="repeatable-card-header">
                                        <strong>
                                            Experience {index + 1}
                                        </strong>

                                        {resume.experience.length > 1 && (
                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    removeItem(
                                                        "experience",
                                                        index
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>

                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label>Job Title</label>
                                            <input
                                                value={item.role}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "experience",
                                                        index,
                                                        "role",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Company</label>
                                            <input
                                                value={item.company}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "experience",
                                                        index,
                                                        "company",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Duration</label>
                                            <input
                                                value={item.duration}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "experience",
                                                        index,
                                                        "duration",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Description</label>
                                            <textarea
                                                rows="5"
                                                value={item.description}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "experience",
                                                        index,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}


                    {/* =====================================
                        SKILLS
                    ===================================== */}

                    {activeSection === "skills" && (
                        <div className="resume-form-content">

                            <div className="form-section-title">
                                <h3>Skills</h3>
                                <p>
                                    Add technical and professional skills.
                                </p>
                            </div>

                            <div className="skills-editor">

                                {resume.skills.map((skill, index) => (
                                    <div
                                        className="skill-input-row"
                                        key={index}
                                    >
                                        <input
                                            value={skill}
                                            onChange={(e) => {
                                                const updated = [
                                                    ...resume.skills
                                                ];

                                                updated[index] =
                                                    e.target.value;

                                                setResume({
                                                    ...resume,
                                                    skills: updated
                                                });
                                            }}
                                        />

                                        <button
                                            className="skill-delete"
                                            onClick={() =>
                                                removeItem(
                                                    "skills",
                                                    index
                                                )
                                            }
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                                <button
                                    className="add-button"
                                    onClick={() =>
                                        setResume({
                                            ...resume,
                                            skills: [
                                                ...resume.skills,
                                                "New Skill"
                                            ]
                                        })
                                    }
                                >
                                    + Add Skill
                                </button>

                            </div>

                        </div>
                    )}


                    {/* =====================================
                        PROJECTS
                    ===================================== */}

                    {activeSection === "projects" && (
                        <div className="resume-form-content">

                            <div className="form-section-title-row">

                                <div>
                                    <h3>Projects</h3>
                                    <p>Showcase your strongest projects.</p>
                                </div>

                                <button
                                    className="add-button"
                                    onClick={() =>
                                        addItem("projects", {
                                            name: "",
                                            technologies: "",
                                            description: ""
                                        })
                                    }
                                >
                                    + Add Project
                                </button>

                            </div>

                            {resume.projects.map((item, index) => (
                                <div
                                    className="repeatable-form-card"
                                    key={index}
                                >

                                    <div className="repeatable-card-header">
                                        <strong>
                                            Project {index + 1}
                                        </strong>

                                        {resume.projects.length > 1 && (
                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    removeItem(
                                                        "projects",
                                                        index
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>

                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label>Project Name</label>

                                            <input
                                                value={item.name}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "projects",
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Technologies</label>

                                            <input
                                                value={item.technologies}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "projects",
                                                        index,
                                                        "technologies",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Description</label>

                                            <textarea
                                                rows="5"
                                                value={item.description}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "projects",
                                                        index,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}


                    {/* =====================================
                        CERTIFICATIONS
                    ===================================== */}

                    {activeSection === "certifications" && (
                        <div className="resume-form-content">

                            <div className="form-section-title-row">

                                <div>
                                    <h3>Certifications</h3>
                                    <p>Add relevant certifications.</p>
                                </div>

                                <button
                                    className="add-button"
                                    onClick={() =>
                                        addItem("certifications", {
                                            name: "",
                                            issuer: "",
                                            year: ""
                                        })
                                    }
                                >
                                    + Add Certification
                                </button>

                            </div>

                            {resume.certifications.map((item, index) => (
                                <div
                                    className="repeatable-form-card"
                                    key={index}
                                >

                                    <div className="repeatable-card-header">
                                        <strong>
                                            Certification {index + 1}
                                        </strong>

                                        {resume.certifications.length > 1 && (
                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    removeItem(
                                                        "certifications",
                                                        index
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>

                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label>Certification</label>

                                            <input
                                                value={item.name}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "certifications",
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Issuer</label>

                                            <input
                                                value={item.issuer}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "certifications",
                                                        index,
                                                        "issuer",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Year</label>

                                            <input
                                                value={item.year}
                                                onChange={(e) =>
                                                    updateArrayItem(
                                                        "certifications",
                                                        index,
                                                        "year",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}

                </div>


                {/* =========================================
                    RIGHT PREVIEW PANEL
                ========================================= */}

                <div className="resume-preview-panel">

                    <div className="preview-header">

                        <div>
                            <h2>Live Preview</h2>
                            <span>ATS-Friendly Template</span>
                        </div>

                        <button className="template-button">
                            Template 01 ▾
                        </button>

                    </div>


                    <div className="resume-paper">

                        {/* RESUME HEADER */}

                        <div className="resume-paper-header">

                            <h1>{resume.fullName}</h1>

                            <h2>{resume.jobTitle}</h2>

                            <div className="resume-contact">

                                <span>{resume.email}</span>
                                <span>•</span>
                                <span>{resume.phone}</span>
                                <span>•</span>
                                <span>{resume.location}</span>

                            </div>

                            <div className="resume-links">

                                <span>{resume.linkedin}</span>

                                <span>{resume.github}</span>

                            </div>

                        </div>


                        {/* SUMMARY */}

                        <ResumePreviewSection title="PROFESSIONAL SUMMARY">

                            <p className="preview-summary">
                                {resume.summary}
                            </p>

                        </ResumePreviewSection>


                        {/* EXPERIENCE */}

                        <ResumePreviewSection title="EXPERIENCE">

                            {resume.experience.map((item, index) => (

                                <div
                                    className="preview-entry"
                                    key={index}
                                >

                                    <div className="preview-entry-heading">

                                        <strong>
                                            {item.role}
                                        </strong>

                                        <span>
                                            {item.duration}
                                        </span>

                                    </div>

                                    <div className="preview-company">
                                        {item.company}
                                    </div>

                                    <p>
                                        {item.description}
                                    </p>

                                </div>

                            ))}

                        </ResumePreviewSection>


                        {/* EDUCATION */}

                        <ResumePreviewSection title="EDUCATION">

                            {resume.education.map((item, index) => (

                                <div
                                    className="preview-entry"
                                    key={index}
                                >

                                    <div className="preview-entry-heading">

                                        <strong>
                                            {item.degree}
                                        </strong>

                                        <span>
                                            {item.year}
                                        </span>

                                    </div>

                                    <div className="preview-company">
                                        {item.institution}
                                    </div>

                                    <p>
                                        {item.description}
                                    </p>

                                </div>

                            ))}

                        </ResumePreviewSection>


                        {/* SKILLS */}

                        <ResumePreviewSection title="SKILLS">

                            <div className="preview-skills">

                                {resume.skills.map((skill, index) => (
                                    <span key={index}>
                                        {skill}
                                    </span>
                                ))}

                            </div>

                        </ResumePreviewSection>


                        {/* PROJECTS */}

                        <ResumePreviewSection title="PROJECTS">

                            {resume.projects.map((item, index) => (

                                <div
                                    className="preview-entry"
                                    key={index}
                                >

                                    <div className="preview-entry-heading">

                                        <strong>
                                            {item.name}
                                        </strong>

                                    </div>

                                    <div className="preview-company">
                                        {item.technologies}
                                    </div>

                                    <p>
                                        {item.description}
                                    </p>

                                </div>

                            ))}

                        </ResumePreviewSection>


                        {/* CERTIFICATIONS */}

                        <ResumePreviewSection title="CERTIFICATIONS">

                            {resume.certifications.map((item, index) => (

                                <div
                                    className="preview-entry"
                                    key={index}
                                >

                                    <div className="preview-entry-heading">

                                        <strong>
                                            {item.name}
                                        </strong>

                                        <span>
                                            {item.year}
                                        </span>

                                    </div>

                                    <div className="preview-company">
                                        {item.issuer}
                                    </div>

                                </div>

                            ))}

                        </ResumePreviewSection>

                    </div>

                </div>

            </div>

        </div>
    );
};


/* =========================================
   RESUME PREVIEW SECTION
========================================= */

const ResumePreviewSection = ({ title, children }) => {
    return (
        <section className="resume-preview-section">

            <h3>{title}</h3>

            <div className="section-line"></div>

            {children}

        </section>
    );
};

export default ResumeBuilder;