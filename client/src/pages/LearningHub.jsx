
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LearningHub.css";
import logoImg from "../assets/images/logo.jpeg";

/* =========================================================
   CAREER ROLES
========================================================= */

const ROLES = [
    {
        id: "software-developer",
        title: "Software Developer",
        
        color: "blue",
        description:
            "Learn programming, problem-solving, development tools and application building.",
        subtitle: "From programming basics to development interviews.",
        skills: ["Programming", "DSA", "Git & GitHub", "Web Development"],
    },
    {
        id: "data-analyst",
        title: "Data Analyst",
        
        color: "purple",
        description:
            "Learn spreadsheets, SQL, data visualization and business insights.",
        subtitle: "From data fundamentals to analytical projects and interviews.",
        skills: ["Excel", "SQL", "Power BI", "Data Analysis"],
    },
    {
        id: "cybersecurity",
        title: "Cybersecurity",
        
        color: "green",
        description:
            "Explore networking, security fundamentals, ethical labs and risk awareness.",
        subtitle: "From networking basics to security concepts and practical labs.",
        skills: ["Networking", "Linux", "Security", "Ethical Labs"],
    },
    {
        id: "cloud-devops",
        title: "Cloud / DevOps",
       
        color: "orange",
        description:
            "Understand Linux, Git, cloud services, automation and deployment.",
        subtitle: "From Linux and Git basics to cloud and deployment workflows.",
        skills: ["Linux", "Git", "Cloud", "CI/CD"],
    },
    {
        id: "ui-ux-designer",
        title: "UI/UX Designer",
        
        color: "pink",
        description:
            "Learn design principles, wireframing, prototyping and usability.",
        subtitle: "From design foundations to a portfolio and design interviews.",
        skills: ["Design Principles", "Figma", "Wireframes", "Prototyping"],
    },
];

/* =========================================================
   LEARNING RESOURCES
   Resource links are external learning websites.
========================================================= */

