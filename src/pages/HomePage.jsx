import React, { useState } from "react";
import Sidebar from "../component/Sidebar";
import AssignmentList from "../component/AssignmentList";
import AssignmentForm from "../component/AssignmentForm";
import TeamList from "../component/TeamList";
import TeamForm from "../component/TeamForm";
import AdminTeamManagement from "../component/AdminTeamManagement";
import ChangePassword from "./singin/ChangePassword";
import AdminPages from "./singin/AdminSignupRequests";

export default function HomePage({ role, onLogout }) {
    const [selectedMenu, setSelectedMenu] = useState("home");

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#1a1a2e" }}>
            <Sidebar
                role={role}
                onSelect={setSelectedMenu}
                onLogout={onLogout}
            />
            <div style={{ 
                flex: 1, 
                padding: "32px", 
                background: "#1a1a2e",
                minHeight: "100vh"
            }}>
                <div className="container" style={{ maxWidth: "none", padding: 0 }}>
                    {selectedMenu === "home" && (
                        <div className="card">
                            <div className="page-header" style={{ background: "transparent", boxShadow: "none", padding: 0, margin: 0 }}>
                                <h1 className="page-title">🏠 홈페이지</h1>
                                <p className="page-subtitle">
                                    {role === "admin" 
                                        ? "관리자님, 환영합니다! 과제와 팀을 관리해보세요." 
                                        : "학생님, 환영합니다! 과제를 확인하고 제출해보세요."
                                    }
                                </p>
                            </div>
                            
                            <div className="row mt-4">
                                <div className="col-6">
                                    <div className="card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                                        <h3 style={{ marginBottom: "16px" }}>📋 과제</h3>
                                        <p style={{ marginBottom: "20px" }}>
                                            {role === "admin" 
                                                ? "새로운 과제를 등록하고 기존 과제를 관리하세요." 
                                                : "새로운 과제를 확인하고 제출하세요."
                                            }
                                        </p>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => setSelectedMenu("assignments")}
                                        >
                                            {role === "admin" ? "과제 관리" : "내 과제"}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="col-6">
                                    <div className="card" style={{ background: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)", color: "white" }}>
                                        <h3 style={{ marginBottom: "16px" }}>👥 팀</h3>
                                        <p style={{ marginBottom: "20px" }}>
                                            {role === "admin" 
                                                ? "팀을 생성하고 학생들을 배정하세요." 
                                                : "배정된 팀을 확인하고 팀 과제를 제출하세요."
                                            }
                                        </p>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => setSelectedMenu(role === "admin" ? "team-management" : "teams")}
                                        >
                                            {role === "admin" ? "팀 관리" : "팀 관리"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {selectedMenu === "assignments" && <AssignmentList role={role} />}
                    {selectedMenu === "create-assignment" && role === "admin" && <AssignmentForm />}
                        {selectedMenu === "teams" && role === "student" && <TeamList onTeamSelected={(teamId) => setSelectedMenu("assignments")} />}
                    {selectedMenu === "team-management" && role === "admin" && <AdminTeamManagement />}
                    {selectedMenu === "create-team" && role === "admin" && <TeamForm onTeamCreated={() => setSelectedMenu("team-management")} />}
                    {selectedMenu === "change-password" && <ChangePassword />}
                    {role === "admin" && selectedMenu === "admin" && <AdminPages />}
                </div>
            </div>
        </div>
    );
}
