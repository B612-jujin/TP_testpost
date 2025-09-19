const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pool = require("../db");

const router = express.Router();

// --- In-memory 이메일 인증 코드 저장소 ---
const emailCodes = new Map();

function setEmailCode(email, code, ttlMs = 10 * 60 * 1000) {
    emailCodes.set(email, { code, expiresAt: Date.now() + ttlMs });
}

function verifyEmailCode(email, code) {
    const item = emailCodes.get(email);
    if (!item) return false;
    const ok = item.code === code && Date.now() <= item.expiresAt;
    if (ok) emailCodes.delete(email);
    return ok;
}

// --- Helper ---
async function findUserByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
}

async function findUserByUsername(username) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    return rows[0];
}

// --- Nodemailer ---
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// --- Routes ---

// 회원가입
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.status(400).json({ error: "필수 항목 누락" });

        // 이미 users 테이블에 있는지 확인
        const existingUser = await findUserByUsername(username);
        if (existingUser) return res.status(409).json({ error: "이미 가입된 사용자" });

        // 이미 요청 테이블에 있는지 확인
        const [rows] = await pool.query(
            "SELECT * FROM signup_requests WHERE email = ? OR username = ?",
            [email, username]
        );
        if (rows.length > 0) return res.status(409).json({ error: "이미 요청된 회원가입" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO signup_requests (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        res.json({ message: "회원가입 요청 완료, 관리자의 승인을 기다리세요" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "회원가입 요청 실패" });
    }
});
/*관리자 관리 항목 가입요청 승인 ^*/
router.get("/admin/signup-requests", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "관리자 전용" });

        const [rows] = await pool.query("SELECT * FROM signup_requests ORDER BY requested_at DESC");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "요청 조회 실패" });
    }
});
// 가입 요청 승인
router.post(
    "/admin/signup-requests/:id/approve",
    authenticateToken,
    async (req, res) => {
        if (req.user.role !== "admin") return res.status(403).json({ error: "관리자 전용" });

        try {
            const { id } = req.params;
            const [rows] = await pool.query(
                "SELECT * FROM signup_requests WHERE request_id = ?",
                [id]
            );
            if (rows.length === 0) return res.status(404).json({ error: "요청 없음" });

            const request = rows[0];

            await pool.query(
                "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'student')",
                [request.username, request.email, request.password_hash]
            );

            await pool.query("DELETE FROM signup_requests WHERE request_id = ?", [id]);
            res.json({ message: "가입 승인 완료" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "승인 실패" });
        }
    }
);

// 가입 요청 거절
router.post(
    "/admin/signup-requests/:id/reject",
    authenticateToken,
    async (req, res) => {
        if (req.user.role !== "admin") return res.status(403).json({ error: "관리자 전용" });

        try {
            const { id } = req.params;
            await pool.query("DELETE FROM signup_requests WHERE request_id = ?", [id]);
            res.json({ message: "가입 거절 완료" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "거절 실패" });
        }
    }
);

/*관리자 관리 항목 ^*/

// 로그인
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);
        if (!user) return res.status(400).json({ error: "이메일 없음" });

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.status(400).json({ error: "비밀번호 불일치" });

        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );

        res.json({
            message: "로그인 성공",
            userId: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "로그인 실패" });
    }
});

// 비밀번호 변경
router.post("/change-password", async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ error: "사용자 없음" });

        const ok = await bcrypt.compare(oldPassword, user.password_hash);
        if (!ok) return res.status(401).json({ error: "기존 비밀번호 불일치" });

        const newHash = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [newHash, user.user_id]);
        res.json({ message: "비밀번호 변경 성공" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "비밀번호 변경 실패" });
    }
});

// 이메일 인증 코드 발송
router.post("/send-email-code", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "이메일을 입력하세요" });
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ error: "가입되지 않은 이메일" });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setEmailCode(email, code);

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: "[플랫폼] 비밀번호 재설정 인증코드",
            text: `인증코드: ${code} (10분 내 유효)`
        });

        res.json({ message: "인증코드를 이메일로 발송했습니다." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "이메일 발송 실패" });
    }
});

// 이메일 인증 코드 검증
router.post("/verify-email-code", async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ error: "이메일/코드 누락" });

        const ok = verifyEmailCode(email, code);
        if (!ok) return res.status(400).json({ error: "인증코드가 올바르지 않거나 만료됨" });

        res.json({ message: "인증 성공" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "인증 처리 실패" });
    }
});

// 비밀번호 재설정
router.post("/reset-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ error: "사용자 없음" });

        const tempPassword = Math.random().toString(36).slice(-8);
        const tempHash = await bcrypt.hash(tempPassword, 10);
        await pool.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [tempHash, user.user_id]);

        res.json({ message: "임시 비밀번호 발급", tempPassword });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "비밀번호 재설정 실패" });
    }
});

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

// 로그인 상태 확인
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const user = await findUserByEmail(req.user.email);
        if (!user) return res.status(404).json({ error: "사용자 없음" });

        res.json({
            userId: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "사용자 정보 조회 실패" });
    }
});

module.exports = router;
