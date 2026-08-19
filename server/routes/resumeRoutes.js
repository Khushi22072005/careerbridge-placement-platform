const express = require("express");
const multer = require("multer");

const router = express.Router();

const resumeController = require("../controllers/resumeController");
const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only PDF, DOC, and DOCX files are allowed."
                )
            );
        }
    },
});

// =====================================================
// ANALYZE RESUME
// =====================================================

router.post(
    "/analyze",
    authMiddleware,
    upload.single("resume"),
    resumeController.analyzeResume
);

module.exports = router;