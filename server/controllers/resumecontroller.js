const pool = require("../src/config/db");

console.log("🔥 NEW RESUME CONTROLLER LOADED");

const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const { createWorker } = require("tesseract.js");
const { createCanvas } = require("@napi-rs/canvas");

// =====================================================
// PDF.JS LOADER
// =====================================================

let pdfjsLib = null;

async function loadPdfJs() {
    if (!pdfjsLib) {
        pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    }

    return pdfjsLib;
}

// =====================================================
// PDF PAGE → PNG BUFFER
// =====================================================

async function renderPdfPageToPng(pdfPage, scale = 2.0) {
    const viewport = pdfPage.getViewport({
        scale,
    });

    const width = Math.ceil(viewport.width);
    const height = Math.ceil(viewport.height);

    console.log(
        `🖼️ Rendering page: ${width} x ${height}`
    );

    const canvas = createCanvas(
        width,
        height
    );

    const context = canvas.getContext("2d");

    await pdfPage.render({
        canvasContext: context,
        viewport,
    }).promise;

    const pngBuffer =
        canvas.toBuffer("image/png");

    console.log(
        "🖼️ PNG buffer created:",
        pngBuffer.length,
        "bytes"
    );

    return pngBuffer;
}

// =====================================================
// PDF OCR
// =====================================================

