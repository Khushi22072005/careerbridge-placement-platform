import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        phone: "",
        college: "",
        degree: "",
        branch: "",
        graduation_year: "",
        skills: [],
        interests: [],
        preferred_roles: [],
        preferred_locations: [],
    });

    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");
    const [roleInput, setRoleInput] = useState("");
    const [locationInput, setLocationInput] = useState("");

    // ==========================================
    // GET USER EMAIL
    // ==========================================

    const email =
        localStorage.getItem("userEmail") ||
        localStorage.getItem("email");

    // ==========================================
    // FETCH PROFILE
    // ==========================================

    useEffect(() => {
        if (!email) {
            navigate("/login");
            return;
        }

        fetchProfile();
    }, [email, navigate]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/profile/${encodeURIComponent(email)}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load profile");
            }

            setUser(data.user);

            if (data.profile) {
                setFormData({
                    phone: data.profile.phone || "",
                    college: data.profile.college || "",
                    degree: data.profile.degree || "",
                    branch: data.profile.branch || "",
                    graduation_year: data.profile.graduation_year || "",
                    skills: data.profile.skills || [],
                    interests: data.profile.interests || [],
                    preferred_roles: data.profile.preferred_roles || [],
                    preferred_locations:
                        data.profile.preferred_locations || [],
                });
            }
        } catch (err) {
            console.error("Profile Error:", err);
            setError(err.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ==========================================
    // ADD ITEM TO ARRAY
    // ==========================================

    const addItem = (field, value, setter) => {
        const trimmedValue = value.trim();

        if (!trimmedValue) return;

        if (formData[field].includes(trimmedValue)) {
            setter("");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], trimmedValue],
        }));

        setter("");
    };

    // ==========================================
    // REMOVE ITEM
    // ==========================================

    const removeItem = (field, item) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((value) => value !== item),
        }));
    };

    // ==========================================
    // HANDLE ENTER KEY
    // ==========================================

    const handleArrayKeyDown = (e, field, value, setter) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addItem(field, value, setter);
        }
    };

    // ==========================================
    // SAVE PROFILE
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/profile/${encodeURIComponent(email)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save profile");
            }

            setMessage("Profile saved successfully! 🎉");

            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (err) {
            console.error("Save Profile Error:", err);
            setError(err.message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // PROFILE COMPLETION
    // ==========================================

    const calculateCompletion = () => {
        const fields = [
            formData.phone,
            formData.college,
            formData.degree,
            formData.branch,
            formData.graduation_year,
            formData.skills.length > 0,
            formData.interests.length > 0,
            formData.preferred_roles.length > 0,
            formData.preferred_locations.length > 0,
        ];

        const completed = fields.filter(Boolean).length;

        return Math.round((completed / fields.length) * 100);
    };

    const completion = calculateCompletion();

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="profile-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="profile-page">

            {/* =====================================
                HEADER
            ===================================== */}

            <div className="profile-header">

                <div>
                    <span className="profile-eyebrow">
                        ACCOUNT
                    </span>

                    <h1>My Profile</h1>

                    <p>
                        Keep your profile updated to get better career
                        recommendations.
                    </p>
                </div>

                <button
                    className="back-dashboard-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>

            </div>


            {/* =====================================
                SUCCESS / ERROR
            ===================================== */}

            {message && (
                <div className="profile-message success">
                    ✓ {message}
                </div>
            )}

            {error && (
                <div className="profile-message error">
                    ⚠ {error}
                </div>
            )}


            {/* =====================================
                PROFILE SUMMARY
            ===================================== */}

            <div className="profile-summary">

                <div className="profile-avatar">
                    {user?.fullname
                        ? user.fullname.charAt(0).toUpperCase()
                        : "U"}
                </div>

                <div className="profile-summary-info">
                    <h2>{user?.fullname || "Student"}</h2>
                    <p>{user?.email}</p>
                    <span>Student</span>
                </div>

                <div className="profile-completion">

                    <div
                        className="completion-circle"
                        style={{
                            background: `conic-gradient(
                                #4f46e5 ${completion * 3.6}deg,
                                #e8eaf2 0deg
                            )`,
                        }}
                    >
                        <div className="completion-inner">
                            {completion}%
                        </div>
                    </div>

                    <div>
                        <strong>Profile Completion</strong>
                        <p>
                            {completion === 100
                                ? "Your profile is complete!"
                                : "Complete your profile for better recommendations."}
                        </p>
                    </div>

                </div>

            </div>


            {/* =====================================
                FORM
            ===================================== */}

            <form
                className="profile-form"
                onSubmit={handleSubmit}
            >

                {/* =================================
                    PERSONAL INFORMATION
                ================================= */}

                <section className="profile-card">

                    <div className="section-heading">
                        <div className="section-icon">👤</div>

                        <div>
                            <h2>Personal Information</h2>
                            <p>Your basic contact information.</p>
                        </div>
                    </div>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Full Name</label>

                            <input
                                type="text"
                                value={user?.fullname || ""}
                                disabled
                            />

                            <small>
                                Name is taken from your account.
                            </small>
                        </div>


                        <div className="form-group">
                            <label>Email</label>

                            <input
                                type="email"
                                value={user?.email || ""}
                                disabled
                            />
                        </div>


                        <div className="form-group">
                            <label>Phone Number</label>

                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                            />
                        </div>

                    </div>

                </section>


                {/* =================================
                    EDUCATION
                ================================= */}

                <section className="profile-card">

                    <div className="section-heading">
                        <div className="section-icon">🎓</div>

                        <div>
                            <h2>Education</h2>
                            <p>Tell us about your academic background.</p>
                        </div>
                    </div>


                    <div className="form-grid">

                        <div className="form-group full-width">
                            <label>College / University</label>

                            <input
                                type="text"
                                name="college"
                                value={formData.college}
                                onChange={handleChange}
                                placeholder="Enter your college name"
                            />
                        </div>


                        <div className="form-group">
                            <label>Degree</label>

                            <select
                                name="degree"
                                value={formData.degree}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select degree
                                </option>

                                <option value="B.Tech">
                                    B.Tech
                                </option>

                                <option value="B.E.">
                                    B.E.
                                </option>

                                <option value="BCA">
                                    BCA
                                </option>

                                <option value="B.Sc">
                                    B.Sc
                                </option>

                                <option value="M.Tech">
                                    M.Tech
                                </option>

                                <option value="MCA">
                                    MCA
                                </option>

                                <option value="Other">
                                    Other
                                </option>
                            </select>
                        </div>


                        <div className="form-group">
                            <label>Branch / Specialization</label>

                            <input
                                type="text"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                placeholder="e.g. Information Technology"
                            />
                        </div>


                        <div className="form-group">
                            <label>Graduation Year</label>

                            <select
                                name="graduation_year"
                                value={formData.graduation_year}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select year
                                </option>

                                {Array.from(
                                    { length: 8 },
                                    (_, index) => {
                                        const year =
                                            new Date().getFullYear() +
                                            index;

                                        return (
                                            <option
                                                key={year}
                                                value={year}
                                            >
                                                {year}
                                            </option>
                                        );
                                    }
                                )}
                            </select>
                        </div>

                    </div>

                </section>


                {/* =================================
                    SKILLS
                ================================= */}

                <section className="profile-card">

                    <div className="section-heading">
                        <div className="section-icon">🧠</div>

                        <div>
                            <h2>Skills</h2>
                            <p>
                                Add your technical and professional skills.
                            </p>
                        </div>
                    </div>


                    <div className="tag-input-wrapper">

                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) =>
                                setSkillInput(e.target.value)
                            }
                            onKeyDown={(e) =>
                                handleArrayKeyDown(
                                    e,
                                    "skills",
                                    skillInput,
                                    setSkillInput
                                )
                            }
                            placeholder="Type a skill and press Enter"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                addItem(
                                    "skills",
                                    skillInput,
                                    setSkillInput
                                )
                            }
                        >
                            Add
                        </button>

                    </div>


                    <div className="tag-container">

                        {formData.skills.map((skill) => (
                            <span
                                className="profile-tag"
                                key={skill}
                            >
                                {skill}

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeItem(
                                            "skills",
                                            skill
                                        )
                                    }
                                >
                                    ×
                                </button>
                            </span>
                        ))}

                    </div>

                </section>


                {/* =================================
                    INTERESTS
                ================================= */}

                <section className="profile-card">

                    <div className="section-heading">
                        <div className="section-icon">💡</div>

                        <div>
                            <h2>Interests</h2>
                            <p>
                                What areas are you interested in?
                            </p>
                        </div>
                    </div>


                    <div className="tag-input-wrapper">

                        <input
                            type="text"
                            value={interestInput}
                            onChange={(e) =>
                                setInterestInput(e.target.value)
                            }
                            onKeyDown={(e) =>
                                handleArrayKeyDown(
                                    e,
                                    "interests",
                                    interestInput,
                                    setInterestInput
                                )
                            }
                            placeholder="e.g. Web Development"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                addItem(
                                    "interests",
                                    interestInput,
                                    setInterestInput
                                )
                            }
                        >
                            Add
                        </button>

                    </div>


                    <div className="tag-container">

                        {formData.interests.map((interest) => (
                            <span
                                className="profile-tag interest"
                                key={interest}
                            >
                                {interest}

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeItem(
                                            "interests",
                                            interest
                                        )
                                    }
                                >
                                    ×
                                </button>
                            </span>
                        ))}

                    </div>

                </section>


                {/* =================================
                    PREFERRED ROLES
                ================================= */}

                <section className="profile-card">

                    <div className="section-heading">
                        <div className="section-icon">💼</div>

                        <div>
                            <h2>Preferred Roles</h2>
                            <p>
                                Which roles are you targeting?
                            </p>
                        </div>
                    </div>


                    <div className="tag-input-wrapper">

                        <input
                            type="text"
                            value={roleInput}
                            onChange={(e) =>
                                setRoleInput(e.target.value)
                            }
                            onKeyDown={(e) =>
                                handleArrayKeyDown(
                                    e,
                                    "preferred_roles",
                                    roleInput,
                                    setRoleInput
                                )
                            }
                            placeholder="e.g. Software Developer"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                addItem(
                                    "preferred_roles",
                                    roleInput,
                                    setRoleInput
                                )
                            }
                        >
                            Add
                        </button>

                    </div>


                    <div className="tag-container">

                        {formData.preferred_roles.map((role) => (
                            <span
                                className="profile-tag role"
                                key={role}
                            >
                                {role}

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeItem(
                                            "preferred_roles",
                                            role
                                        )
                                    }
                                >
                                    ×
                                </button>
                            </span>
                        ))}

                    </div>

                </section>


                {/* =================================
                    PREFERRED LOCATIONS
                ================================= */}

                <section className="profile-card">

                    <div className="section-heading">
                        <div className="section-icon">📍</div>

                        <div>
                            <h2>Preferred Locations</h2>
                            <p>
                                Where would you like to work?
                            </p>
                        </div>
                    </div>


                    <div className="tag-input-wrapper">

                        <input
                            type="text"
                            value={locationInput}
                            onChange={(e) =>
                                setLocationInput(e.target.value)
                            }
                            onKeyDown={(e) =>
                                handleArrayKeyDown(
                                    e,
                                    "preferred_locations",
                                    locationInput,
                                    setLocationInput
                                )
                            }
                            placeholder="e.g. Mumbai"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                addItem(
                                    "preferred_locations",
                                    locationInput,
                                    setLocationInput
                                )
                            }
                        >
                            Add
                        </button>

                    </div>


                    <div className="tag-container">

                        {formData.preferred_locations.map(
                            (location) => (
                                <span
                                    className="profile-tag location"
                                    key={location}
                                >
                                    {location}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeItem(
                                                "preferred_locations",
                                                location
                                            )
                                        }
                                    >
                                        ×
                                    </button>
                                </span>
                            )
                        )}

                    </div>

                </section>


                {/* =================================
                    SAVE
                ================================= */}

                <div className="profile-save-bar">

                    <div>
                        <strong>
                            {completion}% profile completed
                        </strong>

                        <p>
                            Your profile helps CareerBridge personalize
                            your career journey.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="save-profile-btn"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Profile →"}
                    </button>

                </div>

            </form>

        </div>
    );
};

export default Profile;