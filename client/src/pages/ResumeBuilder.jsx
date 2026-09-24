import React, { useEffect, useState } from "react";
import "./ResumeBuilder.css";

const defaultResume = {
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
            year: "2023 - 2027"
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
    ],

    customSections: []
};

const defaultSections = [
    {
        id: "summary",
        type: "summary",
        title: "PROFESSIONAL SUMMARY"
    },
    {
        id: "experience",
        type: "experience",
        title: "EXPERIENCE"
    },
    {
        id: "education",
        type: "education",
        title: "EDUCATION"
    },
    {
        id: "skills",
        type: "skills",
        title: "SKILLS"
    },
    {
        id: "projects",
        type: "projects",
        title: "PROJECTS"
    },
    {
        id: "certifications",
        type: "certifications",
        title: "CERTIFICATIONS"
    }
];

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

const ResumeBuilder = () => {
    const [activeSection, setActiveSection] =
        useState("personal");

    const [selectedTemplate, setSelectedTemplate] = useState(() => {
        return (
            localStorage.getItem(
                "careerBridgeResumeTemplate"
            ) || "modern"
        );
    });

    const [showTemplates, setShowTemplates] =
        useState(false);

    const [resume, setResume] = useState(() => {
        const saved =
            localStorage.getItem("careerBridgeResume");

        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                return {
                    ...defaultResume,
                    ...parsed,

                    // Remove old Education descriptions
                    education: (
                        parsed.education ||
                        defaultResume.education
                    ).map((item) => ({
                        degree: item.degree || "",
                        institution:
                            item.institution || "",
                        year: item.year || ""
                    }))
                };
            } catch {
                return defaultResume;
            }
        }

        return defaultResume;
    });

    const [resumeSections, setResumeSections] =
        useState(() => {
            const saved = localStorage.getItem(
                "careerBridgeResumeSections"
            );

            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    return defaultSections;
                }
            }

            return defaultSections;
        });

    /* =========================================
       SAVE EVERYTHING
    ========================================= */

    useEffect(() => {
        localStorage.setItem(
            "careerBridgeResume",
            JSON.stringify(resume)
        );
    }, [resume]);

    useEffect(() => {
        localStorage.setItem(
            "careerBridgeResumeSections",
            JSON.stringify(resumeSections)
        );
    }, [resumeSections]);

    useEffect(() => {
        localStorage.setItem(
            "careerBridgeResumeTemplate",
            selectedTemplate
        );
    }, [selectedTemplate]);

    /* =========================================
       GENERAL UPDATE
    ========================================= */

    const updateField = (field, value) => {
        setResume((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const updateArrayItem = (
        section,
        index,
        field,
        value
    ) => {
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
            [section]: [
                ...prev[section],
                newItem
            ]
        }));
    };

    const removeItem = (section, index) => {
        setResume((prev) => ({
            ...prev,
            [section]: prev[section].filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        }));
    };

    /* =========================================
       SECTION UPDATE
    ========================================= */

    const updateSectionTitle = (
        sectionId,
        value
    ) => {
        setResumeSections((prev) =>
            prev.map((section) =>
                section.id === sectionId
                    ? {
                          ...section,
                          title: value
                      }
                    : section
            )
        );
    };

    /* =========================================
       MOVE SECTION
    ========================================= */

    const moveSection = (
        index,
        direction
    ) => {
        setResumeSections((prev) => {
            const updated = [...prev];

            const newIndex =
                direction === "up"
                    ? index - 1
                    : index + 1;

            if (
                newIndex < 0 ||
                newIndex >= updated.length
            ) {
                return prev;
            }

            const temp = updated[index];

            updated[index] =
                updated[newIndex];

            updated[newIndex] = temp;

            return updated;
        });
    };

    /* =========================================
       DELETE SECTION
    ========================================= */

    const deleteSection = (sectionId) => {
        setResumeSections((prev) =>
            prev.filter(
                (section) =>
                    section.id !== sectionId
            )
        );
    };

    /* =========================================
       ADD CUSTOM SECTION
    ========================================= */

    const addCustomSection = () => {
        const id =
            "custom-" +
            Date.now();

        setResume((prev) => ({
            ...prev,
            customSections: [
                ...(prev.customSections || []),
                {
                    id,
                    content:
                        "Add your content here..."
                }
            ]
        }));

        setResumeSections((prev) => [
            ...prev,
            {
                id,
                type: "custom",
                title: "NEW SECTION"
            }
        ]);
    };

    /* =========================================
       UPDATE CUSTOM SECTION
    ========================================= */

    const updateCustomSection = (
        sectionId,
        value
    ) => {
        setResume((prev) => ({
            ...prev,
            customSections: (
                prev.customSections || []
            ).map((section) =>
                section.id === sectionId
                    ? {
                          ...section,
                          content: value
                      }
                    : section
            )
        }));
    };

    /* =========================================
       DELETE CUSTOM SECTION DATA
    ========================================= */

    const deleteSectionCompletely = (
        section
    ) => {
        deleteSection(section.id);

        if (section.type === "custom") {
            setResume((prev) => ({
                ...prev,
                customSections: (
                    prev.customSections || []
                ).filter(
                    (item) =>
                        item.id !== section.id
                )
            }));
        }
    };

    /* =========================================
       TEMPLATE
    ========================================= */

    const selectTemplate = (
        templateId
    ) => {
        setSelectedTemplate(templateId);
        setShowTemplates(false);
    };

    const currentTemplate =
        templates.find(
            (template) =>
                template.id ===
                selectedTemplate
        ) || templates[0];

    /* =========================================
       LEFT NAVIGATION
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

    return (
        <div
            className="resume-builder-page"
            style={{
                "--template-color":
                    currentTemplate.color
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

                    <h1>
                        Resume Builder
                    </h1>

                    <p className="resume-subtitle">
                        Build a professional,
                        ATS-friendly resume in minutes.
                    </p>
                </div>

                <div className="resume-header-actions">

                    <button
                        className="resume-secondary-button"
                        onClick={() =>
                            window.print()
                        }
                    >
                        🖨 Print
                    </button>

                    <button
                        className="resume-primary-button"
                        onClick={() =>
                            window.print()
                        }
                    >
                        ↓ Download Resume
                    </button>

                </div>

            </div>

            {/* =========================================
                MAIN BUILDER
            ========================================= */}

            <div className="resume-builder-container">

                {/* =====================================
                    LEFT PANEL
                ===================================== */}

                <div className="resume-form-panel">

                    <div className="form-panel-header">

                        <div>
                            <h2>
                                Build Your Resume
                            </h2>

                            <p>
                                Fill in your details below
                            </p>
                        </div>

                        <div className="completion-badge">
                            85% Complete
                        </div>

                    </div>

                    {/* NAVIGATION */}

                    <div className="resume-section-tabs">

                        {sections.map(
                            (section) => (
                                <button
                                    key={section.id}
                                    className={
                                        activeSection ===
                                        section.id
                                            ? "resume-section-tab active"
                                            : "resume-section-tab"
                                    }
                                    onClick={() =>
                                        setActiveSection(
                                            section.id
                                        )
                                    }
                                >
                                    {section.title}
                                </button>
                            )
                        )}

                    </div>

                    {/* =================================
                        PERSONAL
                    ================================= */}

                    {activeSection ===
                        "personal" && (
                        <div className="resume-form-content">

                            <div className="form-section-title">

                                <h3>
                                    Personal Information
                                </h3>

                                <p>
                                    Add your contact
                                    information and
                                    professional title.
                                </p>

                            </div>

                            <div className="form-grid">

                                <FormInput
                                    label="Full Name"
                                    value={
                                        resume.fullName
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateField(
                                            "fullName",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Professional Title"
                                    value={
                                        resume.jobTitle
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateField(
                                            "jobTitle",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Email"
                                    value={
                                        resume.email
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateField(
                                            "email",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Phone"
                                    value={
                                        resume.phone
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateField(
                                            "phone",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Location"
                                    value={
                                        resume.location
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateField(
                                            "location",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="LinkedIn"
                                    value={
                                        resume.linkedin
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateField(
                                            "linkedin",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="GitHub"
                                    value={
                                        resume.github
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateField(
                                            "github",
                                            value
                                        )
                                    }
                                    fullWidth
                                />

                            </div>

                        </div>
                    )}

                    {/* =================================
                        SUMMARY
                    ================================= */}

                    {activeSection ===
                        "summary" && (
                        <div className="resume-form-content">

                            <div className="form-section-title">

                                <h3>
                                    Professional Summary
                                </h3>

                                <p>
                                    Write a short summary
                                    that highlights your
                                    strengths.
                                </p>

                            </div>

                            <div className="form-group">

                                <label>
                                    Summary
                                </label>

                                <textarea
                                    rows="8"
                                    value={
                                        resume.summary
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "summary",
                                            e.target.value
                                        )
                                    }
                                />

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
                                    addItem(
                                        "education",
                                        {
                                            degree: "",
                                            institution: "",
                                            year: ""
                                        }
                                    )
                                }
                            />

                            {resume.education.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <RepeatableCard
                                        key={index}
                                        title={`Education ${
                                            index + 1
                                        }`}
                                        showDelete={
                                            resume
                                                .education
                                                .length > 1
                                        }
                                        onDelete={() =>
                                            removeItem(
                                                "education",
                                                index
                                            )
                                        }
                                    >

                                        <FormInput
                                            label="Degree / Course"
                                            value={
                                                item.degree
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                            value={
                                                item.institution
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                            value={
                                                item.year
                                            }
                                            onChange={(
                                                value
                                            ) =>
                                                updateArrayItem(
                                                    "education",
                                                    index,
                                                    "year",
                                                    value
                                                )
                                            }
                                        />

                                    </RepeatableCard>
                                )
                            )}

                        </div>
                    )}

                    {/* =================================
                        EXPERIENCE
                    ================================= */}

                    {activeSection ===
                        "experience" && (
                        <div className="resume-form-content">

                            <SectionHeader
                                title="Experience"
                                description="Add internships, jobs or work experience."
                                button="+ Add Experience"
                                onClick={() =>
                                    addItem(
                                        "experience",
                                        {
                                            role: "",
                                            company: "",
                                            duration: "",
                                            description: ""
                                        }
                                    )
                                }
                            />

                            {resume.experience.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <RepeatableCard
                                        key={index}
                                        title={`Experience ${
                                            index + 1
                                        }`}
                                        showDelete={
                                            resume
                                                .experience
                                                .length > 1
                                        }
                                        onDelete={() =>
                                            removeItem(
                                                "experience",
                                                index
                                            )
                                        }
                                    >

                                        <FormInput
                                            label="Job Title"
                                            value={
                                                item.role
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                            value={
                                                item.company
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                            value={
                                                item.duration
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                            value={
                                                item.description
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                )
                            )}

                        </div>
                    )}

                    {/* =================================
                        SKILLS
                    ================================= */}

                    {activeSection ===
                        "skills" && (
                        <div className="resume-form-content">

                            <div className="form-section-title">

                                <h3>
                                    Skills
                                </h3>

                                <p>
                                    Add technical and
                                    professional skills.
                                </p>

                            </div>

                            <div className="skills-editor">

                                {resume.skills.map(
                                    (
                                        skill,
                                        index
                                    ) => (
                                        <div
                                            className="skill-input-row"
                                            key={index}
                                        >

                                            <input
                                                value={
                                                    skill
                                                }
                                                onChange={(
                                                    e
                                                ) => {
                                                    const updated =
                                                        [
                                                            ...resume.skills
                                                        ];

                                                    updated[
                                                        index
                                                    ] =
                                                        e
                                                            .target
                                                            .value;

                                                    setResume(
                                                        (
                                                            prev
                                                        ) => ({
                                                            ...prev,
                                                            skills: updated
                                                        })
                                                    );
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
                                    )
                                )}

                                <button
                                    type="button"
                                    className="add-button"
                                    onClick={() =>
                                        setResume(
                                            (prev) => ({
                                                ...prev,
                                                skills: [
                                                    ...prev.skills,
                                                    "New Skill"
                                                ]
                                            })
                                        )
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

                    {activeSection ===
                        "projects" && (
                        <div className="resume-form-content">

                            <SectionHeader
                                title="Projects"
                                description="Showcase your strongest projects."
                                button="+ Add Project"
                                onClick={() =>
                                    addItem(
                                        "projects",
                                        {
                                            name: "",
                                            technologies: "",
                                            description: ""
                                        }
                                    )
                                }
                            />

                            {resume.projects.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <RepeatableCard
                                        key={index}
                                        title={`Project ${
                                            index + 1
                                        }`}
                                        showDelete={
                                            resume
                                                .projects
                                                .length > 1
                                        }
                                        onDelete={() =>
                                            removeItem(
                                                "projects",
                                                index
                                            )
                                        }
                                    >

                                        <FormInput
                                            label="Project Name"
                                            value={
                                                item.name
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                            value={
                                                item.technologies
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                            value={
                                                item.description
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                )
                            )}

                        </div>
                    )}

                    {/* =================================
                        CERTIFICATIONS
                    ================================= */}

                    {activeSection ===
                        "certifications" && (
                        <div className="resume-form-content">

                            <SectionHeader
                                title="Certifications"
                                description="Add relevant certifications."
                                button="+ Add Certification"
                                onClick={() =>
                                    addItem(
                                        "certifications",
                                        {
                                            name: "",
                                            issuer: "",
                                            year: ""
                                        }
                                    )
                                }
                            />

                            {resume.certifications.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <RepeatableCard
                                        key={index}
                                        title={`Certification ${
                                            index + 1
                                        }`}
                                        showDelete={
                                            resume
                                                .certifications
                                                .length > 1
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
                                            value={
                                                item.name
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                            value={
                                                item.issuer
                                            }
                                            onChange={(
                                                value
                                            ) =>
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
                                            value={
                                                item.year
                                            }
                                            onChange={(
                                                value
                                            ) =>
                                                updateArrayItem(
                                                    "certifications",
                                                    index,
                                                    "year",
                                                    value
                                                )
                                            }
                                        />

                                    </RepeatableCard>
                                )
                            )}

                        </div>
                    )}

                </div>

                {/* =====================================
                    RIGHT PREVIEW
                ===================================== */}

                <div className="resume-preview-panel">

                    <div className="preview-header">

                        <div>
                            <h2>
                                Live Preview
                            </h2>

                            <span>
                                {
                                    currentTemplate.name
                                }{" "}
                                Template •
                                ATS-Friendly
                            </span>
                        </div>

                        <div className="template-selector">

                            <button
                                type="button"
                                className="template-button"
                                onClick={() =>
                                    setShowTemplates(
                                        !showTemplates
                                    )
                                }
                            >
                                <span>
                                    {
                                        currentTemplate.icon
                                    }
                                </span>

                                {
                                    currentTemplate.name
                                }

                                <span className="template-arrow">
                                    {showTemplates
                                        ? "⌃"
                                        : "⌄"}
                                </span>

                            </button>

                            {showTemplates && (
                                <div className="template-dropdown">

                                    <div className="template-dropdown-title">
                                        Choose Resume
                                        Template
                                    </div>

                                    <div className="template-grid">

                                        {templates.map(
                                            (
                                                template
                                            ) => (
                                                <button
                                                    type="button"
                                                    key={
                                                        template.id
                                                    }
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
                                                            {
                                                                template.icon
                                                            }{" "}
                                                            {
                                                                template.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                template.description
                                                            }
                                                        </span>

                                                    </div>

                                                    {selectedTemplate ===
                                                        template.id && (
                                                        <span className="template-check">
                                                            ✓
                                                        </span>
                                                    )}

                                                </button>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                        </div>

                    </div>

                    {/* =================================
                        RESUME PAPER
                    ================================= */}

                    <div
                        className={`resume-paper resume-template-${selectedTemplate}`}
                    >

                        {/* =================================
                            PERSONAL HEADER
                        ================================= */}

                        <div className="resume-paper-header">

                            <EditablePreviewInput
                                value={
                                    resume.fullName
                                }
                                onChange={(value) =>
                                    updateField(
                                        "fullName",
                                        value
                                    )
                                }
                                className="preview-name-input"
                            />

                            <EditablePreviewInput
                                value={
                                    resume.jobTitle
                                }
                                onChange={(value) =>
                                    updateField(
                                        "jobTitle",
                                        value
                                    )
                                }
                                className="preview-job-title-input"
                            />

                            <div className="resume-contact">

                                <EditableInlineInput
                                    value={
                                        resume.email
                                    }
                                    onChange={(value) =>
                                        updateField(
                                            "email",
                                            value
                                        )
                                    }
                                />

                                <span>•</span>

                                <EditableInlineInput
                                    value={
                                        resume.phone
                                    }
                                    onChange={(value) =>
                                        updateField(
                                            "phone",
                                            value
                                        )
                                    }
                                />

                                <span>•</span>

                                <EditableInlineInput
                                    value={
                                        resume.location
                                    }
                                    onChange={(value) =>
                                        updateField(
                                            "location",
                                            value
                                        )
                                    }
                                />

                            </div>

                            <div className="resume-links">

                                <EditableInlineInput
                                    value={
                                        resume.linkedin
                                    }
                                    onChange={(value) =>
                                        updateField(
                                            "linkedin",
                                            value
                                        )
                                    }
                                />

                                <EditableInlineInput
                                    value={
                                        resume.github
                                    }
                                    onChange={(value) =>
                                        updateField(
                                            "github",
                                            value
                                        )
                                    }
                                />

                            </div>

                        </div>

                        {/* =================================
                            DYNAMIC SECTIONS
                        ================================= */}

                        {resumeSections.map(
                            (
                                section,
                                index
                            ) => (
                                <EditableResumeSection
                                    key={section.id}
                                    section={section}
                                    index={index}
                                    total={
                                        resumeSections.length
                                    }
                                    onTitleChange={
                                        updateSectionTitle
                                    }
                                    onMoveUp={() =>
                                        moveSection(
                                            index,
                                            "up"
                                        )
                                    }
                                    onMoveDown={() =>
                                        moveSection(
                                            index,
                                            "down"
                                        )
                                    }
                                    onDelete={() =>
                                        deleteSectionCompletely(
                                            section
                                        )
                                    }
                                    onCustomChange={
                                        updateCustomSection
                                    }
                                    resume={resume}
                                    setResume={
                                        setResume
                                    }
                                    updateArrayItem={
                                        updateArrayItem
                                    }
                                    removeItem={
                                        removeItem
                                    }
                                />
                            )
                        )}

                        {/* =================================
                            ADD CUSTOM SECTION
                        ================================= */}

                        <button
                            type="button"
                            className="add-preview-section-button"
                            onClick={
                                addCustomSection
                            }
                        >
                            + Add Resume Section
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};


/* =====================================================
   DYNAMIC PREVIEW SECTION
===================================================== */

const EditableResumeSection = ({
    section,
    index,
    total,
    onTitleChange,
    onMoveUp,
    onMoveDown,
    onDelete,
    onCustomChange,
    resume,
    setResume,
    updateArrayItem,
    removeItem
}) => {
    return (
        <section className="resume-preview-section">

            {/* SECTION CONTROLS */}

            <div className="preview-section-controls">

                <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={index === 0}
                    title="Move section up"
                >
                    ↑
                </button>

                <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={
                        index === total - 1
                    }
                    title="Move section down"
                >
                    ↓
                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    title="Delete section"
                >
                    ×
                </button>

            </div>

            {/* EDITABLE HEADING */}

            <input
                type="text"
                value={section.title}
                onChange={(e) =>
                    onTitleChange(
                        section.id,
                        e.target.value
                    )
                }
                className="editable-resume-heading"
            />

            <div className="section-line"></div>

            {/* =================================
                SUMMARY
            ================================= */}

            {section.type ===
                "summary" && (
                <textarea
                    className="preview-editable-textarea preview-summary"
                    value={resume.summary}
                    onChange={(e) =>
                        setResume(
                            (prev) => ({
                                ...prev,
                                summary:
                                    e.target.value
                            })
                        )
                    }
                />
            )}

            {/* =================================
                EXPERIENCE
            ================================= */}

            {section.type ===
                "experience" && (
                <>
                    {resume.experience.map(
                        (
                            item,
                            itemIndex
                        ) => (
                            <div
                                className="preview-entry"
                                key={itemIndex}
                            >

                                <div className="preview-entry-heading">

                                    <EditablePreviewInput
                                        value={
                                            item.role
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateArrayItem(
                                                "experience",
                                                itemIndex,
                                                "role",
                                                value
                                            )
                                        }
                                        className="preview-entry-title-input"
                                    />

                                    <EditablePreviewInput
                                        value={
                                            item.duration
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateArrayItem(
                                                "experience",
                                                itemIndex,
                                                "duration",
                                                value
                                            )
                                        }
                                        className="preview-date-input"
                                    />

                                </div>

                                <EditablePreviewInput
                                    value={
                                        item.company
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateArrayItem(
                                            "experience",
                                            itemIndex,
                                            "company",
                                            value
                                        )
                                    }
                                    className="preview-company-input"
                                />

                                <textarea
                                    className="preview-editable-textarea"
                                    value={
                                        item.description
                                    }
                                    onChange={(e) =>
                                        updateArrayItem(
                                            "experience",
                                            itemIndex,
                                            "description",
                                            e.target.value
                                        )
                                    }
                                />

                                <button
                                    type="button"
                                    className="preview-delete-entry"
                                    onClick={() =>
                                        removeItem(
                                            "experience",
                                            itemIndex
                                        )
                                    }
                                >
                                    Delete
                                </button>

                            </div>
                        )
                    )}

                    <button
                        type="button"
                        className="preview-add-entry"
                        onClick={() =>
                            setResume(
                                (prev) => ({
                                    ...prev,
                                    experience: [
                                        ...prev.experience,
                                        {
                                            role: "",
                                            company: "",
                                            duration: "",
                                            description: ""
                                        }
                                    ]
                                })
                            )
                        }
                    >
                        + Add Experience
                    </button>
                </>
            )}

            {/* =================================
                EDUCATION
            ================================= */}

            {section.type ===
                "education" && (
                <>
                    {resume.education.map(
                        (
                            item,
                            itemIndex
                        ) => (
                            <div
                                className="preview-entry"
                                key={itemIndex}
                            >

                                <div className="preview-entry-heading">

                                    <EditablePreviewInput
                                        value={
                                            item.degree
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateArrayItem(
                                                "education",
                                                itemIndex,
                                                "degree",
                                                value
                                            )
                                        }
                                        className="preview-entry-title-input"
                                    />

                                    <EditablePreviewInput
                                        value={
                                            item.year
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateArrayItem(
                                                "education",
                                                itemIndex,
                                                "year",
                                                value
                                            )
                                        }
                                        className="preview-date-input"
                                    />

                                </div>

                                <EditablePreviewInput
                                    value={
                                        item.institution
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateArrayItem(
                                            "education",
                                            itemIndex,
                                            "institution",
                                            value
                                        )
                                    }
                                    className="preview-company-input"
                                />

                                {/* EDUCATION DESCRIPTION REMOVED */}

                                <button
                                    type="button"
                                    className="preview-delete-entry"
                                    onClick={() =>
                                        removeItem(
                                            "education",
                                            itemIndex
                                        )
                                    }
                                >
                                    Delete
                                </button>

                            </div>
                        )
                    )}

                    <button
                        type="button"
                        className="preview-add-entry"
                        onClick={() =>
                            setResume(
                                (prev) => ({
                                    ...prev,
                                    education: [
                                        ...prev.education,
                                        {
                                            degree: "",
                                            institution: "",
                                            year: ""
                                        }
                                    ]
                                })
                            )
                        }
                    >
                        + Add Education
                    </button>
                </>
            )}

            {/* =================================
                SKILLS
            ================================= */}

            {section.type ===
                "skills" && (
                <>
                    <div className="preview-skills">

                        {resume.skills.map(
                            (
                                skill,
                                skillIndex
                            ) => (
                                <div
                                    className="preview-skill-edit"
                                    key={skillIndex}
                                >

                                    <input
                                        value={skill}
                                        onChange={(e) => {
                                            const updated =
                                                [
                                                    ...resume.skills
                                                ];

                                            updated[
                                                skillIndex
                                            ] =
                                                e
                                                    .target
                                                    .value;

                                            setResume(
                                                (
                                                    prev
                                                ) => ({
                                                    ...prev,
                                                    skills:
                                                        updated
                                                })
                                            );
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeItem(
                                                "skills",
                                                skillIndex
                                            )
                                        }
                                    >
                                        ×
                                    </button>

                                </div>
                            )
                        )}

                    </div>

                    <button
                        type="button"
                        className="preview-add-entry"
                        onClick={() =>
                            setResume(
                                (prev) => ({
                                    ...prev,
                                    skills: [
                                        ...prev.skills,
                                        "New Skill"
                                    ]
                                })
                            )
                        }
                    >
                        + Add Skill
                    </button>
                </>
            )}

            {/* =================================
                PROJECTS
            ================================= */}

            {section.type ===
                "projects" && (
                <>
                    {resume.projects.map(
                        (
                            item,
                            itemIndex
                        ) => (
                            <div
                                className="preview-entry"
                                key={itemIndex}
                            >

                                <EditablePreviewInput
                                    value={
                                        item.name
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateArrayItem(
                                            "projects",
                                            itemIndex,
                                            "name",
                                            value
                                        )
                                    }
                                    className="preview-entry-title-input"
                                />

                                <EditablePreviewInput
                                    value={
                                        item.technologies
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateArrayItem(
                                            "projects",
                                            itemIndex,
                                            "technologies",
                                            value
                                        )
                                    }
                                    className="preview-company-input"
                                />

                                <textarea
                                    className="preview-editable-textarea"
                                    value={
                                        item.description
                                    }
                                    onChange={(e) =>
                                        updateArrayItem(
                                            "projects",
                                            itemIndex,
                                            "description",
                                            e.target.value
                                        )
                                    }
                                />

                                <button
                                    type="button"
                                    className="preview-delete-entry"
                                    onClick={() =>
                                        removeItem(
                                            "projects",
                                            itemIndex
                                        )
                                    }
                                >
                                    Delete
                                </button>

                            </div>
                        )
                    )}

                    <button
                        type="button"
                        className="preview-add-entry"
                        onClick={() =>
                            setResume(
                                (prev) => ({
                                    ...prev,
                                    projects: [
                                        ...prev.projects,
                                        {
                                            name: "",
                                            technologies: "",
                                            description: ""
                                        }
                                    ]
                                })
                            )
                        }
                    >
                        + Add Project
                    </button>
                </>
            )}

            {/* =================================
                CERTIFICATIONS
            ================================= */}

            {section.type ===
                "certifications" && (
                <>
                    {resume.certifications.map(
                        (
                            item,
                            itemIndex
                        ) => (
                            <div
                                className="preview-entry"
                                key={itemIndex}
                            >

                                <div className="preview-entry-heading">

                                    <EditablePreviewInput
                                        value={
                                            item.name
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateArrayItem(
                                                "certifications",
                                                itemIndex,
                                                "name",
                                                value
                                            )
                                        }
                                        className="preview-entry-title-input"
                                    />

                                    <EditablePreviewInput
                                        value={
                                            item.year
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateArrayItem(
                                                "certifications",
                                                itemIndex,
                                                "year",
                                                value
                                            )
                                        }
                                        className="preview-date-input"
                                    />

                                </div>

                                <EditablePreviewInput
                                    value={
                                        item.issuer
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateArrayItem(
                                            "certifications",
                                            itemIndex,
                                            "issuer",
                                            value
                                        )
                                    }
                                    className="preview-company-input"
                                />

                                <button
                                    type="button"
                                    className="preview-delete-entry"
                                    onClick={() =>
                                        removeItem(
                                            "certifications",
                                            itemIndex
                                        )
                                    }
                                >
                                    Delete
                                </button>

                            </div>
                        )
                    )}

                    <button
                        type="button"
                        className="preview-add-entry"
                        onClick={() =>
                            setResume(
                                (prev) => ({
                                    ...prev,
                                    certifications: [
                                        ...prev.certifications,
                                        {
                                            name: "",
                                            issuer: "",
                                            year: ""
                                        }
                                    ]
                                })
                            )
                        }
                    >
                        + Add Certification
                    </button>
                </>
            )}

            {/* =================================
                CUSTOM SECTION
            ================================= */}

            {section.type ===
                "custom" && (
                <textarea
                    className="preview-editable-textarea"
                    value={
                        (
                            resume.customSections ||
                            []
                        ).find(
                            (item) =>
                                item.id ===
                                section.id
                        )?.content || ""
                    }
                    onChange={(e) =>
                        onCustomChange(
                            section.id,
                            e.target.value
                        )
                    }
                />
            )}

        </section>
    );
};


/* =====================================================
   EDITABLE PREVIEW INPUT
===================================================== */

const EditablePreviewInput = ({
    value,
    onChange,
    className = ""
}) => {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) =>
                onChange(e.target.value)
            }
            className={`preview-editable-input ${className}`}
        />
    );
};


/* =====================================================
   INLINE PREVIEW INPUT
===================================================== */

const EditableInlineInput = ({
    value,
    onChange
}) => {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) =>
                onChange(e.target.value)
            }
            className="preview-inline-input"
        />
    );
};


/* =====================================================
   FORM INPUT
===================================================== */

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

            <label>
                {label}
            </label>

            <input
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                placeholder={
                    placeholder
                }
            />

        </div>
    );
};


/* =====================================================
   FORM TEXTAREA
===================================================== */

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

            <label>
                {label}
            </label>

            <textarea
                rows="5"
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
            />

        </div>
    );
};


/* =====================================================
   SECTION HEADER
===================================================== */

const SectionHeader = ({
    title,
    description,
    button,
    onClick
}) => {
    return (
        <div className="form-section-title-row">

            <div>
                <h3>
                    {title}
                </h3>

                <p>
                    {description}
                </p>
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


/* =====================================================
   REPEATABLE CARD
===================================================== */

const RepeatableCard = ({
    title,
    showDelete,
    onDelete,
    children
}) => {
    return (
        <div className="repeatable-form-card">

            <div className="repeatable-card-header">

                <strong>
                    {title}
                </strong>

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


export default ResumeBuilder;