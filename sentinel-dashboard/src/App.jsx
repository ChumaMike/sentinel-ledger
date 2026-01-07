import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    LayoutDashboard, Send, Landmark,
    History, ShieldCheck, Bell, User, AlertTriangle, ShieldAlert, LogOut
} from 'lucide-react';

import Login from './components/Login';

const FNB_TEAL = "#00a7a7";
const FNB_AMBER = "#ffb81c";

function App() {
    // 1. Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('sentinel_token'));

    // 2. Profile State (Initialized from storage or default)
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('sentinel_profile');
        return saved ? JSON.parse(saved) : { name: "Guest", email: "N/A" };
    });

    // 3. Banking Data States
    const [accounts, setAccounts] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [alerts, setAlerts] = useState([]);
    const [history, setHistory] = useState([]);
    const [transfer, setTransfer] = useState({ fromId: '', toId: '', amount: '' });
    const [loading, setLoading] = useState(false);

    // 🌟 Auth Helper
    const getAuthConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('sentinel_token')}` }
    });

    // 🌟 Data Fetchers
    const fetchData = async () => {
        try {
            const config = getAuthConfig();
            const accRes = await axios.get('http://localhost:8080/api/accounts', config);
            setAccounts(accRes.data);
            const histRes = await axios.get('http://localhost:8080/api/accounts/history', config);
            setHistory(histRes.data);
        } catch (e) {
            console.error("Dashboard Sync Error:", e);
            if (e.response?.status === 403) handleLogout();
        }
    };

    const fetchWatchdogAlerts = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/monitor/alerts');
            setAlerts(res.data);
        } catch (e) {
            console.warn("Monitor standby...");
        }
    };

    // 🌟 Lifecycle: The Handshake
    useEffect(() => {
        if (isAuthenticated) {
            // Re-read profile from storage (crucial for redirect)
            const savedProfile = localStorage.getItem('sentinel_profile');
            if (savedProfile) {
                setProfile(JSON.parse(savedProfile));
            }
            fetchData();
            fetchWatchdogAlerts();

            // Auto-refresh alerts every 10s
            const interval = setInterval(fetchWatchdogAlerts, 10000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem('sentinel_token');
        localStorage.removeItem('sentinel_profile');
        setIsAuthenticated(false);
        setAccounts([]);
        setProfile({ name: "Guest", email: "N/A" });
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = getAuthConfig();
            const url = `http://localhost:8080/api/accounts/transfer?fromId=${transfer.fromId}&toId=${transfer.toId}&amount=${transfer.amount}`;
            const res = await axios.post(url, {}, config);
            toast.success(res.data);
            fetchData();
            setActiveTab('dashboard');
            setTransfer({ fromId: '', toId: '', amount: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || "Transfer Denied");
        } finally { setLoading(false); }
    };

    // --- RENDER LOGIC ---
    if (!isAuthenticated) {
        return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="d-flex bg-light min-vh-100 w-100 overflow-hidden">
            <ToastContainer position="top-right" theme="colored" />

            {/* --- SIDEBAR --- */}
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
                    <button onClick={() => setActiveTab('dashboard')} className={`btn d-flex align-items-center gap-3 p-3 text-start border-0 transition-all ${activeTab === 'dashboard' ? 'text-white shadow' : 'text-white-50'}`} style={{ backgroundColor: activeTab === 'dashboard' ? FNB_TEAL : 'transparent', borderRadius: '12px' }}>
                        <LayoutDashboard size={20}/> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('payments')} className={`btn d-flex align-items-center gap-3 p-3 text-start border-0 ${activeTab === 'payments' ? 'text-white shadow' : 'text-white-50'}`} style={{ backgroundColor: activeTab === 'payments' ? FNB_TEAL : 'transparent', borderRadius: '12px' }}>
                        <Send size={20}/> Payments
                    </button>
                </div>

                {/* Personalized User Profile Section */}
                <div className="mt-auto p-3 rounded-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="bg-dark text-white p-2 rounded-circle border border-secondary">
                            <User size={18} />
                        </div>
                        <div className="overflow-hidden">
                            <div className="fw-bold small text-truncate">{profile.name}</div>
                            <div className="opacity-50" style={{ fontSize: '10px' }}>{profile.email}</div>
                        </div>
                    </div>
                    <div className="small opacity-50 mb-1" style={{ fontSize: '10px' }}>SECURED BY</div>
                    <div className="fw-bold small" style={{ color: FNB_AMBER }}>SENTINEL_AI_v2.1</div>
                </div>
            </nav>

            <main className="flex-grow-1 overflow-auto">
                <header className="bg-white border-bottom py-3 px-5 d-flex justify-content-between align-items-center sticky-top">
                    <h4 className="fw-bold mb-0 text-dark">{activeTab === 'dashboard' ? 'Overview' : 'Transfer Funds'}</h4>
                    <div className="d-flex gap-4 align-items-center">
                        <Bell size={20} className="text-muted"/>
                        {/* Logout Implementation */}
                        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 rounded-3 px-3">
                            <LogOut size={16} />
                            <span className="fw-bold">LOGOUT</span>
                        </button>
                    </div>
                </header>

                <div className="container-fluid p-5" style={{ maxWidth: '1200px' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'dashboard' ? (
                            <motion.div key="dash" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <div className="row g-4 mb-5">
                                    {accounts.map(acc => {
                                        const isLowBalance = acc.balance < 2000;
                                        const barColor = isLowBalance ? "#ff4d4d" : FNB_TEAL;
                                        return (
                                            <div className="col-md-6" key={acc.accountId}>
                                                <div className="card border-0 shadow-sm p-4 h-100 position-relative" style={{ borderRadius: '16px' }}>
                                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '100%', backgroundColor: barColor, borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}></div>
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <h6 className="text-muted small fw-bold text-uppercase">Account Savings</h6>
                                                        <span className={`badge rounded-pill px-2 py-1 small ${isLowBalance ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>{isLowBalance ? "LOW BALANCE" : "HEALTHY"}</span>
                                                    </div>
                                                    <h2 className="fw-bold mb-4">R {acc.balance.toLocaleString()}</h2>
                                                    <div className="progress" style={{ height: '6px', backgroundColor: '#f0f0f0' }}>
                                                        <div className="progress-bar" style={{ width: isLowBalance ? '30%' : '100%', backgroundColor: barColor }} />
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center text-muted small mt-4">
                                                        <span>6284 **** {acc.accountId}</span>
                                                        <Landmark size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="card border-0 shadow-sm p-4">
                                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                        <History size={20} style={{ color: FNB_TEAL }}/> Transaction Audit Log
                                    </h5>
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead className="table-light">
                                            <tr className="small text-muted" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                                <th>TIMESTAMP</th>
                                                <th>TYPE</th>
                                                <th>AMOUNT</th>
                                                <th>SENTINEL STATUS</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {history.map((tx) => (
                                                <tr key={tx.transactionId}>
                                                    <td className="small text-muted">{new Date(tx.timestamp).toLocaleString()}</td>
                                                    <td className="fw-bold">Electronic Transfer</td>
                                                    <td className="fw-bold">R {tx.amount.toLocaleString()}</td>
                                                    <td><span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">SUCCESS</span></td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="col-md-6 mx-auto">
                                <div className="card border-0 shadow-lg p-5" style={{ borderTop: `6px solid ${FNB_AMBER}`, borderRadius: '20px' }}>
                                    <h3 className="fw-bold mb-4" style={{ color: FNB_TEAL }}>Make a Payment</h3>
                                    {alerts.length > 0 ? (
                                        <div className="alert alert-danger p-4 text-center">
                                            <ShieldAlert size={48} className="mb-3 mx-auto d-block" />
                                            <h5>Sentinel Lockdown Active</h5>
                                            <p className="small mb-0">Transactions are suspended by AI Monitor.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleTransfer}>
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted">SENDER ACCOUNT ID</label>
                                                <input type="number" className="form-control form-control-lg bg-light border-0"
                                                       value={transfer.fromId} onChange={e => setTransfer({...transfer, fromId: e.target.value})} required />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted">RECIPIENT ACCOUNT ID</label>
                                                <input type="number" className="form-control form-control-lg bg-light border-0"
                                                       value={transfer.toId} onChange={e => setTransfer({...transfer, toId: e.target.value})} required />
                                            </div>
                                            <div className="mb-4">
                                                <label className="form-label small fw-bold text-muted">AMOUNT (ZAR)</label>
                                                <input type="number" className="form-control form-control-lg bg-light border-0 fw-bold"
                                                       value={transfer.amount} onChange={e => setTransfer({...transfer, amount: e.target.value})} required />
                                            </div>
                                            <button className="btn btn-lg w-100 fw-bold text-white py-3 shadow-sm" style={{ backgroundColor: FNB_TEAL }} disabled={loading}>
                                                {loading ? 'PROCESSING...' : 'PAY RECIPIENT'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default App;