const RESOURCE_DATA = {
    "software-developer": [
        {
            id: "sd-1",
            title: "Programming Fundamentals",
            provider: "freeCodeCamp",
            
            skill: "Programming",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Start with programming concepts, variables, conditions, loops and functions before moving to larger applications.",
            url: "https://www.freecodecamp.org/learn/",
        },
        {
            id: "sd-2",
            title: "JavaScript Guide",
            provider: "MDN",
           
            skill: "JavaScript",
            type: "Documentation",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Learn JavaScript syntax, functions, arrays, objects, asynchronous programming and browser fundamentals.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        },
        {
            id: "sd-3",
            title: "Data Structures and Algorithms",
            provider: "GeeksforGeeks",
           
            skill: "Problem Solving",
            type: "Practice",
            duration: "Practice-based",
            level: "Beginner to Intermediate",
            description:
                "Study arrays, strings, searching, sorting, linked lists, stacks, queues and common interview problems.",
            url: "https://www.geeksforgeeks.org/data-structures/",
        },
        {
            id: "sd-4",
            title: "Git and GitHub",
            provider: "GitHub",
            
            skill: "Version Control",
            type: "Documentation",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Learn repositories, commits, branches, pull requests and how to maintain project code.",
            url: "https://docs.github.com/en/get-started",
        },
        {
            id: "sd-5",
            title: "React Learn",
            provider: "React",
            
            skill: "Web Development",
            type: "Documentation",
            duration: "Self-paced",
            level: "Intermediate",
            description:
                "Learn components, props, state, events and the fundamentals of building interactive user interfaces.",
            url: "https://react.dev/learn",
        },
        {
            id: "sd-6",
            title: "SQLBolt Interactive Lessons",
            provider: "SQLBolt",
            
            skill: "SQL",
            type: "Interactive",
            duration: "Short lessons",
            level: "Beginner",
            description:
                "Practise SQL queries, filtering, sorting, joins and aggregations through interactive exercises.",
            url: "https://sqlbolt.com/",
        },
    ],

    "data-analyst": [
        {
            id: "da-1",
            title: "Excel Training",
            provider: "Microsoft",
          
            skill: "Excel",
            type: "Documentation",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Learn spreadsheet fundamentals, formulas, tables, sorting, filtering, charts and PivotTables.",
            url: "https://support.microsoft.com/en-us/excel",
        },
        {
            id: "da-2",
            title: "SQLBolt Interactive SQL",
            provider: "SQLBolt",
            
            skill: "SQL",
            type: "Interactive",
            duration: "Short lessons",
            level: "Beginner",
            description:
                "Practise SELECT, WHERE, ORDER BY, GROUP BY, JOIN and other essential SQL query concepts.",
            url: "https://sqlbolt.com/",
        },
        {
            id: "da-3",
            title: "SQL Tutorial",
            provider: "W3Schools",
            
            skill: "SQL",
            type: "Tutorial",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Review SQL syntax and practise retrieving, filtering, grouping and combining data.",
            url: "https://www.w3schools.com/sql/",
        },
        {
            id: "da-4",
            title: "Power BI Learning",
            provider: "Microsoft",
           
            skill: "Power BI",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner to Intermediate",
            description:
                "Learn to connect data, transform tables, create visualizations and build interactive reports.",
            url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/",
        },
        {
            id: "da-5",
            title: "Data Analysis with Excel",
            provider: "Khan Academy",
            
            skill: "Data Analysis",
            type: "Learning",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Strengthen your understanding of data, patterns, comparisons and basic statistical reasoning.",
            url: "https://www.khanacademy.org/math/statistics-probability",
        },
        {
            id: "da-6",
            title: "Data Visualization Resources",
            provider: "Microsoft",
            
            skill: "Visualization",
            type: "Documentation",
            duration: "Self-paced",
            level: "Beginner to Intermediate",
            description:
                "Explore charts, report layouts, filters and visualization choices for communicating insights.",
            url: "https://learn.microsoft.com/en-us/power-bi/",
        },
    ],

    cybersecurity: [
        {
            id: "cy-1",
            title: "Networking Fundamentals",
            provider: "Cisco",
        
            skill: "Networking",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Understand networks, IP addressing, protocols, routing, switching and basic network security.",
            url: "https://www.netacad.com/",
        },
        {
            id: "cy-2",
            title: "Linux Command Line",
            provider: "Linux Journey",
           
            skill: "Linux",
            type: "Tutorial",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Learn terminal commands, files, permissions, processes and essential Linux concepts.",
            url: "https://linuxjourney.com/",
        },
        {
            id: "cy-3",
            title: "Cybersecurity Learning",
            provider: "Cisco",
            
            skill: "Security Fundamentals",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Explore common threats, security principles, digital safety and defensive security practices.",
            url: "https://www.netacad.com/",
        },
        {
            id: "cy-4",
            title: "Web Security Academy",
            provider: "PortSwigger",
          
            skill: "Web Security",
            type: "Interactive",
            duration: "Lab-based",
            level: "Beginner to Advanced",
            description:
                "Study web vulnerabilities and practise in intentionally vulnerable training labs.",
            url: "https://portswigger.net/web-security",
        },
        {
            id: "cy-5",
            title: "OWASP Top Ten",
            provider: "OWASP",
            
            skill: "Application Security",
            type: "Documentation",
            duration: "Self-paced",
            level: "Beginner to Intermediate",
            description:
                "Understand major web application security risks and ways developers can reduce them.",
            url: "https://owasp.org/www-project-top-ten/",
        },
        {
            id: "cy-6",
            title: "Guided Security Learning",
            provider: "TryHackMe",
            
            skill: "Practical Security",
            type: "Interactive",
            duration: "Lab-based",
            level: "Beginner to Intermediate",
            description:
                "Explore guided cybersecurity learning paths and practice in authorised training environments.",
            url: "https://tryhackme.com/",
        },
    ],

    "cloud-devops": [
        {
            id: "cd-1",
            title: "Linux Journey",
            provider: "Linux Journey",
           
            skill: "Linux",
            type: "Tutorial",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Learn command-line basics, file management, permissions, processes and Linux administration concepts.",
            url: "https://linuxjourney.com/",
        },
        {
            id: "cd-2",
            title: "Git and GitHub Basics",
            provider: "GitHub",
        
            skill: "Git",
            type: "Documentation",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Learn how to track changes, work with branches and collaborate on code repositories.",
            url: "https://docs.github.com/en/get-started",
        },
        {
            id: "cd-3",
            title: "AWS Cloud Practitioner",
            provider: "AWS",
            
            skill: "Cloud Fundamentals",
            type: "Course",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Build foundational knowledge of cloud computing, core AWS services, security and pricing concepts.",
            url: "https://skillbuilder.aws/",
        },
        {
            id: "cd-4",
            title: "Docker Get Started",
            provider: "Docker",
            
            skill: "Containers",
            type: "Documentation",
            duration: "Self-paced",
            level: "Beginner to Intermediate",
            description:
                "Understand container concepts and learn to build, run and manage a simple containerized application.",
            url: "https://docs.docker.com/get-started/",
        },
        {
            id: "cd-5",
            title: "Kubernetes Basics",
            provider: "Kubernetes",
           
            skill: "Orchestration",
            type: "Tutorial",
            duration: "Self-paced",
            level: "Intermediate",
            description:
                "Learn the purpose of Kubernetes and the basics of deploying and managing containerized applications.",
            url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
        },
        {
            id: "cd-6",
            title: "GitHub Actions",
            provider: "GitHub",
           
            skill: "CI/CD",
            type: "Documentation",
            duration: "Self-paced",
            level: "Beginner to Intermediate",
            description:
                "Explore automated workflows for building, testing and deploying software using GitHub Actions.",
            url: "https://docs.github.com/en/actions",
        },
    ],

    "ui-ux-designer": [
        {
            id: "ux-1",
            title: "Figma Design Basics",
            provider: "Figma",
           
            skill: "Figma",
            type: "Tutorial",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Become familiar with the design canvas, frames, shapes, text, components and prototyping tools.",
            url: "https://help.figma.com/",
        },
        {
            id: "ux-2",
            title: "Design Fundamentals",
            provider: "Interaction Design Foundation",
         
            skill: "Design Principles",
            type: "Learning",
            duration: "Self-paced",
            level: "Beginner",
            description:
                "Explore visual hierarchy, spacing, contrast, typography, consistency and user-centred design.",
            url: "https://www.interaction-design.org/",
        },
        {
            id: "ux-3",
            title: "Material Design Guidelines",
            provider: "Google",
     
            skill: "Interface Design",
            type: "Documentation",
            duration: "Self-paced",
            level: "Beginner to Intermediate",
            description:
                "Study interface patterns, layout, colour, accessibility and design components for digital products.",
            url: "https://m3.material.io/",
        },
        {
            id: "ux-4",
            title: "Nielsen Norman Group",
            provider: "NN/g",
         
            skill: "UX Research",
            type: "Articles",
            duration: "Self-paced",
            level: "Beginner to Intermediate",
            description:
                "Learn about usability, user research, usability testing, navigation and interaction design.",
            url: "https://www.nngroup.com/articles/",
        },
        {
            id: "ux-5",
            title: "Web Accessibility",
            provider: "W3C",
        
            skill: "Accessibility",
            type: "Documentation",
            duration: "Self-paced",
            level: "Beginner to Intermediate",
            description:
                "Understand accessible web design, readable content, keyboard navigation and inclusive interfaces.",
            url: "https://www.w3.org/WAI/fundamentals/",
        },
        {
            id: "ux-6",
            title: "Figma Community",
            provider: "Figma",
          
            skill: "Design Practice",
            type: "Practice",
            duration: "Practice-based",
            level: "Beginner to Intermediate",
            description:
                "Explore community design files and use them as references while practising your own layouts and prototypes.",
            url: "https://www.figma.com/community",
        },
    ],
};

