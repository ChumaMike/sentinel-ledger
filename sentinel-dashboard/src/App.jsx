import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    LayoutDashboard, Send, Landmark,
    History, ShieldCheck, Bell, User, Info, AlertTriangle
} from 'lucide-react';

const FNB_TEAL = "#00a7a7";
const FNB_AMBER = "#ffb81c";

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [accounts, setAccounts] = useState([]);
    const [history, setHistory] = useState([]); // For the Bank Statement
    const [transfer, setTransfer] = useState({ fromId: '', toId: '', amount: '' });
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const accRes = await axios.get('http://localhost:8080/api/accounts');
            setAccounts(accRes.data);
            // We'll fetch history from the new endpoint we're about to create
            // const histRes = await axios.get('http://localhost:8080/api/accounts/history');
            // setHistory(histRes.data);
        } catch (e) { console.error("Sync Error"); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = `http://localhost:8080/api/accounts/transfer?fromId=${transfer.fromId}&toId=${transfer.toId}&amount=${transfer.amount}`;
            const res = await axios.post(url);
            toast.success(res.data, { icon: "✅" });
            fetchData();
            setActiveTab('dashboard'); // Auto-switch back to see balance update
        } catch (err) {
            toast.error(err.response?.data?.message || "Sentinel Blocked Transaction", { theme: "colored" });
        } finally { setLoading(false); }
    };

    return (
        <div className="d-flex bg-light min-vh-100 w-100 overflow-hidden">
            <ToastContainer position="top-right" />

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
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`btn d-flex align-items-center gap-3 p-3 text-start border-0 transition-all ${activeTab === 'dashboard' ? 'text-white shadow' : 'text-white-50'}`}
                        style={{ backgroundColor: activeTab === 'dashboard' ? FNB_TEAL : 'transparent', borderRadius: '12px' }}>
                        <LayoutDashboard size={20}/> Dashboard
                    </button>

                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`btn d-flex align-items-center gap-3 p-3 text-start border-0 ${activeTab === 'payments' ? 'text-white shadow' : 'text-white-50'}`}
                        style={{ backgroundColor: activeTab === 'payments' ? FNB_TEAL : 'transparent', borderRadius: '12px' }}>
                        <Send size={20}/> Payments
                    </button>
                </div>

                <div className="mt-auto p-3 rounded-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="small opacity-50 mb-1" style={{ fontSize: '10px' }}>SECURED BY</div>
                    <div className="fw-bold small" style={{ color: FNB_AMBER }}>SENTINEL_AI_v2.1</div>
                </div>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-grow-1 overflow-auto">
                <header className="bg-white border-bottom py-3 px-5 d-flex justify-content-between align-items-center sticky-top">
                    <h4 className="fw-bold mb-0 text-dark">{activeTab === 'dashboard' ? 'Overview' : 'Transfer Funds'}</h4>
                    <div className="d-flex gap-4 align-items-center">
                        <Bell size={20} className="text-muted"/>
                        <div className="bg-dark text-white p-2 rounded-3 shadow-sm"><User size={20} /></div>
                    </div>
                </header>

                <div className="container-fluid p-5" style={{ maxWidth: '1200px' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'dashboard' ? (
                            <motion.div key="dash" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <div className="row g-4 mb-5">
                                    {accounts.map(acc => (
                                        <div className="col-md-6" key={acc.accountId}>
                                            <div className="card border-0 shadow-sm p-4 h-100 position-relative">
                                                <div style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '100%', backgroundColor: FNB_TEAL }}></div>
                                                <h6 className="text-muted small fw-bold mb-3 uppercase">Savings Account</h6>
                                                <h2 className="fw-bold mb-3" style={{ color: '#333' }}>R {acc.balance.toLocaleString()}</h2>
                                                <div className="d-flex justify-content-between text-muted small">
                                                    <span>6284 **** {acc.accountId}</span>
                                                    <Landmark size={18} className="opacity-50" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* TRANSACTION HISTORY TABLE */}
                                <div className="card border-0 shadow-sm p-4">
                                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                        <History size={20} style={{ color: FNB_TEAL }}/> Recent Transactions
                                    </h5>
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                        <tr className="small text-muted"><th>DATE</th><th>DESCRIPTION</th><th>STATUS</th><th>AMOUNT</th></tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>Today</td>
                                            <td>Opening Balance Seed</td>
                                            <td><span className="badge bg-success-subtle text-success">SUCCESS</span></td>
                                            <td className="fw-bold text-primary">+ R 15,000.50</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="col-md-6 mx-auto">
                                <div className="card border-0 shadow-lg p-5" style={{ borderTop: `6px solid ${FNB_AMBER}`, borderRadius: '20px' }}>
                                    <h3 className="fw-bold mb-4" style={{ color: FNB_TEAL }}>Make a Payment</h3>
                                    <form onSubmit={handleTransfer}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">RECIPIENT ACCOUNT ID</label>
                                            <input type="number" className="form-control form-control-lg bg-light border-0" placeholder="e.g. 2" onChange={e => setTransfer({...transfer, toId: e.target.value})} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">SENDER ACCOUNT ID</label>
                                            <input type="number" className="form-control form-control-lg bg-light border-0" placeholder="e.g. 1" onChange={e => setTransfer({...transfer, fromId: e.target.value})} required />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">AMOUNT (ZAR)</label>
                                            <input type="number" className="form-control form-control-lg bg-light border-0 fw-bold" placeholder="0.00" onChange={e => setTransfer({...transfer, amount: e.target.value})} required />
                                        </div>
                                        <button className="btn btn-lg w-100 fw-bold text-white py-3 shadow-sm" style={{ backgroundColor: FNB_TEAL }} disabled={loading}>
                                            {loading ? 'SENTINEL CHECKING...' : 'PAY RECIPIENT'}
                                        </button>
                                    </form>
                                    <div className="mt-4 p-3 rounded-3 bg-warning-subtle border-start border-4 border-warning d-flex gap-3">
                                        <AlertTriangle className="text-warning" size={20} />
                                        <small className="text-dark-emphasis">Sentinel AI automatically scans payments over R10,000 for compliance.</small>
                                    </div>
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