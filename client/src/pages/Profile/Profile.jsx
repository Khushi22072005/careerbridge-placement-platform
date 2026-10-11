
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API = "http://localhost:5000/api/profile";

const EMPTY_PROFILE = {
  phone: "",
  college: "",
  degree: "",
  branch: "",
  graduation_year: "",
  current_year: "",
  cgpa: "",
  skills: [],
  skill_proficiency: {},
  soft_skills: [],
  career_goal: "",
  projects: [],
  certifications: [],
  achievements: [],
};

const CAREER_GOALS = [
  "Software Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Data Scientist",
  "AI/ML Engineer",
  "Cybersecurity Analyst",
  "Cloud Engineer",
  "UI/UX Designer",
  "Mobile App Developer",
  "Other",
];

const normalizeProfile = (profile = {}) => ({
  ...EMPTY_PROFILE,
  ...profile,
  skills: Array.isArray(profile.skills) ? profile.skills : [],
  soft_skills: Array.isArray(profile.soft_skills)
    ? profile.soft_skills
    : [],
  projects: Array.isArray(profile.projects) ? profile.projects : [],
  certifications: Array.isArray(profile.certifications)
    ? profile.certifications
    : [],
  achievements: Array.isArray(profile.achievements)
    ? profile.achievements
    : [],
  skill_proficiency: profile.skill_proficiency || {},
});

const hasValue = (value) =>
  value !== "" &&
  value !== null &&
  value !== undefined &&
  String(value).trim() !== "";

