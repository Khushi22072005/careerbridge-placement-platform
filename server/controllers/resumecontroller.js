const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

// Common skills to look for in a resume.
const SKILLS = [
    "JavaScript",
    "React",
    "Node.js",
    "Express.js",
    "HTML",
    "CSS",
    "Java",
    "Python",
    "C++",
    "C",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Excel",
    "Power BI",
    "Tableau",
    "Pandas",
    "NumPy",
    "Machine Learning",
    "Data Analysis",
    "Data Visualization",
    "Artificial Intelligence",
    "Git",
    "GitHub",
    "REST API",
    "Android Studio",
    "Flutter",
    "Firebase",
    "AWS",
    "Communication",
    "Problem Solving",
    "Leadership",
    "Teamwork"
];

// Common resume sections.
const SECTION_PATTERNS = [
    ["Contact Information", /\b(email|phone|mobile|linkedin|github)\b/i],
    [
        "Summary / Objective",
        /\b(summary|career objective|professional profile|objective)\b/i
    ],
    ["Education", /\b(education|academic background|qualification)\b/i],
    [
        "Skills",
        /\b(technical skills|skills|core competencies|key skills)\b/i
    ],
    [
        "Projects",
        /\b(projects|academic projects|personal projects)\b/i
    ],
    [
        "Experience",
        /\b(experience|work history|internship|employment)\b/i
    ],
    [
        "Certifications",
        /\b(certifications|certificates|courses|training)\b/i
    ],
    [
        "Achievements",
        /\b(achievements|awards|accomplishments|publications)\b/i
    ]
];

function unique(items) {
    return [...new Set(items)];
}

function analyzeResumeText(text) {
    const cleanText = text.replace(/\s+/g, " ").trim();
    const lowerText = cleanText.toLowerCase();

    if (cleanText.length < 40) {
        const error = new Error(
            "Very little text could be extracted. This PDF may be scanned or image-based. Please upload a text-based PDF or DOCX file."
        );

        error.statusCode = 422;
        throw error;
    }

    // Detect common skills.
    const skillsFound = SKILLS.filter(skill =>
        lowerText.includes(skill.toLowerCase())
    );

    // Detect standard resume sections.
    const sectionsFound = SECTION_PATTERNS
        .filter(([, pattern]) => pattern.test(cleanText))
        .map(([name]) => name);

    let score = 0;

    // Contact details: 15 points.
    const hasEmail =
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(cleanText);

    const hasPhone =
        /(?:\+\s*)?\d[\d\s().-]{7,}\d/.test(cleanText);

    if (hasEmail) score += 8;
    if (hasPhone) score += 7;

    // Standard resume sections: 30 points.
    const sectionPoints = {
        "Summary / Objective": 4,
        "Education": 6,
        "Skills": 6,
        "Projects": 6,
        "Experience": 4,
        "Certifications": 2,
        "Achievements": 2
    };

    for (const section of sectionsFound) {
        score += sectionPoints[section] || 0;
    }

    // Skills: maximum 20 points.
    score += Math.min(20, skillsFound.length * 2);

    // Resume content length: maximum 15 points.
    const wordCount = cleanText
        .split(/\s+/)
        .filter(Boolean).length;

    if (wordCount >= 250) score += 5;
    if (wordCount >= 400) score += 5;
    if (wordCount >= 600) score += 5;

    // Projects and experience details: 10 points.
    if (/\b(project|developed|created|built|implemented)\b/i.test(cleanText)) {
        score += 5;
    }

    if (
        /\b(intern|experience|responsibilities|worked|contributed)\b/i.test(
            cleanText
        )
    ) {
        score += 5;
    }

    // Measurable results and achievements: 10 points.
    const hasMeasurableResults =
        /\b(\d+(?:\.\d+)?%|\d+\+|increased|reduced|improved|achieved|ranked)\b/i
            .test(cleanText);

    if (hasMeasurableResults) {
        score += 10;
    }

    // Ensure the score remains within 0–100.
    score = Math.min(100, score);

    const strengths = [];
    const improvements = [];

    // Contact information.
    if (hasEmail && hasPhone) {
        strengths.push(
            "Contact details appear to be present."
        );
    } else {
        improvements.push(
            "Add a valid email address and phone number."
        );
    }

    // Education.
    if (sectionsFound.includes("Education")) {
        strengths.push(
            "An education section was detected."
        );
    } else {
        improvements.push(
            "Add a clearly labelled Education section."
        );
    }

    // Skills.
    if (sectionsFound.includes("Skills") && skillsFound.length > 0) {
        strengths.push(
            `Detected ${skillsFound.length} common skills in your resume.`
        );
    } else {
        improvements.push(
            "Add a clearly labelled Skills section with relevant skills."
        );
    }

    // Projects.
    if (sectionsFound.includes("Projects")) {
        strengths.push(
            "A projects section was detected."
        );
    } else {
        improvements.push(
            "Include academic or personal projects and explain your contribution."
        );
    }

    // Experience.
    if (sectionsFound.includes("Experience")) {
        strengths.push(
            "An experience or internship section was detected."
        );
    } else {
        improvements.push(
            "Add relevant internship, training, volunteering, or practical experience if available."
        );
    }

    // Measurable achievements.
    if (hasMeasurableResults) {
        strengths.push(
            "The resume appears to include measurable outcomes or achievements."
        );
    } else {
        improvements.push(
            "Where possible, describe project results using specific numbers or measurable outcomes."
        );
    }

    // Content length.
    if (wordCount < 250) {
        improvements.push(
            "Check whether important education, skills, and project details are missing."
        );
    }

    return {
        resumeScore: score,
        skillsFound: unique(skillsFound),
        sectionsFound: unique(sectionsFound),
        strengths: unique(strengths),
        improvements: unique(improvements),
        wordCount
    };
}

exports.analyzeResume = async (req, res) => {
    let parser;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a PDF or DOCX resume."
            });
        }

        const fileName = req.file.originalname || "";
        const extension = fileName.split(".").pop().toLowerCase();

        let extractedText = "";

        // Extract text from PDF using pdf-parse v2.
        if (extension === "pdf") {
            if (typeof PDFParse !== "function") {
                throw new Error(
                    "PDFParse is unavailable. Check the installed pdf-parse package."
                );
            }

            parser = new PDFParse({
                data: req.file.buffer
            });

            try {
                const pdfData = await parser.getText();
                extractedText = pdfData.text || "";
            } finally {
                await parser.destroy();
                parser = undefined;
            }
        }

        // Extract text from DOCX.
        else if (extension === "docx") {
            const docxData = await mammoth.extractRawText({
                buffer: req.file.buffer
            });

            extractedText = docxData.value || "";
        }

        // Reject unsupported formats.
        else {
            return res.status(400).json({
                message: "Unsupported file format. Please upload PDF or DOCX."
            });
        }

        // Analyze the extracted resume text.
        const analysis = analyzeResumeText(extractedText);

        return res.status(200).json({
            message: "Resume analyzed successfully.",
            analysis
        });
    } catch (error) {
        console.error("Resume analysis error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Unable to analyze the uploaded resume. Please check the file and try again."
        });
    } finally {
        // Clean up the parser if extraction failed before normal cleanup.
        if (parser) {
            try {
                await parser.destroy();
            } catch (cleanupError) {
                console.error(
                    "PDF parser cleanup error:",
                    cleanupError.message
                );
            }
        }
    }
};
