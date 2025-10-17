import React, { useState, useEffect } from "react";

export default function StudntAssignmentSubmit({ assignmentId }) {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [submission, setSubmission] = useState(null);
    const [myTeams, setMyTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [assignmentInfo, setAssignmentInfo] = useState(null);

    const token = localStorage.getItem("token");

    // 기존 제출 불러오기
    useEffect(() => {
        fetch(`http://192.168.24.185:5000/api/assignments/${assignmentId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setAssignmentInfo(data.assignment);
                if (data.submission) {
                    setSubmission(data.submission);
                    if (data.submission.team_id) {
                        setSelectedTeamId(data.submission.team_id);
                    }
                }
                
                // 과제가 특정 팀용인 경우 자동으로 해당 팀 선택
                if (data.assignment.team_id) {
                    // 해당 팀이 내 팀 목록에 있는지 확인
                    const myTeam = myTeams.find(team => team.team_id === data.assignment.team_id);
                    if (myTeam) {
                        setSelectedTeamId(data.assignment.team_id);
                    }
                }
            })
            .catch(err => console.error(err));
    }, [assignmentId, token, myTeams]);

    // 내 팀 목록 불러오기
    useEffect(() => {
        fetch("http://192.168.24.185:5000/api/teams/my-teams", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setMyTeams(data))
            .catch(err => console.error(err));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert("파일을 선택해주세요");

        // 팀 선택 확인 (모든 제출은 팀 제출)
        if (!selectedTeamId) {
            return alert("팀을 선택해주세요");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("team_id", selectedTeamId);

        try {
            const res = await fetch(`http://192.168.24.185:5000/api/assignments/${assignmentId}/submit`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "제출 실패");

            setMessage(data.message);
            setSubmission({ 
                ...submission, 
                file_url: data.file_url,
                team_id: submissionType === "team" ? selectedTeamId : null
            });
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div className="card">
                <div className="page-header" style={{ background: "transparent", boxShadow: "none", padding: 0, margin: 0 }}>
                    <h2 className="page-title">
                        {submission ? "📝 팀 제출 수정" : "📤 팀 제출"}
                    </h2>
                    <p className="page-subtitle">
                        {submission ? "팀 제출을 수정하거나 새로운 파일로 교체하세요" : "팀으로 과제를 제출하세요"}
                    </p>
                </div>
            
            {submission?.file_url && (
                <div className="alert alert-info">
                    <h5 style={{ marginBottom: "12px" }}>📋 기존 제출 정보</h5>
                    <div className="d-flex flex-column gap-1">
                        <p>
                            <strong>파일:</strong> 
                            <a href={submission.file_url} target="_blank" rel="noopener noreferrer" 
                               style={{ marginLeft: "8px", color: "#667eea", textDecoration: "none" }}>
                                📎 파일 보기
                            </a>
                        </p>
                        {submission.team_name && (
                            <p><strong>제출 팀:</strong> 
                                <span style={{ 
                                    background: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)", 
                                    color: "white", 
                                    padding: "4px 8px", 
                                    borderRadius: "4px", 
                                    marginLeft: "8px",
                                    fontSize: "12px"
                                }}>
                                    {submission.team_name}
                                </span>
                            </p>
                        )}
                        <p><strong>제출일:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
                    </div>
                </div>
            )}

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    {/* 과제가 팀 전용인 경우 자동으로 팀 제출 모드 */}
                    {assignmentInfo?.team_id ? (
                        <div className="alert alert-info">
                            <h5 style={{ marginBottom: "12px" }}>👥 팀 과제</h5>
                            <p style={{ margin: 0, fontSize: "14px" }}>
                                이 과제는 팀 과제입니다. 팀으로 제출됩니다.
                            </p>
                        </div>
                    ) : (
                        /* 일반 과제인 경우 자동으로 팀 제출 모드 */
                        <div className="alert alert-info">
                            <h5 style={{ marginBottom: "12px" }}>👥 팀 제출</h5>
                            <p style={{ margin: 0, fontSize: "14px" }}>
                                이 과제는 팀으로 제출됩니다. 팀을 선택해주세요.
                            </p>
                        </div>
                    )}

                    {/* 팀 선택 (모든 과제는 팀 제출) */}
                    <div className="form-group">
                        <label htmlFor="teamSelect" className="form-label">👥 팀 선택</label>
                        <select
                            id="teamSelect"
                            className="form-select"
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            required
                            disabled={assignmentInfo?.team_id ? true : false}
                        >
                            <option value="">팀을 선택하세요</option>
                            {myTeams.map(team => (
                                <option key={team.team_id} value={team.team_id}>
                                    {team.team_name}
                                </option>
                            ))}
                        </select>
                        {assignmentInfo?.team_id && (
                            <div className="mt-2" style={{ fontSize: "12px", color: "#6c757d" }}>
                                이 과제는 특정 팀 전용입니다.
                            </div>
                        )}
                        {myTeams.length === 0 && (
                            <div className="alert alert-info mt-2">
                                <p style={{ margin: 0, fontSize: "14px" }}>
                                    가입된 팀이 없습니다. 관리자에게 팀 배정을 요청해주세요.
                                </p>
                            </div>
                        )}
                    </div>

                {/* 파일 선택 */}
                <div className="form-group">
                    <label htmlFor="fileInput" className="form-label">📎 파일 선택</label>
                    <input
                        id="fileInput"
                        type="file"
                        className="form-control"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                    />
                    <div className="mt-2" style={{ fontSize: "12px", color: "#6c757d" }}>
                        지원 형식: PDF, DOC, DOCX, PPT, PPTX, 이미지 파일
                    </div>
                </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ marginTop: "16px" }}
                    >
                        {submission ? "📝 팀 제출 수정" : "📤 팀 제출하기"}
                    </button>
            </form>

            {message && (
                <div className={`alert ${message.includes('완료') ? 'alert-success' : 'alert-danger'} mt-3`}>
                    {message}
                </div>
            )}
        </div>
    );
}
