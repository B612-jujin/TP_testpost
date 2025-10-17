import React, { useEffect, useState } from "react";

export default function AdminSignupRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://192.168.24.185:5000/api/auth/admin/signup-requests", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("요청 불러오기 실패");
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            console.error(err);
            alert("회원가입 요청 불러오기 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const res = await fetch(`http://192.168.24.185:5000/api/auth/admin/signup-requests/${id}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("승인 실패");
            alert("가입 승인 완료");
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert("가입 승인 실패");
        }
    };

    const handleReject = async (id) => {
        try {
            const res = await fetch(`http://192.168.24.185:5000/api/auth/admin/signup-requests/${id}/reject`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("거절 실패");
            alert("가입 거절 완료");
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert("가입 거절 실패");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (requests.length === 0) return <p>승인 대기 중인 회원가입 요청이 없습니다.</p>;

    return (
        <div>
            <h2>가입 요청 관리</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>요청일</th>
                    <th>승인/거절</th>
                </tr>
                </thead>
                <tbody>
                {requests.map((req) => (
                    <tr key={req.request_id}>
                        <td>{req.request_id}</td>
                        <td>{req.username}</td>
                        <td>{req.email}</td>
                        <td>{new Date(req.requested_at).toLocaleString()}</td>
                        <td>
                            <button onClick={() => handleApprove(req.request_id)}>승인</button>
                            <button onClick={() => handleReject(req.request_id)} style={{ marginLeft: "8px" }}>
                                거절
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
