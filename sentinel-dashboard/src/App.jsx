import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    LayoutDashboard, Send, Landmark, History, ShieldCheck,
    Bell, User, AlertTriangle, ShieldAlert, LogOut, CreditCard
} from 'lucide-react';

import Login from './components/Login';

const FNB_TEAL = "#00a7a7";
const FNB_AMBER = "#ffb81c";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('sentinel_token'));

    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('sentinel_profile');
        return saved ? JSON.parse(saved) : { name: "Guest", email: "N/A" };
    });

    const [accounts, setAccounts] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [alerts, setAlerts] = useState([]);
    const [history, setHistory] = useState([]);

    // 🌟 Updated Transfer State for Retail Logic
    const [transfer, setTransfer] = useState({
        fromAcc: '',      // Your Account Number
        toAcc: '',        // Recipient Account/Card Number
        amount: '',
        description: ''   // e.g. "Rent"
    });

    const [loading, setLoading] = useState(false);

    const getAuthConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('sentinel_token')}` }
    });

    const fetchData = async () => {
        try {
            const config = getAuthConfig();
            const accRes = await axios.get('http://localhost:8080/api/accounts', config);
            setAccounts(accRes.data);

            // Set default "From" account to the first one found
            if(accRes.data.length > 0 && !transfer.fromAcc) {
                setTransfer(prev => ({ ...prev, fromAcc: accRes.data[0].accountNumber }));
            }

            const histRes = await axios.get('http://localhost:8080/api/accounts/history', config);
            setHistory(histRes.data);
        } catch (e) {
            console.error("Sync Error:", e);
            if (e.response?.status === 403) toast.error("403 Forbidden: Key Mismatch!");
        }
    };

    const fetchWatchdogAlerts = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/monitor/alerts');
            setAlerts(res.data);
        } catch (e) { console.warn("Monitor standby..."); }
    };

    useEffect(() => {
        if (isAuthenticated) {
            const savedProfile = localStorage.getItem('sentinel_profile');
            if (savedProfile) setProfile(JSON.parse(savedProfile));
            fetchData();
            fetchWatchdogAlerts();
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
            // 🌟 Sending Data to the NEW AccountController endpoint
            const url = `http://localhost:8080/api/accounts/transfer?fromAcc=${transfer.fromAcc}&toAcc=${transfer.toAcc}&amount=${transfer.amount}&description=${encodeURIComponent(transfer.description)}`;

            const res = await axios.post(url, {}, config);
            toast.success(res.data);
            fetchData();
            setActiveTab('dashboard');
            setTransfer({ ...transfer, toAcc: '', amount: '', description: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || "Transfer Denied");
        } finally { setLoading(false); }
    };

    if (!isAuthenticated) return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;

    return (
        <div className="d-flex bg-light min-vh-100 w-100 overflow-hidden">
            <ToastContainer position="top-right" theme="colored" />

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
                    <button onClick={() => setActiveTab('dashboard')} className={`btn d-flex align-items-center gap-3 p-3 text-start border-0 ${activeTab === 'dashboard' ? 'text-white shadow' : 'text-white-50'}`} style={{ backgroundColor: activeTab === 'dashboard' ? FNB_TEAL : 'transparent', borderRadius: '12px' }}>
                        <LayoutDashboard size={20}/> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('payments')} className={`btn d-flex align-items-center gap-3 p-3 text-start border-0 ${activeTab === 'payments' ? 'text-white shadow' : 'text-white-50'}`} style={{ backgroundColor: activeTab === 'payments' ? FNB_TEAL : 'transparent', borderRadius: '12px' }}>
                        <Send size={20}/> Payments
                    </button>
                </div>

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
                </div>
            </nav>

            <main className="flex-grow-1 overflow-auto">
                <header className="bg-white border-bottom py-3 px-5 d-flex justify-content-between align-items-center sticky-top">
                    <h4 className="fw-bold mb-0 text-dark">{activeTab === 'dashboard' ? 'Overview' : 'Transfer Funds'}</h4>
                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 rounded-3 px-3">
                        <LogOut size={16} /> <span className="fw-bold">LOGOUT</span>
                    </button>
                </header>

                <div className="container-fluid p-5" style={{ maxWidth: '1200px' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'dashboard' ? (
                            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {/* 🌟 ACCOUNTS LIST */}
                                <div className="row g-4 mb-5">
                                    {accounts.map(acc => {
                                        const isLow = acc.balance < 2000;
                                        return (
                                            <div className="col-md-6" key={acc.accountId}>
                                                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
                                                    <div className="d-flex justify-content-between mb-3">
                                                        <h6 className="text-muted small fw-bold text-uppercase">{acc.accountType} ACCOUNT</h6>
                                                        <span className={`badge rounded-pill px-2 ${isLow ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>{isLow ? "LOW FUNDS" : "ACTIVE"}</span>
                                                    </div>
                                                    <h2 className="fw-bold mb-4">R {acc.balance.toLocaleString()}</h2>
                                                    <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <CreditCard size={18} className="text-muted"/>
                                                            <span className="small fw-bold text-muted">{acc.accountNumber}</span>
                                                        </div>
                                                        <span className="small text-muted opacity-50">Sentinel SAVINGS</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* 🌟 TRANSACTION HISTORY */}
                                <div className="card border-0 shadow-sm p-4">
                                    <h5 className="fw-bold mb-4"><History size={20}/> Recent Activity</h5>
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead className="table-light">
                                            <tr className="small text-muted">
                                                <th>DATE</th>
                                                <th>DESCRIPTION</th>
                                                <th>FROM / TO</th>
                                                <th>AMOUNT</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {history.map((tx) => (
                                                <tr key={tx.transactionId}>
                                                    <td className="small text-muted">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                                    <td className="fw-bold">{tx.description || "Electronic Transfer"}</td>
                                                    <td className="small text-muted">{tx.senderAccountNumber} ➝ {tx.receiverAccountNumber}</td>
                                                    <td className="fw-bold">R {tx.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-md-6 mx-auto">
                                <div className="card border-0 shadow-lg p-5" style={{ borderTop: `6px solid ${FNB_AMBER}`, borderRadius: '20px' }}>
                                    <h3 className="fw-bold mb-4" style={{ color: FNB_TEAL }}>New Payment</h3>

                                    <form onSubmit={handleTransfer}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">PAY FROM</label>
                                            <select className="form-select form-select-lg bg-light border-0"
                                                    value={transfer.fromAcc}
                                                    onChange={e => setTransfer({...transfer, fromAcc: e.target.value})}>
                                                {accounts.map(acc => (
                                                    <option key={acc.accountId} value={acc.accountNumber}>
                                                        {acc.accountType} - {acc.accountNumber} (R {acc.balance})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">BENEFICIARY ACCOUNT / CARD NO.</label>
                                            <input type="text" className="form-control form-control-lg bg-light border-0"
                                                   value={transfer.toAcc} onChange={e => setTransfer({...transfer, toAcc: e.target.value})}
                                                   placeholder="e.g. 100200300" required />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">DESCRIPTION</label>
                                            <input type="text" className="form-control form-control-lg bg-light border-0"
                                                   value={transfer.description} onChange={e => setTransfer({...transfer, description: e.target.value})}
                                                   placeholder="e.g. Rent, Dinner" required />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">AMOUNT (ZAR)</label>
                                            <input type="number" className="form-control form-control-lg bg-light border-0 fw-bold"
                                                   value={transfer.amount} onChange={e => setTransfer({...transfer, amount: e.target.value})} required />
                                        </div>

                                        <button className="btn btn-lg w-100 fw-bold text-white py-3 shadow-sm" style={{ backgroundColor: FNB_TEAL }} disabled={loading}>
                                            {loading ? 'PROCESSING...' : 'PAY NOW'}
                                        </button>
                                    </form>
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