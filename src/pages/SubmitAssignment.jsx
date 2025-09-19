import React, { useState } from "react";

export default function StudntAssignmentSubmit({ assignmentId }) {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert("파일을 선택해주세요");

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`http://localhost:5000/api/submissions/${assignmentId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "제출 실패");
            setMessage(data.message);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div>
            <h2>과제 제출</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button type="submit">제출</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
