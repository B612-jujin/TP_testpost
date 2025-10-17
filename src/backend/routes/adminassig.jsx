const express = require("express");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const router = express.Router();



// JWT 인증 미들웨어
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

// --- 관리자가 특정 과제 제출 내역 조회 ---
router.get("/:assignmentId/submissions", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "권한 없음" });

        const { assignmentId } = req.params;
        const [rows] = await pool.query(
            `SELECT s.submission_id, s.file_url, s.submitted_at, s.grade, s.feedback, u.username, u.email
             FROM submissions s
             JOIN users u ON s.student_id = u.user_id
             WHERE s.assignment_id = ?
             ORDER BY s.submitted_at ASC`,
            [assignmentId]
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "제출 내역 조회 실패" });
    }
});

// --- 관리자가 점수/피드백 등록 ---
router.post("/submissions/:submissionId/grade", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "권한 없음" });

        const { submissionId } = req.params;
        const { grade, feedback } = req.body;

        await pool.query(
            "UPDATE submissions SET grade=?, feedback=? WHERE submission_id=?",
            [grade, feedback, submissionId]
        );

        res.json({ message: "평가 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "평가 실패" });
    }
});

module.exports = router;