/* =========================================================
   PROJECT PRACTICE DATA
========================================================= */

const PROJECT_DATA = {
    "software-developer": [
        {
            id: "sdp-1",
            title: "Personal Portfolio Website",
           
            category: "Web Development",
            level: "Beginner",
            duration: "1–2 weeks",
            description:
                "Build a responsive portfolio that introduces you, showcases your projects and provides contact information.",
            skills: ["HTML", "CSS", "JavaScript"],
            tasks: [
                "Plan the pages and sketch a simple layout.",
                "Build an introduction, skills, projects and contact section.",
                "Make the website responsive on mobile and desktop.",
                "Publish the project and add it to your portfolio.",
            ],
            resourceUrl: "https://developer.mozilla.org/en-US/docs/Learn",
        },
        {
            id: "sdp-2",
            title: "Task Management App",
          
            category: "Application Development",
            level: "Intermediate",
            duration: "2–3 weeks",
            description:
                "Create an app where users can add, update, complete and delete tasks.",
            skills: ["React", "State Management", "CSS"],
            tasks: [
                "Design a task list and task creation form.",
                "Add, edit, complete and delete tasks.",
                "Save tasks locally so they remain after refresh.",
                "Test empty states, invalid input and responsive layouts.",
            ],
            resourceUrl: "https://react.dev/learn",
        },
        {
            id: "sdp-3",
            title: "Student Record System",
           
            category: "Database Application",
            level: "Intermediate",
            duration: "2–3 weeks",
            description:
                "Create a small application for managing student records and searching information.",
            skills: ["JavaScript", "SQL", "CRUD"],
            tasks: [
                "Define the student fields and database structure.",
                "Implement adding, viewing, editing and deleting records.",
                "Add search and input validation.",
                "Document the database and test the main operations.",
            ],
            resourceUrl: "https://sqlbolt.com/",
        },
    ],

    "data-analyst": [
        {
            id: "dap-1",
            title: "Sales Performance Dashboard",
        
            category: "Business Analytics",
            level: "Beginner to Intermediate",
            duration: "1–2 weeks",
            description:
                "Analyse sales data and create a dashboard showing revenue, sales trends, product performance and regional comparisons.",
            skills: ["Excel", "SQL", "Power BI"],
            tasks: [
                "Inspect the dataset and document data quality issues.",
                "Clean and organise the data using justified steps.",
                "Calculate revenue, order counts and useful comparisons.",
                "Build a dashboard and write evidence-based insights.",
            ],
            resourceUrl: "https://learn.microsoft.com/en-us/power-bi/",
        },
        {
            id: "dap-2",
            title: "Customer Booking Analysis",
         
            category: "Exploratory Analysis",
            level: "Intermediate",
            duration: "2–3 weeks",
            description:
                "Analyse bookings, cancellations, customer ratings and revenue to identify business patterns.",
            skills: ["Excel", "SQL", "Power BI"],
            tasks: [
                "Inspect columns, data types, missing values and duplicates.",
                "Create SQL queries for business questions.",
                "Calculate booking, cancellation and revenue metrics.",
                "Build visualizations and present only supported findings.",
            ],
            resourceUrl: "https://sqlbolt.com/",
        },
        {
            id: "dap-3",
            title: "Customer Feedback Report",
           
            category: "Reporting",
            level: "Beginner",
            duration: "1–2 weeks",
            description:
                "Summarise customer feedback and ratings to identify common themes and areas for improvement.",
            skills: ["Excel", "Data Visualization", "Reporting"],
            tasks: [
                "Choose a suitable feedback dataset.",
                "Standardise fields and check missing or inconsistent entries.",
                "Summarise ratings and feedback categories.",
                "Create a report with recommendations supported by the data.",
            ],
            resourceUrl: "https://support.microsoft.com/en-us/excel",
        },
    ],

    cybersecurity: [
        {
            id: "cyp-1",
            title: "Network Traffic Basics",
       
            category: "Networking",
            level: "Beginner",
            duration: "1–2 weeks",
            description:
                "Study sample network traffic and learn how protocols, IP addresses and ports work.",
            skills: ["Networking", "Protocols", "Documentation"],
            tasks: [
                "Study IP addresses, ports and common protocols.",
                "Install or use an authorised network analysis tool.",
                "Inspect sample or personally generated traffic.",
                "Document observations without collecting private traffic.",
            ],
            resourceUrl: "https://www.wireshark.org/docs/",
        },
        {
            id: "cyp-2",
            title: "Linux Security Checklist",
         
            category: "System Security",
            level: "Beginner to Intermediate",
            duration: "1–2 weeks",
            description:
                "Create a checklist for basic account, permission, update and system security practices.",
            skills: ["Linux", "Permissions", "Security"],
            tasks: [
                "Learn basic Linux commands and file permissions.",
                "Review user accounts and update practices in a lab environment.",
                "Document safe configuration recommendations.",
                "Prepare a checklist explaining each security measure.",
            ],
            resourceUrl: "https://linuxjourney.com/",
        },
        {
            id: "cyp-3",
            title: "Web Security Learning Lab",
         
            category: "Application Security",
            level: "Intermediate",
            duration: "2–3 weeks",
            description:
                "Learn common web security issues using authorised training labs and document defensive practices.",
            skills: ["Web Security", "OWASP", "Testing"],
            tasks: [
                "Review the OWASP Top Ten categories.",
                "Choose a legal, intentionally vulnerable training lab.",
                "Complete guided exercises within the lab rules.",
                "Write a report describing the risk and mitigation.",
            ],
            resourceUrl: "https://portswigger.net/web-security",
        },
    ],

    "cloud-devops": [
        {
            id: "cdp-1",
            title: "Deploy a Static Website",
    
            category: "Cloud Fundamentals",
            level: "Beginner",
            duration: "1 week",
            description:
                "Publish a simple website and document the deployment process, configuration and result.",
            skills: ["HTML", "Git", "Cloud Hosting"],
            tasks: [
                "Create a small static website.",
                "Store the source code in a Git repository.",
                "Deploy using a suitable hosting service.",
                "Document the deployment steps and final URL.",
            ],
            resourceUrl: "https://pages.github.com/",
        },
        {
            id: "cdp-2",
            title: "Dockerise a Small App",
         
            category: "Containers",
            level: "Intermediate",
            duration: "1–2 weeks",
            description:
                "Package a small application in a container and document how to run it consistently.",
            skills: ["Docker", "Containers", "Documentation"],
            tasks: [
                "Choose a small application.",
                "Create a suitable Dockerfile.",
                "Build and run the container locally.",
                "Write instructions for building and running the app.",
            ],
            resourceUrl: "https://docs.docker.com/get-started/",
        },
        {
            id: "cdp-3",
            title: "Automated Build Workflow",
        
            category: "CI/CD",
            level: "Intermediate",
            duration: "1–2 weeks",
            description:
                "Set up a basic automated workflow that checks a repository whenever changes are pushed.",
            skills: ["GitHub Actions", "Git", "Automation"],
            tasks: [
                "Create or select a small repository.",
                "Add a workflow file to the repository.",
                "Configure a basic build or validation step.",
                "Check workflow results and document the process.",
            ],
            resourceUrl: "https://docs.github.com/en/actions",
        },
    ],

    "ui-ux-designer": [
        {
            id: "uxp-1",
            title: "Mobile App Wireframes",
         
            category: "Wireframing",
            level: "Beginner",
            duration: "1 week",
            description:
                "Design low-fidelity screens for a simple mobile app and show how a user moves between them.",
            skills: ["User Flows", "Wireframes", "Figma"],
            tasks: [
                "Choose a clear user problem.",
                "Sketch the main user flow.",
                "Create wireframes for the key screens.",
                "Review the flow for clarity and usability.",
            ],
            resourceUrl: "https://help.figma.com/",
        },
        {
            id: "uxp-2",
            title: "Website Redesign Concept",
            
            category: "Interface Design",
            level: "Beginner to Intermediate",
            duration: "1–2 weeks",
            description:
                "Redesign a website interface to improve readability, consistency and navigation.",
            skills: ["Typography", "Layout", "Visual Design"],
            tasks: [
                "Identify usability issues in an existing interface.",
                "Create a simple design brief and reference board.",
                "Design the updated screens in Figma.",
                "Explain the design decisions and compare the layouts.",
            ],
            resourceUrl: "https://m3.material.io/",
        },
        {
            id: "uxp-3",
            title: "Interactive Prototype",
           
            category: "Prototyping",
            level: "Intermediate",
            duration: "1–2 weeks",
            description:
                "Connect interface screens into a clickable prototype and test a typical user journey.",
            skills: ["Figma", "Prototyping", "Usability Testing"],
            tasks: [
                "Select a user journey to prototype.",
                "Create the main screens and interactive connections.",
                "Ask a few people to try the prototype.",
                "Record feedback and make improvements.",
            ],
            resourceUrl: "https://help.figma.com/",
        },
    ],
};

