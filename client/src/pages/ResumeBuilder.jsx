import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ResumeBuilder.css";

/* =========================================================
   CAREERBRIDGE RESUME BUILDER
   - 10 different resume layouts
   - Accent color picker
   - Photo support for selected templates
   - Live A4 preview
   - Step-by-step editor
   - LocalStorage persistence
   - Print / Save as PDF
   ========================================================= */

const STORAGE_KEYS = {
  resume: "careerBridgeResume",
  template: "careerBridgeResumeTemplate",
  color: "careerBridgeResumeColor",
  sections: "careerBridgeResumeSections",
};

const DEFAULT_COLOR = "#7C4DFF";

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean professional layout with strong visual hierarchy.",
    hasPhoto: false,
    category: "Professional",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional ATS-friendly resume with elegant typography.",
    hasPhoto: false,
    category: "Professional",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple, spacious and highly readable one-column design.",
    hasPhoto: false,
    category: "Minimal",
  },
  {
    id: "sidebar",
    name: "Sidebar",
    description: "Two-column layout with skills and contact information.",
    hasPhoto: false,
    category: "Professional",
  },
  {
    id: "creative",
    name: "Creative Photo",
    description: "Modern photo-based design with a visual header.",
    hasPhoto: true,
    category: "Creative",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional sidebar design for corporate roles.",
    hasPhoto: true,
    category: "Corporate",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Developer-focused layout for software and IT profiles.",
    hasPhoto: false,
    category: "Technology",
  },
  {
    id: "fresher",
    name: "Fresher",
    description: "Student and internship-friendly resume layout.",
    hasPhoto: false,
    category: "Student",
  },
  {
    id: "academic",
    name: "Academic",
    description: "Structured layout for academic and research profiles.",
    hasPhoto: false,
    category: "Academic",
  },
  {
    id: "elegant",
    name: "Elegant Photo",
    description: "Sophisticated centered design with profile photo.",
    hasPhoto: true,
    category: "Premium",
  },
];

const colorOptions = [
  "#7C4DFF",
  "#2563EB",
  "#0F172A",
  "#0F766E",
  "#059669",
  "#DC2626",
  "#EA580C",
  "#CA8A04",
  "#DB2777",
  "#475569",
];

const steps = [
  {
    id: "personal",
    label: "Personal",
    icon: "👤",
    title: "Personal Information",
    subtitle: "Start with your basic contact information",
  },
  {
    id: "summary",
    label: "Summary",
    icon: "✦",
    title: "Professional Summary",
    subtitle: "Add a short introduction about yourself",
  },
  {
    id: "experience",
    label: "Experience",
    icon: "💼",
    title: "Professional Experience",
    subtitle: "Add your work experience and achievements",
  },
  {
    id: "education",
    label: "Education",
    icon: "🎓",
    title: "Education",
    subtitle: "Add your academic qualifications",
  },
  {
    id: "skills",
    label: "Skills",
    icon: "⚡",
    title: "Skills",
    subtitle: "Add technical and soft skills",
  },
  {
    id: "projects",
    label: "Projects",
    icon: "📁",
    title: "Projects",
    subtitle: "Showcase your important projects",
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: "🏆",
    title: "Certifications",
    subtitle: "Add certificates and achievements",
  },
];

const defaultResume = {
  fullName: "Your Name",
  jobTitle: "Aspiring Software Engineer",
  email: "your.email@example.com",
  phone: "+91 98765 43210",
  location: "Mumbai, India",
  linkedin: "linkedin.com/in/yourname",
  github: "github.com/yourname",
  website: "",
  profilePhoto: "",
  summary:
    "Motivated and detail-oriented technology student with a strong interest in software development, data analysis and problem solving. Skilled in developing practical applications and working with modern technologies.",
  experience: [
    {
      role: "Software Development Intern",
      company: "Company Name",
      startDate: "2025-06",
      endDate: "2025-08",
      current: false,
      description:
        "Worked on software development tasks, implemented application features and collaborated with team members to improve project functionality.",
    },
  ],
  education: [
    {
      degree: "B.Tech in Information Technology",
      institution: "Your College Name",
      field: "Information Technology",
      year: "2027",
      gpa: "",
    },
  ],
  skills: [
    "Java",
    "Python",
    "React",
    "JavaScript",
    "SQL",
    "Git",
    "QGIS",
  ],
  projects: [
    {
      name: "CareerBridge Resume Builder",
      technologies: "React, JavaScript, CSS",
      description:
        "A web-based resume builder that allows users to create professional resumes using customizable templates and live preview.",
      link: "",
    },
    {
      name: "Healthcare Accessibility Mapping",
      technologies: "QGIS, GIS, Excel",
      description:
        "A GIS-based project for mapping healthcare facilities, service areas and underserved locations.",
      link: "",
    },
  ],
  certifications: [
    {
      name: "Certification Name",
      issuer: "Issuing Organization",
      year: "2026",
      link: "",
    },
  ],
  customSections: [],
};

const defaultSections = [
  { id: "summary", label: "Professional Summary", visible: true },
  { id: "experience", label: "Professional Experience", visible: true },
  { id: "education", label: "Education", visible: true },
  { id: "skills", label: "Skills", visible: true },
  { id: "projects", label: "Projects", visible: true },
  { id: "certifications", label: "Certifications", visible: true },
];

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeResume(saved) {
  const data = {
    ...defaultResume,
    ...(saved || {}),
  };

  return {
    ...data,
    experience: Array.isArray(data.experience)
      ? data.experience
      : defaultResume.experience,
    education: Array.isArray(data.education)
      ? data.education
      : defaultResume.education,
    skills: Array.isArray(data.skills) ? data.skills : defaultResume.skills,
    projects: Array.isArray(data.projects)
      ? data.projects
      : defaultResume.projects,
    certifications: Array.isArray(data.certifications)
      ? data.certifications
      : defaultResume.certifications,
    customSections: Array.isArray(data.customSections)
      ? data.customSections
      : [],
    profilePhoto: data.profilePhoto || "",
    website: data.website || "",
  };
}

