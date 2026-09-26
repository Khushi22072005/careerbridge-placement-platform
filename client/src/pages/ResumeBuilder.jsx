import React, { useMemo, useState } from "react";
import "./ResumeBuilder.css";

const STEPS = [
  { id: "personal", label: "Personal Details", short: "Personal" },
  { id: "summary", label: "Professional Summary", short: "Summary" },
  { id: "experience", label: "Work Experience", short: "Experience" },
  { id: "education", label: "Education", short: "Education" },
  { id: "skills", label: "Skills", short: "Skills" },
  { id: "projects", label: "Projects", short: "Projects" },
  { id: "certifications", label: "Certifications", short: "Certifications" },
];

const TEMPLATE_DATA = [
  { id: "puffin", name: "Puffin", desc: "Clean two-column layout with strong section hierarchy.", type: "split" },
  { id: "classic", name: "Classic", desc: "Clean single-column layout with clear hierarchy and balanced spacing.", type: "minimal" },
  { id: "stonefly", name: "Stonefly", desc: "Structured and compact layout for ATS-friendly resumes.", type: "table" },
  { id: "minimal", name: "Minimal", desc: "Simple single-column layout with generous whitespace.", type: "minimal" },
  { id: "executive", name: "Executive", desc: "Polished professional layout with a strong header.", type: "executive" },
  { id: "modern", name: "Modern", desc: "Contemporary layout with subtle accent blocks.", type: "modern" },
];

const COLORS = ["#6558b5", "#2563eb", "#0f766e", "#b45309", "#be185d", "#111827"];

const initialData = {
  firstName: "Sapna",
  lastName: "Rumale",
  jobTitle: "Data Analyst",
  email: "sapnarumalee@gmail.com",
  phone: "09321817418",
  city: "Mumbai",
  country: "India",
  linkedin: "linkedin.com/in/yourname",
  github: "github.com/yourname",
  website: "",
  summary:
    "Detail-oriented professional with a strong interest in data analysis, business problem solving and technology. Experienced in working with data, creating visualizations and communicating insights clearly.",
  experience: [
    {
      title: "Business Development Intern",
      company: "Infinity Exports and Imports",
      location: "Mumbai, India",
      start: "Aug 2022",
      end: "Nov 2022",
      bullets: [
        "Generated 150+ qualified leads using LinkedIn and trade directories.",
        "Maintained structured lead tracking sheets and weekly reports using Excel.",
      ],
    },
  ],
  education: [
    {
      degree: "B.E. Information Technology",
      school: "Usha Mittal Institute of Technology, SNDT Women's University",
      location: "Mumbai, India",
      year: "2023 – 2027",
      detail: "CGPA: 7.87 / 10",
    },
  ],
  skills: ["Python", "SQL", "Excel", "Power BI", "Tableau", "Data Analysis"],
  projects: [
    {
      name: "CareerBridge",
      tech: "React · JavaScript · CSS",
      link: "",
      description: "Career platform with resume building, career assessment and job-readiness features.",
    },
  ],
  certifications: [
    { name: "IBM Data Analysis with Python", issuer: "IBM", year: "2025" },
    { name: "IBM Data Analyst Capstone", issuer: "IBM", year: "2025" },
  ],
};

