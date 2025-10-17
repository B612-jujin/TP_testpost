const express = require("express");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// --- 파일 업로드 설정 ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"), // uploads 폴더 필요
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + "_" + Math.random().toString(36).slice(2) + ext);
    },
});
const upload = multer({ storage });

// --- JWT 인증 미들웨어 ---
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

// -------------------
// 과제 등록 (관리자)
// -------------------
router.post("/", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "권한 없음" });

        const { title, description, due_date, team_id } = req.body;
        const createdBy = req.user.user_id;

        await pool.query(
            "INSERT INTO assignments (title, description, due_date, created_by, team_id) VALUES (?, ?, ?, ?, ?)",
            [title, description, due_date, createdBy, team_id || null]
        );

        res.json({ message: "과제 등록 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "과제 등록 실패" });
    }
});

// -------------------
// 과제 목록 조회
// -------------------
router.get("/", authenticateToken, async (req, res) => {
    try {
        let query;
        let params = [];

        if (req.user.role === "admin") {
            // 관리자는 모든 과제 조회
            query = `
                SELECT a.*, u.username AS creator, t.team_name
                FROM assignments a 
                JOIN users u ON a.created_by = u.user_id 
                LEFT JOIN teams t ON a.team_id = t.team_id
                ORDER BY a.created_at DESC
            `;
        } else {
            // 학생은 자신이 속한 팀의 과제 또는 팀이 없는 과제만 조회
            query = `
                SELECT a.*, u.username AS creator, t.team_name
                FROM assignments a 
                JOIN users u ON a.created_by = u.user_id 
                LEFT JOIN teams t ON a.team_id = t.team_id
                WHERE a.team_id IS NULL 
                OR a.team_id IN (
                    SELECT tm.team_id 
                    FROM team_members tm 
                    WHERE tm.user_id = ?
                )
                ORDER BY a.created_at DESC
            `;
            params = [req.user.user_id];
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "조회 실패" });
    }
});

// -------------------
// 과제 상세 조회 + 학생 제출 포함
// -------------------
router.get("/:assignmentId", authenticateToken, async (req, res) => {
    try {
        const { assignmentId } = req.params;

        // 과제 정보 조회
        const [assignmentRows] = await pool.query(
            "SELECT a.*, u.username AS creator FROM assignments a JOIN users u ON a.created_by = u.user_id WHERE a.assignment_id = ?",
            [assignmentId]
        );
        if (assignmentRows.length === 0) return res.status(404).json({ error: "과제를 찾을 수 없습니다." });

        const assignment = assignmentRows[0];

        // 학생인 경우 자신의 팀 과제인지 확인
        if (req.user.role === "student" && assignment.team_id) {
            const [teamCheck] = await pool.query(
                "SELECT * FROM team_members WHERE team_id = ? AND user_id = ?",
                [assignment.team_id, req.user.user_id]
            );
            if (teamCheck.length === 0) {
                return res.status(403).json({ error: "해당 과제에 접근할 권한이 없습니다." });
            }
        }

        // 학생 제출 정보 포함 (팀 제출 정보도 포함)
        let submission = null;
        if (req.user.role === "student") {
            const [subRows] = await pool.query(`
                SELECT s.*, t.team_name
                FROM submissions s
                LEFT JOIN teams t ON s.team_id = t.team_id
                WHERE s.assignment_id = ? AND s.student_id = ?
            `, [assignmentId, req.user.user_id]);
            submission = subRows[0] || null;
        }

        res.json({ assignment, submission });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "과제 조회 실패" });
    }
});

// -------------------
// 과제 제출 / 수정 (팀 제출 지원)
// -------------------
router.post("/:assignmentId/submit", authenticateToken, upload.single("file"), async (req, res) => {
    try {
        if (req.user.role !== "student") return res.status(403).json({ error: "권한 없음" });

        const { assignmentId } = req.params;
        const { team_id } = req.body; // 팀 ID (선택사항)
        const studentId = req.user.user_id;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // 팀 제출인 경우 팀 멤버 확인
        if (team_id) {
            const [teamMember] = await pool.query(
                "SELECT * FROM team_members WHERE team_id = ? AND user_id = ?",
                [team_id, studentId]
            );
            if (teamMember.length === 0) {
                return res.status(403).json({ error: "해당 팀의 멤버가 아닙니다" });
            }
        }

        // 기존 제출 확인 (개인 제출 또는 팀 제출)
        let existing;
        if (team_id) {
            // 팀 제출인 경우
            [existing] = await pool.query(
                "SELECT * FROM submissions WHERE assignment_id=? AND team_id=?",
                [assignmentId, team_id]
            );
        } else {
            // 개인 제출인 경우
            [existing] = await pool.query(
                "SELECT * FROM submissions WHERE assignment_id=? AND student_id=? AND team_id IS NULL",
                [assignmentId, studentId]
            );
        }

        if (existing.length > 0) {
            // 수정
            await pool.query(
                "UPDATE submissions SET file_url=?, submitted_at=NOW() WHERE submission_id=?",
                [fileUrl, existing[0].submission_id]
            );
            return res.json({ message: "제출 수정 완료", file_url: fileUrl });
        }

        // 새 제출
        await pool.query(
            "INSERT INTO submissions (assignment_id, student_id, team_id, file_url) VALUES (?, ?, ?, ?)",
            [assignmentId, studentId, team_id, fileUrl]
        );

        res.json({ message: "과제 제출 완료", file_url: fileUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "과제 제출 실패" });
    }
});

