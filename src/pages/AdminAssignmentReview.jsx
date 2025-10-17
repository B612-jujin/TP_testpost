import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function AdminAssignmentReview({ assignmentId }) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin-assignments/${assignmentId}/submissions`);
            setSubmissions(res.data);
        } catch (err) {
            console.error(err);
            setMessage("제출 내역 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [assignmentId]);

    const handleGrade = async (submissionId, grade, feedback) => {
        try {
            await api.post(`/api/admin-assignments/submissions/${submissionId}/grade`, { grade, feedback });
            setMessage("평가 완료");
            fetchSubmissions(); // 갱신
        } catch (err) {
            console.error(err);
            setMessage("평가 실패");
        }
    };

    if (loading) return <p>로딩 중...</p>;

    if (!submissions.length) return <p>제출된 과제가 없습니다.</p>;

    return (
        <div>
            <h2>과제 제출 평가</h2>
            {message && <p>{message}</p>}
            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                <tr>
                    <th>학생</th>
                    <th>이메일</th>
                    <th>제출 파일</th>
                    <th>제출일</th>
                    <th>점수</th>
                    <th>피드백</th>
                    <th>평가</th>
                </tr>
                </thead>
                <tbody>
                {submissions.map(s => (
                    <tr key={s.submission_id}>
                        <td>{s.username}</td>
                        <td>{s.email}</td>
                        <td>{s.file_url ? <a href={s.file_url} target="_blank">보기</a> : "미제출"}</td>
                        <td>{new Date(s.submitted_at).toLocaleString()}</td>
                        <td>
                            <input
                                type="number"
                                defaultValue={s.grade || ""}
                                min="0"
                                max="100"
                                id={`grade-${s.submission_id}`}
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                defaultValue={s.feedback || ""}
                                id={`feedback-${s.submission_id}`}
                            />
                        </td>
                        <td>
                            <button
                                onClick={() => {
                                    const grade = document.getElementById(`grade-${s.submission_id}`).value;
                                    const feedback = document.getElementById(`feedback-${s.submission_id}`).value;
                                    handleGrade(s.submission_id, grade, feedback);
                                }}
                            >
                                제출
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
