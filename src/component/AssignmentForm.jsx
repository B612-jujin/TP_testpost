import React, { useState } from "react";

export default function AssignmentForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/assignments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ title, description, due_date: dueDate }),
            });
            const data = await res.json();
            if (res.ok) {
                alert("과제 등록 완료");
                setTitle("");
                setDescription("");
                setDueDate("");
            } else {
                alert(data.error);
            }
        } catch {
            alert("서버 오류");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>과제 등록</h2>
            <input
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
            />
            <textarea
                placeholder="설명"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit">등록</button>
        </form>
    );
}
