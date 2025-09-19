import React, { useState, useEffect } from "react";

export default function MyAssignments() {
    const [submissions, setSubmissions] = useState([]);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch("http://localhost:5000/api/submissions/me", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setSubmissions(data))
            .catch(err => console.error(err));
    }, []);

    const handleFileChange = async (submissionId, file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`http://localhost:5000/api/submissions/${submissionId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("파일 수정 완료");
                // 새로고침
                setSubmissions(submissions.map(s => s.submission_id === submissionId ? { ...s, file_url: data.file_url } : s));
            } else {
                setMessage(data.error || "수정 실패");
            }
        } catch (err) {
            console.error(err);
            setMessage("서버 오류");
        }
    };

    return (
        <div>
            <h2>내 과제</h2>
            {message && <p>{message}</p>}
            <ul>
                {submissions.map(s => (
                    <li key={s.submission_id}>
                        <strong>{s.assignment_title}</strong> - 제출: {s.file_url ? <a href={s.file_url} target="_blank">파일 보기</a> : "미제출"}
                        <input
                            type="file"
                            onChange={(e) => handleFileChange(s.submission_id, e.target.files[0])}
                        />
                        <p>점수: {s.grade || "미채점"} | 피드백: {s.feedback || "-"}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