/* =========================================================
   INTERVIEW PREPARATION
========================================================= */

const INTERVIEW_DATA = [
    {
        id: "technical",
       
        title: "Technical Interview",
        description:
            "Revise role-specific concepts, explain your approach clearly and practise technical questions.",
        button: "Practise technical questions",
        route: "/interview",
    },
    {
        id: "communication",
        
        title: "HR and Communication",
        description:
            "Prepare your introduction, strengths, career goals and examples of teamwork or problem-solving.",
        button: "Practise an interview",
        route: "/interview",
    },
    {
        id: "portfolio",
       
        title: "Resume and Projects",
        description:
            "Prepare to explain your contribution, tools, decisions, challenges and results for every listed project.",
        button: "Review your resume",
        route: "/resume-builder",
    },
];

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const STORAGE_PREFIX = "careerbridge_learning_hub_v2";

const getStoredData = (key, fallback) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
};

const getRoleStorageKey = (roleId, type) =>
    `${STORAGE_PREFIX}_${roleId}_${type}`;

const getProviderClass = (provider) => {
    const value = provider.toLowerCase();

    if (value.includes("microsoft")) return "microsoft";
    if (value.includes("youtube")) return "youtube";
    if (value.includes("github")) return "github";
    if (value.includes("react")) return "react";
    if (value.includes("docker")) return "docker";
    if (value.includes("aws")) return "aws";
    if (value.includes("kubernetes")) return "kubernetes";
    if (value.includes("figma")) return "figma";
    if (value.includes("cisco")) return "cisco";
    if (value.includes("portswigger")) return "portswigger";
    if (value.includes("tryhackme")) return "tryhackme";
    if (value.includes("owasp")) return "owasp";
    if (value.includes("sqlbolt")) return "sqlbolt";
    if (value.includes("linux")) return "linux";
    if (value.includes("khan")) return "khan-academy";
    if (value.includes("freecodecamp")) return "freecodecamp";

    return "default";
};

