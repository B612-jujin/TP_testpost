import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function MySubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const studentId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await api.get(`/api/submissions/student/${studentId}`);
                setSubmissions(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSubmissions();
    }, [studentId]);

    return (
        <div style={{ padding: 20 }}>
            <h2>내 제출 목록</h2>
            <table border="1" cellPadding="5">
                <thead>
                <tr>
                    <th>과제ID</th>
                    <th>파일명</th>
                    <th>제출일</th>
                    <th>점수</th>
                    <th>피드백</th>
                </tr>
                </thead>
                <tbody>
                {submissions.map(s => (
                    <tr key={s.submission_id}>
                        <td>{s.assignment_id}</td>
                        <td>{s.original_filename}</td>
                        <td>{new Date(s.submitted_at).toLocaleString()}</td>
                        <td>{s.grade ?? "-"}</td>
                        <td>{s.feedback ?? "-"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
