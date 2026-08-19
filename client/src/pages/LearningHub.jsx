import React, { useMemo, useState } from "react";
import "./LearningHub.css";

/* =====================================================
   CAREER ROLES
===================================================== */

const CAREER_ROLES = [
    {
        id: "software-developer",
        name: "Software Developer",
        short: "Software",
        icon: "💻",
        description:
            "Learn programming, data structures, web development and software engineering."
    },
    {
        id: "data-analyst",
        name: "Data Analyst",
        short: "Data",
        icon: "📊",
        description:
            "Learn SQL, Python, Excel, Power BI, statistics and data visualization."
    },
    {
        id: "cybersecurity",
        name: "Cybersecurity",
        short: "Security",
        icon: "🔐",
        description:
            "Learn networking, Linux, cybersecurity fundamentals and ethical hacking."
    },
    {
        id: "cloud-devops",
        name: "Cloud / DevOps",
        short: "Cloud",
        icon: "☁️",
        description:
            "Learn Linux, AWS, Docker, Kubernetes, CI/CD and DevOps practices."
    },
    {
        id: "ui-ux",
        name: "UI/UX Designer",
        short: "UI/UX",
        icon: "🎨",
        description:
            "Learn UI design, UX research, Figma, wireframing and prototyping."
    }
];


/* =====================================================
   ONLINE LEARNING RESOURCES
===================================================== */

