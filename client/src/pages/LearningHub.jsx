import React, { useEffect, useState } from "react";
import "./LearningHub.css";

const courses = [
    {
        id: 1,
        title: "Advanced SQL & Window Functions",
        provider: "Udemy",
        level: "Advanced",
        duration: "3h 20m",
        rating: "4.8",
        skill: "SQL",
        reason: "Your SQL level is Intermediate.",
        icon: "SQL",
        iconClass: "sql-icon",
        url: "https://www.udemy.com/courses/search/?q=advanced%20sql"
    },
    {
        id: 2,
        title: "Microsoft Power BI for Data Analysis",
        provider: "Udemy",
        level: "Beginner",
        duration: "6h 30m",
        rating: "4.7",
        skill: "Power BI",
        reason: "You need to improve your Power BI skills.",
        icon: "BI",
        iconClass: "powerbi-icon",
        url: "https://www.udemy.com/courses/search/?q=power%20bi"
    },
    {
        id: 3,
        title: "Statistics for Data Science",
        provider: "Coursera",
        level: "Beginner",
        duration: "8h",
        rating: "4.6",
        skill: "Statistics",
        reason: "Statistics is important for your Data Analyst goal.",
        icon: "ƒx",
        iconClass: "statistics-icon",
        url: "https://www.coursera.org/search?query=statistics%20for%20data%20science"
    }
];

const skills = [
    { name: "SQL", courses: 12, icon: "SQL", iconClass: "sql-icon" },
    { name: "Python", courses: 15, icon: "PY", iconClass: "python-icon" },
    { name: "Excel", courses: 10, icon: "XL", iconClass: "excel-icon" },
    { name: "Power BI", courses: 8, icon: "BI", iconClass: "powerbi-icon" },
    { name: "Statistics", courses: 6, icon: "Σ", iconClass: "statistics-icon" },
    {
        name: "Data Visualization",
        courses: 9,
        icon: "DV",
        iconClass: "visual-icon"
    }
];

const practice = [
    {
        title: "SQL Practice",
        description: "20 questions to test your SQL skills",
        icon: "SQL",
        iconClass: "sql-icon",
        button: "Start Practice"
    },
    {
        title: "Excel Practice",
        description: "15 questions to test your Excel skills",
        icon: "XL",
        iconClass: "excel-icon",
        button: "Start Practice"
    },
    {
        title: "Python Practice",
        description: "20 coding problems",
        icon: "PY",
        iconClass: "python-icon",
        button: "Start Practice"
    },
    {
        title: "Aptitude Quiz",
        description: "25 placement questions",
        icon: "IQ",
        iconClass: "aptitude-icon",
        button: "Start Quiz"
    }
];

