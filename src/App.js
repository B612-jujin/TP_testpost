import React, { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");
        if (token) {
            setIsLoggedIn(true);
            setRole(userRole);
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setRole(null);
    };

    return (
        <div>
            {!isLoggedIn ? (
                <LoginPage onLogin={() => setIsLoggedIn(true)} />
            ) : (
                <HomePage role={role} onLogout={handleLogout} />
            )}
        </div>
    );
}