function formatMonth(value) {
  if (!value) return "";

  const [year, month] = value.split("-");

  const date = new Date(Number(year), Number(month) - 1, 1);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");

  if (clean.length !== 6) {
    return "124, 77, 255";
  }

  const number = parseInt(clean, 16);

  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${
    number & 255
  }`;
}

function createId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select an image."));
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      reject(new Error("Please choose an image smaller than 4 MB."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 500;

        let width = image.width;
        let height = image.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          resolve(event.target.result);
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };

      image.onerror = () => {
        resolve(event.target.result);
      };

      image.src = event.target.result;
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export default function ResumeBuilder() {
  const [resume, setResume] = useState(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEYS.resume), null);
    return normalizeResume(saved);
  });

  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.template) || "modern";
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.color) || DEFAULT_COLOR;
  });

  const [sections, setSections] = useState(() => {
    const saved = safeParse(
      localStorage.getItem(STORAGE_KEYS.sections),
      null
    );

    return Array.isArray(saved) && saved.length
      ? saved
      : defaultSections;
  });

  const [activeStep, setActiveStep] = useState("personal");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [customSectionName, setCustomSectionName] = useState("");
  const [photoError, setPhotoError] = useState("");

  const fileInputRef = useRef(null);

  const currentTemplate =
    templates.find((template) => template.id === selectedTemplate) ||
    templates[0];

  const currentStepIndex = steps.findIndex(
    (step) => step.id === activeStep
  );

  const previousStep =
    currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;

  const nextStep =
    currentStepIndex < steps.length - 1
      ? steps[currentStepIndex + 1]
      : null;

  const visibleSections = useMemo(() => {
    return sections.filter((section) => section.visible);
  }, [sections]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.resume,
      JSON.stringify(resume)
    );
  }, [resume]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.template,
      selectedTemplate
    );
  }, [selectedTemplate]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.color,
      accentColor
    );
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.sections,
      JSON.stringify(sections)
    );
  }, [sections]);

  useEffect(() => {
    if (!currentTemplate.hasPhoto && resume.profilePhoto) {
      setResume((previous) => ({
        ...previous,
        profilePhoto: "",
      }));
    }
  }, [currentTemplate.hasPhoto]);

  useEffect(() => {
    if (!savedMessage) return;

    const timer = setTimeout(() => {
      setSavedMessage("");
    }, 2200);

    return () => clearTimeout(timer);
  }, [savedMessage]);

  const updateResumeField = (field, value) => {
    setResume((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateArrayItem = (arrayName, index, field, value) => {
    setResume((previous) => {
      const updatedArray = [...previous[arrayName]];

      updatedArray[index] = {
        ...updatedArray[index],
        [field]: value,
      };

      return {
        ...previous,
        [arrayName]: updatedArray,
      };
    });
  };

  const addExperience = () => {
    setResume((previous) => ({
      ...previous,
      experience: [
        ...previous.experience,
        {
          role: "",
          company: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setResume((previous) => ({
      ...previous,
      experience: previous.experience.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const addEducation = () => {
    setResume((previous) => ({
      ...previous,
      education: [
        ...previous.education,
        {
          degree: "",
          institution: "",
          field: "",
          year: "",
          gpa: "",
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setResume((previous) => ({
      ...previous,
      education: previous.education.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const addProject = () => {
    setResume((previous) => ({
      ...previous,
      projects: [
        ...previous.projects,
        {
          name: "",
          technologies: "",
          description: "",
          link: "",
        },
      ],
    }));
  };

  const removeProject = (index) => {
    setResume((previous) => ({
      ...previous,
      projects: previous.projects.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const addCertification = () => {
    setResume((previous) => ({
      ...previous,
      certifications: [
        ...previous.certifications,
        {
          name: "",
          issuer: "",
          year: "",
          link: "",
        },
      ],
    }));
  };

  const removeCertification = (index) => {
    setResume((previous) => ({
      ...previous,
      certifications: previous.certifications.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const addSkill = () => {
    const value = customSkill.trim();

    if (!value) return;

    if (
      resume.skills.some(
        (skill) => skill.toLowerCase() === value.toLowerCase()
      )
    ) {
      setCustomSkill("");
      return;
    }

    setResume((previous) => ({
      ...previous,
      skills: [...previous.skills, value],
    }));

    setCustomSkill("");
  };

  const removeSkill = (index) => {
    setResume((previous) => ({
      ...previous,
      skills: previous.skills.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const addCustomSection = () => {
    const name = customSectionName.trim();

    if (!name) return;

    const id = createId("custom");

    setResume((previous) => ({
      ...previous,
      customSections: [
        ...previous.customSections,
        {
          id,
          title: name,
          content: "",
        },
      ],
    }));

    setSections((previous) => [
      ...previous,
      {
        id: `custom-${id}`,
        label: name,
        visible: true,
        customId: id,
      },
    ]);

    setCustomSectionName("");
  };

  const removeCustomSection = (customId) => {
    setResume((previous) => ({
      ...previous,
      customSections: previous.customSections.filter(
        (section) => section.id !== customId
      ),
    }));

    setSections((previous) =>
      previous.filter(
        (section) => section.customId !== customId
      )
    );
  };

  const updateCustomSection = (customId, field, value) => {
    setResume((previous) => ({
      ...previous,
      customSections: previous.customSections.map((section) =>
        section.id === customId
          ? { ...section, [field]: value }
          : section
      ),
    }));
  };

  const updateSectionLabel = (sectionId, value) => {
    setSections((previous) =>
      previous.map((section) =>
        section.id === sectionId
          ? { ...section, label: value }
          : section
      )
    );
  };

  const toggleSectionVisibility = (sectionId) => {
    setSections((previous) =>
      previous.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              visible: !section.visible,
            }
          : section
      )
    );
  };

  const moveSection = (index, direction) => {
    setSections((previous) => {
      const newSections = [...previous];

      const targetIndex =
        direction === "up" ? index - 1 : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= newSections.length
      ) {
        return previous;
      }

      const temp = newSections[index];

      newSections[index] = newSections[targetIndex];
      newSections[targetIndex] = temp;

      return newSections;
    });
  };

  const deleteSection = (sectionId) => {
    const section = sections.find(
      (item) => item.id === sectionId
    );

    if (section?.customId) {
      removeCustomSection(section.customId);
      return;
    }

    setSections((previous) =>
      previous.filter((item) => item.id !== sectionId)
    );
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhotoError("");

    try {
      const compressed = await compressImage(file);

      setResume((previous) => ({
        ...previous,
        profilePhoto: compressed,
      }));
    } catch (error) {
      setPhotoError(
        error?.message || "Unable to upload this image."
      );
    }

    event.target.value = "";
  };

  const removePhoto = () => {
    setResume((previous) => ({
      ...previous,
      profilePhoto: "",
    }));
  };

  const saveChanges = () => {
    localStorage.setItem(
      STORAGE_KEYS.resume,
      JSON.stringify(resume)
    );

    localStorage.setItem(
      STORAGE_KEYS.template,
      selectedTemplate
    );

    localStorage.setItem(
      STORAGE_KEYS.color,
      accentColor
    );

    localStorage.setItem(
      STORAGE_KEYS.sections,
      JSON.stringify(sections)
    );

    setSavedMessage("Changes saved");
  };

  const goToStep = (stepId) => {
    setActiveStep(stepId);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goPrevious = () => {
    if (previousStep) {
      goToStep(previousStep.id);
    }
  };

  const goNext = () => {
    if (nextStep) {
      goToStep(nextStep.id);
    }
  };

  const printResume = () => {
    saveChanges();

    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setTemplateOpen(false);
  };

  const handleAccentSelect = (color) => {
    setAccentColor(color);
    setColorOpen(false);
  };

  const resumeStyle = {
    "--template-color": accentColor,
    "--template-color-rgb": hexToRgb(accentColor),
  };

  return (
    <div
      className="cb-resume-builder"
      style={resumeStyle}
    >
      {/* =====================================================
          TOP HEADER
          ===================================================== */}

      <header className="cb-builder-header">
        <div className="cb-brand">
          <div className="cb-brand-mark">C</div>

          <div>
            <div className="cb-brand-name">
              CareerBridge
            </div>

            <div className="cb-brand-subtitle">
              Resume Builder
            </div>
          </div>
        </div>

        <div className="cb-header-actions">
          {savedMessage && (
            <span className="cb-saved-message">
              ✓ {savedMessage}
            </span>
          )}

          <button
            className="cb-header-button secondary"
            onClick={saveChanges}
          >
            Save
          </button>

          <button
            className="cb-header-button primary"
            onClick={printResume}
          >
            ↓ Download PDF
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN BUILDER
          ===================================================== */}

      <main className="cb-builder-main">
        <div className="cb-builder-layout">

          {/* =================================================
              LEFT EDITOR
              ================================================= */}

          <section className="cb-editor-panel">

            {/* Top controls */}

            <div className="cb-editor-toolbar">

              <div className="cb-toolbar-group">
                <button
                  className="cb-tool-button"
                  onClick={() =>
                    setTemplateOpen((previous) => !previous)
                  }
                >
                  <span>▦</span>
                  Template
                </button>

                <button
                  className="cb-tool-button accent"
                  onClick={() =>
                    setColorOpen((previous) => !previous)
                  }
                >
                  <span>◉</span>
                  Accent
                </button>
              </div>

              <div className="cb-step-navigation">
                <button
                  className="cb-nav-button"
                  disabled={!previousStep}
                  onClick={goPrevious}
                >
                  ‹ Previous
                </button>

                <button
                  className="cb-nav-button"
                  disabled={!nextStep}
                  onClick={goNext}
                >
                  Next ›
                </button>
              </div>
            </div>

            {/* Template dropdown */}

            {templateOpen && (
              <TemplatePicker
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelect={handleTemplateSelect}
                accentColor={accentColor}
                resume={resume}
              />
            )}

            {/* Accent dropdown */}

            {colorOpen && (
              <div className="cb-accent-panel">
                <div className="cb-accent-title">
                  Choose accent color
                </div>

                <div className="cb-color-grid">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`cb-color-option ${
                        accentColor === color
                          ? "selected"
                          : ""
                      }`}
                      style={{
                        backgroundColor: color,
                      }}
                      onClick={() =>
                        handleAccentSelect(color)
                      }
                      aria-label={`Use ${color}`}
                    >
                      {accentColor === color && "✓"}
                    </button>
                  ))}

                  <label
                    className="cb-custom-color"
                    title="Choose custom color"
                  >
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(event) =>
                        handleAccentSelect(
                          event.target.value
                        )
                      }
                    />

                    <span>+</span>
                  </label>
                </div>
              </div>
            )}

            {/* Progress */}

            <div className="cb-progress">
              <div className="cb-progress-track">
                <div
                  className="cb-progress-value"
                  style={{
                    width: `${
                      ((currentStepIndex + 1) /
                        steps.length) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="cb-progress-text">
                Step {currentStepIndex + 1} of{" "}
                {steps.length}
              </div>
            </div>

            {/* Step navigation */}

            <div className="cb-step-tabs">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  className={`cb-step-tab ${
                    activeStep === step.id
                      ? "active"
                      : ""
                  } ${
                    index < currentStepIndex
                      ? "completed"
                      : ""
                  }`}
                  onClick={() => goToStep(step.id)}
                >
                  <span className="cb-step-icon">
                    {index < currentStepIndex
                      ? "✓"
                      : step.icon}
                  </span>

                  <span>{step.label}</span>
                </button>
              ))}
            </div>

            {/* Active form */}

            <div className="cb-form-area">

              {activeStep === "personal" && (
                <PersonalForm
                  resume={resume}
                  currentTemplate={currentTemplate}
                  updateResumeField={updateResumeField}
                  fileInputRef={fileInputRef}
                  handlePhotoChange={handlePhotoChange}
                  removePhoto={removePhoto}
                  photoError={photoError}
                />
              )}

              {activeStep === "summary" && (
                <SummaryForm
                  resume={resume}
                  updateResumeField={updateResumeField}
                />
              )}

              {activeStep === "experience" && (
                <ExperienceForm
                  resume={resume}
                  updateArrayItem={updateArrayItem}
                  addExperience={addExperience}
                  removeExperience={removeExperience}
                />
              )}

              {activeStep === "education" && (
                <EducationForm
                  resume={resume}
                  updateArrayItem={updateArrayItem}
                  addEducation={addEducation}
                  removeEducation={removeEducation}
                />
              )}

              {activeStep === "skills" && (
                <SkillsForm
                  resume={resume}
                  customSkill={customSkill}
                  setCustomSkill={setCustomSkill}
                  addSkill={addSkill}
                  removeSkill={removeSkill}
                />
              )}

              {activeStep === "projects" && (
                <ProjectsForm
                  resume={resume}
                  updateArrayItem={updateArrayItem}
                  addProject={addProject}
                  removeProject={removeProject}
                />
              )}

              {activeStep === "certifications" && (
                <CertificationsForm
                  resume={resume}
                  updateArrayItem={updateArrayItem}
                  addCertification={addCertification}
                  removeCertification={removeCertification}
                />
              )}

              {/* Custom sections */}

              {resume.customSections.length > 0 && (
                <CustomSectionsEditor
                  resume={resume}
                  updateCustomSection={
                    updateCustomSection
                  }
                  removeCustomSection={
                    removeCustomSection
                  }
                  customSectionName={
                    customSectionName
                  }
                  setCustomSectionName={
                    setCustomSectionName
                  }
                  addCustomSection={
                    addCustomSection
                  }
                />
              )}

              <SectionManager
                sections={sections}
                toggleSectionVisibility={
                  toggleSectionVisibility
                }
                moveSection={moveSection}
                deleteSection={deleteSection}
                updateSectionLabel={
                  updateSectionLabel
                }
              />

              <div className="cb-form-footer">
                <button
                  className="cb-save-button"
                  onClick={saveChanges}
                >
                  Save Changes
                </button>

                {nextStep && (
                  <button
                    className="cb-next-button"
                    onClick={goNext}
                  >
                    Continue to {nextStep.label}
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT LIVE PREVIEW
              ================================================= */}

          <section className="cb-preview-panel">

            <div className="cb-preview-topbar">
              <div>
                <span className="cb-live-dot" />
                Live Preview
              </div>

              <div className="cb-preview-template-name">
                {currentTemplate.name}
              </div>
            </div>

            <div className="cb-preview-scroll">
              <ResumePreview
                resume={resume}
                sections={visibleSections}
                template={currentTemplate}
                accentColor={accentColor}
                updateResumeField={updateResumeField}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   TEMPLATE PICKER
   ========================================================= */

function TemplatePicker({
  templates,
  selectedTemplate,
  onSelect,
  accentColor,
  resume,
}) {
  return (
    <div className="cb-template-panel">
      <div className="cb-template-panel-header">
        <div>
          <h3>Choose a template</h3>
          <p>
            Select a layout that matches your profile.
          </p>
        </div>

        <span className="cb-template-count">
          {templates.length} templates
        </span>
      </div>

      <div className="cb-template-grid">
        {templates.map((template) => (
          <button
            key={template.id}
            className={`cb-template-card ${
              selectedTemplate === template.id
                ? "selected"
                : ""
            }`}
            onClick={() => onSelect(template.id)}
          >
            <div className="cb-template-mini">
              <MiniTemplatePreview
                template={template}
                accentColor={accentColor}
                resume={resume}
              />
            </div>

            <div className="cb-template-info">
              <div className="cb-template-name-row">
                <strong>{template.name}</strong>

                {template.hasPhoto && (
                  <span className="cb-photo-badge">
                    Photo
                  </span>
                )}

                {selectedTemplate === template.id && (
                  <span className="cb-template-check">
                    ✓
                  </span>
                )}
              </div>

              <span className="cb-template-category">
                {template.category}
              </span>

              <p>{template.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MINI TEMPLATE PREVIEW
   ========================================================= */

function MiniTemplatePreview({
  template,
  accentColor,
  resume,
}) {
  const name = resume.fullName || "Your Name";
  const title =
    resume.jobTitle || "Professional Title";

  if (template.id === "sidebar") {
    return (
      <div
        className="mini-resume mini-sidebar"
        style={{
          "--mini-color": accentColor,
        }}
      >
        <div className="mini-sidebar-left">
          <div className="mini-circle" />
          <div className="mini-small-line" />
          <div className="mini-small-line short" />
          <div className="mini-small-line" />
          <div className="mini-block" />
        </div>

        <div className="mini-sidebar-right">
          <div className="mini-title">
            {name}
          </div>
          <div className="mini-role">{title}</div>
          <div className="mini-section" />
          <div className="mini-lines" />
          <div className="mini-section" />
          <div className="mini-lines" />
        </div>
      </div>
    );
  }

  if (template.id === "creative") {
    return (
      <div
        className="mini-resume mini-creative"
        style={{
          "--mini-color": accentColor,
        }}
      >
        <div className="mini-creative-header">
          <div className="mini-photo">
            {resume.profilePhoto ? (
              <img
                src={resume.profilePhoto}
                alt=""
              />
            ) : null}
          </div>

          <div>
            <div className="mini-title">
              {name}
            </div>
            <div className="mini-role">
              {title}
            </div>
          </div>
        </div>

        <div className="mini-content-grid">
          <div>
            <div className="mini-section" />
            <div className="mini-lines" />
          </div>

          <div>
            <div className="mini-section" />
            <div className="mini-lines" />
            <div className="mini-section" />
          </div>
        </div>
      </div>
    );
  }

  if (template.id === "corporate") {
    return (
      <div
        className="mini-resume mini-corporate"
        style={{
          "--mini-color": accentColor,
        }}
      >
        <div className="mini-corporate-side">
          <div className="mini-photo square">
            {resume.profilePhoto ? (
              <img
                src={resume.profilePhoto}
                alt=""
              />
            ) : null}
          </div>

          <div className="mini-side-line" />
          <div className="mini-side-line" />
          <div className="mini-side-line short" />
        </div>

        <div className="mini-corporate-main">
          <div className="mini-title">{name}</div>
          <div className="mini-role">{title}</div>

          <div className="mini-section" />
          <div className="mini-lines" />
          <div className="mini-section" />
          <div className="mini-lines" />
        </div>
      </div>
    );
  }

  if (template.id === "elegant") {
    return (
      <div
        className="mini-resume mini-elegant"
        style={{
          "--mini-color": accentColor,
        }}
      >
        <div className="mini-elegant-photo">
          {resume.profilePhoto ? (
            <img
              src={resume.profilePhoto}
              alt=""
            />
          ) : null}
        </div>

        <div className="mini-title">{name}</div>
        <div className="mini-role">{title}</div>
        <div className="mini-elegant-line" />

        <div className="mini-section" />
        <div className="mini-lines" />
        <div className="mini-section" />
      </div>
    );
  }

  if (template.id === "tech") {
    return (
      <div
        className="mini-resume mini-tech"
        style={{
          "--mini-color": accentColor,
        }}
      >
        <div className="mini-tech-top">
          <span>&lt;/&gt;</span>
          <div>
            <div className="mini-title">{name}</div>
            <div className="mini-role">{title}</div>
          </div>
        </div>

        <div className="mini-code-line">
          # experience
        </div>

        <div className="mini-lines" />

        <div className="mini-code-line">
          # projects
        </div>

        <div className="mini-lines" />
      </div>
    );
  }

  if (template.id === "fresher") {
    return (
      <div
        className="mini-resume mini-fresher"
        style={{
          "--mini-color": accentColor,
        }}
      >
        <div className="mini-fresher-header">
          <div>
            <div className="mini-title">{name}</div>
            <div className="mini-role">{title}</div>
          </div>

          <div className="mini-star">✦</div>
        </div>

        <div className="mini-section" />
        <div className="mini-lines" />

        <div className="mini-two-column">
          <div>
            <div className="mini-section" />
            <div className="mini-lines" />
          </div>

          <div>
            <div className="mini-section" />
            <div className="mini-lines" />
          </div>
        </div>
      </div>
    );
  }

  if (template.id === "academic") {
    return (
      <div
        className="mini-resume mini-academic"
        style={{
          "--mini-color": accentColor,
        }}
      >
        <div className="mini-academic-name">
          {name}
        </div>

        <div className="mini-academic-rule" />

        <div className="mini-section" />
        <div className="mini-lines" />

        <div className="mini-section" />
        <div className="mini-lines" />

        <div className="mini-section" />
      </div>
    );
  }

  if (template.id === "minimal") {
    return (
      <div
        className="mini-resume mini-minimal"
        style={{
          "--mini-color": accentColor,
        }}
      >
        <div className="mini-title">{name}</div>
        <div className="mini-role">{title}</div>

        <div className="mini-minimal-rule" />

        <div className="mini-section" />
        <div className="mini-lines" />

        <div className="mini-section" />
        <div className="mini-lines" />
      </div>
    );
  }

  if (template.id === "classic") {
    return (
      <div
        className="mini-resume mini-classic"
        style={{
          "--mini-color": accentColor,
        }}
      >
        <div className="mini-classic-name">
          {name}
        </div>

        <div className="mini-classic-contact">
          email • phone • location
        </div>

        <div className="mini-classic-rule" />

        <div className="mini-section" />
        <div className="mini-lines" />

        <div className="mini-section" />
        <div className="mini-lines" />
      </div>
    );
  }

  return (
    <div
      className="mini-resume mini-modern"
      style={{
        "--mini-color": accentColor,
      }}
    >
      <div className="mini-modern-top">
        <div>
          <div className="mini-title">{name}</div>
          <div className="mini-role">{title}</div>
        </div>

        <div className="mini-accent-square" />
      </div>

      <div className="mini-modern-rule" />

      <div className="mini-section" />
      <div className="mini-lines" />

      <div className="mini-section" />
      <div className="mini-lines" />

      <div className="mini-section" />
    </div>
  );
}

/* =========================================================
   PERSONAL FORM
   ========================================================= */

function PersonalForm({
  resume,
  currentTemplate,
  updateResumeField,
  fileInputRef,
  handlePhotoChange,
  removePhoto,
  photoError,
}) {
  return (
    <div className="cb-form-section">
      <FormHeading
        title="Personal Information"
        subtitle="Add your basic contact details and professional identity."
      />

      {currentTemplate.hasPhoto && (
        <div className="cb-photo-upload-box">
          <div className="cb-photo-preview">
            {resume.profilePhoto ? (
              <img
                src={resume.profilePhoto}
                alt="Profile"
              />
            ) : (
              <span>👤</span>
            )}
          </div>

          <div className="cb-photo-details">
            <strong>Profile Photo</strong>

            <p>
              This template supports a professional
              profile photo.
            </p>

            <div className="cb-photo-actions">
              <button
                className="cb-upload-button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                Upload Photo
              </button>

              {resume.profilePhoto && (
                <button
                  className="cb-remove-photo"
                  onClick={removePhoto}
                >
                  Remove
                </button>
              )}
            </div>

            {photoError && (
              <span className="cb-photo-error">
                {photoError}
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handlePhotoChange}
            hidden
          />
        </div>
      )}

      {!currentTemplate.hasPhoto && (
        <div className="cb-info-note">
          <span>💡</span>
          <div>
            <strong>Photo not required</strong>
            <p>
              This template is designed without a
              profile photo.
            </p>
          </div>
        </div>
      )}

      <div className="cb-form-grid two">
        <FormField
          label="Full Name"
          required
          value={resume.fullName}
          placeholder="Enter your full name"
          onChange={(value) =>
            updateResumeField("fullName", value)
          }
        />

        <FormField
          label="Professional Title"
          value={resume.jobTitle}
          placeholder="e.g. Software Engineer"
          onChange={(value) =>
            updateResumeField("jobTitle", value)
          }
        />

        <FormField
          label="Email Address"
          required
          value={resume.email}
          placeholder="Enter your email"
          type="email"
          onChange={(value) =>
            updateResumeField("email", value)
          }
        />

        <FormField
          label="Phone Number"
          value={resume.phone}
          placeholder="+91 98765 43210"
          onChange={(value) =>
            updateResumeField("phone", value)
          }
        />

        <FormField
          label="Location"
          value={resume.location}
          placeholder="Mumbai, India"
          onChange={(value) =>
            updateResumeField("location", value)
          }
        />

        <FormField
          label="LinkedIn"
          value={resume.linkedin}
          placeholder="linkedin.com/in/yourname"
          onChange={(value) =>
            updateResumeField("linkedin", value)
          }
        />

        <FormField
          label="GitHub"
          value={resume.github}
          placeholder="github.com/yourname"
          onChange={(value) =>
            updateResumeField("github", value)
          }
        />

        <FormField
          label="Personal Website"
          value={resume.website}
          placeholder="yourwebsite.com"
          onChange={(value) =>
            updateResumeField("website", value)
          }
        />
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY FORM
   ========================================================= */

function SummaryForm({
  resume,
  updateResumeField,
}) {
  return (
    <div className="cb-form-section">
      <FormHeading
        title="Professional Summary"
        subtitle="Write 3–4 concise sentences that describe your strengths and career goals."
      />

      <div className="cb-ai-row">
        <span>Professional Summary</span>

        <button
          className="cb-ai-button"
          type="button"
          onClick={() =>
            updateResumeField(
              "summary",
              resume.summary ||
                "Motivated professional with strong technical skills, problem-solving ability and a passion for building practical solutions."
            )
          }
        >
          ✨ Enhance with AI
        </button>
      </div>

      <textarea
        className="cb-large-textarea"
        value={resume.summary}
        placeholder="Write a compelling professional summary..."
        onChange={(event) =>
          updateResumeField(
            "summary",
            event.target.value
          )
        }
      />

      <div className="cb-form-tip">
        <strong>Tip:</strong> Keep your summary concise
        and focus on your strongest skills, experience
        and career direction.
      </div>
    </div>
  );
}

/* =========================================================
   EXPERIENCE FORM
   ========================================================= */

function ExperienceForm({
  resume,
  updateArrayItem,
  addExperience,
  removeExperience,
}) {
  return (
    <div className="cb-form-section">
      <FormHeading
        title="Professional Experience"
        subtitle="Add your work experience, internships and important achievements."
        action={
          <button
            className="cb-add-button"
            onClick={addExperience}
          >
            + Add Experience
          </button>
        }
      />

      {resume.experience.length === 0 && (
        <EmptyState
          icon="💼"
          title="No experience added yet"
          text="Add an internship, job or practical experience."
        />
      )}

      <div className="cb-repeat-list">
        {resume.experience.map((item, index) => (
          <div
            className="cb-repeat-card"
            key={`experience-${index}`}
          >
            <div className="cb-card-heading">
              <span>
                Experience #{index + 1}
              </span>

              <button
                className="cb-delete-button"
                onClick={() =>
                  removeExperience(index)
                }
              >
                🗑
              </button>
            </div>

            <div className="cb-form-grid two">
              <FormField
                label="Job Title"
                value={item.role}
                placeholder="Software Developer Intern"
                onChange={(value) =>
                  updateArrayItem(
                    "experience",
                    index,
                    "role",
                    value
                  )
                }
              />

              <FormField
                label="Company"
                value={item.company}
                placeholder="Company Name"
                onChange={(value) =>
                  updateArrayItem(
                    "experience",
                    index,
                    "company",
                    value
                  )
                }
              />

              <FormField
                label="Start Date"
                type="month"
                value={item.startDate}
                onChange={(value) =>
                  updateArrayItem(
                    "experience",
                    index,
                    "startDate",
                    value
                  )
                }
              />

              <FormField
                label="End Date"
                type="month"
                value={item.endDate}
                disabled={item.current}
                onChange={(value) =>
                  updateArrayItem(
                    "experience",
                    index,
                    "endDate",
                    value
                  )
                }
              />
            </div>

            <label className="cb-checkbox-row">
              <input
                type="checkbox"
                checked={!!item.current}
                onChange={(event) =>
                  updateArrayItem(
                    "experience",
                    index,
                    "current",
                    event.target.checked
                  )
                }
              />

              <span>Currently working here</span>
            </label>

            <label className="cb-field-label">
              Job Description
            </label>

            <textarea
              className="cb-textarea"
              value={item.description}
              placeholder="Describe your responsibilities, achievements and impact..."
              onChange={(event) =>
                updateArrayItem(
                  "experience",
                  index,
                  "description",
                  event.target.value
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   EDUCATION FORM
   ========================================================= */

function EducationForm({
  resume,
  updateArrayItem,
  addEducation,
  removeEducation,
}) {
  return (
    <div className="cb-form-section">
      <FormHeading
        title="Education"
        subtitle="Add your degree, college and academic information."
        action={
          <button
            className="cb-add-button"
            onClick={addEducation}
          >
            + Add Education
          </button>
        }
      />

      {resume.education.length === 0 && (
        <EmptyState
          icon="🎓"
          title="No education added yet"
          text="Add your current degree or previous qualifications."
        />
      )}

      <div className="cb-repeat-list">
        {resume.education.map((item, index) => (
          <div
            className="cb-repeat-card"
            key={`education-${index}`}
          >
            <div className="cb-card-heading">
              <span>
                Education #{index + 1}
              </span>

              <button
                className="cb-delete-button"
                onClick={() =>
                  removeEducation(index)
                }
              >
                🗑
              </button>
            </div>

            <div className="cb-form-grid two">
              <FormField
                label="Institution"
                value={item.institution}
                placeholder="College / University Name"
                onChange={(value) =>
                  updateArrayItem(
                    "education",
                    index,
                    "institution",
                    value
                  )
                }
              />

              <FormField
                label="Degree"
                value={item.degree}
                placeholder="Bachelor's / Master's Degree"
                onChange={(value) =>
                  updateArrayItem(
                    "education",
                    index,
                    "degree",
                    value
                  )
                }
              />

              <FormField
                label="Field of Study"
                value={item.field}
                placeholder="Information Technology"
                onChange={(value) =>
                  updateArrayItem(
                    "education",
                    index,
                    "field",
                    value
                  )
                }
              />

              <FormField
                label="Graduation Year"
                type="number"
                value={item.year}
                placeholder="2027"
                onChange={(value) =>
                  updateArrayItem(
                    "education",
                    index,
                    "year",
                    value
                  )
                }
              />

              <FormField
                label="GPA / Percentage"
                value={item.gpa}
                placeholder="Optional"
                onChange={(value) =>
                  updateArrayItem(
                    "education",
                    index,
                    "gpa",
                    value
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   SKILLS FORM
   ========================================================= */

function SkillsForm({
  resume,
  customSkill,
  setCustomSkill,
  addSkill,
  removeSkill,
}) {
  return (
    <div className="cb-form-section">
      <FormHeading
        title="Skills"
        subtitle="Add technical, professional and soft skills."
      />

      <div className="cb-skill-input-row">
        <input
          className="cb-input"
          value={customSkill}
          placeholder="Enter a skill, e.g. JavaScript"
          onChange={(event) =>
            setCustomSkill(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSkill();
            }
          }}
        />

        <button
          className="cb-blue-add-button"
          onClick={addSkill}
        >
          + Add
        </button>
      </div>

      {resume.skills.length === 0 ? (
        <EmptyState
          icon="✦"
          title="No skills added yet"
          text="Add your technical and soft skills above."
        />
      ) : (
        <div className="cb-skills-editor-list">
          {resume.skills.map((skill, index) => (
            <div
              className="cb-skill-editor-item"
              key={`${skill}-${index}`}
            >
              <span>{skill}</span>

              <button
                onClick={() => removeSkill(index)}
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="cb-form-tip">
        <strong>Tip:</strong> Add 8–12 relevant skills.
        Include both technical skills and useful soft
        skills.
      </div>
    </div>
  );
}

/* =========================================================
   PROJECTS FORM
   ========================================================= */

function ProjectsForm({
  resume,
  updateArrayItem,
  addProject,
  removeProject,
}) {
  return (
    <div className="cb-form-section">
      <FormHeading
        title="Projects"
        subtitle="Showcase projects that demonstrate your skills."
        action={
          <button
            className="cb-add-button"
            onClick={addProject}
          >
            + Add Project
          </button>
        }
      />

      {resume.projects.length === 0 && (
        <EmptyState
          icon="📁"
          title="No projects added yet"
          text="Add academic, personal or hackathon projects."
        />
      )}

      <div className="cb-repeat-list">
        {resume.projects.map((item, index) => (
          <div
            className="cb-repeat-card"
            key={`project-${index}`}
          >
            <div className="cb-card-heading">
              <span>
                Project #{index + 1}
              </span>

              <button
                className="cb-delete-button"
                onClick={() =>
                  removeProject(index)
                }
              >
                🗑
              </button>
            </div>

            <FormField
              label="Project Name"
              value={item.name}
              placeholder="Project Name"
              onChange={(value) =>
                updateArrayItem(
                  "projects",
                  index,
                  "name",
                  value
                )
              }
            />

            <FormField
              label="Technologies"
              value={item.technologies}
              placeholder="React, Python, MySQL..."
              onChange={(value) =>
                updateArrayItem(
                  "projects",
                  index,
                  "technologies",
                  value
                )
              }
            />

            <label className="cb-field-label">
              Project Description
            </label>

            <textarea
              className="cb-textarea"
              value={item.description}
              placeholder="Describe what you built and what problem it solves..."
              onChange={(event) =>
                updateArrayItem(
                  "projects",
                  index,
                  "description",
                  event.target.value
                )
              }
            />

            <FormField
              label="Project Link"
              value={item.link}
              placeholder="GitHub / Live Demo URL"
              onChange={(value) =>
                updateArrayItem(
                  "projects",
                  index,
                  "link",
                  value
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   CERTIFICATION FORM
   ========================================================= */

function CertificationsForm({
  resume,
  updateArrayItem,
  addCertification,
  removeCertification,
}) {
  return (
    <div className="cb-form-section">
      <FormHeading
        title="Certifications"
        subtitle="Add certifications, courses and professional achievements."
        action={
          <button
            className="cb-add-button"
            onClick={addCertification}
          >
            + Add Certification
          </button>
        }
      />

      {resume.certifications.length === 0 && (
        <EmptyState
          icon="🏆"
          title="No certifications added yet"
          text="Add relevant certificates and courses."
        />
      )}

      <div className="cb-repeat-list">
        {resume.certifications.map((item, index) => (
          <div
            className="cb-repeat-card"
            key={`certification-${index}`}
          >
            <div className="cb-card-heading">
              <span>
                Certification #{index + 1}
              </span>

              <button
                className="cb-delete-button"
                onClick={() =>
                  removeCertification(index)
                }
              >
                🗑
              </button>
            </div>

            <div className="cb-form-grid two">
              <FormField
                label="Certification Name"
                value={item.name}
                placeholder="Certification Name"
                onChange={(value) =>
                  updateArrayItem(
                    "certifications",
                    index,
                    "name",
                    value
                  )
                }
              />

              <FormField
                label="Issuing Organization"
                value={item.issuer}
                placeholder="Organization"
                onChange={(value) =>
                  updateArrayItem(
                    "certifications",
                    index,
                    "issuer",
                    value
                  )
                }
              />

              <FormField
                label="Year"
                value={item.year}
                placeholder="2026"
                onChange={(value) =>
                  updateArrayItem(
                    "certifications",
                    index,
                    "year",
                    value
                  )
                }
              />

              <FormField
                label="Credential URL"
                value={item.link}
                placeholder="https://..."
                onChange={(value) =>
                  updateArrayItem(
                    "certifications",
                    index,
                    "link",
                    value
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOM SECTION EDITOR
   ========================================================= */

function CustomSectionsEditor({
  resume,
  updateCustomSection,
  removeCustomSection,
  customSectionName,
  setCustomSectionName,
  addCustomSection,
}) {
  return (
    <div className="cb-form-section cb-custom-sections">
      <FormHeading
        title="Custom Sections"
        subtitle="Add additional sections such as achievements, languages or interests."
      />

      {resume.customSections.map((section) => (
        <div
          className="cb-repeat-card"
          key={section.id}
        >
          <div className="cb-card-heading">
            <span>{section.title}</span>

            <button
              className="cb-delete-button"
              onClick={() =>
                removeCustomSection(section.id)
              }
            >
              🗑
            </button>
          </div>

          <FormField
            label="Section Title"
            value={section.title}
            onChange={(value) =>
              updateCustomSection(
                section.id,
                "title",
                value
              )
            }
          />

          <label className="cb-field-label">
            Content
          </label>

          <textarea
            className="cb-textarea"
            value={section.content}
            placeholder="Write the content for this section..."
            onChange={(event) =>
              updateCustomSection(
                section.id,
                "content",
                event.target.value
              )
            }
          />
        </div>
      ))}

      <div className="cb-add-custom-row">
        <input
          className="cb-input"
          value={customSectionName}
          placeholder="New section name"
          onChange={(event) =>
            setCustomSectionName(
              event.target.value
            )
          }
        />

        <button
          className="cb-add-button"
          onClick={addCustomSection}
        >
          + Add Section
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION MANAGER
   ========================================================= */

function SectionManager({
  sections,
  toggleSectionVisibility,
  moveSection,
  deleteSection,
  updateSectionLabel,
}) {
  return (
    <div className="cb-section-manager">
      <div className="cb-section-manager-heading">
        <div>
          <h3>Resume Sections</h3>
          <p>
            Change visibility and order of your sections.
          </p>
        </div>
      </div>

      <div className="cb-section-manager-list">
        {sections.map((section, index) => (
          <div
            className={`cb-section-manager-item ${
              section.visible ? "" : "hidden"
            }`}
            key={section.id}
          >
            <button
              className="cb-visibility-button"
              onClick={() =>
                toggleSectionVisibility(
                  section.id
                )
              }
            >
              {section.visible ? "◉" : "○"}
            </button>

            <input
              value={section.label}
              onChange={(event) =>
                updateSectionLabel(
                  section.id,
                  event.target.value
                )
              }
            />

            <div className="cb-order-buttons">
              <button
                disabled={index === 0}
                onClick={() =>
                  moveSection(index, "up")
                }
              >
                ↑
              </button>

              <button
                disabled={
                  index === sections.length - 1
                }
                onClick={() =>
                  moveSection(index, "down")
                }
              >
                ↓
              </button>

              <button
                className="danger"
                onClick={() =>
                  deleteSection(section.id)
                }
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   RESUME PREVIEW
   ========================================================= */

function ResumePreview({
  resume,
  sections,
  template,
  accentColor,
  updateResumeField,
}) {
  const previewStyle = {
    "--template-color": accentColor,
    "--template-color-rgb": hexToRgb(accentColor),
  };

  return (
    <div className="cb-paper-wrapper">
      <div
        className={`cb-resume-paper resume-${template.id}`}
        style={previewStyle}
      >
        {template.id === "modern" && (
          <ModernResume
            resume={resume}
            sections={sections}
            updateResumeField={updateResumeField}
          />
        )}

        {template.id === "classic" && (
          <ClassicResume
            resume={resume}
            sections={sections}
            updateResumeField={updateResumeField}
          />
        )}

        {template.id === "minimal" && (
          <MinimalResume
            resume={resume}
            sections={sections}
            updateResumeField={updateResumeField}
          />
        )}

        {template.id === "sidebar" && (
          <SidebarResume
            resume={resume}
            sections={sections}
            updateResumeField={updateResumeField}
          />
        )}

        {template.id === "creative" && (
          <CreativeResume
            resume={resume}
            sections={sections}
            updateResumeField={updateResumeField}
          />
        )}

        {template.id === "corporate" && (
          <CorporateResume
            resume={resume}
            sections={sections}
            updateResumeField={updateResumeField}
          />
        )}

        {template.id === "tech" && (
          <TechResume
            resume={resume}
            sections={sections}
            updateResumeField={updateResumeField}
          />
        )}

        {template.id === "fresher" && (
          <FresherResume
            resume={resume}
            sections={sections}
            updateResumeField={updateResumeField}
          />
        )}

        {template.id === "academic" && (
          <AcademicResume
            resume={resume}
            sections={sections}
            updateResumeField={updateResumeField}
          />
        )}

        {template.id === "elegant" && (
          <ElegantResume
            resume={resume}
            sections={sections}
            updateResumeField={updateResumeField}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   RESUME SHARED CONTENT
   ========================================================= */

function ContactLine({ resume }) {
  const contacts = [
    resume.email,
    resume.phone,
    resume.location,
    resume.linkedin,
    resume.github,
    resume.website,
  ].filter(Boolean);

  return (
    <div className="resume-contact-line">
      {contacts.map((contact, index) => (
        <span key={`${contact}-${index}`}>
          {contact}
        </span>
      ))}
    </div>
  );
}

function ResumeSection({
  title,
  children,
  className = "",
}) {
  return (
    <section
      className={`resume-section ${className}`}
    >
      <h2 className="resume-section-title">
        {title}
      </h2>

      <div className="resume-section-body">
        {children}
      </div>
    </section>
  );
}

function EditableText({
  value,
  onChange,
  className = "",
  placeholder = "",
  multiline = false,
}) {
  if (multiline) {
    return (
      <textarea
        className={`resume-editable resume-editable-textarea ${className}`}
        value={value || ""}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    );
  }

  return (
    <input
      className={`resume-editable ${className}`}
      value={value || ""}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(event.target.value)
      }
    />
  );
}

function ContactList({ resume }) {
  return (
    <div className="resume-contact-list">
      {resume.email && (
        <div>
          <span>✉</span>
          {resume.email}
        </div>
      )}

      {resume.phone && (
        <div>
          <span>☎</span>
          {resume.phone}
        </div>
      )}

      {resume.location && (
        <div>
          <span>⌖</span>
          {resume.location}
        </div>
      )}

      {resume.linkedin && (
        <div>
          <span>in</span>
          {resume.linkedin}
        </div>
      )}

      {resume.github && (
        <div>
          <span>⌘</span>
          {resume.github}
        </div>
      )}
    </div>
  );
}

function RenderSummary({
  resume,
  updateResumeField,
}) {
  return (
    <EditableText
      value={resume.summary}
      multiline
      placeholder="Add your professional summary..."
      onChange={(value) =>
        updateResumeField("summary", value)
      }
    />
  );
}

function RenderExperience({ resume }) {
  if (!resume.experience.length) {
    return null;
  }

  return (
    <div className="resume-experience-list">
      {resume.experience.map((item, index) => {
        const dateText =
          item.startDate || item.endDate || item.current
            ? `${formatMonth(item.startDate)}${
                item.startDate ? " – " : ""
              }${
                item.current
                  ? "Present"
                  : formatMonth(item.endDate)
              }`
            : "";

        return (
          <div
            className="resume-experience-item"
            key={`preview-experience-${index}`}
          >
            <div className="resume-item-top">
              <div>
                <strong>
                  {item.role ||
                    "Job Title"}
                </strong>

                <span className="resume-company">
                  {item.company ||
                    "Company Name"}
                </span>
              </div>

              <span className="resume-date">
                {dateText}
              </span>
            </div>

            {item.description && (
              <p className="resume-description">
                {item.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RenderEducation({ resume }) {
  return (
    <div className="resume-education-list">
      {resume.education.map((item, index) => (
        <div
          className="resume-education-item"
          key={`preview-education-${index}`}
        >
          <div>
            <strong>
              {item.degree ||
                "Degree"}
            </strong>

            <span>
              {item.institution ||
                "Institution"}
            </span>

            {item.field && (
              <small>{item.field}</small>
            )}

            {item.gpa && (
              <small>
                GPA / Percentage: {item.gpa}
              </small>
            )}
          </div>

          <span className="resume-date">
            {item.year}
          </span>
        </div>
      ))}
    </div>
  );
}

function RenderSkills({ resume }) {
  return (
    <div className="resume-skills-list">
      {resume.skills.map((skill, index) => (
        <span
          className="resume-skill"
          key={`${skill}-${index}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function RenderProjects({ resume }) {
  return (
    <div className="resume-project-list">
      {resume.projects.map((project, index) => (
        <div
          className="resume-project-item"
          key={`preview-project-${index}`}
        >
          <div className="resume-project-heading">
            <strong>
              {project.name ||
                "Project Name"}
            </strong>

            {project.link && (
              <span>{project.link}</span>
            )}
          </div>

          {project.technologies && (
            <div className="resume-project-tech">
              {project.technologies}
            </div>
          )}

          {project.description && (
            <p>{project.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function RenderCertifications({ resume }) {
  return (
    <div className="resume-certification-list">
      {resume.certifications.map(
        (certificate, index) => (
          <div
            className="resume-certification-item"
            key={`preview-cert-${index}`}
          >
            <div>
              <strong>
                {certificate.name ||
                  "Certification"}
              </strong>

              <span>
                {certificate.issuer}
              </span>
            </div>

            <span>
              {certificate.year}
            </span>
          </div>
        )
      )}
    </div>
  );
}

function RenderCustomSections({
  resume,
}) {
  return resume.customSections.map(
    (section) => (
      <ResumeSection
        key={section.id}
        title={section.title}
      >
        <p className="resume-custom-content">
          {section.content}
        </p>
      </ResumeSection>
    )
  );
}

function SectionRenderer({
  section,
  resume,
  updateResumeField,
}) {
  if (section.id === "summary") {
    return (
      <ResumeSection title={section.label}>
        <RenderSummary
          resume={resume}
          updateResumeField={
            updateResumeField
          }
        />
      </ResumeSection>
    );
  }

  if (section.id === "experience") {
    return (
      <ResumeSection title={section.label}>
        <RenderExperience resume={resume} />
      </ResumeSection>
    );
  }

  if (section.id === "education") {
    return (
      <ResumeSection title={section.label}>
        <RenderEducation resume={resume} />
      </ResumeSection>
    );
  }

  if (section.id === "skills") {
    return (
      <ResumeSection title={section.label}>
        <RenderSkills resume={resume} />
      </ResumeSection>
    );
  }

  if (section.id === "projects") {
    return (
      <ResumeSection title={section.label}>
        <RenderProjects resume={resume} />
      </ResumeSection>
    );
  }

  if (section.id === "certifications") {
    return (
      <ResumeSection title={section.label}>
        <RenderCertifications
          resume={resume}
        />
      </ResumeSection>
    );
  }

  if (section.customId) {
    const customSection =
      resume.customSections.find(
        (item) =>
          item.id === section.customId
      );

    if (!customSection) return null;

    return (
      <ResumeSection
        title={customSection.title}
      >
        <p className="resume-custom-content">
          {customSection.content}
        </p>
      </ResumeSection>
    );
  }

  return null;
}

/* =========================================================
   MODERN RESUME
   ========================================================= */

function ModernResume({
  resume,
  sections,
  updateResumeField,
}) {
  return (
    <div className="resume-layout-content modern-layout">
      <header className="modern-header">
        <div>
          <EditableText
            value={resume.fullName}
            className="resume-name modern-name"
            placeholder="Your Name"
            onChange={(value) =>
              updateResumeField(
                "fullName",
                value
              )
            }
          />

          <EditableText
            value={resume.jobTitle}
            className="resume-job-title"
            placeholder="Professional Title"
            onChange={(value) =>
              updateResumeField(
                "jobTitle",
                value
              )
            }
          />
        </div>

        <div className="modern-accent-box" />
      </header>

      <ContactLine resume={resume} />

      <div className="modern-rule" />

      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          resume={resume}
          updateResumeField={
            updateResumeField
          }
        />
      ))}
    </div>
  );
}

/* =========================================================
   CLASSIC RESUME
   ========================================================= */

function ClassicResume({
  resume,
  sections,
  updateResumeField,
}) {
  return (
    <div className="resume-layout-content classic-layout">
      <header className="classic-header">
        <EditableText
          value={resume.fullName}
          className="resume-name classic-name"
          placeholder="Your Name"
          onChange={(value) =>
            updateResumeField(
              "fullName",
              value
            )
          }
        />

        <EditableText
          value={resume.jobTitle}
          className="resume-job-title classic-title"
          placeholder="Professional Title"
          onChange={(value) =>
            updateResumeField(
              "jobTitle",
              value
            )
          }
        />

        <ContactLine resume={resume} />
      </header>

      <div className="classic-rule" />

      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          resume={resume}
          updateResumeField={
            updateResumeField
          }
        />
      ))}
    </div>
  );
}

/* =========================================================
   MINIMAL RESUME
   ========================================================= */

function MinimalResume({
  resume,
  sections,
  updateResumeField,
}) {
  return (
    <div className="resume-layout-content minimal-layout">
      <header className="minimal-header">
        <EditableText
          value={resume.fullName}
          className="resume-name minimal-name"
          placeholder="Your Name"
          onChange={(value) =>
            updateResumeField(
              "fullName",
              value
            )
          }
        />

        <EditableText
          value={resume.jobTitle}
          className="resume-job-title minimal-title"
          placeholder="Professional Title"
          onChange={(value) =>
            updateResumeField(
              "jobTitle",
              value
            )
          }
        />

        <ContactLine resume={resume} />
      </header>

      <div className="minimal-rule" />

      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          resume={resume}
          updateResumeField={
            updateResumeField
          }
        />
      ))}
    </div>
  );
}

/* =========================================================
   SIDEBAR RESUME
   ========================================================= */

function SidebarResume({
  resume,
  sections,
  updateResumeField,
}) {
  const mainSections = sections.filter(
    (section) =>
      !["skills", "certifications"].includes(
        section.id
      )
  );

  const sideSections = sections.filter(
    (section) =>
      ["skills", "certifications"].includes(
        section.id
      )
  );

  return (
    <div className="resume-sidebar-layout">
      <aside className="resume-sidebar">
        <div className="sidebar-name-area">
          <EditableText
            value={resume.fullName}
            className="resume-name sidebar-name"
            placeholder="Your Name"
            onChange={(value) =>
              updateResumeField(
                "fullName",
                value
              )
            }
          />

          <EditableText
            value={resume.jobTitle}
            className="resume-job-title sidebar-title"
            placeholder="Professional Title"
            onChange={(value) =>
              updateResumeField(
                "jobTitle",
                value
              )
            }
          />
        </div>

        <div className="sidebar-contact">
          <ContactList resume={resume} />
        </div>

        {sideSections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            resume={resume}
            updateResumeField={
              updateResumeField
            }
          />
        ))}
      </aside>

      <main className="resume-sidebar-main">
        {mainSections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            resume={resume}
            updateResumeField={
              updateResumeField
            }
          />
        ))}
      </main>
    </div>
  );
}

/* =========================================================
   CREATIVE PHOTO RESUME
   ========================================================= */

function CreativeResume({
  resume,
  sections,
  updateResumeField,
}) {
  return (
    <div className="resume-layout-content creative-layout">
      <header className="creative-header">
        <div className="creative-photo">
          {resume.profilePhoto ? (
            <img
              src={resume.profilePhoto}
              alt="Profile"
            />
          ) : (
            <span>👤</span>
          )}
        </div>

        <div className="creative-header-info">
          <EditableText
            value={resume.fullName}
            className="resume-name creative-name"
            placeholder="Your Name"
            onChange={(value) =>
              updateResumeField(
                "fullName",
                value
              )
            }
          />

          <EditableText
            value={resume.jobTitle}
            className="resume-job-title"
            placeholder="Professional Title"
            onChange={(value) =>
              updateResumeField(
                "jobTitle",
                value
              )
            }
          />

          <ContactLine resume={resume} />
        </div>
      </header>

      <div className="creative-body">
        <div className="creative-left">
          {sections
            .filter(
              (section) =>
                section.id === "skills" ||
                section.id ===
                  "certifications"
            )
            .map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                resume={resume}
                updateResumeField={
                  updateResumeField
                }
              />
            ))}
        </div>

        <div className="creative-right">
          {sections
            .filter(
              (section) =>
                section.id !== "skills" &&
                section.id !==
                  "certifications"
            )
            .map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                resume={resume}
                updateResumeField={
                  updateResumeField
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CORPORATE RESUME
   ========================================================= */

function CorporateResume({
  resume,
  sections,
  updateResumeField,
}) {
  return (
    <div className="resume-corporate-layout">
      <aside className="corporate-sidebar">
        <div className="corporate-photo">
          {resume.profilePhoto ? (
            <img
              src={resume.profilePhoto}
              alt="Profile"
            />
          ) : (
            <span>👤</span>
          )}
        </div>

        <EditableText
          value={resume.fullName}
          className="resume-name corporate-name"
          placeholder="Your Name"
          onChange={(value) =>
            updateResumeField(
              "fullName",
              value
            )
          }
        />

        <EditableText
          value={resume.jobTitle}
          className="resume-job-title corporate-title"
          placeholder="Professional Title"
          onChange={(value) =>
            updateResumeField(
              "jobTitle",
              value
            )
          }
        />

        <ContactList resume={resume} />

        {sections
          .filter(
            (section) =>
              section.id === "skills"
          )
          .map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              resume={resume}
              updateResumeField={
                updateResumeField
              }
            />
          ))}
      </aside>

      <main className="corporate-main">
        {sections
          .filter(
            (section) =>
              section.id !== "skills"
          )
          .map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              resume={resume}
              updateResumeField={
                updateResumeField
              }
            />
          ))}
      </main>
    </div>
  );
}

/* =========================================================
   TECH RESUME
   ========================================================= */

function TechResume({
  resume,
  sections,
  updateResumeField,
}) {
  return (
    <div className="resume-layout-content tech-layout">
      <header className="tech-header">
        <div className="tech-symbol">
          &lt;/&gt;
        </div>

        <div>
          <EditableText
            value={resume.fullName}
            className="resume-name tech-name"
            placeholder="Your Name"
            onChange={(value) =>
              updateResumeField(
                "fullName",
                value
              )
            }
          />

          <EditableText
            value={resume.jobTitle}
            className="resume-job-title"
            placeholder="Software Engineer"
            onChange={(value) =>
              updateResumeField(
                "jobTitle",
                value
              )
            }
          />
        </div>
      </header>

      <ContactLine resume={resume} />

      <div className="tech-divider">
        <span># career_profile</span>
      </div>

      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          resume={resume}
          updateResumeField={
            updateResumeField
          }
        />
      ))}
    </div>
  );
}

/* =========================================================
   FRESHER RESUME
   ========================================================= */

function FresherResume({
  resume,
  sections,
  updateResumeField,
}) {
  return (
    <div className="resume-layout-content fresher-layout">
      <header className="fresher-header">
        <div>
          <EditableText
            value={resume.fullName}
            className="resume-name fresher-name"
            placeholder="Your Name"
            onChange={(value) =>
              updateResumeField(
                "fullName",
                value
              )
            }
          />

          <EditableText
            value={resume.jobTitle}
            className="resume-job-title"
            placeholder="Aspiring Software Engineer"
            onChange={(value) =>
              updateResumeField(
                "jobTitle",
                value
              )
            }
          />

          <ContactLine resume={resume} />
        </div>

        <div className="fresher-symbol">
          ✦
        </div>
      </header>

      <div className="fresher-line" />

      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          resume={resume}
          updateResumeField={
            updateResumeField
          }
        />
      ))}
    </div>
  );
}

/* =========================================================
   ACADEMIC RESUME
   ========================================================= */

function AcademicResume({
  resume,
  sections,
  updateResumeField,
}) {
  return (
    <div className="resume-layout-content academic-layout">
      <header className="academic-header">
        <EditableText
          value={resume.fullName}
          className="resume-name academic-name"
          placeholder="Your Name"
          onChange={(value) =>
            updateResumeField(
              "fullName",
              value
            )
          }
        />

        <EditableText
          value={resume.jobTitle}
          className="resume-job-title"
          placeholder="Academic / Research Profile"
          onChange={(value) =>
            updateResumeField(
              "jobTitle",
              value
            )
          }
        />

        <ContactLine resume={resume} />
      </header>

      <div className="academic-rule" />

      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          resume={resume}
          updateResumeField={
            updateResumeField
          }
        />
      ))}
    </div>
  );
}

/* =========================================================
   ELEGANT PHOTO RESUME
   ========================================================= */

function ElegantResume({
  resume,
  sections,
  updateResumeField,
}) {
  return (
    <div className="resume-layout-content elegant-layout">
      <header className="elegant-header">
        <div className="elegant-photo">
          {resume.profilePhoto ? (
            <img
              src={resume.profilePhoto}
              alt="Profile"
            />
          ) : (
            <span>👤</span>
          )}
        </div>

        <EditableText
          value={resume.fullName}
          className="resume-name elegant-name"
          placeholder="Your Name"
          onChange={(value) =>
            updateResumeField(
              "fullName",
              value
            )
          }
        />

        <EditableText
          value={resume.jobTitle}
          className="resume-job-title"
          placeholder="Professional Title"
          onChange={(value) =>
            updateResumeField(
              "jobTitle",
              value
            )
          }
        />

        <ContactLine resume={resume} />

        <div className="elegant-rule" />
      </header>

      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          resume={resume}
          updateResumeField={
            updateResumeField
          }
        />
      ))}
    </div>
  );
}

/* =========================================================
   FORM COMPONENTS
   ========================================================= */

function FormHeading({
  title,
  subtitle,
  action,
}) {
  return (
    <div className="cb-form-heading">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {action && (
        <div className="cb-heading-action">
          {action}
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  required = false,
  value,
  placeholder,
  onChange,
  type = "text",
  disabled = false,
}) {
  return (
    <div className="cb-field">
      <label className="cb-field-label">
        {label}

        {required && (
          <span className="required">*</span>
        )}
      </label>

      <input
        className="cb-input"
        type={type}
        value={value || ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div className="cb-empty-state">
      <div className="cb-empty-icon">
        {icon}
      </div>

      <strong>{title}</strong>

      <p>{text}</p>
    </div>
  );
}