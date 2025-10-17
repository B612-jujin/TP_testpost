import React, { useState, useEffect } from "react";

export default function AssignmentForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await fetch("http://192.168.24.185:5000/api/teams", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setTeams(data);
            }
        } catch (err) {
            console.error("팀 목록 조회 실패:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://192.168.24.185:5000/api/assignments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    title, 
                    description, 
                    due_date: dueDate,
                    team_id: selectedTeamId || null
                }),
            });
            const data = await res.json();
            if (res.ok) {
                alert("과제 등록 완료!");
                setTitle("");
                setDescription("");
                setDueDate("");
                setSelectedTeamId("");
            } else {
                setError(data.error || "과제 등록 실패");
            }
        } catch (err) {
            setError("서버 오류 발생");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="page-header" style={{ background: "transparent", boxShadow: "none", padding: 0, margin: 0 }}>
                <h1 className="page-title">➕ 과제 등록</h1>
                <p className="page-subtitle">새로운 과제를 등록하세요</p>
            </div>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div className="form-group">
                    <label className="form-label">📝 과제 제목</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="과제 제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">📅 마감일</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">📋 과제 설명</label>
                    <textarea
                        className="form-textarea"
                        placeholder="과제에 대한 상세 설명을 입력하세요"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">👥 대상 팀 (선택사항)</label>
                    <select
                        className="form-select"
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                    >
                        <option value="">전체 학생 (팀 선택 안함)</option>
                        {teams.map(team => (
                            <option key={team.team_id} value={team.team_id}>
                                {team.team_name} ({team.member_count}명)
                            </option>
                        ))}
                    </select>
                    <div className="mt-2" style={{ fontSize: "12px", color: "#6c757d" }}>
                        특정 팀을 선택하면 해당 팀 학생들만 과제를 볼 수 있습니다.
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                >
                    {loading ? "등록 중..." : "📝 과제 등록"}
                </button>
            </form>

            <div className="mt-4" style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <h4>과제 등록 안내</h4>
                <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
                    <li>과제 제목과 마감일은 필수 입력 항목입니다.</li>
                    <li>팀을 선택하면 해당 팀 학생들만 과제를 확인할 수 있습니다.</li>
                    <li>팀을 선택하지 않으면 모든 학생이 과제를 확인할 수 있습니다.</li>
                    <li>과제 등록 후 수정이 가능합니다.</li>
                </ul>
            </div>
        </div>
    );
}
