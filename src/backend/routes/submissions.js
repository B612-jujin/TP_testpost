const express = require("express");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"), // uploads 폴더 필요
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + "_" + Math.random().toString(36).slice(2) + ext);
    },
});
const upload = multer({ storage });

// JWT 미들웨어
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// 과제 제출
router.post("/:assignmentId", authenticateToken, upload.single("file"), async (req, res) => {
    try {
        if (req.user.role !== "student") return res.status(403).json({ error: "권한 없음" });

        const { assignmentId } = req.params;
        const studentId = req.user.user_id;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // 기존 제출 확인
        const [existing] = await pool.query(
            "SELECT * FROM submissions WHERE assignment_id=? AND student_id=?",
            [assignmentId, studentId]
        );

        if (existing.length > 0) {
            // 수정
            await pool.query(
                "UPDATE submissions SET file_url=?, submitted_at=NOW() WHERE submission_id=?",
                [fileUrl, existing[0].submission_id]
            );
            return res.json({ message: "제출 수정 완료" });
        }

        // 새 제출
        await pool.query(
            "INSERT INTO submissions (assignment_id, student_id, file_url) VALUES (?, ?, ?)",
            [assignmentId, studentId, fileUrl]
        );

        res.json({ message: "과제 제출 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "과제 제출 실패" });
    }
});

// 내 제출 내역 조회
router.get("/my-submissions", authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.user_id;
        const [rows] = await pool.query(
            `SELECT s.*, a.title, a.due_date 
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.assignment_id
       WHERE s.student_id=?`,
            [studentId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "조회 실패" });
    }
});

module.exports = router;
