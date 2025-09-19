import React, { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [message, setMessage] = useState("");
    const [mode, setMode] = useState("login"); // login / register / reset
    const [resetEmail, setResetEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [codeSent, setCodeSent] = useState(false);

    const API_BASE = "http://localhost:5000/api/auth"; // 백엔드 주소

    // --- 로그인 ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("role", data.role);
                window.location.href = "/"; // 메인 페이지로 이동
            } else {
                setMessage(data.error || "로그인 실패");
            }
        } catch (err) {
            setMessage("서버 오류 발생");
        }
    };

    // --- 회원가입 ---
    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email: registerEmail,
                    password: registerPassword,
                    role: "student" // 기본 권한 student
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("가입 요청 성공! 관리자가 승인하면 로그인 가능");
                setMode("login");
            } else {
                setMessage(data.error || "가입 실패");
            }
        } catch (err) {
            setMessage("서버 오류 발생");
        }
    };

    // --- 비밀번호 찾기 (메일 코드 발송) ---
    const sendResetCode = async () => {
        try {
            const res = await fetch(`${API_BASE}/send-email-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resetEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                setCodeSent(true);
                setMessage("인증코드가 이메일로 발송되었습니다.");
            } else {
                setMessage(data.error || "발송 실패");
            }
        } catch {
            setMessage("서버 오류 발생");
        }
    };

    // --- 비밀번호 재설정 ---
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const verifyRes = await fetch(`${API_BASE}/verify-email-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resetEmail, code: resetCode }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
                setMessage(verifyData.error || "코드 인증 실패");
                return;
            }

            const resetRes = await fetch(`${API_BASE}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resetEmail, newPassword }),
            });
            const resetData = await resetRes.json();
            if (resetRes.ok) {
                setMessage("비밀번호 재설정 완료! 로그인 해주세요.");
                setMode("login");
            } else {
                setMessage(resetData.error || "재설정 실패");
            }
        } catch {
            setMessage("서버 오류 발생");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
            {mode === "login" && (
                <>
                    <h2>로그인</h2>
                    <form onSubmit={handleLogin}>
                        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="submit">로그인</button>
                    </form>
                    <p style={{ color: "red" }}>{message}</p>
                    <p>
                        계정이 없나요? <button onClick={() => setMode("register")}>회원가입</button>
                    </p>
                    <p>
                        비밀번호를 잊으셨나요? <button onClick={() => setMode("reset")}>재설정</button>
                    </p>
                </>
            )}

            {mode === "register" && (
                <>
                    <h2>회원가입 요청</h2>
                    <form onSubmit={handleRegister}>
                        <input type="text" placeholder="사용자 이름" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <input type="email" placeholder="이메일" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                        <input type="password" placeholder="비밀번호" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
                        <button type="submit">가입 요청</button>
                    </form>
                    <p style={{ color: "red" }}>{message}</p>
                    <p>
                        <button onClick={() => setMode("login")}>로그인으로 돌아가기</button>
                    </p>
                </>
            )}

            {mode === "reset" && (
                <>
                    <h2>비밀번호 재설정</h2>
                    {!codeSent ? (
                        <>
                            <input type="email" placeholder="가입된 이메일" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                            <button onClick={sendResetCode}>인증코드 발송</button>
                        </>
                    ) : (
                        <>
                            <input type="text" placeholder="메일로 받은 인증코드" value={resetCode} onChange={(e) => setResetCode(e.target.value)} required />
                            <input type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                            <button onClick={handleResetPassword}>비밀번호 재설정</button>
                        </>
                    )}
                    <p style={{ color: "red" }}>{message}</p>
                    <p>
                        <button onClick={() => setMode("login")}>로그인으로 돌아가기</button>
                    </p>
                </>
            )}
        </div>
    );
}
