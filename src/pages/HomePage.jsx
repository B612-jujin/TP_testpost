import React, { useState } from "react";
import Sidebar from "../component/Sidebar";
import AssignmentList from "../component/AssignmentList";
import AssignmentForm from "../component/AssignmentForm";
import ChangePassword from "./ChangePassword";
import AdminPages from "./AdminSignupRequests";

export default function HomePage({ role, onLogout }) {
    const [selectedMenu, setSelectedMenu] = useState("home");

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar
                role={role}
                onSelect={setSelectedMenu}
                onLogout={onLogout}
            />
            <div style={{ flex: 1, padding: "20px" }}>
                {selectedMenu === "home" && <h2>홈페이지</h2>}
                {selectedMenu === "assignments" && <AssignmentList role={role} />}
                {selectedMenu === "create-assignment" && role === "admin" && <AssignmentForm />}
                {selectedMenu === "change-password" && <ChangePassword />}
                {role === "admin" && selectedMenu === "admin" && <AdminPages />}
            </div>
        </div>
    );
}