const LEARNING_RESOURCES = {

    /* =================================================
       SOFTWARE DEVELOPER
    ================================================= */

    "software-developer": [

        {
            id: "sd-1",
            title: "Java Programming",
            provider: "Coursera",
            platform: "Coursera",
            skill: "Java",
            type: "Course",
            duration: "Beginner",
            level: "Beginner",
            icon: "JAVA",
            url:
                "https://www.coursera.org/learn/java-programming"
        },

        {
            id: "sd-2",
            title: "Python for Everybody",
            provider: "Coursera",
            platform: "Coursera",
            skill: "Python",
            type: "Course",
            duration: "Beginner",
            level: "Beginner",
            icon: "PY",
            url:
                "https://www.coursera.org/specializations/python"
        },

        {
            id: "sd-3",
            title: "Data Structures & Algorithms",
            provider: "GeeksforGeeks",
            platform: "GeeksforGeeks",
            skill: "DSA",
            type: "Learning",
            duration: "Self-paced",
            level: "Intermediate",
            icon: "DSA",
            url:
                "https://www.geeksforgeeks.org/data-structures/"
        },

        {
            id: "sd-4",
            title: "Full Stack Web Development",
            provider: "freeCodeCamp",
            platform: "YouTube",
            skill: "Web Development",
            type: "Video",
            duration: "Long Course",
            level: "Beginner",
            icon: "WEB",
            url:
                "https://www.youtube.com/@freecodecamp"
        },

        {
            id: "sd-5",
            title: "JavaScript Full Course",
            provider: "freeCodeCamp",
            platform: "YouTube",
            skill: "JavaScript",
            type: "Video",
            duration: "Self-paced",
            level: "Beginner",
            icon: "JS",
            url:
                "https://www.youtube.com/results?search_query=javascript+full+course+freecodecamp"
        },

        {
            id: "sd-6",
            title: "Web Development Bootcamp",
            provider: "Udemy",
            platform: "Udemy",
            skill: "Web Development",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            icon: "WEB",
            url:
                "https://www.udemy.com/courses/development/web-development/"
        },

        {
            id: "sd-7",
            title: "SQL Tutorial",
            provider: "W3Schools",
            platform: "Online",
            skill: "SQL",
            type: "Tutorial",
            duration: "Self-paced",
            level: "Beginner",
            icon: "SQL",
            url:
                "https://www.w3schools.com/sql/"
        },

        {
            id: "sd-8",
            title: "Git & GitHub",
            provider: "GitHub",
            platform: "Online",
            skill: "Git",
            type: "Learning",
            duration: "Self-paced",
            level: "Beginner",
            icon: "GIT",
            url:
                "https://skills.github.com/"
        }
    ],


    /* =================================================
       DATA ANALYST
    ================================================= */

    "data-analyst": [

        {
            id: "da-1",
            title: "Google Data Analytics",
            provider: "Coursera",
            platform: "Coursera",
            skill: "Data Analytics",
            type: "Professional Certificate",
            duration: "Beginner",
            level: "Beginner",
            icon: "DA",
            url:
                "https://www.coursera.org/professional-certificates/google-data-analytics"
        },

        {
            id: "da-2",
            title: "SQL for Data Science",
            provider: "Coursera",
            platform: "Coursera",
            skill: "SQL",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            icon: "SQL",
            url:
                "https://www.coursera.org/learn/sql-for-data-science"
        },

        {
            id: "da-3",
            title: "Python for Data Analysis",
            provider: "freeCodeCamp",
            platform: "YouTube",
            skill: "Python",
            type: "Video",
            duration: "Self-paced",
            level: "Beginner",
            icon: "PY",
            url:
                "https://www.youtube.com/results?search_query=python+data+analysis+freecodecamp"
        },

        {
            id: "da-4",
            title: "Power BI Full Course",
            provider: "freeCodeCamp",
            platform: "YouTube",
            skill: "Power BI",
            type: "Video",
            duration: "Long Course",
            level: "Beginner",
            icon: "BI",
            url:
                "https://www.youtube.com/results?search_query=power+bi+full+course+freecodecamp"
        },

        {
            id: "da-5",
            title: "Power BI Learning",
            provider: "Microsoft Learn",
            platform: "Microsoft",
            skill: "Power BI",
            type: "Learning Path",
            duration: "Self-paced",
            level: "Beginner",
            icon: "BI",
            url:
                "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/"
        },

        {
            id: "da-6",
            title: "Excel for Data Analysis",
            provider: "Coursera",
            platform: "Coursera",
            skill: "Excel",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            icon: "XL",
            url:
                "https://www.coursera.org/search?query=excel%20data%20analysis"
        },

        {
            id: "da-7",
            title: "Advanced Excel Tutorials",
            provider: "YouTube",
            platform: "YouTube",
            skill: "Excel",
            type: "Video",
            duration: "Self-paced",
            level: "Beginner",
            icon: "XL",
            url:
                "https://www.youtube.com/results?search_query=advanced+excel+data+analysis"
        },

        {
            id: "da-8",
            title: "Statistics for Data Analysis",
            provider: "Khan Academy",
            platform: "Online",
            skill: "Statistics",
            type: "Learning",
            duration: "Self-paced",
            level: "Beginner",
            icon: "ST",
            url:
                "https://www.khanacademy.org/math/statistics-probability"
        },

        {
            id: "da-9",
            title: "Data Visualization with Tableau",
            provider: "Coursera",
            platform: "Coursera",
            skill: "Visualization",
            type: "Course",
            duration: "Self-paced",
            level: "Intermediate",
            icon: "TAB",
            url:
                "https://www.coursera.org/search?query=tableau%20data%20visualization"
        }
    ],


    /* =================================================
       CYBERSECURITY
    ================================================= */

    "cybersecurity": [

        {
            id: "cy-1",
            title: "Introduction to Cybersecurity",
            provider: "Cisco",
            platform: "Cisco",
            skill: "Cybersecurity",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            icon: "SEC",
            url:
                "https://www.netacad.com/courses/cybersecurity"
        },

        {
            id: "cy-2",
            title: "Cybersecurity Fundamentals",
            provider: "Coursera",
            platform: "Coursera",
            skill: "Security",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            icon: "SEC",
            url:
                "https://www.coursera.org/search?query=cybersecurity%20fundamentals"
        },

        {
            id: "cy-3",
            title: "Computer Networking",
            provider: "Cisco",
            platform: "Cisco",
            skill: "Networking",
            type: "Learning",
            duration: "Self-paced",
            level: "Beginner",
            icon: "NET",
            url:
                "https://www.netacad.com/courses/networking"
        },

        {
            id: "cy-4",
            title: "Linux Fundamentals",
            provider: "YouTube",
            platform: "YouTube",
            skill: "Linux",
            type: "Video",
            duration: "Self-paced",
            level: "Beginner",
            icon: "LIN",
            url:
                "https://www.youtube.com/results?search_query=linux+fundamentals+for+beginners"
        },

        {
            id: "cy-5",
            title: "Ethical Hacking",
            provider: "Udemy",
            platform: "Udemy",
            skill: "Ethical Hacking",
            type: "Course",
            duration: "Self-paced",
            level: "Intermediate",
            icon: "EH",
            url:
                "https://www.udemy.com/courses/it-and-software/network-and-security/ethical-hacking/"
        },

        {
            id: "cy-6",
            title: "TryHackMe",
            provider: "TryHackMe",
            platform: "Online",
            skill: "Cybersecurity",
            type: "Hands-on",
            duration: "Interactive",
            level: "Beginner",
            icon: "THM",
            url:
                "https://tryhackme.com/"
        },

        {
            id: "cy-7",
            title: "OWASP Web Security",
            provider: "OWASP",
            platform: "Online",
            skill: "Web Security",
            type: "Material",
            duration: "Self-paced",
            level: "Intermediate",
            icon: "OW",
            url:
                "https://owasp.org/www-project-top-ten/"
        }
    ],


    /* =================================================
       CLOUD / DEVOPS
    ================================================= */

    "cloud-devops": [

        {
            id: "cd-1",
            title: "AWS Cloud Practitioner",
            provider: "AWS",
            platform: "AWS",
            skill: "AWS",
            type: "Learning",
            duration: "Self-paced",
            level: "Beginner",
            icon: "AWS",
            url:
                "https://aws.amazon.com/training/"
        },

        {
            id: "cd-2",
            title: "AWS Cloud Fundamentals",
            provider: "Coursera",
            platform: "Coursera",
            skill: "AWS",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            icon: "AWS",
            url:
                "https://www.coursera.org/search?query=aws%20cloud"
        },

        {
            id: "cd-3",
            title: "Docker Getting Started",
            provider: "Docker",
            platform: "Online",
            skill: "Docker",
            type: "Learning",
            duration: "Self-paced",
            level: "Beginner",
            icon: "DOC",
            url:
                "https://docs.docker.com/get-started/"
        },

        {
            id: "cd-4",
            title: "Kubernetes Basics",
            provider: "Kubernetes",
            platform: "Online",
            skill: "Kubernetes",
            type: "Tutorial",
            duration: "Self-paced",
            level: "Intermediate",
            icon: "K8S",
            url:
                "https://kubernetes.io/docs/tutorials/kubernetes-basics/"
        },

        {
            id: "cd-5",
            title: "DevOps Full Course",
            provider: "YouTube",
            platform: "YouTube",
            skill: "DevOps",
            type: "Video",
            duration: "Long Course",
            level: "Beginner",
            icon: "DEV",
            url:
                "https://www.youtube.com/results?search_query=devops+full+course"
        },

        {
            id: "cd-6",
            title: "Linux Fundamentals",
            provider: "Linux Foundation",
            platform: "Online",
            skill: "Linux",
            type: "Learning",
            duration: "Self-paced",
            level: "Beginner",
            icon: "LIN",
            url:
                "https://training.linuxfoundation.org/"
        },

        {
            id: "cd-7",
            title: "CI/CD with GitHub Actions",
            provider: "GitHub",
            platform: "GitHub",
            skill: "CI/CD",
            type: "Learning",
            duration: "Self-paced",
            level: "Intermediate",
            icon: "CI",
            url:
                "https://docs.github.com/en/actions"
        }
    ],


    /* =================================================
       UI / UX
    ================================================= */

    "ui-ux": [

        {
            id: "ux-1",
            title: "Google UX Design",
            provider: "Coursera",
            platform: "Coursera",
            skill: "UX Design",
            type: "Professional Certificate",
            duration: "Self-paced",
            level: "Beginner",
            icon: "UX",
            url:
                "https://www.coursera.org/professional-certificates/google-ux-design"
        },

        {
            id: "ux-2",
            title: "Figma Tutorial for Beginners",
            provider: "YouTube",
            platform: "YouTube",
            skill: "Figma",
            type: "Video",
            duration: "Self-paced",
            level: "Beginner",
            icon: "FIG",
            url:
                "https://www.youtube.com/results?search_query=figma+tutorial+for+beginners"
        },

        {
            id: "ux-3",
            title: "Figma Learn",
            provider: "Figma",
            platform: "Figma",
            skill: "Figma",
            type: "Learning",
            duration: "Self-paced",
            level: "Beginner",
            icon: "FIG",
            url:
                "https://help.figma.com/hc/en-us/categories/360002051613-Learn-design"
        },

        {
            id: "ux-4",
            title: "UX Research Fundamentals",
            provider: "Coursera",
            platform: "Coursera",
            skill: "UX Research",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            icon: "RES",
            url:
                "https://www.coursera.org/search?query=ux%20research"
        },

        {
            id: "ux-5",
            title: "UI Design Fundamentals",
            provider: "Udemy",
            platform: "Udemy",
            skill: "UI Design",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            icon: "UI",
            url:
                "https://www.udemy.com/courses/design/user-experience/"
        },

        {
            id: "ux-6",
            title: "UI/UX Design Full Course",
            provider: "YouTube",
            platform: "YouTube",
            skill: "UI/UX",
            type: "Video",
            duration: "Long Course",
            level: "Beginner",
            icon: "UX",
            url:
                "https://www.youtube.com/results?search_query=ui+ux+design+full+course"
        }
    ]
};


