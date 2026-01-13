import React, { useEffect, useState } from 'react';
import { coreApi } from '../utils/api';
import { toast } from 'react-toastify';
import {
    Landmark, Search, ShieldAlert, History,
    ArrowUpRight, ArrowDownLeft, CreditCard, User, Banknote, Unlock
} from 'lucide-react';

const Admin = () => {

    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);

    const [allAccounts, setAllAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAcc, setSelectedAcc] = useState(null);
    const [accHistory, setAccHistory] = useState([]);
    const [amount, setAmount] = useState('');



    const loadGlobalData = async () => {
        try {
            const res = await coreApi.get('/accounts/admin/all');
            setAllAccounts(res.data);
        } catch (err) {
            toast.error("Admin Access Denied: Could not load global ledger.");
        }
    };

    // 1. Fetch Global Data on Load
    useEffect(() => {
        loadGlobalData();
    }, []);

    // 2. Fetch History when an Account is clicked
    const handleAccountClick = async (acc) => {
        setSelectedAcc(acc);
        setAccHistory([]); // Clear old history while loading
        try {
            const res = await coreApi.get(`/accounts/admin/history/${acc.accountNumber}`);
            setAccHistory(res.data);
        } catch (err) {
            console.error("History fetch failed", err);
        }
    };

    // 3. Deposit Logic (Same as before)
    const handleDeposit = async (e) => {
        e.preventDefault();
        try {
            await coreApi.post('/accounts/deposit', {
                accountNumber: selectedAcc.accountNumber,
                amount: amount,
                description: "Central Bank Injection"
            });
            toast.success("Liquidity Injected Successfully");
            setAmount('');
            loadGlobalData(); // Refresh balances
            handleAccountClick(selectedAcc); // Refresh history
        } catch (err) {
            toast.error("Injection Failed");
        }
    };

    // Filter accounts by Name or Number
    const filteredAccounts = allAccounts.filter(acc =>
        acc.accountNumber.includes(searchTerm) ||
        (acc.accountName && acc.accountName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleUnlock = (e) => {
        e.preventDefault();
        if (pin === "072479") {
            setIsUnlocked(true);
            setError(false);
        } else {
            setError(true);
            setPin("");
            toast.error("Access Denied: Invalid Security Clearance");
        }
    };

    // 🌟 3. RENDER: If Locked, show PIN Screen
    if (!isUnlocked) {
        return (
            <div className="container-fluid h-100 d-flex flex-column align-items-center justify-content-center bg-light" style={{ height: 'calc(100vh - 100px)' }}>
                <div className="card border-0 shadow-lg p-5 text-center" style={{ width: '400px', borderRadius: '24px' }}>
                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-4">
                        <ShieldAlert size={48} className="text-danger" />
                    </div>
                    <h3 className="fw-bold mb-2">Restricted Area</h3>
                    <p className="text-muted small mb-4">Enter Security PIN to access Central Bank Console</p>

                    <form onSubmit={handleUnlock}>
                        <input
                            type="password"
                            className={`form-control form-control-lg text-center fw-bold mb-3 ${error ? 'is-invalid' : ''}`}
                            placeholder="• • • • • •"
                            maxLength="6"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            style={{ letterSpacing: '8px', fontSize: '24px' }}
                            autoFocus
                        />
                        <button className="btn btn-dark w-100 py-3 fw-bold rounded-3">
                            AUTHENTICATE <Unlock size={18} className="ms-2"/>
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid h-100 p-0 d-flex flex-column" style={{ height: 'calc(100vh - 100px)' }}>

            {/* 🛑 HEADER BAR */}
            <div className="bg-dark text-white p-4 d-flex justify-content-between align-items-center shadow">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-danger p-2 rounded d-flex align-items-center justify-content-center">
                        <ShieldAlert size={24} className="text-white" />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-0">SENTINEL OVERSEER</h4>
                        <small className="text-white-50" style={{ letterSpacing: '1px' }}>GLOBAL SYSTEM ADMINISTRATION</small>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-3 bg-white bg-opacity-10 p-2 rounded-pill px-4">
                    <Banknote className="text-success" />
                    <span className="fw-bold">Total Liquidity: R {allAccounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}</span>
                </div>
            </div>

            <div className="row g-0 flex-grow-1 overflow-hidden">

                {/* 📋 LEFT PANE: THE GLOBAL LEDGER (List) */}
                <div className="col-md-4 border-end bg-white d-flex flex-column h-100">
                    <div className="p-3 border-bottom bg-light">
                        <div className="input-group">
                            <span className="input-group-text border-0 bg-white"><Search size={18} className="text-muted"/></span>
                            <input
                                type="text"
                                className="form-control border-0 shadow-none"
                                placeholder="Search Account # or Name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-auto flex-grow-1">
                        {filteredAccounts.map(acc => (
                            <div
                                key={acc.accountId}
                                onClick={() => handleAccountClick(acc)}
                                className={`p-3 border-bottom cursor-pointer ${selectedAcc?.accountId === acc.accountId ? 'bg-primary bg-opacity-10 border-start border-4 border-primary' : 'hover-bg-light'}`}
                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="fw-bold text-dark">{acc.accountName || 'Unnamed Account'}</span>
                                    <span className="badge bg-dark text-white rounded-pill">{acc.accountType}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted font-monospace">{acc.accountNumber}</small>
                                    <span className="fw-bold text-primary">R {acc.balance.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔍 RIGHT PANE: THE INSPECTOR (Details & History) */}
                <div className="col-md-8 bg-light h-100 overflow-auto p-4">
                    {selectedAcc ? (
                        <div className="row h-100">
                            {/* DETAILS CARD */}
                            <div className="col-md-5 mb-4">
                                <div className="card border-0 shadow-sm rounded-4 h-100">
                                    <div className="card-body p-4 d-flex flex-column">
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <div className="bg-light p-3 rounded-circle">
                                                <CreditCard size={32} className="text-primary"/>
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-0">{selectedAcc.accountName}</h5>
                                                <div className="text-muted small">ID: {selectedAcc.accountNumber}</div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-light rounded-3 mb-4">
                                            <small className="text-muted fw-bold">CURRENT BALANCE</small>
                                            <h2 className="fw-bold text-dark mb-0">R {selectedAcc.balance.toLocaleString()}</h2>
                                            <div className={`badge mt-2 ${selectedAcc.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                                                {selectedAcc.status || 'ACTIVE'}
                                            </div>
                                        </div>

                                        <hr className="text-muted opacity-25"/>

                                        <form onSubmit={handleDeposit} className="mt-auto">
                                            <label className="small fw-bold text-muted mb-2">QUICK DEPOSIT</label>
                                            <div className="input-group mb-3">
                                                <span className="input-group-text bg-white border-end-0">R</span>
                                                <input
                                                    type="number"
                                                    className="form-control border-start-0"
                                                    placeholder="0.00"
                                                    value={amount}
                                                    onChange={e => setAmount(e.target.value)}
                                                    required
                                                />
                                                <button className="btn btn-success fw-bold">SEND</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* HISTORY TAPE */}
                            <div className="col-md-7 mb-4">
                                <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column">
                                    <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                            <History size={18}/> Audit Log
                                        </h6>
                                        <span className="badge bg-light text-dark border">{accHistory.length} Records</span>
                                    </div>
                                    <div className="list-group list-group-flush overflow-auto flex-grow-1" style={{ maxHeight: '600px' }}>
                                        {accHistory.length > 0 ? (
                                            accHistory.map(tx => {
                                                const isIncoming = tx.receiverAccountNumber === selectedAcc.accountNumber;
                                                return (
                                                    <div key={tx.transactionId} className="list-group-item p-3 border-0 border-bottom">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <div className="d-flex align-items-center gap-2">
                                                                {isIncoming ? <ArrowDownLeft size={16} className="text-success"/> : <ArrowUpRight size={16} className="text-danger"/>}
                                                                <span className="fw-bold small">{isIncoming ? 'RECEIVED' : 'SENT'}</span>
                                                            </div>
                                                            <small className="text-muted">{tx.timestamp.split('T')[0]}</small>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="text-dark small text-truncate" style={{ maxWidth: '150px' }}>{tx.description}</span>
                                                            <span className={`fw-bold ${isIncoming ? 'text-success' : 'text-danger'}`}>
                                                                {isIncoming ? '+' : '-'} R {tx.amount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center text-muted py-5">No transaction records found.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                            <Landmark size={64} className="mb-3"/>
                            <h4>Select an account from the ledger</h4>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;