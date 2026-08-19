const pool = require("../src/config/db");
console.log("🔥 NEW RESUME CONTROLLER LOADED");

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

exports.analyzeResume = async (req, res) => {
    try {
        const userId = req.user.id;

        // =====================================================
        // 1. CHECK FILE
        // =====================================================

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a resume file.",
            });
        }

        const file = req.file;

        let resumeText = "";

        // =====================================================
        // 2. EXTRACT PDF TEXT
        // =====================================================

        if (file.mimetype === "application/pdf") {
            const pdfData = await pdfParse(file.buffer);
            resumeText = pdfData.text || "";
        }

        // =====================================================
        // 3. EXTRACT DOCX TEXT
        // =====================================================

        else if (
            file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            const result = await mammoth.extractRawText({
                buffer: file.buffer,
            });

            resumeText = result.value || "";
        }

        // =====================================================
        // 4. DOC NOT SUPPORTED
        // =====================================================

        else if (file.mimetype === "application/msword") {
            return res.status(400).json({
                message:
                    "DOC files are not currently supported. Please upload PDF or DOCX.",
            });
        }

        else {
            return res.status(400).json({
                message:
                    "Unsupported file type. Please upload PDF or DOCX.",
            });
        }

        // =====================================================
        // 5. CLEAN TEXT
        // =====================================================

        const text = resumeText
            .replace(/\s+/g, " ")
            .trim();

        if (!text || text.length < 50) {
            return res.status(400).json({
                message:
                    "Could not extract enough text from the resume.",
            });
        }

        const lowerText = text.toLowerCase();

        const wordCount = text
            .split(/\s+/)
            .filter(Boolean)
            .length;

        // =====================================================
        // 6. CONTACT SCORE - 10
        // =====================================================

        let contactScore = 0;

        const hasEmail =
            /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);

        const hasPhone =
            /(?:\+91[\s-]?)?[6-9]\d{9}\b/.test(text);

        const hasLinkedIn =
            lowerText.includes("linkedin");

        const hasGithub =
            lowerText.includes("github");

        if (hasEmail) contactScore += 3;
        if (hasPhone) contactScore += 3;
        if (hasLinkedIn) contactScore += 2;
        if (hasGithub) contactScore += 2;

        // =====================================================
        // 7. SECTION SCORE - 20
        // =====================================================

        const sectionPatterns = {
            education: [
                "education",
                "academic background",
            ],

            experience: [
                "experience",
                "work experience",
                "professional experience",
            ],

            skills: [
                "skills",
                "technical skills",
                "core skills",
            ],

            projects: [
                "projects",
                "academic projects",
                "personal projects",
            ],

            summary: [
                "summary",
                "professional summary",
                "profile",
            ],

            certification: [
                "certification",
                "certifications",
            ],

            achievements: [
                "achievements",
                "accomplishments",
            ],
        };

        const foundSections = [];

        Object.entries(sectionPatterns).forEach(
            ([section, patterns]) => {
                if (
                    patterns.some((pattern) =>
                        lowerText.includes(pattern)
                    )
                ) {
                    foundSections.push(section);
                }
            }
        );

        const sectionScore = Math.min(
            Math.round(
                (foundSections.length / 7) * 20
            ),
            20
        );

        // =====================================================
        // 8. TECHNICAL SKILLS - 20
        // =====================================================

        const technicalSkills = [
            "python",
            "java",
            "javascript",
            "typescript",
            "c++",
            "c#",
            "sql",
            "postgresql",
            "mysql",
            "mongodb",
            "excel",
            "power bi",
            "tableau",
            "pandas",
            "numpy",
            "matplotlib",
            "machine learning",
            "deep learning",
            "data analysis",
            "data visualization",
            "statistics",
            "react",
            "node.js",
            "express",
            "html",
            "css",
            "git",
            "github",
            "docker",
            "aws",
            "azure",
        ];

        const foundSkills = technicalSkills.filter(
            (skill) =>
                lowerText.includes(skill)
        );

        const skillScore = Math.min(
            Math.round(
                (foundSkills.length /
                    10) *
                    20
            ),
            20
        );

        // =====================================================
        // 9. PROJECT SCORE - 15
        // =====================================================

        let projectScore = 0;

        const hasProjects =
            lowerText.includes("project") ||
            lowerText.includes("projects");

        const actionWords = [
            "developed",
            "built",
            "created",
            "implemented",
            "designed",
            "engineered",
            "deployed",
        ];

        const actionWordCount =
            actionWords.filter((word) =>
                lowerText.includes(word)
            ).length;

        if (hasProjects) {
            projectScore += 7;
        }

        if (actionWordCount >= 1) {
            projectScore += 3;
        }

        if (actionWordCount >= 3) {
            projectScore += 2;
        }

        if (
            lowerText.includes("github") ||
            lowerText.includes("deployed") ||
            lowerText.includes("live")
        ) {
            projectScore += 3;
        }

        projectScore = Math.min(
            projectScore,
            15
        );

        // =====================================================
        // 10. EXPERIENCE SCORE - 10
        // =====================================================

        let experienceScore = 0;

        const experienceKeywords = [
            "internship",
            "intern",
            "work experience",
            "professional experience",
            "employment",
        ];

        const hasExperience =
            experienceKeywords.some(
                (keyword) =>
                    lowerText.includes(keyword)
            );

        if (hasExperience) {
            experienceScore += 5;
        }

        if (
            lowerText.includes("responsible") ||
            lowerText.includes("managed") ||
            lowerText.includes("analyzed") ||
            lowerText.includes("developed") ||
            lowerText.includes("led")
        ) {
            experienceScore += 3;
        }

        if (
            /\b20\d{2}\b/.test(text)
        ) {
            experienceScore += 2;
        }

        experienceScore = Math.min(
            experienceScore,
            10
        );

        // =====================================================
        // 11. ACHIEVEMENT SCORE - 10
        // =====================================================

        let achievementScore = 0;

        const percentageMatches =
            text.match(/\b\d+(?:\.\d+)?%/g) || [];

        const numberMatches =
            text.match(
                /\b\d+(?:\.\d+)?\+?\b/g
            ) || [];

        if (percentageMatches.length >= 1) {
            achievementScore += 4;
        }

        if (numberMatches.length >= 3) {
            achievementScore += 2;
        }

        if (
            lowerText.includes("increased") ||
            lowerText.includes("reduced") ||
            lowerText.includes("improved") ||
            lowerText.includes("achieved") ||
            lowerText.includes("optimized")
        ) {
            achievementScore += 4;
        }

        achievementScore = Math.min(
            achievementScore,
            10
        );

        // =====================================================
        // 12. CONTENT QUALITY SCORE - 10
        // =====================================================

        let contentScore = 0;

        if (wordCount >= 200) {
            contentScore += 2;
        }

        if (wordCount >= 350) {
            contentScore += 2;
        }

        if (wordCount >= 500) {
            contentScore += 2;
        }

        if (wordCount >= 650) {
            contentScore += 2;
        }

        if (
            lowerText.includes("resume") ||
            lowerText.includes("curriculum vitae")
        ) {
            contentScore += 1;
        }

        if (
            lowerText.includes("skills") &&
            lowerText.includes("education")
        ) {
            contentScore += 1;
        }

        contentScore = Math.min(
            contentScore,
            10
        );

        // =====================================================
        // 13. OVERALL SCORE
        // =====================================================

        const rawScore =
            contactScore +
            sectionScore +
            skillScore +
            projectScore +
            experienceScore +
            achievementScore +
            contentScore;

        const resumeScore = Math.min(
            Math.max(
                Math.round(rawScore),
                0
            ),
            100
        );

        // =====================================================
        // 14. ATS SCORE
        // =====================================================

        let atsScore = 0;

        atsScore +=
            contactScore * 2;

        atsScore +=
            sectionScore * 2;

        atsScore +=
            contentScore * 2;

        if (wordCount >= 200) {
            atsScore += 5;
        }

        if (wordCount >= 400) {
            atsScore += 5;
        }

        atsScore = Math.min(
            Math.round(atsScore),
            100
        );

        // =====================================================
        // 15. KEYWORD SCORE
        // =====================================================

        const keywordScore = Math.min(
            Math.round(
                (foundSkills.length /
                    12) *
                    100
            ),
            100
        );

        // =====================================================
        // 16. SAVE SCORE TO DATABASE
        // =====================================================

        const updateResult =
            await pool.query(
                `
                UPDATE profiles
                SET
                    resume_score = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $2
                `,
                [
                    resumeScore,
                    userId,
                ]
            );

        if (updateResult.rowCount === 0) {
            return res.status(404).json({
                message:
                    "Profile not found for this user.",
            });
        }

        // =====================================================
        // 17. RESPONSE
        // =====================================================

        return res.status(200).json({
            message:
                "Resume analyzed successfully",

            resumeScore,

            analysis: {
                contactScore,
                sectionScore,
                skillScore,
                projectScore,
                experienceScore,
                achievementScore,
                contentScore,

                atsScore,
                keywordScore,

                wordCount,

                skillsFound:
                    foundSkills,

                sectionsFound:
                    foundSections,
            },
        });

    } catch (error) {
        console.error(
            "Resume Analysis Error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to analyze resume",

            error:
                error.message,
        });
    }
};