/* =====================================================
   PRACTICE DATA
===================================================== */

const PRACTICE_DATA = {

    "software-developer": [
        {
            title: "Coding Practice",
            description:
                "Solve programming problems and strengthen coding fundamentals.",
            icon: "</>",
            action: "Start Practice",
            url:
                "https://www.hackerrank.com/domains/tutorials/10-days-of-javascript"
        },
        {
            title: "DSA Practice",
            description:
                "Practice arrays, strings, stacks, queues and algorithms.",
            icon: "DSA",
            action: "Practice DSA",
            url:
                "https://leetcode.com/problemset/"
        },
        {
            title: "SQL Practice",
            description:
                "Improve your database and SQL query skills.",
            icon: "SQL",
            action: "Practice SQL",
            url:
                "https://www.hackerrank.com/domains/sql"
        },
        {
            title: "Interview Coding",
            description:
                "Prepare for technical coding interview questions.",
            icon: "INT",
            action: "Start Practice",
            url:
                "https://www.interviewbit.com/"
        }
    ],

    "data-analyst": [
        {
            title: "SQL Practice",
            description:
                "Solve SQL queries used in real data analyst interviews.",
            icon: "SQL",
            action: "Start Practice",
            url:
                "https://www.hackerrank.com/domains/sql"
        },
        {
            title: "Excel Practice",
            description:
                "Practice formulas, tables, pivot tables and analysis.",
            icon: "XL",
            action: "Practice Excel",
            url:
                "https://www.w3schools.com/excel/"
        },
        {
            title: "Data Interpretation",
            description:
                "Analyze charts, tables and business datasets.",
            icon: "DATA",
            action: "Start Practice",
            url:
                "https://www.indiabix.com/data-interpretation/questions-and-answers/"
        },
        {
            title: "Aptitude Practice",
            description:
                "Improve quantitative and logical reasoning skills.",
            icon: "APT",
            action: "Start Practice",
            url:
                "https://www.indiabix.com/aptitude/questions-and-answers/"
        }
    ],

    "cybersecurity": [
        {
            title: "Networking Practice",
            description:
                "Test your understanding of networks and protocols.",
            icon: "NET",
            action: "Start Practice",
            url:
                "https://www.hackerrank.com/domains/tutorials/10-days-of-javascript"
        },
        {
            title: "Security Labs",
            description:
                "Practice cybersecurity concepts in safe learning labs.",
            icon: "SEC",
            action: "Start Labs",
            url:
                "https://tryhackme.com/"
        },
        {
            title: "Linux Practice",
            description:
                "Strengthen Linux commands and administration skills.",
            icon: "LIN",
            action: "Start Practice",
            url:
                "https://linuxjourney.com/"
        },
        {
            title: "Security Interview",
            description:
                "Prepare for cybersecurity interview questions.",
            icon: "INT",
            action: "Start Practice",
            url:
                "https://www.interviewbit.com/"
        }
    ],

    "cloud-devops": [
        {
            title: "Linux Practice",
            description:
                "Practice important Linux commands and concepts.",
            icon: "LIN",
            action: "Start Practice",
            url:
                "https://linuxjourney.com/"
        },
        {
            title: "Cloud Learning",
            description:
                "Learn cloud computing fundamentals and services.",
            icon: "AWS",
            action: "Start Learning",
            url:
                "https://aws.amazon.com/training/"
        },
        {
            title: "DevOps Practice",
            description:
                "Practice Docker, CI/CD and DevOps concepts.",
            icon: "DEV",
            action: "Start Practice",
            url:
                "https://www.katacoda.com/"
        },
        {
            title: "Interview Practice",
            description:
                "Prepare for cloud and DevOps interview questions.",
            icon: "INT",
            action: "Start Practice",
            url:
                "https://www.interviewbit.com/"
        }
    ],

    "ui-ux": [
        {
            title: "Design Quiz",
            description:
                "Test your knowledge of UI/UX design principles.",
            icon: "UX",
            action: "Start Quiz",
            url:
                "https://www.interaction-design.org/literature/topics/ux-design"
        },
        {
            title: "UX Research",
            description:
                "Practice user research and usability scenarios.",
            icon: "RES",
            action: "Start Learning",
            url:
                "https://www.nngroup.com/articles/"
        },
        {
            title: "Design Challenge",
            description:
                "Solve practical UI/UX design challenges.",
            icon: "UI",
            action: "Start Practice",
            url:
                "https://www.dailyui.co/"
        },
        {
            title: "Design Interview",
            description:
                "Prepare for UI/UX interview questions.",
            icon: "INT",
            action: "Start Practice",
            url:
                "https://www.interviewbit.com/"
        }
    ]
};


