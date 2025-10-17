// AssignmentListWithDetail.jsx
import React, { useState, useEffect } from "react";
import StudntAssignmentSubmit from "../pages/StudntAssignmentSubmit";

export default function AssignmentListWithDetail({ role }) {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [message, setMessage] = useState("");
    const [teamSubmissions, setTeamSubmissions] = useState(null);
    const [teamSubmissionDetails, setTeamSubmissionDetails] = useState(null);
    const [viewMode, setViewMode] = useState("detail"); // "detail", "team-submissions", "team-submission-details"

    const token = localStorage.getItem("token");

    // 과제 목록 불러오기
    useEffect(() => {
        fetch("http://192.168.24.185:5000/api/assignments", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
                setAssignments(sorted);
            })
            .catch(err => console.error(err));
    }, [token]);

    // 과제 클릭 시 상세 조회
    const selectAssignment = async (assignmentId) => {
        setMessage("");
        setViewMode("detail");
        try {
            const res = await fetch(`http://192.168.24.185:5000/api/assignments/${assignmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("상세 조회 실패");
            const data = await res.json();
            setSelectedAssignment(data);
        } catch (err) {
            console.error(err);
            setMessage(err.message);
        }
    };

    // 팀별 제출 현황 조회
    const fetchTeamSubmissions = async (assignmentId) => {
        setMessage("");
        setViewMode("team-submissions");
        try {
            const res = await fetch(`http://192.168.24.185:5000/api/assignments/team-submissions/${assignmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("제출 현황 조회 실패");
            const data = await res.json();
            setTeamSubmissions(data);
        } catch (err) {
            console.error(err);
            setMessage(err.message);
        }
    };

    // 팀 제출 상세 정보 조회 (교수용)
    const fetchTeamSubmissionDetails = async (assignmentId) => {
        setMessage("");
        setViewMode("team-submission-details");
        try {
            const res = await fetch(`http://192.168.24.185:5000/api/assignments/team-submission-details/${assignmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("제출 상세 정보 조회 실패");
            const data = await res.json();
            setTeamSubmissionDetails(data);
        } catch (err) {
            console.error(err);
            setMessage(err.message);
        }
    };


    return (
        <div>
            <div className="page-header" style={{ background: "transparent", boxShadow: "none", padding: 0, margin: 0 }}>
                <h1 className="page-title">
                    {role === "admin" ? "📋 과제 관리" : "📝 내 과제"}
                </h1>
                <p className="page-subtitle">
                    {role === "admin" ? "과제를 관리하고 제출 현황을 확인하세요" : "과제를 확인하고 제출하세요"}
                </p>
            </div>

            <div className="row">
                <div className="col-4">
                    <div className="card">
                        <h3 className="mb-3">📚 과제 목록</h3>
                        {assignments.length === 0 ? (
                            <div className="text-center p-4" style={{ color: "#6c757d" }}>
                                <p>등록된 과제가 없습니다.</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                                {assignments.map(a => (
                                    <div key={a.assignment_id} className="card" style={{ marginBottom: "12px", cursor: "pointer" }}
                                         onClick={() => selectAssignment(a.assignment_id)}>
                                        <h5 style={{ marginBottom: "8px", color: "#2c3e50" }}>{a.title}</h5>
                                        <p style={{ fontSize: "14px", color: "#6c757d", margin: 0 }}>
                                            <strong>마감일:</strong> {new Date(a.due_date).toLocaleDateString()}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "#adb5bd", margin: "4px 0 0 0" }}>
                                            {a.creator}
                                        </p>
                                        {a.team_name && (
                                            <div style={{ 
                                                background: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)", 
                                                color: "white", 
                                                padding: "2px 6px", 
                                                borderRadius: "4px", 
                                                fontSize: "10px",
                                                marginTop: "4px",
                                                display: "inline-block"
                                            }}>
                                                👥 {a.team_name}
                                            </div>
                                        )}
                                        {role === "admin" && (
                                            <div className="d-flex gap-2 mt-2" style={{ gap: "8px" }}>
                                                <button 
                                                    className="btn btn-primary btn-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        fetchTeamSubmissions(a.assignment_id);
                                                    }}
                                                    style={{ minWidth: "90px" }}
                                                >
                                                    📊 현황
                                                </button>
                                                <button 
                                                    className="btn btn-success btn-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        fetchTeamSubmissionDetails(a.assignment_id);
                                                    }}
                                                    style={{ minWidth: "90px" }}
                                                >
                                                    📋 상세
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-8">
                    {selectedAssignment && viewMode === "detail" && (
                        <div className="card">
                            <h3 className="mb-3">{selectedAssignment.assignment.title}</h3>
                            <div className="d-flex flex-column gap-2">
                    <p><strong>마감일:</strong> {new Date(selectedAssignment.assignment.due_date).toLocaleString()}</p>
                    <p><strong>내용:</strong> {selectedAssignment.assignment.description}</p>
                    <p><strong>첨부파일:</strong> {selectedAssignment.assignment.file_url ? <a href={selectedAssignment.assignment.file_url} target="_blank">다운로드</a> : "없음"}</p>
                            </div>

                    {role === "student" && (
                                <div className="mt-4">
                                    <StudntAssignmentSubmit assignmentId={selectedAssignment.assignment.assignment_id} />
                                </div>
                            )}

                            {message && <div className="alert alert-danger mt-3">{message}</div>}
                        </div>
                    )}

                    {teamSubmissions && viewMode === "team-submissions" && (
                        <div className="card">
                            <div className="d-flex justify-between align-center mb-3">
                                <h3>👥 팀별 제출 현황</h3>
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setViewMode("detail")}
                                >
                                    상세보기로 돌아가기
                                </button>
                            </div>
                            
                            <div className="card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", marginBottom: "20px" }}>
                                <h4 style={{ marginBottom: "12px" }}>{teamSubmissions.assignment.title}</h4>
                                <div className="d-flex flex-column gap-1" style={{ fontSize: "14px" }}>
                                    <p><strong>마감일:</strong> {new Date(teamSubmissions.assignment.due_date).toLocaleString()}</p>
                                    <p><strong>내용:</strong> {teamSubmissions.assignment.description}</p>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-6">
                                    <h5 className="mb-3">👥 팀 제출 현황</h5>
                                    {teamSubmissions.team_submissions.length === 0 ? (
                                        <div className="text-center p-3" style={{ color: "#6c757d" }}>
                                            <p>해당 과제를 위한 팀이 없습니다.</p>
                                            <p style={{ fontSize: "12px", color: "#8a8a9e" }}>
                                                이 과제는 특정 팀용이 아닙니다.
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                                            {teamSubmissions.team_submissions.map(team => (
                                                <div key={team.team_id} className="card" style={{ marginBottom: "12px" }}>
                                                    <h6 style={{ marginBottom: "8px", color: "#2c3e50" }}>{team.team_name}</h6>
                                                    <div className="d-flex justify-between align-center mb-2">
                                                        <span style={{ fontSize: "14px", color: "#6c757d" }}>
                                                            멤버: {team.total_members}명
                                                        </span>
                                                        <span style={{ 
                                                            fontSize: "14px", 
                                                            fontWeight: "600",
                                                            color: team.submitted_count > 0 ? "#28a745" : "#dc3545"
                                                        }}>
                                                            제출: {team.submitted_count}팀
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                                                        {team.member_status}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="col-6">
                                    <h5 className="mb-3">👤 개인 제출 현황</h5>
                                    {teamSubmissions.individual_submissions.length === 0 ? (
                                        <div className="text-center p-3" style={{ color: "#6c757d" }}>
                                            <p>개인 제출자가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                                            {teamSubmissions.individual_submissions.map(student => (
                                                <div key={student.user_id} className="card" style={{ marginBottom: "8px" }}>
                                                    <div className="d-flex justify-between align-center">
                        <div>
                                                            <strong style={{ color: "#2c3e50" }}>{student.username}</strong>
                                                            <div style={{ fontSize: "12px", color: "#6c757d" }}>
                                                                {student.email}
                                                            </div>
                                                        </div>
                                                        <span style={{ 
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: "white",
                                                            background: student.status === "제출" ? "#28a745" : "#dc3545"
                                                        }}>
                                                            {student.status}
                                                        </span>
                                                    </div>
                                                    {student.submitted_at && (
                                                        <div style={{ fontSize: "11px", color: "#adb5bd", marginTop: "4px" }}>
                                                            제출일: {new Date(student.submitted_at).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {message && <div className="alert alert-danger mt-3">{message}</div>}
                        </div>
                    )}

                    {teamSubmissionDetails && viewMode === "team-submission-details" && (
                        <div className="card">
                            <div className="d-flex justify-between align-center mb-3">
                                <h3>📋 팀 제출 상세 정보</h3>
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setViewMode("detail")}
                                >
                                    상세보기로 돌아가기
                                </button>
                            </div>
                            
                            <div className="card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", marginBottom: "20px" }}>
                                <h4 style={{ marginBottom: "12px" }}>{teamSubmissionDetails.assignment.title}</h4>
                                <div className="d-flex flex-column gap-1" style={{ fontSize: "14px" }}>
                                    <p><strong>마감일:</strong> {new Date(teamSubmissionDetails.assignment.due_date).toLocaleString()}</p>
                                    <p><strong>내용:</strong> {teamSubmissionDetails.assignment.description}</p>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-6">
                                    <h5 className="mb-3">👥 팀 제출 상세</h5>
                                    {teamSubmissionDetails.team_submissions.length === 0 ? (
                                        <div className="text-center p-3" style={{ color: "#6c757d" }}>
                                            <p>해당 과제를 위한 팀 제출이 없습니다.</p>
                                            <p style={{ fontSize: "12px", color: "#8a8a9e" }}>
                                                이 과제는 특정 팀용이 아닙니다.
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                                            {teamSubmissionDetails.team_submissions.map(submission => (
                                                <div key={submission.submission_id} className="card" style={{ marginBottom: "16px" }}>
                                                    <div className="d-flex justify-between align-start mb-3">
                                                        <h6 style={{ color: "#e0e0e0", margin: 0 }}>{submission.team_name}</h6>
                                                        <span style={{ 
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: "white",
                                                            background: "#28a745"
                                                        }}>
                                                            제출완료
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="d-flex flex-column gap-2" style={{ fontSize: "14px", color: "#b0b0c0" }}>
                                                        <p><strong>제출자:</strong> {submission.submitted_by} ({submission.submitted_by_email})</p>
                                                        <p><strong>팀 멤버:</strong> {submission.team_members}</p>
                                                        <p><strong>제출일:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
                                                        {submission.file_url && (
                                                            <p><strong>파일:</strong> 
                                                                <a href={submission.file_url} target="_blank" rel="noopener noreferrer"
                                                                   style={{ marginLeft: "8px", color: "#667eea", textDecoration: "none" }}>
                                                                    📎 파일 다운로드
                                                                </a>
                                                            </p>
                                                        )}
                                                        {submission.grade && (
                                                            <p><strong>점수:</strong> {submission.grade}점</p>
                                                        )}
                                                        {submission.feedback && (
                                                            <p><strong>피드백:</strong> {submission.feedback}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="col-6">
                                    <h5 className="mb-3">👤 개인 제출 상세</h5>
                                    {teamSubmissionDetails.individual_submissions.length === 0 ? (
                                        <div className="text-center p-3" style={{ color: "#6c757d" }}>
                                            <p>개인 제출이 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                                            {teamSubmissionDetails.individual_submissions.map(submission => (
                                                <div key={submission.submission_id} className="card" style={{ marginBottom: "12px" }}>
                                                    <div className="d-flex justify-between align-start mb-2">
                                                        <h6 style={{ color: "#e0e0e0", margin: 0 }}>{submission.submitted_by}</h6>
                                                        <span style={{ 
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            color: "white",
                                                            background: "#28a745"
                                                        }}>
                                                            제출완료
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="d-flex flex-column gap-1" style={{ fontSize: "12px", color: "#b0b0c0" }}>
                                                        <p><strong>이메일:</strong> {submission.submitted_by_email}</p>
                                                        <p><strong>제출일:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
                                                        {submission.file_url && (
                                                            <p><strong>파일:</strong> 
                                                                <a href={submission.file_url} target="_blank" rel="noopener noreferrer"
                                                                   style={{ marginLeft: "8px", color: "#667eea", textDecoration: "none" }}>
                                                                    📎 파일 다운로드
                                                                </a>
                                                            </p>
                                                        )}
                                                        {submission.grade && (
                                                            <p><strong>점수:</strong> {submission.grade}점</p>
                                                        )}
                                                        {submission.feedback && (
                                                            <p><strong>피드백:</strong> {submission.feedback}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {message && <div className="alert alert-danger mt-3">{message}</div>}
                        </div>
                    )}

                    {!selectedAssignment && !teamSubmissions && !teamSubmissionDetails && (
                        <div className="card">
                            <div className="text-center p-4" style={{ color: "#6c757d" }}>
                                <div style={{ fontSize: "48px", marginBottom: "16px" }}>👈</div>
                                <p>왼쪽에서 과제를 선택하면</p>
                                <p>상세 정보가 표시됩니다.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
