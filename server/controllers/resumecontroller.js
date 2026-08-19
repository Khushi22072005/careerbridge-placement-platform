const pool = require("../src/config/db");

console.log("🔥 NEW RESUME CONTROLLER LOADED");

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

exports.analyzeResume = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log("\n========================================");
        console.log("📄 RESUME ANALYSIS STARTED");
        console.log("========================================");

        // =====================================================
        // 1. CHECK FILE
        // =====================================================

        if (!req.file) {
            console.log("❌ No resume file received");

            return res.status(400).json({
                message: "Please upload a resume file.",
            });
        }

        const file = req.file;

        console.log("📁 File name:", file.originalname);
        console.log("📦 File type:", file.mimetype);
        console.log(
            "📏 File size:",
            (file.size / 1024 / 1024).toFixed(2),
            "MB"
        );

        let resumeText = "";

        // =====================================================
        // 2. EXTRACT PDF TEXT
        // =====================================================

        if (file.mimetype === "application/pdf") {
            console.log("📕 Processing PDF...");

            try {
                const pdfData = await pdfParse(file.buffer);

                console.log(
                    "📊 PDF pages:",
                    pdfData.numpages
                );

                console.log(
                    "📝 Extracted raw text length:",
                    pdfData.text
                        ? pdfData.text.length
                        : 0
                );

                console.log(
                    "📝 Extracted PDF text preview:"
                );

                console.log(
                    pdfData.text
                        ? pdfData.text.substring(0, 1000)
                        : "NO TEXT EXTRACTED"
                );

                resumeText = pdfData.text || "";

            } catch (pdfError) {
                console.error(
                    "❌ PDF parsing error:",
                    pdfError
                );

                return res.status(400).json({
                    message:
                        "Unable to read the uploaded PDF.",
                    error:
                        pdfError.message,
                });
            }
        }

        // =====================================================
        // 3. EXTRACT DOCX TEXT
        // =====================================================

        else if (
            file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            console.log("📘 Processing DOCX...");

            try {
                const result =
                    await mammoth.extractRawText({
                        buffer: file.buffer,
                    });

                resumeText =
                    result.value || "";

                console.log(
                    "📝 DOCX text length:",
                    resumeText.length
                );

            } catch (docxError) {
                console.error(
                    "❌ DOCX parsing error:",
                    docxError
                );

                return res.status(400).json({
                    message:
                        "Unable to read the uploaded DOCX file.",
                    error:
                        docxError.message,
                });
            }
        }

        // =====================================================
        // 4. DOC NOT SUPPORTED
        // =====================================================

        else if (
            file.mimetype ===
            "application/msword"
        ) {
            return res.status(400).json({
                message:
                    "DOC files are not currently supported. Please upload PDF or DOCX.",
            });
        }

        // =====================================================
        // 5. OTHER FILE TYPES
        // =====================================================

        else {
            return res.status(400).json({
                message:
                    "Unsupported file type. Please upload PDF or DOCX.",
            });
        }

        // =====================================================
        // 6. CLEAN EXTRACTED TEXT
        // =====================================================

        const text = resumeText
            .replace(/\u0000/g, " ")
            .replace(/\r/g, " ")
            .replace(/\n+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        console.log(
            "🧹 Cleaned text length:",
            text.length
        );

        console.log(
            "📄 FINAL EXTRACTED TEXT:"
        );

        console.log(text.substring(0, 2000));

        // =====================================================
        // 7. CHECK EXTRACTED TEXT
        // =====================================================

        if (!text || text.length < 20) {
            console.log(
                "❌ PDF contains insufficient extractable text."
            );

            return res.status(400).json({
                message:
                    "Could not extract enough text from the resume.",
                extractedCharacters:
                    text.length,
                suggestion:
                    "The uploaded PDF may contain image-based content or text that cannot be extracted.",
            });
        }

        console.log(
            "✅ Resume text successfully extracted."
        );

        // =====================================================
        // 8. LOWERCASE TEXT
        // =====================================================

        const lowerText =
            text.toLowerCase();

        // =====================================================
        // 9. WORD COUNT
        // =====================================================

        const wordCount = text
            .split(/\s+/)
            .filter(Boolean)
            .length;

        console.log(
            "🔢 Word count:",
            wordCount
        );

        // =====================================================
        // 10. CONTACT SCORE - 10
        // =====================================================

        let contactScore = 0;

        const hasEmail =
            /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(
                text
            );

        const hasPhone =
            /(?:\+91[\s-]?)?[6-9]\d{9}\b/.test(
                text
            );

        const hasLinkedIn =
            lowerText.includes("linkedin");

        const hasGithub =
            lowerText.includes("github");

        if (hasEmail) contactScore += 3;
        if (hasPhone) contactScore += 3;
        if (hasLinkedIn) contactScore += 2;
        if (hasGithub) contactScore += 2;

        // =====================================================
        // 11. SECTION SCORE - 20
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
                "project",
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

        Object.entries(
            sectionPatterns
        ).forEach(
            ([section, patterns]) => {
                if (
                    patterns.some(
                        (pattern) =>
                            lowerText.includes(
                                pattern
                            )
                    )
                ) {
                    foundSections.push(
                        section
                    );
                }
            }
        );

        const sectionScore = Math.min(
            Math.round(
                (foundSections.length / 7) *
                    20
            ),
            20
        );

        // =====================================================
        // 12. TECHNICAL SKILLS - 20
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

        const foundSkills =
            technicalSkills.filter(
                (skill) =>
                    lowerText.includes(
                        skill
                    )
            );

        const skillScore = Math.min(
            Math.round(
                (foundSkills.length / 10) *
                    20
            ),
            20
        );

        // =====================================================
        // 13. PROJECT SCORE - 15
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
            "develop",
            "build",
            "create",
        ];

        const actionWordCount =
            actionWords.filter(
                (word) =>
                    lowerText.includes(
                        word
                    )
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
        // 14. EXPERIENCE SCORE - 10
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
                    lowerText.includes(
                        keyword
                    )
            );

        if (hasExperience) {
            experienceScore += 5;
        }

        if (
            lowerText.includes(
                "responsible"
            ) ||
            lowerText.includes(
                "managed"
            ) ||
            lowerText.includes(
                "analyzed"
            ) ||
            lowerText.includes(
                "developed"
            ) ||
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
        // 15. ACHIEVEMENT SCORE - 10
        // =====================================================

        let achievementScore = 0;

        const percentageMatches =
            text.match(
                /\b\d+(?:\.\d+)?%/g
            ) || [];

        const numberMatches =
            text.match(
                /\b\d+(?:\.\d+)?\+?\b/g
            ) || [];

        if (
            percentageMatches.length >= 1
        ) {
            achievementScore += 4;
        }

        if (
            numberMatches.length >= 3
        ) {
            achievementScore += 2;
        }

        if (
            lowerText.includes(
                "increased"
            ) ||
            lowerText.includes(
                "reduced"
            ) ||
            lowerText.includes(
                "improved"
            ) ||
            lowerText.includes(
                "achieved"
            ) ||
            lowerText.includes(
                "optimized"
            )
        ) {
            achievementScore += 4;
        }

        achievementScore = Math.min(
            achievementScore,
            10
        );

        // =====================================================
        // 16. CONTENT QUALITY SCORE - 10
        // =====================================================

        let contentScore = 0;

        if (wordCount >= 100) {
            contentScore += 2;
        }

        if (wordCount >= 250) {
            contentScore += 2;
        }

        if (wordCount >= 400) {
            contentScore += 2;
        }

        if (wordCount >= 550) {
            contentScore += 2;
        }

        if (
            lowerText.includes("resume") ||
            lowerText.includes(
                "curriculum vitae"
            )
        ) {
            contentScore += 1;
        }

        if (
            lowerText.includes("skills") &&
            lowerText.includes(
                "education"
            )
        ) {
            contentScore += 1;
        }

        contentScore = Math.min(
            contentScore,
            10
        );

        // =====================================================
        // 17. OVERALL SCORE
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
        // 18. ATS SCORE
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
        // 19. KEYWORD SCORE
        // =====================================================

        const keywordScore = Math.min(
            Math.round(
                (foundSkills.length / 12) *
                    100
            ),
            100
        );

        // =====================================================
        // 20. DATABASE UPDATE
        // =====================================================

        console.log(
            "💾 Updating profile score..."
        );

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

        if (
            updateResult.rowCount === 0
        ) {
            console.log(
                "❌ Profile not found."
            );

            return res.status(404).json({
                message:
                    "Profile not found for this user.",
            });
        }

        // =====================================================
        // 21. SUCCESS RESPONSE
        // =====================================================

        console.log(
            "========================================"
        );

        console.log(
            "✅ RESUME ANALYSIS SUCCESSFUL"
        );

        console.log(
            "📊 Resume Score:",
            resumeScore
        );

        console.log(
            "🎯 ATS Score:",
            atsScore
        );

        console.log(
            "🔑 Keyword Score:",
            keywordScore
        );

        console.log(
            "🔢 Word Count:",
            wordCount
        );

        console.log(
            "========================================\n"
        );

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
            "🔥 Resume Analysis Error:",
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