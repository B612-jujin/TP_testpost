import React, { useState } from "react";
import api from "../../api/api";

export default function ResetPasswordPage({ goBack }) {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 코드 입력
    const [message, setMessage] = useState("");

    const sendCode = async () => {
        setMessage("");
        try {
            await api.post("/api/auth/send-email-code", { email });
            setStep(2);
            setMessage("이메일로 인증코드를 발송했습니다.");
        } catch (err) {
            setMessage(err.response?.data?.error || "실패");
        }
    };

    const verifyCode = async () => {
        setMessage("");
        try {
            await api.post("/api/auth/verify-email-code", { email, code });
            const res = await api.post("/api/auth/reset-password", { email });
            setMessage(`임시 비밀번호: ${res.data.tempPassword}`);
            setStep(1);
        } catch (err) {
            setMessage(err.response?.data?.error || "실패");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "50px auto" }}>
            <h2>비밀번호 찾기</h2>
            {step === 1 && (
                <>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    <button onClick={sendCode}>인증코드 발송</button>
                </>
            )}
            {step === 2 && (
                <>
                    <input type="text" placeholder="인증코드" value={code} onChange={e => setCode(e.target.value)} />
                    <button onClick={verifyCode}>인증 및 임시 비밀번호 발급</button>
                </>
            )}
            {message && <p>{message}</p>}
            <button onClick={goBack}>뒤로</button>
        </div>
    );
}
