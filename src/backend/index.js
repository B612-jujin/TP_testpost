// Description: Main server file for TRPG API with authentication and game routees
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");// 인증 관련 라우터
const assignmentsRouter = require("./routes/assignments"); // 여기 추가
const teamsRouter = require("./routes/teams"); // 팀 관리 라우터
//const adminAssigRouter = require("./routes/adminassig"); // 여기 추가

dotenv.config();
const app = express();

app.use(cors({ origin: true, credentials: true }));
// app.use(cors({ origin: ["http://192.168.24.185:3000"], credentials: false }));
app.use(express.json());

// 기본 health check
app.get("/", (req, res) => res.json({ ok: true, service: "TEST POST" }));

// 인증 관련 라우터
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentsRouter); // <--- 이 부분이 중요
app.use("/api/teams", teamsRouter); // 팀 관리 라우터
// app.use("/api/adminassignments", adminAssigRouter); // <--- 이 부분이 중요

// uploads 폴더 static
app.use("/uploads", express.static("uploads"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://192.168.24.185:${PORT}`);
});
