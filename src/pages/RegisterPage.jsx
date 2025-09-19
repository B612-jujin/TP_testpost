import React, { useState } from "react";
import api from "../api/api";

export default function RegisterPage({ goBack }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await api.post("/api/auth/register", { username, email, password });
            setMessage("회원가입 요청 완료. 관리자 승인 후 로그인 가능.");
        } catch (err) {
            setMessage(err.response?.data?.error || "회원가입 실패");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "50px auto" }}>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="사용자명" value={username} onChange={e => setUsername(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit">회원가입 요청</button>
            </form>
            {message && <p>{message}</p>}
            <button onClick={goBack}>뒤로</button>
        </div>
    );
}
