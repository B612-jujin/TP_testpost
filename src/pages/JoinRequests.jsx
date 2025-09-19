import React, { useEffect, useState } from "react";

export default function JoinRequests() {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch("http://localhost:5000/api/users/requests", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setRequests(data))
            .catch(err => console.error(err));
    }, []);

    const handleDecision = async (userId, approve) => {
        try {
            const res = await fetch(`http://localhost:5000/api/users/requests/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ approve })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(approve ? "승인 완료" : "거절 완료");
                setRequests(requests.filter(r => r.user_id !== userId));
            } else {
                setMessage(data.error || "처리 실패");
            }
        } catch (err) {
            console.error(err);
            setMessage("서버 오류");
        }
    };

    return (
        <div>
            <h2>가입 요청</h2>
            {message && <p>{message}</p>}
            <ul>
                {requests.map(r => (
                    <li key={r.user_id}>
                        {r.username} ({r.email})
                        <button onClick={() => handleDecision(r.user_id, true)}>승인</button>
                        <button onClick={() => handleDecision(r.user_id, false)}>거절</button>
                    </li>
                ))}
            </ul>
            {requests.length === 0 && <p>처리할 요청이 없습니다.</p>}
        </div>
    );
}