async function extractPdfWithOCR(buffer, totalPages) {
    console.log(
        "========================================"
    );

    console.log(
        "🔎 STARTING PDF OCR"
    );

    console.log(
        "========================================"
    );

    const pdfjs = await loadPdfJs();

    console.log(
        "📚 PDF.js loaded successfully."
    );

    // -------------------------------------------------
    // LOAD PDF
    // -------------------------------------------------

    const loadingTask =
        pdfjs.getDocument({
            data: new Uint8Array(buffer),
            disableWorker: true,
        });

    const pdf =
        await loadingTask.promise;

    console.log(
        "📄 PDF.js pages:",
        pdf.numPages
    );

    const pagesToProcess =
        Math.min(
            pdf.numPages,
            10
        );

    console.log(
        "📄 Pages to OCR:",
        pagesToProcess
    );

    // -------------------------------------------------
    // CREATE TESSERACT WORKER
    // -------------------------------------------------

    let worker = null;

    try {
        console.log(
            "🤖 Initializing Tesseract..."
        );

        worker =
            await createWorker(
                "eng"
            );

        console.log(
            "🤖 Tesseract OCR worker initialized."
        );

        let completeText = "";

        // -------------------------------------------------
        // PROCESS EACH PDF PAGE
        // -------------------------------------------------

        for (
            let pageNumber = 1;
            pageNumber <= pagesToProcess;
            pageNumber++
        ) {
            console.log(
                "----------------------------------------"
            );

            console.log(
                `🔎 OCR processing page ${pageNumber}/${pagesToProcess}...`
            );

            try {
                const page =
                    await pdf.getPage(
                        pageNumber
                    );

                // Render PDF page directly to memory
                const pngBuffer =
                    await renderPdfPageToPng(
                        page,
                        2.0
                    );

                console.log(
                    `🤖 Sending page ${pageNumber} to Tesseract...`
                );

                const result =
                    await worker.recognize(
                        pngBuffer
                    );

                const pageText =
                    result?.data?.text ||
                    "";

                console.log(
                    `📝 Page ${pageNumber} OCR characters:`,
                    pageText.length
                );

                console.log(
                    `📝 Page ${pageNumber} preview:`,
                    JSON.stringify(
                        pageText.substring(
                            0,
                            300
                        )
                    )
                );

                completeText +=
                    "\n" +
                    pageText;

                // Release page resources
                page.cleanup();

            } catch (pageError) {
                console.error(
                    `❌ OCR error on page ${pageNumber}:`,
                    pageError.message
                );

                console.error(
                    pageError.stack
                );
            }
        }

        // -------------------------------------------------
        // CLEAN OCR TEXT
        // -------------------------------------------------

        const cleanedText =
            completeText
                .replace(
                    /\u0000/g,
                    " "
                )
                .replace(
                    /\r/g,
                    " "
                )
                .replace(
                    /\n+/g,
                    " "
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

        console.log(
            "========================================"
        );

        console.log(
            "🤖 OCR COMPLETE"
        );

        console.log(
            "OCR text length:",
            cleanedText.length
        );

        console.log(
            "OCR preview:"
        );

        console.log(
            cleanedText.substring(
                0,
                2000
            )
        );

        console.log(
            "========================================"
        );

        return cleanedText;

    } finally {
        if (worker) {
            try {
                await worker.terminate();

                console.log(
                    "🧹 OCR worker terminated."
                );

            } catch (workerError) {
                console.error(
                    "⚠️ OCR worker cleanup error:",
                    workerError.message
                );
            }
        }
    }
}

// =====================================================
// MAIN RESUME ANALYZER
// =====================================================

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
            console.log(
                "❌ No resume file received"
            );

            return res.status(400).json({
                message:
                    "Please upload a resume file.",
            });
        }

        const file = req.file;

        console.log(
            "📁 File name:",
            file.originalname
        );

        console.log(
            "📦 File type:",
            file.mimetype
        );

        console.log(
            "📏 File size:",
            (
                file.size /
                1024 /
                1024
            ).toFixed(2),
            "MB"
        );

        console.log(
            "🔍 Buffer exists:",
            !!file.buffer
        );

        console.log(
            "🔍 Buffer size:",
            file.buffer
                ? file.buffer.length
                : 0
        );

        let resumeText = "";
        let extractionMethod = "none";

        // =====================================================
        // 2. PDF
        // =====================================================

        if (
            file.mimetype ===
            "application/pdf"
        ) {
            console.log(
                "📕 Processing PDF..."
            );

            let parser = null;

            try {
                if (
                    !file.buffer ||
                    !Buffer.isBuffer(
                        file.buffer
                    )
                ) {
                    throw new Error(
                        "Uploaded PDF buffer is missing or invalid."
                    );
                }

                console.log(
                    "🔍 PDF buffer size:",
                    file.buffer.length,
                    "bytes"
                );

                // -------------------------------------------------
                // FIRST ATTEMPT: NORMAL TEXT EXTRACTION
                // -------------------------------------------------

                parser =
                    new PDFParse({
                        data: file.buffer,
                    });

                const pdfData =
                    await parser.getText();

                console.log(
                    "========================================"
                );

                console.log(
                    "PDF TEXT EXTRACTION DEBUG"
                );

                console.log(
                    "Pages:",
                    pdfData.total || 0
                );

                console.log(
                    "Text length:",
                    pdfData.text
                        ? pdfData.text.length
                        : 0
                );

                console.log(
                    "Text preview:",
                    JSON.stringify(
                        pdfData.text
                            ? pdfData.text.substring(
                                  0,
                                  500
                              )
                            : ""
                    )
                );

                console.log(
                    "========================================"
                );

                resumeText =
                    pdfData.text || "";

                const cleanedPdfText =
                    resumeText
                        .replace(
                            /\u0000/g,
                            " "
                        )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();

                // -------------------------------------------------
                // NORMAL TEXT SUCCESS
                // -------------------------------------------------

                if (
                    cleanedPdfText.length >=
                    50
                ) {
                    console.log(
                        "✅ Normal PDF text extraction successful."
                    );

                    resumeText =
                        cleanedPdfText;

                    extractionMethod =
                        "pdf-text";
                }

                // -------------------------------------------------
                // OCR FALLBACK
                // -------------------------------------------------

                else {
                    console.log(
                        "⚠️ Very little PDF text found."
                    );

                    console.log(
                        "🔎 Starting PDF.js → Canvas → Tesseract OCR..."
                    );

                    // Destroy parser before OCR
                    try {
                        await parser.destroy();
                    } catch (error) {
                        console.log(
                            "⚠️ Parser cleanup warning:",
                            error.message
                        );
                    }

                    parser = null;

                    resumeText =
                        await extractPdfWithOCR(
                            file.buffer,
                            pdfData.total || 1
                        );

                    extractionMethod =
                        "ocr";
                }

            } catch (pdfError) {
                console.error(
                    "========================================"
                );

                console.error(
                    "❌ PDF PROCESSING ERROR"
                );

                console.error(
                    "========================================"
                );

                console.error(
                    pdfError
                );

                console.error(
                    "Message:",
                    pdfError.message
                );

                console.error(
                    "Stack:",
                    pdfError.stack
                );

                console.error(
                    "========================================"
                );

                return res.status(400).json({
                    message:
                        "Unable to read the uploaded PDF.",
                    error:
                        pdfError.message,
                });

            } finally {
                if (parser) {
                    try {
                        await parser.destroy();
                    } catch (
                        destroyError
                    ) {
                        console.error(
                            "⚠️ PDF parser cleanup error:",
                            destroyError.message
                        );
                    }
                }
            }
        }

        // =====================================================
        // 3. DOCX
        // =====================================================

        else if (
            file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            console.log(
                "📘 Processing DOCX..."
            );

            try {
                const result =
                    await mammoth.extractRawText(
                        {
                            buffer:
                                file.buffer,
                        }
                    );

                resumeText =
                    result.value || "";

                extractionMethod =
                    "docx";

                console.log(
                    "📝 DOCX text length:",
                    resumeText.length
                );

            } catch (
                docxError
            ) {
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
        // 4. OLD DOC
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
        // 5. UNSUPPORTED FILE
        // =====================================================

        else {
            return res.status(400).json({
                message:
                    "Unsupported file type. Please upload PDF or DOCX.",
            });
        }

        // =====================================================
        // 6. FINAL TEXT CLEANING
        // =====================================================

        const text =
            resumeText
                .replace(
                    /\u0000/g,
                    " "
                )
                .replace(
                    /\r/g,
                    " "
                )
                .replace(
                    /\n+/g,
                    " "
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

        console.log(
            "========================================"
        );

        console.log(
            "🧹 FINAL TEXT EXTRACTION"
        );

        console.log(
            "Extraction method:",
            extractionMethod
        );

        console.log(
            "Final text length:",
            text.length
        );

        console.log(
            "Final text preview:"
        );

        console.log(
            text.substring(
                0,
                2000
            )
        );

        console.log(
            "========================================"
        );

        // =====================================================
        // 7. CHECK TEXT
        // =====================================================

        if (
            !text ||
            text.length < 50
        ) {
            console.log(
                "❌ Still insufficient text after extraction/OCR."
            );

            return res.status(400).json({
                message:
                    "Could not extract enough text from the resume.",
                extractedCharacters:
                    text.length,
                extractionMethod,
                suggestion:
                    "Please upload a clearer PDF or DOCX resume.",
            });
        }

        console.log(
            "✅ Resume text successfully extracted."
        );

        // =====================================================
        // 8. LOWERCASE
        // =====================================================

        const lowerText =
            text.toLowerCase();

        // =====================================================
        // 9. WORD COUNT
        // =====================================================

        const wordCount =
            text
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
            lowerText.includes(
                "linkedin"
            );

        const hasGithub =
            lowerText.includes(
                "github"
            );

        if (hasEmail)
            contactScore += 3;

        if (hasPhone)
            contactScore += 3;

        if (hasLinkedIn)
            contactScore += 2;

        if (hasGithub)
            contactScore += 2;

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

        const sectionScore =
            Math.min(
                Math.round(
                    (foundSections.length /
                        7) *
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

        const skillScore =
            Math.min(
                Math.round(
                    (foundSkills.length /
                        10) *
                        20
                ),
                20
            );

        // =====================================================
        // 13. PROJECT SCORE - 15
        // =====================================================

        let projectScore = 0;

        const hasProjects =
            lowerText.includes(
                "project"
            ) ||
            lowerText.includes(
                "projects"
            );

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
            lowerText.includes(
                "github"
            ) ||
            lowerText.includes(
                "deployed"
            ) ||
            lowerText.includes(
                "live"
            )
        ) {
            projectScore += 3;
        }

        projectScore =
            Math.min(
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
            lowerText.includes(
                "led"
            )
        ) {
            experienceScore += 3;
        }

        if (
            /\b20\d{2}\b/.test(
                text
            )
        ) {
            experienceScore += 2;
        }

        experienceScore =
            Math.min(
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
            percentageMatches.length >=
            1
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

        achievementScore =
            Math.min(
                achievementScore,
                10
            );

        // =====================================================
        // 16. CONTENT QUALITY SCORE - 10
        // =====================================================

        let contentScore = 0;

        if (wordCount >= 100)
            contentScore += 2;

        if (wordCount >= 250)
            contentScore += 2;

        if (wordCount >= 400)
            contentScore += 2;

        if (wordCount >= 550)
            contentScore += 2;

        if (
            lowerText.includes(
                "resume"
            ) ||
            lowerText.includes(
                "curriculum vitae"
            )
        ) {
            contentScore += 1;
        }

        if (
            lowerText.includes(
                "skills"
            ) &&
            lowerText.includes(
                "education"
            )
        ) {
            contentScore += 1;
        }

        contentScore =
            Math.min(
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

        const resumeScore =
            Math.min(
                Math.max(
                    Math.round(
                        rawScore
                    ),
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

        if (wordCount >= 200)
            atsScore += 5;

        if (wordCount >= 400)
            atsScore += 5;

        atsScore =
            Math.min(
                Math.round(
                    atsScore
                ),
                100
            );

        // =====================================================
        // 19. KEYWORD SCORE
        // =====================================================

        const keywordScore =
            Math.min(
                Math.round(
                    (foundSkills.length /
                        12) *
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
            updateResult.rowCount ===
            0
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
        // 21. SUCCESS
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
            "🛠 Skills Found:",
            foundSkills
        );

        console.log(
            "📚 Sections Found:",
            foundSections
        );

        console.log(
            "📖 Extraction Method:",
            extractionMethod
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

                extractionMethod,
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