const Profile = () => {
  const navigate = useNavigate();

  const email =
    localStorage.getItem("userEmail") ||
    localStorage.getItem("email");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PROFILE);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [skillInput, setSkillInput] = useState("");
  const [softSkillInput, setSoftSkillInput] = useState("");

  const [project, setProject] = useState({
    title: "",
    description: "",
    technologies: "",
    link: "",
    role: "",
  });

  const [certificate, setCertificate] = useState({
    name: "",
    issuer: "",
    date: "",
    link: "",
  });

  const [achievement, setAchievement] = useState({
    title: "",
    organization: "",
    date: "",
    description: "",
  });

  const fetchProfile = useCallback(async () => {
    if (!email) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load profile."
        );
      }

      setUser(data.user || null);
      setFormData(normalizeProfile(data.profile || {}));
    } catch (err) {
      setError(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, [email, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  const addTag = (field, value, setter) => {
    const tag = value.trim();

    if (!tag) return;

    setFormData((prev) => {
      const current = prev[field] || [];

      if (
        current.some(
          (item) => item.toLowerCase() === tag.toLowerCase()
        )
      ) {
        return prev;
      }

      return {
        ...prev,
        [field]: [...current, tag],
      };
    });

    setter("");
    setMessage("");
  };

  const removeTag = (field, tag) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== tag),
    }));
  };

  const addRecord = (field, item, setter, emptyItem) => {
    if (!item.title?.trim() && !item.name?.trim()) {
      setError("Please enter a title or name first.");
      return;
    }

    const record = {
      ...item,
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
    };

    if (item.technologies !== undefined) {
      record.title = item.title.trim();
      record.description = item.description.trim();
      record.role = item.role.trim();
      record.link = item.link.trim();
      record.technologies = item.technologies
        .split(",")
        .map((technology) => technology.trim())
        .filter(Boolean);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], record],
    }));

    setter(emptyItem);
    setError("");
    setMessage("");
  };

  const removeRecord = (field, id) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item.id !== id),
    }));
  };

  // Profile completion is retained.
  // The separate placement-readiness checklist is removed.
  const completionChecks = [
    Boolean(formData.phone.trim()),
    Boolean(formData.college.trim()),
    Boolean(formData.degree),
    Boolean(formData.branch.trim()),
    Boolean(formData.graduation_year),
    Boolean(formData.current_year),
    hasValue(formData.cgpa),
    formData.skills.length > 0,
    formData.soft_skills.length > 0,
    Boolean(formData.career_goal),
    formData.projects.length > 0,
    formData.certifications.length > 0,
    formData.achievements.length > 0,
  ];

  const completion = Math.round(
    (completionChecks.filter(Boolean).length /
      completionChecks.length) *
      100
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      setError("Please log in again.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        ...formData,
        graduation_year: formData.graduation_year
          ? Number(formData.graduation_year)
          : null,
        cgpa:
          formData.cgpa === ""
            ? null
            : Number(formData.cgpa),
      };

      const response = await fetch(
        `${API}/${encodeURIComponent(email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save profile."
        );
      }

      setMessage(
        data.message || "Profile saved successfully."
      );

      await fetchProfile();
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner" />
        <p>Loading your CareerBridge profile...</p>
      </div>
    );
  }

  const name = user?.fullname || user?.name || "Student";

  return (
    <main className="profile-page">
      <header className="profile-header">
        <div>
          
          <h1>My Profile</h1>
         
        </div>

        <button
          type="button"
          className="back-dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {message && (
        <div className="profile-message success">
          <span>{message}</span>
          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="profile-message error">
          <span>{error}</span>
          <button
            type="button"
            aria-label="Dismiss error message"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      <section className="profile-hero">
        <div className="profile-identity">
          <div className="profile-avatar">
            {name.trim().charAt(0).toUpperCase()}
          </div>

          <div className="profile-identity-text">
            <span className="profile-summary-label">
              STUDENT PROFILE
            </span>

            <h2>{name}</h2>
            <p>{user?.email || email}</p>

            <div className="profile-summary-tags">
              <span>{formData.degree || "Degree not added"}</span>
              <span>{formData.branch || "Branch not added"}</span>
            </div>
          </div>
        </div>

        <div className="hero-completion">
          <div
            className="completion-circle"
            style={{
              "--completion": `${completion * 3.6}deg`,
            }}
          >
            <div className="completion-circle-inner">
              <strong>{completion}%</strong>
              <span>Complete</span>
            </div>
          </div>

          <p>Profile completion</p>
        </div>
      </section>

      <section className="profile-overview-grid">
        <article className="overview-card">
         
          <div>
            <strong>{formData.skills.length}</strong>
            <span>Technical skills</span>
          </div>
        </article>

        <article className="overview-card">
          
          <div>
            <strong>{formData.projects.length}</strong>
            <span>Projects</span>
          </div>
        </article>

        <article className="overview-card">
         
          <div>
            <strong>{formData.certifications.length}</strong>
            <span>Certifications</span>
          </div>
        </article>
      </section>

      <form className="profile-form" onSubmit={handleSubmit}>
        {/* PERSONAL INFORMATION */}
        <section className="profile-card">
          <div className="section-heading">
            
            <div>
              <h2>Personal Information</h2>
              <p>Your contact details.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input value={name} disabled />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                value={user?.email || email || ""}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </section>

        {/* EDUCATION */}
        <section className="profile-card">
          <div className="section-heading">
           
            <div>
              <h2>Education</h2>
              <p>Add your academic background.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>College / University</label>
              <input
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="Enter college name"
              />
            </div>

            <div className="form-group">
              <label>Degree</label>
              <select
                name="degree"
                value={formData.degree}
                onChange={handleChange}
              >
                <option value="">Select degree</option>
                {[
                  "B.Tech",
                  "B.E.",
                  "BCA",
                  "B.Sc",
                  "M.Tech",
                  "MCA",
                  "M.Sc",
                  "Other",
                ].map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Branch / Specialization</label>
              <input
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="e.g. Information Technology"
              />
            </div>

            <div className="form-group">
              <label>Current Year / Semester</label>
              <input
                name="current_year"
                value={formData.current_year}
                onChange={handleChange}
                placeholder="e.g. Final Year / Semester 7"
              />
            </div>

            <div className="form-group">
              <label>Graduation Year</label>
              <select
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
              >
                <option value="">Select year</option>
                {Array.from(
                  { length: 10 },
                  (_, i) => new Date().getFullYear() + i - 3
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>CGPA / Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="Enter CGPA or percentage"
              />
            </div>
          </div>
        </section>

        {/* TECHNICAL SKILLS */}
        <section className="profile-card">
          <div className="section-heading">
            
            <div>
              <h2>Technical Skills</h2>
              <p>Add skills and select your proficiency.</p>
            </div>
          </div>

          <div className="tag-input-wrapper">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag("skills", skillInput, setSkillInput);
                }
              }}
              placeholder="Java, React, SQL..."
            />

            <button
              type="button"
              onClick={() => addTag("skills", skillInput, setSkillInput)}
            >
              + Add
            </button>
          </div>

          <div className="skill-list">
            {formData.skills.map((skill) => (
              <div className="skill-item" key={skill}>
                <div className="item-title-row">
                  <strong>{skill}</strong>

                  <button
                    type="button"
                    className="remove-item"
                    aria-label={`Remove ${skill}`}
                    onClick={() => {
                      removeTag("skills", skill);

                      setFormData((prev) => {
                        const levels = {
                          ...prev.skill_proficiency,
                        };
                        delete levels[skill];

                        return {
                          ...prev,
                          skill_proficiency: levels,
                        };
                      });
                    }}
                  >
                    ×
                  </button>
                </div>

                <label>Proficiency</label>

                <select
                  value={
                    formData.skill_proficiency[skill] || "Beginner"
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      skill_proficiency: {
                        ...prev.skill_proficiency,
                        [skill]: e.target.value,
                      },
                    }))
                  }
                >
                  {["Beginner", "Intermediate", "Advanced"].map(
                    (level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    )
                  )}
                </select>
              </div>
            ))}

            {!formData.skills.length && (
              <p className="empty-state">
                No technical skills added yet.
              </p>
            )}
          </div>
        </section>

        {/* SOFT SKILLS */}
        <section className="profile-card">
          <div className="section-heading">
            
            <div>
              <h2>Soft Skills</h2>
              <p>Communication, teamwork and other professional skills.</p>
            </div>
          </div>

          <div className="tag-input-wrapper">
            <input
              value={softSkillInput}
              onChange={(e) => setSoftSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(
                    "soft_skills",
                    softSkillInput,
                    setSoftSkillInput
                  );
                }
              }}
              placeholder="Communication, Teamwork..."
            />

            <button
              type="button"
              onClick={() =>
                addTag("soft_skills", softSkillInput, setSoftSkillInput)
              }
            >
              + Add
            </button>
          </div>

          <div className="tag-container">
            {formData.soft_skills.map((skill) => (
              <span className="profile-tag" key={skill}>
                {skill}

                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() => removeTag("soft_skills", skill)}
                >
                  ×
                </button>
              </span>
            ))}

            {!formData.soft_skills.length && (
              <p className="empty-state">No soft skills added yet.</p>
            )}
          </div>
        </section>

        {/* CAREER GOAL */}
        <section className="profile-card">
          <div className="section-heading">
            
            <div>
              <h2>Career Goal</h2>
              <p>Select your preferred career path.</p>
            </div>
          </div>

          <div className="form-group">
            <label>Primary Career Goal</label>
            <select
              name="career_goal"
              value={formData.career_goal}
              onChange={handleChange}
            >
              <option value="">Select career goal</option>
              {CAREER_GOALS.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="profile-card">
          <div className="section-heading">
            
            <div>
              <h2>Projects & Portfolio</h2>
              <p>Showcase your practical work.</p>
            </div>
          </div>

          <div className="embedded-form">
            <h3>Add a Project</h3>

            <div className="form-grid">
              {[
                ["title", "Project Title", "e.g. CareerBridge"],
                ["role", "Your Role", "e.g. Frontend Developer"],
                [
                  "technologies",
                  "Technologies (comma-separated)",
                  "React, Node.js",
                ],
                ["link", "GitHub / Project URL", "https://github.com/..."],
              ].map(([key, label, placeholder]) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input
                    value={project[key]}
                    placeholder={placeholder}
                    onChange={(e) =>
                      setProject((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={project.description}
                  onChange={(e) =>
                    setProject((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe what your project does..."
                />
              </div>
            </div>

            <button
              type="button"
              className="secondary-action-btn"
              onClick={() =>
                addRecord("projects", project, setProject, {
                  title: "",
                  description: "",
                  technologies: "",
                  link: "",
                  role: "",
                })
              }
            >
              + Add Project
            </button>
          </div>

          {formData.projects.map((item) => (
            <article className="record-item" key={item.id || item.title}>
              <div className="record-content">
                <div className="item-title-row">
                  <h3>{item.title}</h3>
                  <button
                    type="button"
                    className="remove-item"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => removeRecord("projects", item.id)}
                  >
                    ×
                  </button>
                </div>

                {item.role && <p>{item.role}</p>}
                {item.description && <p>{item.description}</p>}

                <p>
                  {Array.isArray(item.technologies)
                    ? item.technologies.join(", ")
                    : item.technologies}
                </p>

                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer">
                    View Project ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>

        {/* CERTIFICATIONS */}
        <section className="profile-card">
          <div className="section-heading">
            
            <div>
              <h2>Certifications</h2>
              <p>Record courses and certificates.</p>
            </div>
          </div>

          <div className="embedded-form">
            <h3>Add a Certification</h3>

            <div className="form-grid">
              {[
                ["name", "Certification Name", "e.g. Cloud Fundamentals"],
                ["issuer", "Issuing Organization", "e.g. Microsoft"],
                ["date", "Date Received", ""],
                ["link", "Certificate URL", "https://..."],
              ].map(([key, label, placeholder]) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input
                    type={
                      key === "date"
                        ? "date"
                        : key === "link"
                          ? "url"
                          : "text"
                    }
                    value={certificate[key]}
                    placeholder={placeholder}
                    onChange={(e) =>
                      setCertificate((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              className="secondary-action-btn"
              onClick={() =>
                addRecord("certifications", certificate, setCertificate, {
                  name: "",
                  issuer: "",
                  date: "",
                  link: "",
                })
              }
            >
              + Add Certification
            </button>
          </div>

          {formData.certifications.map((item) => (
            <article className="record-item" key={item.id || item.name}>
              <div className="record-content">
                <div className="item-title-row">
                  <h3>{item.name}</h3>
                  <button
                    type="button"
                    className="remove-item"
                    aria-label={`Remove ${item.name}`}
                    onClick={() =>
                      removeRecord("certifications", item.id)
                    }
                  >
                    ×
                  </button>
                </div>

                <p>
                  {item.issuer} {item.date && `· ${item.date}`}
                </p>

                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer">
                    View Certificate ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>

        {/* ACHIEVEMENTS */}
        <section className="profile-card">
          <div className="section-heading">
            
            <div>
              <h2>Achievements & Activities</h2>
              <p>Record hackathons, research and awards.</p>
            </div>
          </div>

          <div className="embedded-form">
            <h3>Add an Achievement</h3>

            <div className="form-grid">
              {[
                ["title", "Achievement Title", "e.g. Hackathon"],
                ["organization", "Organization / Event", "Event name"],
                ["date", "Date", ""],
              ].map(([key, label, placeholder]) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input
                    type={key === "date" ? "date" : "text"}
                    value={achievement[key]}
                    placeholder={placeholder}
                    onChange={(e) =>
                      setAchievement((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  rows="2"
                  value={achievement.description}
                  onChange={(e) =>
                    setAchievement((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your achievement..."
                />
              </div>
            </div>

            <button
              type="button"
              className="secondary-action-btn"
              onClick={() =>
                addRecord("achievements", achievement, setAchievement, {
                  title: "",
                  organization: "",
                  date: "",
                  description: "",
                })
              }
            >
              + Add Achievement
            </button>
          </div>

          {formData.achievements.map((item) => (
            <article className="record-item" key={item.id || item.title}>
              <div className="record-content">
                <div className="item-title-row">
                  <h3>{item.title}</h3>
                  <button
                    type="button"
                    className="remove-item"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => removeRecord("achievements", item.id)}
                  >
                    ×
                  </button>
                </div>

                <p>
                  {item.organization} {item.date && `· ${item.date}`}
                </p>
                {item.description && <p>{item.description}</p>}
              </div>
            </article>
          ))}
        </section>

        {/* SAVE PROFILE — NO CHECKLIST SCORE */}
        <div className="profile-save-bar">
          <div>
            <strong>Keep your profile updated</strong>
            <p>Profile completion: {completion}%</p>
          </div>

          <button
            type="submit"
            className="save-profile-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile →"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default Profile;
