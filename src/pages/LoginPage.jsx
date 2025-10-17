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

    const API_BASE = "http://192.168.24.185:5000/api/auth"; // 백엔드 주소

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
        <div className="container">
            <div className="d-flex justify-center align-center" style={{ minHeight: "100vh" }}>
                <div className="card" style={{ maxWidth: "450px", width: "100%" }}>
                    <div className="text-center mb-4">
                        <h1 className="page-title" style={{ fontSize: "32px", marginBottom: "8px" }}>
                            🎓 과제 관리 시스템
                        </h1>
                        <p className="page-subtitle">로그인하여 시작하세요</p>
                    </div>

                    {mode === "login" && (
                        <>
                            <form onSubmit={handleLogin} className="d-flex flex-column gap-2">
                                <div className="form-group">
                                    <label className="form-label">이메일</label>
                                    <input 
                                        type="email" 
                                        className="form-control"
                                        placeholder="이메일을 입력하세요" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">비밀번호</label>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        placeholder="비밀번호를 입력하세요" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg">
                                    로그인
                                </button>
                            </form>
                            
                            {message && (
                                <div className={`alert ${message.includes('성공') ? 'alert-success' : 'alert-danger'}`}>
                                    {message}
                                </div>
                            )}
                            
                            <div className="text-center mt-3">
                                <p className="mb-2">
                                    계정이 없나요? 
                                    <button 
                                        className="btn btn-secondary btn-sm ml-2" 
                                        onClick={() => setMode("register")}
                                    >
                                        회원가입
                                    </button>
                                </p>
                                <p>
                                    비밀번호를 잊으셨나요? 
                                    <button 
                                        className="btn btn-secondary btn-sm ml-2" 
                                        onClick={() => setMode("reset")}
                                    >
                                        재설정
                                    </button>
                                </p>
                            </div>
                        </>
                    )}

                    {mode === "register" && (
                        <>
                            <h2 className="text-center mb-4">회원가입 요청</h2>
                            <form onSubmit={handleRegister} className="d-flex flex-column gap-2">
                                <div className="form-group">
                                    <label className="form-label">사용자 이름</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="사용자 이름을 입력하세요" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">이메일</label>
                                    <input 
                                        type="email" 
                                        className="form-control"
                                        placeholder="이메일을 입력하세요" 
                                        value={registerEmail} 
                                        onChange={(e) => setRegisterEmail(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">비밀번호</label>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        placeholder="비밀번호를 입력하세요" 
                                        value={registerPassword} 
                                        onChange={(e) => setRegisterPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <button type="submit" className="btn btn-success btn-lg">
                                    가입 요청
                                </button>
                            </form>
                            
                            {message && (
                                <div className={`alert ${message.includes('성공') ? 'alert-success' : 'alert-danger'}`}>
                                    {message}
                                </div>
                            )}
                            
                            <div className="text-center mt-3">
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setMode("login")}
                                >
                                    로그인으로 돌아가기
                                </button>
                            </div>
                        </>
                    )}

                    {mode === "reset" && (
                        <>
                            <h2 className="text-center mb-4">비밀번호 재설정</h2>
                            
                            {!codeSent ? (
                                <div className="d-flex flex-column gap-2">
                                    <div className="form-group">
                                        <label className="form-label">가입된 이메일</label>
                                        <input 
                                            type="email" 
                                            className="form-control"
                                            placeholder="가입된 이메일을 입력하세요" 
                                            value={resetEmail} 
                                            onChange={(e) => setResetEmail(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <button 
                                        className="btn btn-primary btn-lg" 
                                        onClick={sendResetCode}
                                    >
                                        인증코드 발송
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleResetPassword} className="d-flex flex-column gap-2">
                                    <div className="form-group">
                                        <label className="form-label">인증코드</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            placeholder="메일로 받은 인증코드를 입력하세요" 
                                            value={resetCode} 
                                            onChange={(e) => setResetCode(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">새 비밀번호</label>
                                        <input 
                                            type="password" 
                                            className="form-control"
                                            placeholder="새 비밀번호를 입력하세요" 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success btn-lg">
                                        비밀번호 재설정
                                    </button>
                                </form>
                            )}
                            
                            {message && (
                                <div className={`alert ${message.includes('성공') || message.includes('발송') ? 'alert-success' : 'alert-danger'}`}>
                                    {message}
                                </div>
                            )}
                            
                            <div className="text-center mt-3">
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setMode("login")}
                                >
                                    로그인으로 돌아가기
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
