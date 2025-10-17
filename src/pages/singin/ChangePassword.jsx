import React, { useState } from "react";

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleChange = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://192.168.24.185:5000/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: localStorage.getItem("userEmail"),
                    oldPassword,
                    newPassword,
                }),
            });
            const data = await res.json();
            setMessage(data.message || data.error);
        } catch {
            setMessage("서버 오류 발생");
        }
    };

    return (
        <form onSubmit={handleChange}>
            <h2>비밀번호 변경</h2>
            <input type="password" placeholder="기존 비밀번호" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
            <input type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <button type="submit">변경</button>
            <p>{message}</p>
        </form>
    );
}