function cloneData() {
  return JSON.parse(JSON.stringify(initialData));
}

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState("editor");
  const [step, setStep] = useState(0);
  const [data, setData] = useState(cloneData);
  const [template, setTemplate] = useState("puffin");
  const [accent, setAccent] = useState("#6558b5");
  const [resumeName, setResumeName] = useState("Sapna_Rumale_Resume");
  const [atsOnly, setAtsOnly] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [saved, setSaved] = useState(false);

  const progress = Math.max(8, Math.round(((step + 1) / STEPS.length) * 100));

  const update = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateArrayItem = (section, index, key, value) => {
    setData((prev) => {
      const next = [...prev[section]];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, [section]: next };
    });
    setSaved(false);
  };

  const updateBullet = (index, bulletIndex, value) => {
    setData((prev) => {
      const next = [...prev.experience];
      const bullets = [...next[index].bullets];
      bullets[bulletIndex] = value;
      next[index] = { ...next[index], bullets };
      return { ...prev, experience: next };
    });
    setSaved(false);
  };

  const addItem = (section, item) => {
    setData((prev) => ({ ...prev, [section]: [...prev[section], item] }));
    setSaved(false);
  };

  const removeItem = (section, index) => {
    setData((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
    setSaved(false);
  };

  const addSkill = () => {
    addItem("skills", "New Skill");
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const saveResume = () => {
    localStorage.setItem(
      "careerbridge_resume_builder",
      JSON.stringify({ data, template, accent, resumeName, atsOnly, photo })
    );
    setSaved(true);
  };

  const downloadPdf = () => {
    const resume = document.querySelector(".resume-paper");
    if (!resume) return;

    // Print only the resume, not the CareerBridge dashboard/sidebar/editor.
    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printWindow) {
      window.alert("Please allow pop-ups for CareerBridge to download the resume PDF.");
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join("\\n");

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${resumeName || "Resume"}</title>
          ${styles}
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm;
              min-height: 297mm;
              background: #fff !important;
            }
            body {
              overflow: visible !important;
            }
            .resume-paper {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 !important;
              box-sizing: border-box !important;
              box-shadow: none !important;
              background: #fff !important;
            }
            [contenteditable="true"] {
              outline: none !important;
              box-shadow: none !important;
              background: transparent !important;
            }
            .page-count,
            .preview-toolbar,
            .rb-topbar,
            .rb-left,
            .rb-preview-area {
              display: none !important;
            }
          </style>
        </head>
        <body>
          ${resume.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    const startPrint = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };

    // Give the cloned stylesheet/images a moment to load before printing.
    setTimeout(startPrint, 350);
  };

  const setFromContent = (key, value) => update(key, value.replace(/\n/g, " ").trim());

  const sectionTitle = (label, amount) => (
    <div className="editor-section-heading">
      <h2>{label}</h2>
      {amount && <span className="boost">+{amount}%</span>}
    </div>
  );

  const currentTitle = STEPS[step]?.label || "Personal Details";

  return (
    <div className="rb-app" style={{ "--accent": accent }}>
      <header className="rb-topbar">
        <div className="strength">
          <div className="strength-badge">{progress}%</div>
          <div className="strength-copy">
            <strong>Resume strength</strong>
            <div className="strength-line"><span style={{ width: `${progress}%` }} /></div>
          </div>
        </div>

        <div className="top-tabs">
          <button className={activeTab === "editor" ? "active" : ""} onClick={() => setActiveTab("editor")}>Editor</button>
          <button className={activeTab === "customize" ? "active" : ""} onClick={() => setActiveTab("customize")}>Customize</button>
        </div>

        <div className="document-actions">
          <div className="document-name">
            <input value={resumeName} onChange={(e) => setResumeName(e.target.value)} />
            <span>✎</span>
          </div>
          <button className="download-btn" onClick={downloadPdf}>⇩&nbsp; Download PDF</button>
          <div className="avatar-circle">{data.firstName?.[0] || "S"}</div>
        </div>
      </header>

      <main className="rb-workspace">
        <aside className="rb-left">
          {activeTab === "editor" ? (
            <>
              <div className="editor-scroll">
                {step === 0 && (
                  <section className="editor-card">
                    {sectionTitle("Personal Details", 12)}
                    <p className="helper">Adding your phone number and email increases positive recruiter responses by 64%.</p>

                    <div className="profile-row">
                      <div className="profile-preview">
                        {photo ? <img src={photo} alt="Profile" /> : <span>{(data.firstName?.[0] || "S") + (data.lastName?.[0] || "R")}</span>}
                      </div>
                      <div className="photo-actions">
                        <button className="ai-photo">✧ Try AI Photo Studio</button>
                        <label className="photo-button">▣&nbsp; Add Photo<input type="file" accept="image/*" onChange={handlePhoto} /></label>
                      </div>
                    </div>

                    <Field label="Current Job Title" boost="8%">
                      <input value={data.jobTitle} placeholder="add your job title" onChange={(e) => update("jobTitle", e.target.value)} />
                    </Field>

                    <div className="two-col">
                      <Field label="First Name">
                        <input value={data.firstName} onChange={(e) => update("firstName", e.target.value)} />
                      </Field>
                      <Field label="Last Name">
                        <input value={data.lastName} onChange={(e) => update("lastName", e.target.value)} />
                      </Field>
                    </div>

                    <div className="two-col">
                      <Field label="Email Address">
                        <input value={data.email} onChange={(e) => update("email", e.target.value)} />
                      </Field>
                      <Field label="Phone Number" boost="4%">
                        <input value={data.phone} placeholder="add phone number" onChange={(e) => update("phone", e.target.value)} />
                      </Field>
                    </div>

                    <ProTip text="Make sure to use a professional email id that you regularly check." />

                    <div className="two-col">
                      <Field label="City">
                        <input value={data.city} onChange={(e) => update("city", e.target.value)} />
                      </Field>
                      <Field label="Country">
                        <input value={data.country} onChange={(e) => update("country", e.target.value)} />
                      </Field>
                    </div>

                    <div className="two-col">
                      <Field label="LinkedIn">
                        <input value={data.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
                      </Field>
                      <Field label="GitHub">
                        <input value={data.github} onChange={(e) => update("github", e.target.value)} />
                      </Field>
                    </div>
                  </section>
                )}

                {step === 1 && (
                  <section className="editor-card">
                    {sectionTitle("Professional Summary", 15)}
                    <p className="helper">Write 2 to 5 short lines that best describe your profile. Do summarize your career highlights, skills, and experiences that make you stand out.</p>
                    <RichEditor value={data.summary} onChange={(v) => update("summary", v)} />
                    <ProTip text="Highlight why you're a great fit for the job and what sets you apart. This section should spark interest to get shortlisted." />
                  </section>
                )}

                {step === 2 && (
                  <section className="editor-card builder-step">
                    {sectionTitle("Work Experience", 15)}
                    <p className="helper">Add your internships, jobs, freelance work, or other relevant professional experience.</p>

                    {data.experience.map((item, i) => (
                      <div className="builder-entry-card" key={i}>
                        <div className="builder-entry-head">
                          <div>
                            <h3 contentEditable suppressContentEditableWarning
                              onBlur={(e) => updateArrayItem("experience", i, "title", e.currentTarget.innerText)}>
                              {item.title || "Job Title"}
                            </h3>
                            <div className="entry-subtitle">{item.company || "Company"}</div>
                            <div className="entry-period">{item.start || "Start date"} – {item.end || "Present"}</div>
                          </div>
                          <div className="entry-actions">
                            <button title="Duplicate" onClick={() => addItem("experience", { ...item, bullets: [...item.bullets] })}>▣<span>Twin</span></button>
                            <button className="delete-action" title="Delete" onClick={() => removeItem("experience", i)}>▥<span>Delete</span></button>
                          </div>
                        </div>

                        <div className="form-grid-2">
                          <Field label="Job Title">
                            <input value={item.title} onChange={(e) => updateArrayItem("experience", i, "title", e.target.value)} />
                          </Field>
                          <Field label="Company">
                            <input value={item.company} onChange={(e) => updateArrayItem("experience", i, "company", e.target.value)} />
                          </Field>
                        </div>

                        <div className="form-grid-2">
                          <Field label="Location">
                            <input value={item.location} onChange={(e) => updateArrayItem("experience", i, "location", e.target.value)} />
                          </Field>
                          <Field label="Employment Type">
                            <select value={item.type || "Internship"} onChange={(e) => updateArrayItem("experience", i, "type", e.target.value)}>
                              <option>Internship</option><option>Full-time</option><option>Part-time</option><option>Freelance</option>
                            </select>
                          </Field>
                        </div>

                        <div className="date-row">
                          <Field label="Start Date">
                            <input type="month" value={item.startDate || "2026-06"} onChange={(e) => updateArrayItem("experience", i, "startDate", e.target.value)} />
                          </Field>
                          <span className="date-arrow">→</span>
                          <Field label="End Date">
                            <input type="month" disabled={item.currentlyWorking} value={item.endDate || "2026-12"} onChange={(e) => updateArrayItem("experience", i, "endDate", e.target.value)} />
                          </Field>
                          <label className="check-row"><input type="checkbox" checked={!!item.currentlyWorking} onChange={(e) => updateArrayItem("experience", i, "currentlyWorking", e.target.checked)} /> Currently working here</label>
                        </div>

                        <label className="field-label description-label">Responsibilities & achievements</label>
                        <div className="bullet-editor-box">
                          <div className="mini-toolbar"><button type="button">B</button><button type="button"><i>I</i></button><span></span><button type="button">•</button><button type="button">↗</button></div>
                          <textarea value={item.bullets.join("\n")} onChange={(e) => updateArrayItem("experience", i, "bullets", e.target.value.split("\n"))} placeholder="Describe your responsibilities, achievements and impact..." />
                        </div>
                      </div>
                    ))}

                    <button className="add-big-button" onClick={() => addItem("experience", {
                      title: "Job Title", company: "Company", location: "Mumbai, India", type: "Internship", start: "Month Year", end: "Present", startDate: "2026-06", endDate: "2026-12", currentlyWorking: true,
                      bullets: ["Describe your responsibilities, achievements and impact."]
                    })}>＋ Add Work Experience</button>
                  </section>
                )}

                {step === 3 && (
                  <section className="editor-card builder-step">
                    {sectionTitle("Education", 10)}
                    <p className="helper">Add your educational background, including degrees, certifications, and relevant coursework.</p>

                    <div className="toggle-line">
                      <strong>Hide Marks in Resume</strong>
                      <label className="switch"><input type="checkbox" /><span></span></label>
                    </div>

                    {data.education.map((item, i) => (
                      <div className="builder-entry-card education-card" key={i}>
                        <div className="builder-entry-head">
                          <div>
                            <h3 contentEditable suppressContentEditableWarning
                              onBlur={(e) => updateArrayItem("education", i, "degree", e.currentTarget.innerText)}>
                              {item.degree || "Degree"}
                            </h3>
                            <div className="entry-subtitle">{item.school || "@university"}</div>
                            <div className="entry-period">From {item.year || "Start Year"}</div>
                          </div>
                          <div className="entry-actions">
                            <button title="Duplicate" onClick={() => addItem("education", { ...item })}>▣<span>Twin</span></button>
                            <button className="delete-action" title="Delete" onClick={() => removeItem("education", i)}>▥<span>Delete</span></button>
                          </div>
                        </div>

                        <div className="form-grid-2">
                          <Field label="School / University">
                            <input value={item.school} onChange={(e) => updateArrayItem("education", i, "school", e.target.value)} />
                          </Field>
                          <Field label="Degree">
                            <input value={item.degree} onChange={(e) => updateArrayItem("education", i, "degree", e.target.value)} />
                          </Field>
                        </div>

                        <Field label="City">
                          <input value={item.location} onChange={(e) => updateArrayItem("education", i, "location", e.target.value)} />
                        </Field>

                        <div className="form-grid-2">
                          <Field label="Marks Type">
                            <select value={item.marksType || "CGPA"} onChange={(e) => updateArrayItem("education", i, "marksType", e.target.value)}>
                              <option>CGPA</option><option>Percentage</option><option>Grade</option><option>None</option>
                            </select>
                          </Field>
                          <Field label="Marks">
                            <input value={item.marks || item.detail || ""} onChange={(e) => { updateArrayItem("education", i, "marks", e.target.value); updateArrayItem("education", i, "detail", e.target.value ? `${item.marksType || "CGPA"}: ${e.target.value}` : ""); }} />
                          </Field>
                        </div>

                        <div className="date-row education-dates">
                          <Field label="Start Date"><input value={item.startDate || "May 2023"} onChange={(e) => updateArrayItem("education", i, "startDate", e.target.value)} /></Field>
                          <span className="date-arrow">→</span>
                          <Field label="End Date"><input disabled={item.currentlyHere} value={item.endDate || "Jun 2027"} onChange={(e) => updateArrayItem("education", i, "endDate", e.target.value)} /></Field>
                          <label className="check-row"><input type="checkbox" checked={item.currentlyHere !== false} onChange={(e) => updateArrayItem("education", i, "currentlyHere", e.target.checked)} /> Currently here</label>
                        </div>

                        <label className="field-label description-label">Description</label>
                        <RichTextEditor
                          value={item.description || ""}
                          onChange={(v) => updateArrayItem("education", i, "description", v)}
                          placeholder="Add any relevant details about your education..."
                          className="education-description-editor"
                        />
                      </div>
                    ))}

                    <button className="add-big-button" onClick={() => addItem("education", { degree: "Degree", school: "School / University", location: "City, Country", year: "2023 – 2027", detail: "", marksType: "CGPA", marks: "", startDate: "May 2023", endDate: "Jun 2027", currentlyHere: true, description: "" })}>＋ Add Education</button>
                  </section>
                )}

                {step === 4 && (
                  <section className="editor-card">
                    {sectionTitle("Skills", 8)}
                    <p className="helper">Add technical, analytical, business, communication, or other job-relevant skills.</p>
                    <div className="skill-editor-grid">
                      {data.skills.map((skill, i) => (
                        <div className="skill-edit" key={i}>
                          <input value={skill} onChange={(e) => {
                            const next = [...data.skills]; next[i] = e.target.value; update("skills", next);
                          }} />
                          <button onClick={() => removeItem("skills", i)}>×</button>
                        </div>
                      ))}
                    </div>
                    <button className="add-entry" onClick={addSkill}>+ Add Skill</button>
                  </section>
                )}

                {step === 5 && (
                  <section className="editor-card">
                    {sectionTitle("Projects", 8)}
                    <p className="helper">Show projects that demonstrate practical skills and measurable outcomes.</p>
                    {data.projects.map((item, i) => (
                      <div className="entry-editor" key={i}>
                        <div className="entry-top"><strong>Project {i + 1}</strong><button onClick={() => removeItem("projects", i)}>Remove</button></div>
                        <Field label="Project Name"><input value={item.name} onChange={(e) => updateArrayItem("projects", i, "name", e.target.value)} /></Field>
                        <div className="two-col">
                          <Field label="Technologies"><input value={item.tech} onChange={(e) => updateArrayItem("projects", i, "tech", e.target.value)} /></Field>
                          <Field label="Project Link"><input value={item.link} placeholder="https://..." onChange={(e) => updateArrayItem("projects", i, "link", e.target.value)} /></Field>
                        </div>
                        <Field label="Description"><textarea value={item.description} onChange={(e) => updateArrayItem("projects", i, "description", e.target.value)} /></Field>
                      </div>
                    ))}
                    <button className="add-entry" onClick={() => addItem("projects", { name: "Project Name", tech: "Python · SQL", link: "", description: "Describe the problem, your contribution and the outcome." })}>+ Add Project</button>
                  </section>
                )}

                {step === 6 && (
                  <section className="editor-card">
                    {sectionTitle("Certifications", 5)}
                    <p className="helper">Add relevant certifications, courses, licenses, or professional training.</p>
                    {data.certifications.map((item, i) => (
                      <div className="entry-editor" key={i}>
                        <div className="entry-top"><strong>Certification {i + 1}</strong><button onClick={() => removeItem("certifications", i)}>Remove</button></div>
                        <Field label="Certification Name"><input value={item.name} onChange={(e) => updateArrayItem("certifications", i, "name", e.target.value)} /></Field>
                        <div className="two-col">
                          <Field label="Issuer"><input value={item.issuer} onChange={(e) => updateArrayItem("certifications", i, "issuer", e.target.value)} /></Field>
                          <Field label="Year"><input value={item.year} onChange={(e) => updateArrayItem("certifications", i, "year", e.target.value)} /></Field>
                        </div>
                      </div>
                    ))}
                    <button className="add-entry" onClick={() => addItem("certifications", { name: "Certification Name", issuer: "Issuer", year: "Year" })}>+ Add Certification</button>
                  </section>
                )}
              </div>

              <div className="step-footer">
                <div className="dots">
                  {STEPS.map((s, i) => <span key={s.id} className={i === step ? "current" : i < step ? "done" : ""} />)}
                </div>
                <div className="step-actions">
                  {step > 0 && <button className="back-btn" onClick={() => setStep(step - 1)}>Back</button>}
                  <button className="next-btn" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}>
                    {step === STEPS.length - 1 ? "Finish" : `Next: ${STEPS[step + 1].label}`}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <CustomizePanel
              template={template}
              setTemplate={setTemplate}
              accent={accent}
              setAccent={setAccent}
              atsOnly={atsOnly}
              setAtsOnly={setAtsOnly}
              onReset={() => { setData(cloneData()); setSaved(false); }}
            />
          )}
        </aside>

        <section className="rb-preview-area">
          <div className="preview-toolbar">
            <div>
              <span className="preview-dot" /> Live Preview
            </div>
            <span>{saved ? "Saved" : currentTitle}</span>
          </div>

          <div className="paper-scroll">
            <ResumePreview
              data={data}
              template={template}
              accent={accent}
              photo={photo}
              onEdit={setFromContent}
              updateArrayItem={updateArrayItem}
              updateBullet={updateBullet}
            />
            <div className="page-count">Page 1 of 1</div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, boost, children }) {
  return (
    <div className="field">
      <label className="field-label">{label} {boost && <span className="boost">{boost}</span>}</label>
      {children}
    </div>
  );
}

function RichTextEditor({ value = "", onChange, placeholder = "Add any relevant details...", className = "" }) {
  const editorRef = React.useRef(null);

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const runCommand = (command, commandValue = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange?.(editorRef.current?.innerHTML || "");
  };

  const handleInput = () => {
    onChange?.(editorRef.current?.innerHTML || "");
  };

  return (
    <div className={`rich-editor ${className}`}>
      <div className="rich-toolbar">
        <button type="button" title="Bold" onMouseDown={(e) => { e.preventDefault(); runCommand("bold"); }}>B</button>
        <button type="button" title="Italic" onMouseDown={(e) => { e.preventDefault(); runCommand("italic"); }}><i>I</i></button>
        <span />
        <button type="button" title="Bulleted list" onMouseDown={(e) => { e.preventDefault(); runCommand("insertUnorderedList"); }}>•</button>
        <button type="button" title="Add link" onMouseDown={(e) => {
          e.preventDefault();
          const url = window.prompt("Enter URL:", "https://");
          if (url) runCommand("createLink", url);
        }}>↗</button>
      </div>
      <div
        ref={editorRef}
        className="rich-content"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        spellCheck={true}
      />
      <div className="rich-bottom"><button type="button">✧ Ask AI</button><span>{(editorRef.current?.innerText || value.replace(/<[^>]*>/g, "")).length}/2000</span></div>
    </div>
  );
}

function RichEditor({ value, onChange }) {
  return <RichTextEditor value={value} onChange={onChange} placeholder="Add your professional summary..." />;
}

function ProTip({ text }) {
  return <div className="pro-tip"><span className="bulb">♧</span><div><strong>PRO TIP</strong><p>{text}</p></div></div>;
}

function CustomizePanel({ template, setTemplate, accent, setAccent, atsOnly, setAtsOnly, onReset }) {
  return (
    <div className="customize-panel">
      <div className="customize-topbar">
        <div>
          <strong>Customize your resume</strong>
          <span>Choose a template and accent color. Your content stays the same.</span>
        </div>
        <label className="ats-toggle"><strong>ATS only</strong><input type="checkbox" checked={atsOnly} onChange={(e) => setAtsOnly(e.target.checked)} /><span /></label>
      </div>

      <div className="customize-section">
        <h2>Choose a template</h2>
        <p>Pick a layout. Your content stays the same.</p>
        <div className="template-grid">
          {TEMPLATE_DATA.map((item) => (
            <button key={item.id} className={`template-card ${template === item.id ? "selected" : ""}`} onClick={() => setTemplate(item.id)}>
              <TemplateThumb type={item.type} accent={accent} />
              <div className="template-card-copy"><strong>{item.name}</strong><span>{item.desc}</span></div>
              <span className="radio">{template === item.id ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="customize-section color-section">
        <h2>Accent color</h2>
        <div className="color-row">
          {COLORS.map(c => <button key={c} className={`color-dot ${accent === c ? "selected" : ""}`} style={{ background: c }} onClick={() => setAccent(c)} />)}
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
        </div>
      </div>

      <button className="reset-btn" onClick={onReset}>Reset resume content</button>
    </div>
  );
}

function TemplateThumb({ type, accent }) {
  return (
    <div className={`template-thumb thumb-${type}`}>
      <div className="thumb-name" style={{ borderColor: accent }}>MAYANK MATHUR</div>
      <div className="thumb-line" />
      <div className="thumb-columns">
        <div><i /><i /><i /><i /><i /></div>
        <div><i /><i /><i /><i /></div>
      </div>
    </div>
  );
}

function Editable({ children, onChange, className = "", as = "div" }) {
  const Tag = as;
  return (
    <Tag
      className={`editable ${className}`}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange?.(e.currentTarget.innerText)}
      spellCheck={false}
    >
      {children}
    </Tag>
  );
}

function ResumePreview({ data, template, accent, photo, onEdit, updateArrayItem, updateBullet }) {
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  const contact = (
    <div className="resume-contact">
      {data.phone && <span>☎ {data.phone}</span>}
      {data.email && <span>✉ {data.email}</span>}
      {(data.city || data.country) && <span>● {data.city}{data.city && data.country ? ", " : ""}{data.country}</span>}
      {data.linkedin && <span>↗ {data.linkedin}</span>}
      {data.github && <span>◉ {data.github}</span>}
    </div>
  );

  const section = (title, content, extra = "") => (
    <section className={`resume-section ${extra}`}>
      <Editable className="resume-section-title" onChange={(v) => console.log("Section title:", v)}>{title}</Editable>
      {content}
    </section>
  );

  const commonSections = (
    <>
      {section("Professional Summary",
        <Editable className="resume-summary" onChange={(v) => onEdit("summary", v)}>{data.summary}</Editable>
      )}

      {section("Experience",
        <div className="resume-entries">
          {data.experience.map((item, i) => (
            <article className="resume-entry" key={i}>
              <div className="entry-heading">
                <Editable className="entry-title" onChange={(v) => updateArrayItem("experience", i, "title", v)}>{item.title}</Editable>
                <Editable className="entry-date" onChange={(v) => {
                  const [start, ...rest] = v.split("–");
                  updateArrayItem("experience", i, "start", start.trim());
                  updateArrayItem("experience", i, "end", rest.join("–").trim());
                }}>{`${item.start} – ${item.end}`}</Editable>
              </div>
              <Editable className="entry-company" onChange={(v) => updateArrayItem("experience", i, "company", v)}>{item.company}</Editable>
              <Editable className="entry-meta" onChange={(v) => updateArrayItem("experience", i, "location", v)}>{item.location}</Editable>
              <ul>{item.bullets.map((b, bi) => <li key={bi}><Editable as="span" onChange={(v) => updateBullet(i, bi, v)}>{b}</Editable></li>)}</ul>
            </article>
          ))}
        </div>
      )}

      {section("Education",
        <div className="resume-entries">
          {data.education.map((item, i) => (
            <article className="resume-entry" key={i}>
              <div className="entry-heading">
                <Editable className="entry-title" onChange={(v) => updateArrayItem("education", i, "degree", v)}>{item.degree}</Editable>
                <Editable className="entry-date" onChange={(v) => updateArrayItem("education", i, "year", v)}>{item.year}</Editable>
              </div>
              <Editable className="entry-company" onChange={(v) => updateArrayItem("education", i, "school", v)}>{item.school}</Editable>
              <Editable className="entry-meta" onChange={(v) => updateArrayItem("education", i, "location", v)}>{item.location}</Editable>
              <Editable className="entry-detail" onChange={(v) => updateArrayItem("education", i, "detail", v)}>{item.detail}</Editable>
            </article>
          ))}
        </div>
      )}

      {section("Skills",
        <div className="resume-skills">
          {data.skills.map((skill, i) => <Editable as="span" key={i} onChange={(v) => {
            const next = [...data.skills]; next[i] = v; onEdit("skills", next);
          }}>{skill}</Editable>)}
        </div>
      )}

      {section("Projects",
        <div className="resume-entries">
          {data.projects.map((item, i) => (
            <article className="resume-entry" key={i}>
              <div className="entry-heading">
                <Editable className="entry-title" onChange={(v) => updateArrayItem("projects", i, "name", v)}>{item.name}</Editable>
                {item.link && <Editable className="entry-link" onChange={(v) => updateArrayItem("projects", i, "link", v)}>{item.link}</Editable>}
              </div>
              <Editable className="entry-tech" onChange={(v) => updateArrayItem("projects", i, "tech", v)}>{item.tech}</Editable>
              <Editable className="entry-detail" onChange={(v) => updateArrayItem("projects", i, "description", v)}>{item.description}</Editable>
            </article>
          ))}
        </div>
      )}

      {section("Certifications",
        <div className="resume-certifications">
          {data.certifications.map((item, i) => (
            <div className="cert-row" key={i}>
              <Editable className="entry-title" onChange={(v) => updateArrayItem("certifications", i, "name", v)}>{item.name}</Editable>
              <Editable className="entry-meta" onChange={(v) => updateArrayItem("certifications", i, "issuer", v)}>{item.issuer}</Editable>
              <Editable className="entry-date" onChange={(v) => updateArrayItem("certifications", i, "year", v)}>{item.year}</Editable>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const templateConfig = TEMPLATE_DATA.find((item) => item.id === template) || TEMPLATE_DATA[0];
  const templateType = templateConfig.type;

  return (
    <div className={`resume-paper template-${template} template-type-${templateType}`} style={{ "--resume-accent": accent }}>
      <header className="resume-header">
        {photo && <img className="resume-photo" src={photo} alt="" />}
        <div className="resume-header-main">
          <Editable as="h1" onChange={(v) => {
            const parts = v.trim().split(/\s+/);
            onEdit("firstName", parts.shift() || "");
            onEdit("lastName", parts.join(" "));
          }}>{fullName || "Your Name"}</Editable>
          <Editable className="resume-job-title" onChange={(v) => onEdit("jobTitle", v)}>{data.jobTitle}</Editable>
          {contact}
        </div>
      </header>

      {template === "puffin" ? (
        <div className="resume-split">
          <div className="resume-main-column">{commonSections}</div>
          <aside className="resume-side-column">
            <Editable className="side-title" onChange={() => {}}>CONTACT</Editable>
            <div className="side-contact">{contact}</div>
            <Editable className="side-title" onChange={() => {}}>CORE SKILLS</Editable>
            <div className="side-skills">{data.skills.map((x, i) => <Editable as="div" key={i} onChange={(v) => {
              const next = [...data.skills]; next[i] = v; onEdit("skills", next);
            }}>{x}</Editable>)}</div>
          </aside>
        </div>
      ) : commonSections}
    </div>
  );
}
