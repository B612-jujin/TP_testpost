import React, { useState, useEffect } from "react";

export default function MyAssignments() {
    const [submissions, setSubmissions] = useState([]);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    // 내 제출 내역 + 평가 상태 가져오기
    const fetchSubmissions = async () => {
        try {
            const res = await fetch("http://192.168.24.185:5000/api/submissions/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setSubmissions(data);
        } catch (err) {
            console.error(err);
            setMessage("제출 내역 조회 실패");
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleFileChange = async (submissionId, file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`http://192.168.24.185:5000/api/submissions/${submissionId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("파일 수정 완료");
                // 제출 상태 + 점수/피드백 갱신
                setSubmissions(submissions.map(s =>
                    s.submission_id === submissionId
                        ? { ...s, file_url: data.file_url, grade: data.grade, feedback: data.feedback }
                        : s
                ));
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
                        <p>
                            점수: {s.grade !== null ? s.grade : "미채점"} |
                            피드백: {s.feedback || "-"}
                        </p>
                        {s.due_date && <p>마감일: {new Date(s.due_date).toLocaleString()}</p>}
                        {s.description && <p>내용: {s.description}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