/* =====================================================
   MAIN COMPONENT
===================================================== */

function LearningHub() {

    const [selectedRole, setSelectedRole] =
        useState("data-analyst");

    const [search, setSearch] =
        useState("");

    const role =
        CAREER_ROLES.find(
            item =>
                item.id === selectedRole
        );


    /* =================================================
       CURRENT ROLE RESOURCES
    ================================================= */

    const roleResources =
        LEARNING_RESOURCES[
            selectedRole
        ] || [];


    /* =================================================
       SEARCH RESOURCES
    ================================================= */

    const filteredResources =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();

            if (!searchText) {
                return roleResources;
            }

            return roleResources.filter(
                resource => {

                    const text =
                        `${resource.title}
                        ${resource.provider}
                        ${resource.skill}
                        ${resource.platform}
                        ${resource.type}`
                            .toLowerCase();

                    return text.includes(
                        searchText
                    );
                }
            );

        }, [
            roleResources,
            search
        ]);


    /* =================================================
       ROLE CHANGE
    ================================================= */

    function handleRoleChange(
        roleId
    ) {

        setSelectedRole(
            roleId
        );

        setSearch("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* =================================================
       OPEN RESOURCE
    ================================================= */

    function openResource(
        url
    ) {

        if (!url) {
            return;
        }

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    }


    /* =================================================
       PRACTICE
    ================================================= */

    function startPractice(
        practice
    ) {

        if (
            practice.url
        ) {

            openResource(
                practice.url
            );

            return;
        }

        alert(
            `${practice.title} is ready to start!`
        );
    }


    /* =================================================
       PLATFORM CLASS
    ================================================= */

    function getPlatformClass(
        platform
    ) {

        return String(
            platform
        )
            .toLowerCase()
            .replace(
                /[^a-z]/g,
                "-"
            );
    }


    /* =================================================
       RENDER
    ================================================= */

    return (

        <div className="learning-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="learning-header">

                <div className="learning-title-section">

                    <div className="learning-header-icon">
                        📚
                    </div>

                    <div>

                        <span className="section-label">
                            LEARNING HUB
                        </span>

                        <h1>
                            Learn. Build. Get Career Ready.
                        </h1>

                        <p>
                            Choose a career path and explore
                            courses, videos and learning resources.
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                CAREER ROLE SELECTION
            ================================================= */}

            <section className="career-role-section">

                <div className="career-role-heading">

                    <div>

                        <span className="section-label">
                            CHOOSE YOUR PATH
                        </span>

                        <h2>
                            What do you want to learn?
                        </h2>

                        <p>
                            Select a career role to get
                            personalized learning resources.
                        </p>

                    </div>

                </div>


                <div className="career-role-grid">

                    {CAREER_ROLES.map(
                        item => (

                            <button
                                key={
                                    item.id
                                }
                                className={
                                    `career-role-card ${
                                        selectedRole ===
                                        item.id
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleRoleChange(
                                        item.id
                                    )
                                }
                            >

                                <div className="role-card-icon">
                                    {item.icon}
                                </div>

                                <div className="role-card-content">

                                    <strong>
                                        {item.name}
                                    </strong>

                                    <span>
                                        {item.description}
                                    </span>

                                </div>

                                <div className="role-radio">

                                    {selectedRole ===
                                    item.id
                                        ? "✓"
                                        : ""
                                    }

                                </div>

                            </button>

                        )
                    )}

                </div>

            </section>


            {/* =================================================
                SELECTED ROLE
            ================================================= */}

            <section className="selected-role-banner">

                <div className="selected-role-icon">
                    {role?.icon}
                </div>

                <div>

                    <span>
                        CURRENT LEARNING PATH
                    </span>

                    <h2>
                        {role?.name}
                    </h2>

                    <p>
                        {role?.description}
                    </p>

                </div>

            </section>


            {/* =================================================
                RESOURCE OVERVIEW
            ================================================= */}

            <section className="learning-overview">

                <div className="overview-left">

                    <h2>
                        Your Learning Path
                    </h2>

                    <div className="progress-content">

                        <div
                            className="progress-circle"
                            style={{
                                background:
                                    "conic-gradient(#7c3aed 100%, #eeeaf5 100%)"
                            }}
                        >

                            <div className="progress-circle-inner">

                                <strong>
                                    {roleResources.length}
                                </strong>

                                <span>
                                    Resources
                                </span>

                            </div>

                        </div>


                        <div className="progress-message">

                            <div className="message-star">
                                ✦
                            </div>

                            <div>

                                <strong>
                                    Start learning today!
                                </strong>

                                <p>
                                    Explore courses, videos and
                                    practical resources for your
                                    selected career.
                                </p>

                            </div>

                            <div className="trophy">
                                🚀
                            </div>

                        </div>

                    </div>

                </div>


                <div className="overview-right">

                    <div className="stats-grid">

                        <div className="learning-stat">

                            <div className="stat-icon book-icon">
                                🎓
                            </div>

                            <div>

                                <strong>
                                    {roleResources.length}
                                </strong>

                                <span>
                                    Learning Resources
                                </span>

                            </div>

                        </div>


                        <div className="learning-stat">

                            <div className="stat-icon completed-icon">
                                ▶
                            </div>

                            <div>

                                <strong>
                                    {
                                        roleResources.filter(
                                            resource =>
                                                resource.type ===
                                                "Video"
                                        ).length
                                    }
                                </strong>

                                <span>
                                    Video Resources
                                </span>

                            </div>

                        </div>


                        <div className="learning-stat">

                            <div className="stat-icon time-icon">
                                🌐
                            </div>

                            <div>

                                <strong>
                                    {
                                        new Set(
                                            roleResources.map(
                                                resource =>
                                                    resource.platform
                                            )
                                        ).size
                                    }
                                </strong>

                                <span>
                                    Platforms
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                RESOURCE SECTION
            ================================================= */}

            <section className="learning-card">

                <div className="card-heading">

                    <div>

                        <h2>
                            Recommended Learning Resources
                        </h2>

                        <p className="card-subtitle">
                            Courses, videos and online material
                            selected for {role?.name}.
                        </p>

                    </div>

                    <span className="course-count">
                        {filteredResources.length} resources
                    </span>

                </div>


                {/* SEARCH */}

                <div className="course-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder={
                            `Search ${role?.name} resources...`
                        }
                        value={
                            search
                        }
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                    />

                </div>


                {/* RESOURCE LIST */}

                <div className="recommended-list">

                    {filteredResources.length ===
                    0 ? (

                        <div className="empty-learning">

                            <strong>
                                No resources found
                            </strong>

                            <span>
                                Try searching for another
                                skill or topic.
                            </span>

                        </div>

                    ) : (

                        filteredResources.map(
                            resource => (

                                <div
                                    className="recommended-course"
                                    key={
                                        resource.id
                                    }
                                >

                                    {/* ICON */}

                                    <div
                                        className={
                                            `course-thumbnail large ${getPlatformClass(
                                                resource.platform
                                            )}-icon`
                                        }
                                    >
                                        {
                                            resource.icon
                                        }
                                    </div>


                                    {/* INFO */}

                                    <div className="recommended-info">

                                        <h3>
                                            {
                                                resource.title
                                            }
                                        </h3>

                                        <div className="course-meta">

                                            <strong>
                                                {
                                                    resource.provider
                                                }
                                            </strong>

                                            <span>
                                                •
                                            </span>

                                            {
                                                resource.skill
                                            }

                                            <span>
                                                •
                                            </span>

                                            {
                                                resource.level
                                            }

                                        </div>


                                        <span className="recommendation-reason">
                                            {
                                                resource.type
                                            }
                                        </span>

                                    </div>


                                    {/* PLATFORM */}

                                    <div className="resource-platform">

                                        <span>
                                            {
                                                resource.platform
                                            }
                                        </span>

                                    </div>


                                    {/* BUTTON */}

                                    <div className="course-actions">

                                        <button
                                            className="view-course-button"
                                            onClick={() =>
                                                openResource(
                                                    resource.url
                                                )
                                            }
                                        >
                                            Open Resource →
                                        </button>

                                    </div>

                                </div>

                            )
                        )

                    )}

                </div>

            </section>


            {/* =================================================
                PRACTICE ZONE
            ================================================= */}

            <section className="learning-card">

                <div className="card-heading">

                    <div>

                        <h2>
                            Practice Zone
                        </h2>

                        <p className="card-subtitle">
                            Practice skills required for
                            {` ${role?.name}`}.
                        </p>

                    </div>

                </div>


                <div className="practice-grid">

                    {(
                        PRACTICE_DATA[
                            selectedRole
                        ] || []
                    ).map(
                        practice => (

                            <div
                                className="practice-card"
                                key={
                                    practice.title
                                }
                            >

                                <div className="practice-icon">
                                    {
                                        practice.icon
                                    }
                                </div>

                                <div>

                                    <h3>
                                        {
                                            practice.title
                                        }
                                    </h3>

                                    <p>
                                        {
                                            practice.description
                                        }
                                    </p>

                                    <button
                                        onClick={() =>
                                            startPractice(
                                                practice
                                            )
                                        }
                                    >
                                        {
                                            practice.action
                                        }
                                        {" →"}
                                    </button>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </section>



            {/* =================================================
                FOOTER TIP
            ================================================= */}

            <div className="learning-tip">

                <span>
                    💡
                </span>

                <strong>
                    Career Tip:
                </strong>

                <span>
                    Choose one career path, build strong
                    fundamentals, practice regularly and
                    create projects to demonstrate your skills.
                </span>

            </div>

        </div>
    );
}


export default LearningHub;
