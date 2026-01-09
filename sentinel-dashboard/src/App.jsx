import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Send, ShieldCheck, User, LogOut } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// 🌟 Import your modular pieces
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';  // The Charts & Goals
import Payments from './pages/Payments';    // The Form we just made

const FNB_TEAL = "#00a7a7";

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
            const parsed = JSON.parse(savedUser);
            setIsAuthenticated(true);
            setUserProfile(parsed);
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

    // 🔒 1. IF NOT LOGGED IN: Show Login/Register
    if (!isAuthenticated) {
        return (
            <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center p-4">
                <ToastContainer position="top-right" theme="colored" />
                {showRegister ? (
                    <Register onSwitchToLogin={() => setShowRegister(false)} />
                ) : (
                    <Login
                        onLoginSuccess={handleLoginSuccess}
                        onSwitchToRegister={() => setShowRegister(true)}
                    />
                )}
            </div>
        );
    }

    // 🔓 2. IF LOGGED IN: Show Main App Layout
    return (
        <div className="d-flex bg-light min-vh-100 w-100 overflow-hidden">
            <ToastContainer position="top-right" theme="colored" />

            {/* SIDEBAR NAVIGATION */}
            <nav className="d-flex flex-column p-4 text-white shadow-lg"
                 style={{ width: '280px', minWidth: '280px', backgroundColor: '#1a1a1a', zIndex: 1000 }}>

                <div className="d-flex align-items-center mb-5 px-2">
                    <ShieldCheck size={32} style={{ color: FNB_TEAL }} />
                    <div className="ms-3">
                        <div className="fw-bold h5 mb-0" style={{ letterSpacing: '1px' }}>SENTINEL</div>
                        <div className="small opacity-50" style={{ fontSize: '10px' }}>ENTERPRISE BANKING</div>
                    </div>
                </div>

                <div className="nav flex-column gap-3">
                    <button onClick={() => setActiveTab('dashboard')}
                            className={`btn d-flex align-items-center gap-3 p-3 text-start border-0 ${activeTab === 'dashboard' ? 'text-white shadow' : 'text-white-50'}`}
                            style={{ backgroundColor: activeTab === 'dashboard' ? FNB_TEAL : 'transparent', borderRadius: '12px' }}>
                        <LayoutDashboard size={20}/> Dashboard
                    </button>

                    <button onClick={() => setActiveTab('payments')}
                            className={`btn d-flex align-items-center gap-3 p-3 text-start border-0 ${activeTab === 'payments' ? 'text-white shadow' : 'text-white-50'}`}
                            style={{ backgroundColor: activeTab === 'payments' ? FNB_TEAL : 'transparent', borderRadius: '12px' }}>
                        <Send size={20}/> Payments
                    </button>
                </div>

                <div className="mt-auto p-3 rounded-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="bg-dark text-white p-2 rounded-circle border border-secondary">
                            <User size={18} />
                        </div>
                        <div className="overflow-hidden">
                            <div className="fw-bold small text-truncate">{userProfile.name || 'User'}</div>
                            <div className="opacity-50" style={{ fontSize: '10px' }}>{userProfile.email}</div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT AREA */}
            <main className="flex-grow-1 overflow-auto">
                <header className="bg-white border-bottom py-3 px-5 d-flex justify-content-between align-items-center sticky-top">
                    <h4 className="fw-bold mb-0 text-dark">
                        {activeTab === 'dashboard' ? 'Overview' : 'Transfer Funds'}
                    </h4>
                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 rounded-3 px-3">
                        <LogOut size={16} /> <span className="fw-bold">LOGOUT</span>
                    </button>
                </header>

                <div className="container-fluid p-5" style={{ maxWidth: '1200px' }}>
                    {/* 🌟 THIS SWITCHER IS NOW CLEAN AND SIMPLE */}
                    {activeTab === 'dashboard' ? <Dashboard /> : <Payments />}
                </div>
            </main>
        </div>
    );
}

export default App;