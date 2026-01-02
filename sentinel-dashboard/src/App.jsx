import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    LayoutDashboard, Send, Landmark,
    History, ShieldCheck, Bell, User
} from 'lucide-react';

const FNB_TEAL = "#00a7a7";
const FNB_AMBER = "#ffb81c";

function App() {
    const [accounts, setAccounts] = useState([]);
    const [transfer, setTransfer] = useState({ fromId: '', toId: '', amount: '' });
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/accounts');
            setAccounts(res.data);
        } catch (e) { toast.error("System Sync Failed"); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = `http://localhost:8080/api/accounts/transfer?fromId=${transfer.fromId}&toId=${transfer.toId}&amount=${transfer.amount}`;
            const res = await axios.post(url);
            toast.success(res.data);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || "Transfer Denied";
            toast.error(msg, { theme: "colored" });
        } finally { setLoading(false); }
    };

    return (
        <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
            <ToastContainer />

            {/* Sidebar */}
            <nav className="bg-dark text-white p-4 d-flex flex-column" style={{ width: '280px', minWidth: '280px' }}>
                <div className="mb-5 d-flex align-items-center">
                    <ShieldCheck size={32} style={{ color: '#00a7a7' }} />
                    <span className="ms-2 fw-bold">SENTINEL</span>
                </div>
                <div className="d-grid gap-2">
                    <button className="btn btn-teal text-white d-flex align-items-center gap-2 py-3">
                        <LayoutDashboard size={18}/> Dashboard
                    </button>
                    <button className="btn btn-outline-light d-flex align-items-center gap-2 py-3">
                        <Send size={18}/> Payments
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow-1 bg-light overflow-auto p-5">
                {/* ... rest of your content ... */}
            </main>
        </div>
    );
}

export default App;