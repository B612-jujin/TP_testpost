import React, { useEffect, useState } from "react";

export default function AssignmentList({ role }) {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/assignments", {
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        })
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
                setAssignments(sorted);
            })
            .catch(err => console.error(err));
    }, []);

    const fetchSubmissions = (assignmentId) => {
        fetch(`http://localhost:5000/api/assignments/${assignmentId}/submissions`, {
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        })
            .then(res => res.json())
            .then(data => setSubmissions(data))
            .catch(err => console.error(err));
    };

    return (
        <div>
            <h2>{role === "admin" ? "과제 관리" : "내 과제"}</h2>
            <ul>
                {assignments.map(a => (
                    <li key={a.assignment_id}>
                        <button onClick={() => {
                            setSelectedAssignment(a.assignment_id);
                            role === "admin" && fetchSubmissions(a.assignment_id);
                        }}>
                            {a.title} ({a.due_date})
                        </button>
                    </li>
                ))}
            </ul>

            {role === "admin" && selectedAssignment && (
                <div>
                    <h3>제출 현황</h3>
                    <ul>
                        {submissions.map(s => (
                            <li key={s.submission_id}>{s.student_name} - {s.file_url}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
