const express = require("express");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const router = express.Router();

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

// 과제 등록 (관리자만)
router.post("/", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "권한 없음" });

        const { title, description, due_date } = req.body;
        const createdBy = req.user.user_id;

        await pool.query(
            "INSERT INTO assignments (title, description, due_date, created_by) VALUES (?, ?, ?, ?)",
            [title, description, due_date, createdBy]
        );

        res.json({ message: "과제 등록 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "과제 등록 실패" });
    }
});

// 과제 목록 조회
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT a.*, u.username AS creator FROM assignments a JOIN users u ON a.created_by = u.user_id ORDER BY a.created_at DESC"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "조회 실패" });
    }
});

module.exports = router;
