import React, { useState } from "react";

export default function Sidebar({ role, onSelect, onLogout }) {
    const [activeMenu, setActiveMenu] = useState("home");

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
        onSelect(menu);
    };

    const menuItems = [
        { id: "home", label: "홈", icon: "🏠" },
        { 
            id: "assignments", 
            label: role === "admin" ? "과제 관리" : "내 과제", 
            icon: role === "admin" ? "📋" : "📝" 
        }
    ];

    if (role === "student") {
        menuItems.push(
            { id: "teams", label: "팀 관리", icon: "👥" }
        );
    }

    if (role === "admin") {
        menuItems.push(
            { id: "create-assignment", label: "과제 등록", icon: "➕" },
            { id: "team-management", label: "팀 관리", icon: "👥" },
            { id: "create-team", label: "팀 생성", icon: "🏗️" },
            { id: "admin", label: "가입 요청 관리", icon: "👤" }
        );
    }

    menuItems.push(
        { id: "change-password", label: "비밀번호 변경", icon: "🔒" },
        { id: "logout", label: "로그아웃", icon: "🚪", action: onLogout }
    );

    return (
        <div style={{
            width: "280px",
            background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            minHeight: "100vh",
            padding: "24px 0",
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
            borderRight: "1px solid #3a3a4e"
        }}>
            <div style={{ padding: "0 24px", marginBottom: "32px" }}>
                <h2 style={{
                    color: "white",
                    fontSize: "24px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    textAlign: "center"
                }}>
                    🎓 과제 관리
                </h2>
                <p style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "14px",
                    textAlign: "center",
                    margin: 0
                }}>
                    {role === "admin" ? "관리자" : "학생"} 모드
                </p>
            </div>

            <nav>
                {menuItems.map((item) => (
                    <div key={item.id} style={{ marginBottom: "8px", padding: "0 16px" }}>
                        <button
                            onClick={() => item.action ? item.action() : handleMenuClick(item.id)}
                            style={{
                                width: "100%",
                                padding: "16px 20px",
                                border: "none",
                                borderRadius: "12px",
                                background: activeMenu === item.id 
                                    ? "rgba(255, 255, 255, 0.2)" 
                                    : "transparent",
                                color: "white",
                                fontSize: "16px",
                                fontWeight: activeMenu === item.id ? "600" : "500",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                textAlign: "left"
                            }}
                            onMouseEnter={(e) => {
                                if (activeMenu !== item.id) {
                                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeMenu !== item.id) {
                                    e.target.style.background = "transparent";
                                }
                            }}
                        >
                            <span style={{ fontSize: "20px" }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    </div>
                ))}
            </nav>

            <div style={{
                position: "absolute",
                bottom: "24px",
                left: "24px",
                right: "24px",
                padding: "16px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)"
            }}>
                <p style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "12px",
                    margin: 0,
                    textAlign: "center"
                }}>
                    과제 관리 시스템 v1.0
                </p>
            </div>
        </div>
    );
}
