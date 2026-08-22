
import React, { useState } from "react";
import "./ResumeBuilder.css";

const ResumeBuilder = () => {
    const [activeSection, setActiveSection] = useState("personal");
    const [selectedTemplate, setSelectedTemplate] = useState("modern");
    const [showTemplates, setShowTemplates] = useState(false);

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
                description:
                    "Relevant coursework: Data Structures, DBMS, Computer Networks, Data Analytics"
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

    /* =========================================
       TEMPLATES
    ========================================= */

    const templates = [
        {
            id: "modern",
            name: "Modern",
            icon: "✨",
            description: "Clean professional design",
            color: "#7c3aed"
        },
        {
            id: "classic",
            name: "Classic",
            icon: "◼",
            description: "Traditional ATS layout",
            color: "#303030"
        },
        {
            id: "minimal",
            name: "Minimal",
            icon: "○",
            description: "Simple and elegant",
            color: "#555555"
        },
        {
            id: "executive",
            name: "Executive",
            icon: "◆",
            description: "Premium professional",
            color: "#312e81"
        },
        {
            id: "tech",
            name: "Tech",
            icon: "💻",
            description: "Designed for IT roles",
            color: "#0f766e"
        },
        {
            id: "fresher",
            name: "Fresher",
            icon: "🎓",
            description: "Perfect for students",
            color: "#8b5cf6"
        },
        {
            id: "creative",
            name: "Creative",
            icon: "🎨",
            description: "Modern creative style",
            color: "#c026d3"
        },
        {
            id: "academic",
            name: "Academic",
            icon: "📚",
            description: "Education focused",
            color: "#92400e"
        }
    ];

    /* =========================================
       UPDATE FUNCTIONS
    ========================================= */

    const updateField = (field, value) => {
        setResume((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const updateArrayItem = (section, index, field, value) => {
        setResume((prev) => {
            const updated = [...prev[section]];

            updated[index] = {
                ...updated[index],
                [field]: value
            };

            return {
                ...prev,
                [section]: updated
            };
        });
    };

    const addItem = (section, newItem) => {
        setResume((prev) => ({
            ...prev,
            [section]: [...prev[section], newItem]
        }));
    };

    const removeItem = (section, index) => {
        setResume((prev) => ({
            ...prev,
            [section]: prev[section].filter(
                (_, itemIndex) => itemIndex !== index
            )
        }));
    };

    const selectTemplate = (templateId) => {
        setSelectedTemplate(templateId);
        setShowTemplates(false);
    };

    /* =========================================
       SECTIONS
    ========================================= */

    const sections = [
        {
            id: "personal",
            title: "Personal Information"
        },
        {
            id: "summary",
            title: "Professional Summary"
        },
        {
            id: "education",
            title: "Education"
        },
        {
            id: "experience",
            title: "Experience"
        },
        {
            id: "skills",
            title: "Skills"
        },
        {
            id: "projects",
            title: "Projects"
        },
        {
            id: "certifications",
            title: "Certifications"
        }
    ];

    const currentTemplate =
        templates.find(
            (template) => template.id === selectedTemplate
        ) || templates[0];

    return (
        <div
            className="resume-builder-page"
            style={{
                "--template-color": currentTemplate.color
            }}
        >
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
                    LEFT PANEL
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
                                {section.title}
                            </button>
                        ))}
                    </div>

                    {/* =================================
                        PERSONAL
                    ================================= */}

                    {activeSection === "personal" && (
                        <div className="resume-form-content">

                            <div className="form-section-title">
                                <h3>Personal Information</h3>

                                <p>
                                    Add your contact information and
                                    professional title.
                                </p>
                            </div>

                            <div className="form-grid">

                                <FormInput
                                    label="Full Name"
                                    value={resume.fullName}
                                    onChange={(value) =>
                                        updateField("fullName", value)
                                    }
                                    placeholder="John Doe"
                                />

                                <FormInput
                                    label="Professional Title"
                                    value={resume.jobTitle}
                                    onChange={(value) =>
                                        updateField("jobTitle", value)
                                    }
                                    placeholder="Data Analyst"
                                />

                                <FormInput
                                    label="Email"
                                    value={resume.email}
                                    onChange={(value) =>
                                        updateField("email", value)
                                    }
                                    placeholder="your@email.com"
                                />

                                <FormInput
                                    label="Phone"
                                    value={resume.phone}
                                    onChange={(value) =>
                                        updateField("phone", value)
                                    }
                                    placeholder="+91 98765 43210"
                                />

                                <FormInput
                                    label="Location"
                                    value={resume.location}
                                    onChange={(value) =>
                                        updateField("location", value)
                                    }
                                    placeholder="Mumbai, India"
                                />

                                <FormInput
                                    label="LinkedIn"
                                    value={resume.linkedin}
                                    onChange={(value) =>
                                        updateField("linkedin", value)
                                    }
                                    placeholder="linkedin.com/in/yourname"
                                />

                                <FormInput
                                    label="GitHub"
                                    value={resume.github}
                                    onChange={(value) =>
                                        updateField("github", value)
                                    }
                                    placeholder="github.com/yourname"
                                    fullWidth
                                />

                            </div>
                        </div>
                    )}

                    {/* =================================
                        SUMMARY
                    ================================= */}

                    {activeSection === "summary" && (
                        <div className="resume-form-content">

                            <div className="form-section-title">
                                <h3>Professional Summary</h3>

                                <p>
                                    Write a short summary that highlights
                                    your strengths and career goals.
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

                    {/* =================================
                        EDUCATION
                    ================================= */}

                    {activeSection === "education" && (
                        <div className="resume-form-content">

                            <SectionHeader
                                title="Education"
                                description="Add your academic background."
                                button="+ Add Education"
                                onClick={() =>
                                    addItem("education", {
                                        degree: "",
                                        institution: "",
                                        year: "",
                                        description: ""
                                    })
                                }
                            />

                            {resume.education.map((item, index) => (
                                <RepeatableCard
                                    key={index}
                                    title={`Education ${index + 1}`}
                                    showDelete={
                                        resume.education.length > 1
                                    }
                                    onDelete={() =>
                                        removeItem("education", index)
                                    }
                                >

                                    <FormInput
                                        label="Degree / Course"
                                        value={item.degree}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "education",
                                                index,
                                                "degree",
                                                value
                                            )
                                        }
                                        fullWidth
                                    />

                                    <FormInput
                                        label="Institution"
                                        value={item.institution}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "education",
                                                index,
                                                "institution",
                                                value
                                            )
                                        }
                                    />

                                    <FormInput
                                        label="Year"
                                        value={item.year}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "education",
                                                index,
                                                "year",
                                                value
                                            )
                                        }
                                    />

                                    <FormTextarea
                                        label="Description"
                                        value={item.description}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "education",
                                                index,
                                                "description",
                                                value
                                            )
                                        }
                                        fullWidth
                                    />

                                </RepeatableCard>
                            ))}

                        </div>
                    )}

                    {/* =================================
                        EXPERIENCE
                    ================================= */}

                    {activeSection === "experience" && (
                        <div className="resume-form-content">

                            <SectionHeader
                                title="Experience"
                                description="Add internships, jobs or work experience."
                                button="+ Add Experience"
                                onClick={() =>
                                    addItem("experience", {
                                        role: "",
                                        company: "",
                                        duration: "",
                                        description: ""
                                    })
                                }
                            />

                            {resume.experience.map((item, index) => (
                                <RepeatableCard
                                    key={index}
                                    title={`Experience ${index + 1}`}
                                    showDelete={
                                        resume.experience.length > 1
                                    }
                                    onDelete={() =>
                                        removeItem("experience", index)
                                    }
                                >

                                    <FormInput
                                        label="Job Title"
                                        value={item.role}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "experience",
                                                index,
                                                "role",
                                                value
                                            )
                                        }
                                    />

                                    <FormInput
                                        label="Company"
                                        value={item.company}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "experience",
                                                index,
                                                "company",
                                                value
                                            )
                                        }
                                    />

                                    <FormInput
                                        label="Duration"
                                        value={item.duration}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "experience",
                                                index,
                                                "duration",
                                                value
                                            )
                                        }
                                        fullWidth
                                    />

                                    <FormTextarea
                                        label="Description"
                                        value={item.description}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "experience",
                                                index,
                                                "description",
                                                value
                                            )
                                        }
                                        fullWidth
                                    />

                                </RepeatableCard>
                            ))}

                        </div>
                    )}

                    {/* =================================
                        SKILLS
                    ================================= */}

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

                                                setResume((prev) => ({
                                                    ...prev,
                                                    skills: updated
                                                }));
                                            }}
                                        />

                                        <button
                                            type="button"
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
                                    type="button"
                                    className="add-button"
                                    onClick={() =>
                                        setResume((prev) => ({
                                            ...prev,
                                            skills: [
                                                ...prev.skills,
                                                "New Skill"
                                            ]
                                        }))
                                    }
                                >
                                    + Add Skill
                                </button>

                            </div>

                        </div>
                    )}

                    {/* =================================
                        PROJECTS
                    ================================= */}

                    {activeSection === "projects" && (
                        <div className="resume-form-content">

                            <SectionHeader
                                title="Projects"
                                description="Showcase your strongest projects."
                                button="+ Add Project"
                                onClick={() =>
                                    addItem("projects", {
                                        name: "",
                                        technologies: "",
                                        description: ""
                                    })
                                }
                            />

                            {resume.projects.map((item, index) => (
                                <RepeatableCard
                                    key={index}
                                    title={`Project ${index + 1}`}
                                    showDelete={
                                        resume.projects.length > 1
                                    }
                                    onDelete={() =>
                                        removeItem("projects", index)
                                    }
                                >

                                    <FormInput
                                        label="Project Name"
                                        value={item.name}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "projects",
                                                index,
                                                "name",
                                                value
                                            )
                                        }
                                    />

                                    <FormInput
                                        label="Technologies"
                                        value={item.technologies}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "projects",
                                                index,
                                                "technologies",
                                                value
                                            )
                                        }
                                    />

                                    <FormTextarea
                                        label="Description"
                                        value={item.description}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "projects",
                                                index,
                                                "description",
                                                value
                                            )
                                        }
                                        fullWidth
                                    />

                                </RepeatableCard>
                            ))}

                        </div>
                    )}

                    {/* =================================
                        CERTIFICATIONS
                    ================================= */}

                    {activeSection === "certifications" && (
                        <div className="resume-form-content">

                            <SectionHeader
                                title="Certifications"
                                description="Add relevant certifications."
                                button="+ Add Certification"
                                onClick={() =>
                                    addItem("certifications", {
                                        name: "",
                                        issuer: "",
                                        year: ""
                                    })
                                }
                            />

                            {resume.certifications.map((item, index) => (
                                <RepeatableCard
                                    key={index}
                                    title={`Certification ${index + 1}`}
                                    showDelete={
                                        resume.certifications.length > 1
                                    }
                                    onDelete={() =>
                                        removeItem(
                                            "certifications",
                                            index
                                        )
                                    }
                                >

                                    <FormInput
                                        label="Certification"
                                        value={item.name}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "certifications",
                                                index,
                                                "name",
                                                value
                                            )
                                        }
                                    />

                                    <FormInput
                                        label="Issuer"
                                        value={item.issuer}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "certifications",
                                                index,
                                                "issuer",
                                                value
                                            )
                                        }
                                    />

                                    <FormInput
                                        label="Year"
                                        value={item.year}
                                        onChange={(value) =>
                                            updateArrayItem(
                                                "certifications",
                                                index,
                                                "year",
                                                value
                                            )
                                        }
                                    />

                                </RepeatableCard>
                            ))}

                        </div>
                    )}

                </div>

                {/* =====================================
                    RIGHT PREVIEW
                ===================================== */}

                <div className="resume-preview-panel">

                    <div className="preview-header">

                        <div>
                            <h2>Live Preview</h2>

                            <span>
                                {currentTemplate.name} Template • ATS-Friendly
                            </span>
                        </div>

                        {/* TEMPLATE DROPDOWN */}

                        <div className="template-selector">

                            <button
                                type="button"
                                className="template-button"
                                onClick={() =>
                                    setShowTemplates(!showTemplates)
                                }
                            >
                                <span>
                                    {currentTemplate.icon}
                                </span>

                                {currentTemplate.name}

                                <span className="template-arrow">
                                    {showTemplates ? "⌃" : "⌄"}
                                </span>
                            </button>

                            {showTemplates && (
                                <div className="template-dropdown">

                                    <div className="template-dropdown-title">
                                        Choose Resume Template
                                    </div>

                                    <div className="template-grid">

                                        {templates.map((template) => (
                                            <button
                                                type="button"
                                                key={template.id}
                                                className={
                                                    selectedTemplate ===
                                                    template.id
                                                        ? "template-option selected"
                                                        : "template-option"
                                                }
                                                onClick={() =>
                                                    selectTemplate(
                                                        template.id
                                                    )
                                                }
                                            >

                                                <div
                                                    className={`template-mini-preview mini-${template.id}`}
                                                >
                                                    <div className="mini-name"></div>
                                                    <div className="mini-line"></div>
                                                    <div className="mini-content"></div>
                                                    <div className="mini-content short"></div>
                                                    <div className="mini-content"></div>
                                                </div>

                                                <div className="template-option-info">

                                                    <strong>
                                                        {template.icon}{" "}
                                                        {template.name}
                                                    </strong>

                                                    <span>
                                                        {template.description}
                                                    </span>

                                                </div>

                                                {selectedTemplate ===
                                                    template.id && (
                                                    <span className="template-check">
                                                        ✓
                                                    </span>
                                                )}

                                            </button>
                                        ))}

                                    </div>

                                </div>
                            )}

                        </div>

                    </div>

                    {/* =================================
                        ACTUAL RESUME
                    ================================= */}

                    <div
                        className={`resume-paper resume-template-${selectedTemplate}`}
                    >

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

                        <ResumePreviewSection title="PROFESSIONAL SUMMARY">

                            <p className="preview-summary">
                                {resume.summary}
                            </p>

                        </ResumePreviewSection>

                        <ResumePreviewSection title="EXPERIENCE">

                            {resume.experience.map((item, index) => (
                                <div
                                    className="preview-entry"
                                    key={index}
                                >

                                    <div className="preview-entry-heading">

                                        <strong>{item.role}</strong>

                                        <span>{item.duration}</span>

                                    </div>

                                    <div className="preview-company">
                                        {item.company}
                                    </div>

                                    <p>{item.description}</p>

                                </div>
                            ))}

                        </ResumePreviewSection>

                        <ResumePreviewSection title="EDUCATION">

                            {resume.education.map((item, index) => (
                                <div
                                    className="preview-entry"
                                    key={index}
                                >

                                    <div className="preview-entry-heading">

                                        <strong>{item.degree}</strong>

                                        <span>{item.year}</span>

                                    </div>

                                    <div className="preview-company">
                                        {item.institution}
                                    </div>

                                    <p>{item.description}</p>

                                </div>
                            ))}

                        </ResumePreviewSection>

                        <ResumePreviewSection title="SKILLS">

                            <div className="preview-skills">

                                {resume.skills.map((skill, index) => (
                                    <span key={index}>
                                        {skill}
                                    </span>
                                ))}

                            </div>

                        </ResumePreviewSection>

                        <ResumePreviewSection title="PROJECTS">

                            {resume.projects.map((item, index) => (
                                <div
                                    className="preview-entry"
                                    key={index}
                                >

                                    <div className="preview-entry-heading">
                                        <strong>{item.name}</strong>
                                    </div>

                                    <div className="preview-company">
                                        {item.technologies}
                                    </div>

                                    <p>{item.description}</p>

                                </div>
                            ))}

                        </ResumePreviewSection>

                        <ResumePreviewSection title="CERTIFICATIONS">

                            {resume.certifications.map((item, index) => (
                                <div
                                    className="preview-entry"
                                    key={index}
                                >

                                    <div className="preview-entry-heading">

                                        <strong>{item.name}</strong>

                                        <span>{item.year}</span>

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
   FORM INPUT
========================================= */

const FormInput = ({
    label,
    value,
    onChange,
    placeholder,
    fullWidth = false
}) => {
    return (
        <div
            className={
                fullWidth
                    ? "form-group full-width"
                    : "form-group"
            }
        >

            <label>{label}</label>

            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />

        </div>
    );
};


/* =========================================
   FORM TEXTAREA
========================================= */

const FormTextarea = ({
    label,
    value,
    onChange,
    fullWidth = false
}) => {
    return (
        <div
            className={
                fullWidth
                    ? "form-group full-width"
                    : "form-group"
            }
        >

            <label>{label}</label>

            <textarea
                rows="5"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

        </div>
    );
};


/* =========================================
   SECTION HEADER
========================================= */

const SectionHeader = ({
    title,
    description,
    button,
    onClick
}) => {
    return (
        <div className="form-section-title-row">

            <div>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>

            <button
                type="button"
                className="add-button"
                onClick={onClick}
            >
                {button}
            </button>

        </div>
    );
};


/* =========================================
   REPEATABLE CARD
========================================= */

const RepeatableCard = ({
    title,
    showDelete,
    onDelete,
    children
}) => {
    return (
        <div className="repeatable-form-card">

            <div className="repeatable-card-header">

                <strong>{title}</strong>

                {showDelete && (
                    <button
                        type="button"
                        className="delete-button"
                        onClick={onDelete}
                    >
                        Delete
                    </button>
                )}

            </div>

            <div className="form-grid">
                {children}
            </div>

        </div>
    );
};


/* =========================================
   RESUME PREVIEW SECTION
========================================= */

const ResumePreviewSection = ({
    title,
    children
}) => {
    return (
        <section className="resume-preview-section">

            <h3>{title}</h3>

            <div className="section-line"></div>

            {children}

        </section>
    );
};


export default ResumeBuilder;