/* =========================================================
   LEARNING HUB COMPONENT
========================================================= */

export default function LearningHub() {
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = useState(() => {
        const savedRole = getStoredData("careerbridge_role", "data-analyst");

        return ROLES.some((role) => role.id === savedRole)
            ? savedRole
            : "data-analyst";
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [showCompletedOnly, setShowCompletedOnly] = useState(false);

    const [completedResources, setCompletedResources] = useState(() =>
        getStoredData(
            getRoleStorageKey(
                getStoredData("careerbridge_role", "data-analyst"),
                "resources"
            ),
            []
        )
    );

    const [completedProjects, setCompletedProjects] = useState(() =>
        getStoredData(
            getRoleStorageKey(
                getStoredData("careerbridge_role", "data-analyst"),
                "projects"
            ),
            []
        )
    );

    const [expandedProjects, setExpandedProjects] = useState([]);

    const role =
        ROLES.find((item) => item.id === selectedRole) || ROLES[1];

    const resources = RESOURCE_DATA[selectedRole] || [];
    const projects = PROJECT_DATA[selectedRole] || [];

    const filters = useMemo(() => {
        const types = [...new Set(resources.map((item) => item.type))];
        return ["All", ...types];
    }, [resources]);

    /* Save selected role and progress */

    useEffect(() => {
        try {
            localStorage.setItem("careerbridge_role", selectedRole);
            localStorage.setItem(
                getRoleStorageKey(selectedRole, "resources"),
                JSON.stringify(completedResources)
            );
            localStorage.setItem(
                getRoleStorageKey(selectedRole, "projects"),
                JSON.stringify(completedProjects)
            );
        } catch {
            // The page remains usable if browser storage is unavailable.
        }
    }, [selectedRole, completedResources, completedProjects]);

    /* Change role and load that role's saved progress */

    const handleRoleChange = (roleId) => {
        if (!RESOURCE_DATA[roleId]) return;

        setSelectedRole(roleId);
        setSearchQuery("");
        setActiveFilter("All");
        setShowCompletedOnly(false);
        setExpandedProjects([]);

        setCompletedResources(
            getStoredData(getRoleStorageKey(roleId, "resources"), [])
        );

        setCompletedProjects(
            getStoredData(getRoleStorageKey(roleId, "projects"), [])
        );

        try {
            localStorage.setItem("careerbridge_role", roleId);
        } catch {
            // Role selection still works for the current session.
        }
    };

    /* Filter resource cards */

    const filteredResources = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return resources.filter((resource) => {
            const searchableText = [
                resource.title,
                resource.provider,
                resource.skill,
                resource.type,
                resource.level,
                resource.description,
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                query === "" || searchableText.includes(query);

            const matchesFilter =
                activeFilter === "All" || resource.type === activeFilter;

            const matchesCompletion =
                !showCompletedOnly ||
                completedResources.includes(resource.id);

            return (
                matchesSearch &&
                matchesFilter &&
                matchesCompletion
            );
        });
    }, [
        resources,
        searchQuery,
        activeFilter,
        showCompletedOnly,
        completedResources,
    ]);

    /* Progress calculations */

    const completedResourceCount = resources.filter((resource) =>
        completedResources.includes(resource.id)
    ).length;

    const completedProjectCount = projects.filter((project) =>
        completedProjects.includes(project.id)
    ).length;

    const totalTrackedItems = resources.length + projects.length;

    const totalCompletedItems =
        completedResourceCount + completedProjectCount;

    const progressPercentage =
        totalTrackedItems > 0
            ? Math.round(
                  (totalCompletedItems / totalTrackedItems) * 100
              )
            : 0;

    const remainingResources = resources.length - completedResourceCount;

    /* Mark a resource as complete or incomplete */

    const toggleResourceCompletion = (resourceId) => {
        setCompletedResources((previous) =>
            previous.includes(resourceId)
                ? previous.filter((id) => id !== resourceId)
                : [...previous, resourceId]
        );
    };

    /* Mark a project as complete or incomplete */

    const toggleProjectCompletion = (projectId) => {
        setCompletedProjects((previous) =>
            previous.includes(projectId)
                ? previous.filter((id) => id !== projectId)
                : [...previous, projectId]
        );
    };

    /* Expand or collapse project task list */

    const toggleProjectExpanded = (projectId) => {
        setExpandedProjects((previous) =>
            previous.includes(projectId)
                ? previous.filter((id) => id !== projectId)
                : [...previous, projectId]
        );
    };

    /* Navigate to another CareerBridge page */

    const handleNavigate = (path) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* Scroll to the resource library */

    const scrollToResources = () => {
        document
            .getElementById("learning-resources")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const firstIncompleteResource = resources.find(
        (resource) => !completedResources.includes(resource.id)
    );

    const firstIncompleteProject = projects.find(
        (project) => !completedProjects.includes(project.id)
    );

    const nextStepTitle = firstIncompleteResource
        ? firstIncompleteResource.title
        : firstIncompleteProject
          ? firstIncompleteProject.title
          : "Review your interview preparation";

    const nextStepDescription = firstIncompleteResource
        ? `Continue your ${role.title} learning path with ${firstIncompleteResource.title}. Mark resources complete as you study.`
        : firstIncompleteProject
          ? `Your resources are complete. Start building ${firstIncompleteProject.title} to apply what you have learned.`
          : "You have completed the listed resources and projects for this role. Review your work and practise explaining it for interviews.";

    return (
        <div className="learning-hub-page">
           

            {/* ================= COMPACT HERO ================= */}

            <section className="learning-hero">
                <div className="learning-hero-content">
                    <div className="learning-eyebrow">
                        <span className="learning-eyebrow-dot" />
                        YOUR PERSONAL LEARNING SPACE
                    </div>

                    <h1>
                        Learn skills.
                        <br />
                        <span>Build your future.</span>
                    </h1>

                    <p className="learning-hero-description">
                        Explore curated learning resources, practise real
                        skills and build portfolio projects for your chosen
                        career. Track your progress and prepare for
                        placements at your own pace.
                    </p>

                    <div className="learning-hero-actions">
                        <button
                            type="button"
                            className="learning-primary-button"
                            onClick={scrollToResources}
                        >
                            Explore resources <span>→</span>
                        </button>

                        <button
                            type="button"
                            className="learning-secondary-button"
                            onClick={() =>
                                handleNavigate("/career-roadmap")
                            }
                        >
                            View career roadmap
                        </button>
                    </div>

                    <div className="learning-hero-points">
                        <span>
                            <span className="learning-check">✓</span>
                            Role-specific resources
                        </span>

                        <span>
                            <span className="learning-check">✓</span>
                            Practical project ideas
                        </span>

                        <span>
                            <span className="learning-check">✓</span>
                            Saved progress
                        </span>
                    </div>
                </div>

                <div
                    className="learning-hero-visual"
                    aria-hidden="true"
                >
                    <div className="learning-orbit learning-orbit-one" />
                    <div className="learning-orbit learning-orbit-two" />

                    <div className="learning-hero-center">
                        
                        <span className="learning-hero-center-label">
                            YOUR NEXT CHAPTER
                        </span>
                        <strong>Starts here</strong>
                    </div>

                    <div className="learning-float-card learning-float-top">
                        
                        <div>
                            <strong>Clear goals</strong>
                            <span>Learn with purpose</span>
                        </div>
                    </div>

                    <div className="learning-float-card learning-float-bottom">
                        
                        <div>
                            <strong>Real practice</strong>
                            <span>Turn skills into projects</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= STEP 1: ROLE SELECTOR ================= */}

            <section className="learning-section learning-role-section">
                <div className="learning-section-heading">
                    <div>
                        <span className="learning-section-kicker">
                            STEP 01
                        </span>

                        <h2>Choose your career path</h2>

                        <p>
                            Select the role you want to prepare for. Your
                            learning resources, projects and progress will
                            update according to your selection.
                        </p>
                    </div>
                </div>

                <div className="learning-role-grid">
                    {ROLES.map((item) => {
                        const isSelected = selectedRole === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={`learning-role-card ${item.color} ${
                                    isSelected ? "selected" : ""
                                }`}
                                onClick={() => handleRoleChange(item.id)}
                                aria-pressed={isSelected}
                            >
                                <div className="learning-role-card-top">
                                    <span className="learning-role-icon">
                                        {item.icon}
                                    </span>

                                    <span
                                        className={`learning-role-radio ${
                                            isSelected ? "checked" : ""
                                        }`}
                                    >
                                        {isSelected ? "✓" : ""}
                                    </span>
                                </div>

                                <strong>{item.title}</strong>

                                <span className="learning-role-description">
                                    {item.description}
                                </span>

                                <span className="learning-role-action">
                                    {isSelected
                                        ? "Currently selected"
                                        : "Explore this path"}
                                    <span>→</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ================= SELECTED ROLE ================= */}

            <section className="learning-selected-role">
                <div className="learning-selected-role-icon">
                    {role.icon}
                </div>

                <div className="learning-selected-role-copy">
                    <span className="learning-section-kicker">
                        YOUR SELECTED CAREER
                    </span>

                    <h2>{role.title}</h2>

                    <p>{role.subtitle}</p>
                </div>

                <button
                    type="button"
                    className="learning-outline-button"
                    onClick={() =>
                        handleNavigate("/career-roadmap")
                    }
                >
                    Open career roadmap <span>→</span>
                </button>
            </section>

            {/* ================= PROGRESS DASHBOARD ================= */}

            <section className="learning-section learning-progress-section">
                <div className="learning-section-heading">
                    <div>
                        <span className="learning-section-kicker">
                            YOUR ACTIVITY
                        </span>

                        <h2>Your learning progress</h2>

                        <p>
                            Your progress is saved in this browser for each
                            career path. Mark resources and projects complete
                            as you work through them.
                        </p>
                    </div>
                </div>

                <div className="learning-progress-dashboard">
                    <div className="learning-progress-main">
                        <div
                            className="learning-progress-ring"
                            style={{
                                background: `conic-gradient(#7c3aed ${progressPercentage}%, #eee9f6 ${progressPercentage}% 100%)`,
                            }}
                            role="img"
                            aria-label={`${progressPercentage}% of tracked learning items completed`}
                        >
                            <div className="learning-progress-ring-inner">
                                <strong>{progressPercentage}%</strong>
                                <span>completed</span>
                            </div>
                        </div>

                        <div className="learning-progress-message">
                            <h3>
                                {progressPercentage === 100
                                    ? "Great work! Path completed"
                                    : "Keep moving forward"}
                            </h3>

                            <p>
                                You have completed {totalCompletedItems} of{" "}
                                {totalTrackedItems} tracked learning items
                                for {role.title}.
                            </p>

                            <div
                                className="learning-progress-bar"
                                role="progressbar"
                                aria-valuenow={progressPercentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label="Overall learning progress"
                            >
                                <span
                                    style={{
                                        width: `${progressPercentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="learning-progress-stat">
                        <span className="learning-stat-icon purple">
                           
                        </span>

                        <strong>
                            {completedResourceCount}/{resources.length}
                        </strong>

                        <span>Resources completed</span>

                        <small>
                            {remainingResources} remaining
                        </small>
                    </div>

                    <div className="learning-progress-stat">
                        <span className="learning-stat-icon orange">
                           
                        </span>

                        <strong>
                            {completedProjectCount}/{projects.length}
                        </strong>

                        <span>Projects completed</span>

                        <small>Build practical experience</small>
                    </div>

                    <div className="learning-progress-stat">
                        <span className="learning-stat-icon green">
                           
                        </span>

                        <strong>{role.skills.length}</strong>

                        <span>Core skill areas</span>

                        <small>{role.title} preparation</small>
                    </div>
                </div>
            </section>

            {/* ================= RESOURCE LIBRARY ================= */}

            <section
                className="learning-section learning-resources-section"
                id="learning-resources"
            >
                <div className="learning-section-heading learning-resources-heading">
                    <div>
                        <span className="learning-section-kicker">
                            STEP 02
                        </span>

                        <h2>Explore learning resources</h2>

                        <p>
                            Learn the concepts required for {role.title}.
                            Choose a resource, study at your own pace and
                            mark it complete when you finish.
                        </p>
                    </div>

                    <div className="learning-resource-count">
                        <strong>{filteredResources.length}</strong>
                        <span>
                            {filteredResources.length === 1
                                ? "resource shown"
                                : "resources shown"}
                        </span>
                    </div>
                </div>

                <div className="learning-resource-toolbar">
                    <label className="learning-search-box">
                        <span aria-hidden="true">⌕</span>

                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            placeholder="Search skills, topics or resources..."
                            aria-label="Search learning resources"
                        />

                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </label>

                    <label className="learning-completed-filter">
                        <input
                            type="checkbox"
                            checked={showCompletedOnly}
                            onChange={(event) =>
                                setShowCompletedOnly(event.target.checked)
                            }
                        />

                        Completed only
                    </label>
                </div>

                <div
                    className="learning-filter-list"
                    aria-label="Filter resources by type"
                >
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            className={`learning-filter-chip ${
                                activeFilter === filter ? "active" : ""
                            }`}
                            onClick={() => setActiveFilter(filter)}
                            aria-pressed={activeFilter === filter}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {filteredResources.length > 0 ? (
                    <div className="learning-resource-grid">
                        {filteredResources.map((resource) => {
                            const isCompleted = completedResources.includes(
                                resource.id
                            );

                            return (
                                <article
                                    key={resource.id}
                                    className={`learning-resource-card ${
                                        isCompleted ? "completed" : ""
                                    }`}
                                >
                                    <div className="learning-resource-card-top">
                                        <span
                                            className={`learning-provider-icon ${getProviderClass(
                                                resource.provider
                                            )}`}
                                            aria-hidden="true"
                                        >
                                            {resource.icon}
                                        </span>

                                        <span
                                            className={`learning-resource-type ${resource.type.toLowerCase().replace(/\s+/g, "-")}`}
                                        >
                                            {resource.type}
                                        </span>
                                    </div>

                                    <div className="learning-resource-content">
                                        <span className="learning-resource-skill">
                                            {resource.skill}
                                        </span>

                                        <h3>{resource.title}</h3>

                                        <p>{resource.description}</p>

                                        <div className="learning-resource-meta">
                                            <span>
                                                
                                                {resource.provider}
                                            </span>

                                            <span>
                                                
                                                {resource.level}
                                            </span>
                                        </div>

                                        <div className="learning-resource-duration">
                                            Duration: {resource.duration}
                                        </div>
                                    </div>

                                    <div className="learning-resource-actions">
                                        <button
                                            type="button"
                                            className="learning-resource-open"
                                            onClick={() =>
                                                window.open(
                                                    resource.url,
                                                    "_blank",
                                                    "noopener,noreferrer"
                                                )
                                            }
                                        >
                                            Open resource <span>↗</span>
                                        </button>

                                        <button
                                            type="button"
                                            className={`learning-mark-button ${
                                                isCompleted ? "is-complete" : ""
                                            }`}
                                            onClick={() =>
                                                toggleResourceCompletion(
                                                    resource.id
                                                )
                                            }
                                            aria-label={
                                                isCompleted
                                                    ? `Mark ${resource.title} as incomplete`
                                                    : `Mark ${resource.title} as complete`
                                            }
                                            title={
                                                isCompleted
                                                    ? "Mark incomplete"
                                                    : "Mark complete"
                                            }
                                        >
                                            {isCompleted ? "✓" : "○"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="learning-empty-state">
                       
                        <h3>No resources found</h3>

                        <p>
                            Try another search term, select a different
                            resource type or clear the completed-only filter.
                        </p>

                        <button
                            type="button"
                            className="learning-primary-button"
                            onClick={() => {
                                setSearchQuery("");
                                setActiveFilter("All");
                                setShowCompletedOnly(false);
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </section>

            {/* ================= PRACTICAL PROJECTS ================= */}

            <section className="learning-section learning-projects-section">
                <div className="learning-section-heading">
                    <div>
                        <span className="learning-section-kicker">
                            STEP 03
                        </span>

                        <h2>Practise with real projects</h2>

                        <p>
                            Apply the concepts you learn through practical
                            projects. Each project includes suggested tasks
                            to help you plan and complete your work.
                        </p>
                    </div>
                </div>

                <div className="learning-project-grid">
                    {projects.map((project, index) => {
                        const isCompleted = completedProjects.includes(
                            project.id
                        );

                        const isExpanded = expandedProjects.includes(
                            project.id
                        );

                        return (
                            <article
                                key={project.id}
                                className={`learning-project-card ${
                                    isCompleted ? "completed" : ""
                                }`}
                            >
                                <div className="learning-project-top">
                                    <span className="learning-project-icon">
                                        {project.icon}
                                    </span>

                                    <span className="learning-project-number">
                                        PROJECT {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>

                                <span className="learning-project-category">
                                    {project.category}
                                </span>

                                <h3>{project.title}</h3>

                                <p>{project.description}</p>

                                <div className="learning-project-badges">
                                    <span>{project.level}</span>
                                    <span>{project.duration}</span>

                                    {isCompleted && (
                                        <span className="learning-done-badge">
                                            ✓ Completed
                                        </span>
                                    )}
                                </div>

                                <div className="learning-project-badges">
                                    {project.skills.map((skill) => (
                                        <span key={skill}>{skill}</span>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="learning-project-expand"
                                    onClick={() =>
                                        toggleProjectExpanded(project.id)
                                    }
                                    aria-expanded={isExpanded}
                                >
                                    {isExpanded
                                        ? "Hide project tasks"
                                        : "View project tasks"}

                                    <span>{isExpanded ? "−" : "+"}</span>
                                </button>

                                {isExpanded && (
                                    <div className="learning-project-task-panel">
                                        <h4>Suggested project plan</h4>

                                        <ol>
                                            {project.tasks.map(
                                                (task, taskIndex) => (
                                                    <li key={taskIndex}>
                                                        {task}
                                                    </li>
                                                )
                                            )}
                                        </ol>

                                        <button
                                            type="button"
                                            className="learning-project-resource-link"
                                            onClick={() =>
                                                window.open(
                                                    project.resourceUrl,
                                                    "_blank",
                                                    "noopener,noreferrer"
                                                )
                                            }
                                        >
                                            Open learning reference ↗
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className={`learning-project-complete ${
                                        isCompleted ? "is-complete" : ""
                                    }`}
                                    onClick={() =>
                                        toggleProjectCompletion(project.id)
                                    }
                                >
                                    {isCompleted
                                        ? "✓ Project completed"
                                        : "Mark project complete"}
                                </button>
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* ================= PERSONAL NEXT STEP ================= */}

            <section className="learning-next-step">
                <div className="learning-next-step-icon"></div>

                <div className="learning-next-step-copy">
                    <span className="learning-section-kicker">
                        YOUR NEXT STEP
                    </span>

                    <h2>{nextStepTitle}</h2>

                    <p>{nextStepDescription}</p>

                    <button
                        type="button"
                        className="learning-primary-button"
                        onClick={() => {
                            if (firstIncompleteResource) {
                                window.open(
                                    firstIncompleteResource.url,
                                    "_blank",
                                    "noopener,noreferrer"
                                );
                            } else if (firstIncompleteProject) {
                                document
                                    .querySelector(".learning-projects-section")
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                    });

                                setExpandedProjects((previous) =>
                                    previous.includes(firstIncompleteProject.id)
                                        ? previous
                                        : [
                                              ...previous,
                                              firstIncompleteProject.id,
                                          ]
                                );
                            } else {
                                document
                                    .querySelector(".learning-interview-section")
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                    });
                            }
                        }}
                    >
                        Continue learning <span>→</span>
                    </button>
                </div>
            </section>

           

            {/* ================= FOOTER ================= */}

            <footer className="learning-hub-footer">
    <div className="learning-footer-brand">
        <img
            src={logoImg}
            alt="CareerBridge Logo"
            className="learning-footer-logo"
        />

        <div>
            <strong>CareerBridge</strong>
            
        </div>
    </div>

   
    <button
        type="button"
        className="learning-footer-top"
        onClick={() =>
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            })
        }
    >
        Back to top ↑
    </button>
</footer>
        </div>
    );
}

