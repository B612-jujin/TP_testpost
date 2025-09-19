import React, { useState } from "react";

export default function AddAssignment() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const res = await fetch("http://localhost:5000/api/assignments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, due_date: dueDate })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("과제 등록 완료");
                setTitle("");
                setDescription("");
                setDueDate("");
            } else {
                setMessage(data.error || "등록 실패");
            }
        } catch (err) {
            console.error(err);
            setMessage("서버 오류");
        }
    };

    return (
        <div>
            <h2>과제 등록</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
                <input type="text" placeholder="과제 제목" value={title} onChange={e => setTitle(e.target.value)} required />
                <textarea placeholder="설명" value={description} onChange={e => setDescription(e.target.value)} required />
                <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                <button type="submit">등록</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
