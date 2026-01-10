import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// 🌟 New Organized Imports
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Admin from './pages/Admin';

function App() {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [userProfile, setUserProfile] = useState({ name: 'Guest', email: '' });

    // Navigation State
    const [activeTab, setActiveTab] = useState('dashboard');

    // Check Login on Load
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setIsAuthenticated(true);
            setUserProfile(JSON.parse(savedUser));
        }
    }, []);

    const handleLoginSuccess = () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUserProfile(JSON.parse(savedUser));
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setActiveTab('dashboard');
    };

    // 🔒 1. IF NOT LOGGED IN
    if (!isAuthenticated) {
        return (
            <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center p-4">
                <ToastContainer position="top-right" theme="colored" />
                {showRegister ? (
                    <Register onSwitchToLogin={() => setShowRegister(false)} />
                ) : (
                    <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setShowRegister(true)} />
                )}
            </div>
        );
    }

    // 🔓 2. IF LOGGED IN
    return (
        <div className="d-flex bg-light min-vh-100 w-100 overflow-hidden">
            <ToastContainer position="top-right" theme="colored" />

            {/* 🌟 New Sidebar Component */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userProfile={userProfile}
            />

            {/* MAIN CONTENT AREA */}
            <main className="flex-grow-1 overflow-auto d-flex flex-column">

                {/* 🌟 New Header Component */}
                <Header activeTab={activeTab} onLogout={handleLogout} />

                <div className="container-fluid p-5" style={{ maxWidth: '1200px' }}>
                    {activeTab === 'dashboard' ? <Dashboard /> :
                        activeTab === 'payments' ? <Payments /> :
                            <Admin />}
                </div>
            </main>
        </div>
    );
}

export default App;