import React from "react";

export default function Sidebar({ role, onSelect, onLogout }) {
    return (
        <div style={{ width: "200px", borderRight: "1px solid #ccc", padding: "20px" }}>
            <h3>메뉴</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                <li>
                    <button onClick={() => onSelect("home")}>홈</button>
                </li>
                <li>
                    <button onClick={() => onSelect("assignments")}>
                        {role === "admin" ? "과제 관리" : "내 과제"}
                    </button>
                </li>
                {role === "admin" && (
                    <>
                        <li>
                            <button onClick={() => onSelect("create-assignment")}>과제 등록</button>
                        </li>
                        <li>
                            <button onClick={() => onSelect("admin")}>가입 요청 관리</button>
                        </li>
                    </>
                )}
                <li>
                    <button onClick={() => onSelect("change-password")}>비밀번호 변경</button>
                </li>
                <li>
                    <button onClick={onLogout}>로그아웃</button>
                </li>
            </ul>
        </div>
    );
}