function LearningHub() {
    const [myCourses, setMyCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    // =====================================================
    // ENROLL IN COURSE
    // =====================================================

    const enrollCourse = async (course) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login first.");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/learning/enroll",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        courseId: String(course.id),
                        courseTitle: course.title,
                        provider: course.provider,
                        courseUrl: course.url,
                        skill: course.skill
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to enroll");
            }

            alert(data.message);

            await fetchMyCourses();

        } catch (error) {
            console.error("Enrollment error:", error);
            alert(error.message);
        }
    };

    // =====================================================
    // FETCH USER COURSES
    // =====================================================

    const fetchMyCourses = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoadingCourses(false);
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/learning/my-courses",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch learning courses");
            }

            const data = await response.json();

            console.log("My learning courses:", data);

            setMyCourses(data);

        } catch (error) {
            console.error("Error loading learning courses:", error);
        } finally {
            setLoadingCourses(false);
        }
    };

    useEffect(() => {
        fetchMyCourses();
    }, []);

    // =====================================================
    // LEARNING STATS
    // =====================================================

    const totalCourses = myCourses.length;

    const completedCourses = myCourses.filter(
        (course) =>
            course.status === "completed" ||
            Number(course.progress) === 100
    ).length;

    const overallProgress =
        totalCourses > 0
            ? Math.round(
                  myCourses.reduce(
                      (total, course) =>
                          total + Number(course.progress || 0),
                      0
                  ) / totalCourses
              )
            : 0;

    return (
        <div className="learning-page">

            {/* PAGE HEADER */}

            <div className="learning-header">

                <div className="learning-title-section">

                    <div className="learning-header-icon">
                        🎓
                    </div>

                    <div>
                        <span className="section-label">
                            LEARNING HUB
                        </span>

                        <h1>
                            Learning Hub
                        </h1>

                        <p>
                            Discover the best learning resources recommended for your career goals.
                        </p>
                    </div>

                </div>

                <div className="learning-actions">

                    <div className="course-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search for skills, courses or topics..."
                        />
                    </div>

                    <button className="filter-button">
                        <span>⚱</span>
                        Filters
                    </button>

                </div>

            </div>


            {/* LEARNING PROGRESS */}

            <section className="learning-overview">

                <div className="overview-left">

                    <h2>
                        Your Learning Progress
                    </h2>

                    <div className="progress-content">

                        <div className="progress-circle">

                            <div className="progress-circle-inner">

                                <strong>
                                    {overallProgress}%
                                </strong>

                                <span>
                                    Overall Progress
                                </span>

                            </div>

                        </div>

                        <div className="skill-progress-list">

                            <SkillProgress
                                name="SQL"
                                progress={70}
                                icon="SQL"
                                iconClass="sql-icon"
                            />

                            <SkillProgress
                                name="Excel"
                                progress={85}
                                icon="XL"
                                iconClass="excel-icon"
                            />

                            <SkillProgress
                                name="Python"
                                progress={40}
                                icon="PY"
                                iconClass="python-icon"
                            />

                            <SkillProgress
                                name="Power BI"
                                progress={20}
                                icon="BI"
                                iconClass="powerbi-icon"
                            />

                        </div>

                    </div>

                </div>


                <div className="overview-right">

                    <div className="stats-grid">

                        <div className="learning-stat">

                            <div className="stat-icon book-icon">
                                📖
                            </div>

                            <div>
                                <strong>
                                    {totalCourses}
                                </strong>

                                <span>
                                    Courses Enrolled
                                </span>
                            </div>

                        </div>


                        <div className="learning-stat">

                            <div className="stat-icon completed-icon">
                                ✓
                            </div>

                            <div>
                                <strong>
                                    {completedCourses}
                                </strong>

                                <span>
                                    Completed
                                </span>
                            </div>

                        </div>


                        <div className="learning-stat">

                            <div className="stat-icon time-icon">
                                ◷
                            </div>

                            <div>
                                <strong>
                                    36h
                                </strong>

                                <span>
                                    Time Spent
                                </span>
                            </div>

                        </div>

                    </div>


                    <div className="progress-message">

                        <div className="message-star">
                            ★
                        </div>

                        <div>

                            <strong>
                                Great progress!
                            </strong>

                            <p>
                                Keep learning consistently to improve your career readiness.
                            </p>

                        </div>

                        <div className="trophy">
                            🏆
                        </div>

                    </div>

                </div>

            </section>


            {/* MAIN CONTENT */}

            <div className="learning-main-grid">

                <div className="learning-main-column">


                    {/* CONTINUE LEARNING */}

                    <section className="learning-card">

                        <div className="card-heading">

                            <h2>
                                Continue Learning
                            </h2>

                            <button>
                                View all
                            </button>

                        </div>


                        <div className="continue-list">

                            {loadingCourses ? (

                                <p>
                                    Loading your courses...
                                </p>

                            ) : myCourses.length === 0 ? (

                                <p>
                                    You haven't enrolled in any courses yet.
                                </p>

                            ) : (

                                myCourses.map((course) => (

                                    <div
                                        className="continue-course"
                                        key={course.id}
                                    >

                                        <div
                                            className={`course-thumbnail ${
                                                course.skill === "Power BI"
                                                    ? "powerbi-icon"
                                                    : course.skill === "Python"
                                                    ? "python-icon"
                                                    : course.skill === "Excel"
                                                    ? "excel-icon"
                                                    : course.skill === "Statistics"
                                                    ? "statistics-icon"
                                                    : "sql-icon"
                                            }`}
                                        >
                                            {course.skill || "COURSE"}
                                        </div>


                                        <div className="continue-course-info">

                                            <h3>
                                                {course.course_title}
                                            </h3>

                                            <p>
                                                {course.provider || "Learning Platform"}

                                                <span>
                                                    •
                                                </span>

                                                {course.skill || "General"}
                                            </p>


                                            <div className="mini-progress-row">

                                                <div className="mini-progress">

                                                    <div
                                                        style={{
                                                            width: `${Number(
                                                                course.progress || 0
                                                            )}%`
                                                        }}
                                                    />

                                                </div>

                                                <span>
                                                    {Number(course.progress || 0)}%
                                                </span>

                                            </div>

                                        </div>


                                        <button
                                            className="continue-button"
                                            onClick={() => {
                                                if (course.course_url) {
                                                    window.open(
                                                        course.course_url,
                                                        "_blank",
                                                        "noopener,noreferrer"
                                                    );
                                                }
                                            }}
                                        >
                                            ▶ Continue
                                        </button>

                                    </div>

                                ))

                            )}

                        </div>

                    </section>


                    {/* RECOMMENDED COURSES */}

                    <section className="learning-card">

                        <div className="card-heading">

                            <div>

                                <h2>
                                    Recommended for You
                                </h2>

                                <p className="card-subtitle">
                                    Based on your Data Analyst career goal and skill gaps
                                </p>

                            </div>

                            <button>
                                View all
                            </button>

                        </div>


                        <div className="recommended-list">

                            {courses.map((course) => (

                                <div
                                    className="recommended-course"
                                    key={course.id}
                                >

                                    <div
                                        className={`course-thumbnail large ${course.iconClass}`}
                                    >
                                        {course.icon}
                                    </div>


                                    <div className="recommended-info">

                                        <h3>
                                            {course.title}
                                        </h3>

                                        <p className="course-meta">

                                            {course.provider}

                                            <span>•</span>

                                            {course.level}

                                            <span>•</span>

                                            {course.duration}

                                            <span>•</span>

                                            ⭐ {course.rating}

                                        </p>


                                        <div className="recommendation-reason">
                                            {course.reason}
                                        </div>

                                    </div>


                                    <div className="course-actions">

                                        <button
                                            className="save-course"
                                            title="Save course"
                                        >
                                            ♡
                                        </button>

                                        <button
                                            className="view-course-button"
                                            onClick={() => enrollCourse(course)}
                                        >
                                            Enroll Course ↗
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>


                    {/* BROWSE BY SKILL */}

                    <section className="learning-card">

                        <div className="card-heading">

                            <h2>
                                Browse by Skill
                            </h2>

                            <button>
                                View all
                            </button>

                        </div>


                        <div className="skills-grid">

                            {skills.map((skill) => (

                                <button
                                    className="skill-card"
                                    key={skill.name}
                                >

                                    <div
                                        className={`skill-icon ${skill.iconClass}`}
                                    >
                                        {skill.icon}
                                    </div>

                                    <div>

                                        <strong>
                                            {skill.name}
                                        </strong>

                                        <span>
                                            {skill.courses} Courses
                                        </span>

                                    </div>

                                </button>

                            ))}


                            <button className="skill-card more-skill">

                                <div className="skill-icon more-icon">
                                    +
                                </div>

                                <div>

                                    <strong>
                                        More
                                    </strong>

                                    <span>
                                        View all
                                    </span>

                                </div>

                            </button>

                        </div>

                    </section>


                    {/* PRACTICE ZONE */}

                    <section className="learning-card">

                        <div className="card-heading">

                            <h2>
                                Practice Zone
                            </h2>

                            <button>
                                View all
                            </button>

                        </div>


                        <div className="practice-grid">

                            {practice.map((item) => (

                                <div
                                    className="practice-card"
                                    key={item.title}
                                >

                                    <div
                                        className={`practice-icon ${item.iconClass}`}
                                    >
                                        {item.icon}
                                    </div>

                                    <div>

                                        <h3>
                                            {item.title}
                                        </h3>

                                        <p>
                                            {item.description}
                                        </p>

                                        <button>
                                            {item.button} →
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>

                </div>


                {/* RIGHT SIDEBAR */}

                <aside className="learning-sidebar">


                    {/* LEARNING GOALS */}

                    <section className="side-card">

                        <div className="side-card-heading">

                            <h2>
                                My Learning Goals
                            </h2>

                            <button>
                                Edit Goals
                            </button>

                        </div>


                        <LearningGoal
                            title="Improve SQL to Advanced"
                            progress={70}
                        />

                        <LearningGoal
                            title="Learn Power BI"
                            progress={30}
                        />

                        <LearningGoal
                            title="Complete 2 Projects"
                            progress={50}
                        />

                    </section>


                    {/* PLATFORMS */}

                    <section className="side-card">

                        <h2>
                            Top Platforms
                        </h2>


                        <div className="platform-row">
                            <strong>Udemy</strong>
                            <span>18 Courses</span>
                        </div>

                        <div className="platform-row">
                            <strong>Coursera</strong>
                            <span>4 Courses</span>
                        </div>

                        <div className="platform-row">
                            <strong>YouTube</strong>
                            <span>12 Courses</span>
                        </div>

                        <div className="platform-row">
                            <strong>edX</strong>
                            <span>2 Courses</span>
                        </div>


                        <button className="side-link">
                            View all platforms →
                        </button>

                    </section>


                    {/* RESOURCES */}

                    <section className="side-card">

                        <h2>
                            Learning Resources
                        </h2>


                        <button className="resource-row">
                            📄 Articles & Blogs
                        </button>

                        <button className="resource-row">
                            📑 Cheat Sheets
                        </button>

                        <button className="resource-row">
                            💼 Interview Prep
                        </button>

                        <button className="resource-row">
                            📚 Roadmap Guides
                        </button>


                        <button className="side-link">
                            View all resources →
                        </button>

                    </section>

                </aside>

            </div>


            {/* BOTTOM TIP */}

            <div className="learning-tip">

                <span>
                    💡
                </span>

                <strong>
                    Tip:
                </strong>

                Complete recommended courses and practice regularly to improve your career readiness.

            </div>

        </div>
    );
}


/* =====================================================
   SKILL PROGRESS COMPONENT
===================================================== */

function SkillProgress({
    name,
    progress,
    icon,
    iconClass
}) {
    return (
        <div className="skill-progress">

            <div
                className={`skill-progress-icon ${iconClass}`}
            >
                {icon}
            </div>

            <strong>
                {name}
            </strong>

            <div className="skill-progress-bar">

                <div
                    style={{
                        width: `${progress}%`
                    }}
                />

            </div>

            <span>
                {progress}%
            </span>

        </div>
    );
}


/* =====================================================
   LEARNING GOAL COMPONENT
===================================================== */

function LearningGoal({
    title,
    progress
}) {
    return (
        <div className="learning-goal">

            <div className="goal-title">

                <span className="goal-check">
                    ✓
                </span>

                <strong>
                    {title}
                </strong>

            </div>


            <div className="goal-progress">

                <div>

                    <span
                        style={{
                            width: `${progress}%`
                        }}
                    />

                </div>

                <small>
                    {progress}%
                </small>

            </div>

        </div>
    );
}


export default LearningHub;