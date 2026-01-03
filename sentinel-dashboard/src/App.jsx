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
    const [activeTab, setActiveTab] = useState('dashboard');
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
        <div className="app-container d-flex">
            {/* --- SIDEBAR --- */}
            <nav className="bg-dark text-white p-4" style={{ width: '280px', height: '100vh' }}>
                <div className="mb-5 fw-bold h4 text-teal">SENTINEL</div>

                <div className="d-grid gap-2">
                    {/* Dashboard Button */}
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`btn d-flex align-items-center gap-2 p-3 ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline-light border-0'}`}
                    >
                        <LayoutDashboard size={20}/> Dashboard
                    </button>

                    {/* Payments Button */}
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`btn d-flex align-items-center gap-2 p-3 ${activeTab === 'payments' ? 'btn-primary' : 'btn-outline-light border-0'}`}
                    >
                        <Send size={20}/> Payments
                    </button>
                </div>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-grow-1 p-5 bg-light">
                {activeTab === 'dashboard' ? (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
                        <h2>Account Overview</h2>
                        {/* Move your Account Cards / Table Code here */}
                    </motion.div>
                ) : (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
                        <h2>Make a Payment</h2>
                        {/* Move your Transfer Form Code here */}
                    </motion.div>
                )}
            </main>
        </div>
    );
}

export default App;