// -------------------
// 내 제출 내역 조회 (팀 제출 정보 포함)
// -------------------
router.get("/my-submissions/all", authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.user_id;
        const [rows] = await pool.query(`
            SELECT s.*, a.title, a.due_date, t.team_name
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.assignment_id
            LEFT JOIN teams t ON s.team_id = t.team_id
            WHERE s.student_id=?
            ORDER BY s.submitted_at DESC
        `, [studentId, studentId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "조회 실패" });
    }
});

// -------------------
// 팀별 과제 제출 현황 조회 (관리자용)
// -------------------
router.get("/team-submissions/:assignmentId", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "관리자만 접근 가능합니다" });

        const { assignmentId } = req.params;

        // 과제 정보 조회
        const [assignmentRows] = await pool.query(
            "SELECT * FROM assignments WHERE assignment_id = ?",
            [assignmentId]
        );
        if (assignmentRows.length === 0) return res.status(404).json({ error: "과제를 찾을 수 없습니다" });

        // 팀별 제출 현황 조회 (과제를 만든 팀만)
        const [teamSubmissions] = await pool.query(`
            SELECT 
                t.team_id,
                t.team_name,
                COUNT(tm.user_id) as total_members,
                COUNT(s.submission_id) as submitted_count,
                GROUP_CONCAT(
                    CASE 
                        WHEN s.submission_id IS NOT NULL THEN CONCAT(u.username, ' (제출)')
                        ELSE CONCAT(u.username, ' (미제출)')
                    END 
                    ORDER BY u.username SEPARATOR ', '
                ) as member_status
            FROM teams t
            LEFT JOIN team_members tm ON t.team_id = tm.team_id
            LEFT JOIN users u ON tm.user_id = u.user_id
            LEFT JOIN submissions s ON t.team_id = s.team_id AND s.assignment_id = ?
            WHERE t.team_id = (
                SELECT a.team_id 
                FROM assignments a 
                WHERE a.assignment_id = ?
            )
            GROUP BY t.team_id, t.team_name
            ORDER BY t.team_name
        `, [assignmentId, assignmentId]);

        // 개인 제출 현황 조회 (팀에 속하지 않은 학생들)
        const [individualSubmissions] = await pool.query(`
            SELECT 
                u.user_id,
                u.username,
                u.email,
                CASE 
                    WHEN s.submission_id IS NOT NULL THEN '제출'
                    ELSE '미제출'
                END as status,
                s.submitted_at,
                s.file_url
            FROM users u
            LEFT JOIN submissions s ON u.user_id = s.student_id AND s.assignment_id = ? AND s.team_id IS NULL
            WHERE u.role = 'student' 
            AND u.user_id NOT IN (
                SELECT DISTINCT tm.user_id 
                FROM team_members tm
            )
            ORDER BY u.username
        `, [assignmentId]);

        res.json({
            assignment: assignmentRows[0],
            team_submissions: teamSubmissions,
            individual_submissions: individualSubmissions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "제출 현황 조회 실패" });
    }
});

// -------------------
// 팀 제출 상세 조회 (교수용)
// -------------------
router.get("/team-submission-details/:assignmentId", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "관리자만 접근 가능합니다" });

        const { assignmentId } = req.params;

        // 과제 정보 조회
        const [assignmentRows] = await pool.query(
            "SELECT a.*, u.username AS creator FROM assignments a JOIN users u ON a.created_by = u.user_id WHERE a.assignment_id = ?",
            [assignmentId]
        );
        if (assignmentRows.length === 0) return res.status(404).json({ error: "과제를 찾을 수 없습니다." });

        // 팀별 제출 상세 정보 조회 (과제를 만든 팀만)
        const [teamSubmissions] = await pool.query(`
            SELECT 
                s.submission_id,
                s.file_url,
                s.submitted_at,
                s.grade,
                s.feedback,
                t.team_id,
                t.team_name,
                GROUP_CONCAT(
                    CONCAT(u.username, ' (', u.email, ')') 
                    ORDER BY u.username SEPARATOR ', '
                ) as team_members,
                u_submitter.username as submitted_by,
                u_submitter.email as submitted_by_email
            FROM submissions s
            JOIN teams t ON s.team_id = t.team_id
            JOIN team_members tm ON t.team_id = tm.team_id
            JOIN users u ON tm.user_id = u.user_id
            JOIN users u_submitter ON s.student_id = u_submitter.user_id
            WHERE s.assignment_id = ? AND s.team_id IS NOT NULL 
            AND t.team_id = (
                SELECT a.team_id 
                FROM assignments a 
                WHERE a.assignment_id = ?
            )
            GROUP BY s.submission_id, t.team_id, t.team_name, s.file_url, s.submitted_at, s.grade, s.feedback, u_submitter.username, u_submitter.email
            ORDER BY s.submitted_at DESC
        `, [assignmentId, assignmentId]);

        // 개인 제출 정보 조회 (팀에 속하지 않은 학생들)
        const [individualSubmissions] = await pool.query(`
            SELECT 
                s.submission_id,
                s.file_url,
                s.submitted_at,
                s.grade,
                s.feedback,
                u.username as submitted_by,
                u.email as submitted_by_email
            FROM submissions s
            JOIN users u ON s.student_id = u.user_id
            WHERE s.assignment_id = ? AND s.team_id IS NULL
            ORDER BY s.submitted_at DESC
        `, [assignmentId]);

        res.json({
            assignment: assignmentRows[0],
            team_submissions: teamSubmissions,
            individual_submissions: individualSubmissions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "제출 상세 정보 조회 실패" });
    }
});

module.exports = router;
