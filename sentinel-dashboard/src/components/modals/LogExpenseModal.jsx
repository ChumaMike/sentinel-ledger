import React, { useState, useEffect } from 'react';
import { X, Receipt, Tag, AlertCircle } from 'lucide-react';
import { coreApi } from '../../utils/api.js';
import { toast } from 'react-toastify';

const CATEGORIES = ["Food & Drink", "Transport", "Shopping", "Entertainment", "Health", "Bills", "Tech"];

const LogExpenseModal = ({ onClose, onExpenseLogged }) => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAcc, setSelectedAcc] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food & Drink');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch accounts so we know which one to charge
    useEffect(() => {
        coreApi.get('/accounts').then(res => {
            setAccounts(res.data);
            if (res.data.length > 0) setSelectedAcc(res.data[0].accountNumber);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await coreApi.post('/accounts/expense', {
                accountNumber: selectedAcc,
                amount: amount,
                category: category,
                description: description
            });
            toast.success("Expense Logged!");
            onExpenseLogged(); // Refresh Dashboard
            onClose();
        } catch(error){
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to log expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
             style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
            <div className="card border-0 shadow-lg p-0 overflow-hidden" style={{ width: '400px', borderRadius: '20px' }}>
                <div className="bg-danger p-4 text-white">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                            <Receipt size={20}/> Log Expense
                        </h5>
                        <button onClick={onClose} className="btn btn-sm btn-white text-white rounded-circle bg-white bg-opacity-25">
                            <X size={18} />
                        </button>
                    </div>
                    <p className="mb-0 opacity-75 small">Track your real-world spending</p>
                </div>

                <div className="p-4 bg-white">
                    <form onSubmit={handleSubmit}>
                        {/* 1. SELECT ACCOUNT */}
                        <div className="mb-3">
                            <label className="small fw-bold text-muted mb-1">CHARGE ACCOUNT</label>
                            <select className="form-select bg-light border-0"
                                    value={selectedAcc} onChange={e => setSelectedAcc(e.target.value)}>
                                {accounts.map(acc => (
                                    <option key={acc.accountId} value={acc.accountNumber}>
                                        {acc.accountName} (R {acc.balance.toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. AMOUNT */}
                        <div className="mb-3">
                            <label className="small fw-bold text-muted mb-1">AMOUNT SPENT (ZAR)</label>
                            <div className="input-group">
                                <span className="input-group-text border-0 bg-light fw-bold text-muted">R</span>
                                <input type="number" className="form-control bg-light border-0 fw-bold"
                                       placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
                            </div>
                        </div>

                        {/* 3. CATEGORY */}
                        <div className="mb-3">
                            <label className="small fw-bold text-muted mb-1">CATEGORY</label>
                            <div className="d-flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <span key={cat}
                                          onClick={() => setCategory(cat)}
                                          className={`badge cursor-pointer p-2 rounded-pill border ${category === cat ? 'bg-dark text-white border-dark' : 'bg-white text-muted border-light'}`}
                                          style={{cursor: 'pointer'}}>
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 4. DESCRIPTION */}
                        <div className="mb-4">
                            <label className="small fw-bold text-muted mb-1">DESCRIPTION</label>
                            <input type="text" className="form-control bg-light border-0"
                                   placeholder="e.g. Burger King, Uber to Work"
                                   value={description} onChange={e => setDescription(e.target.value)} required />
                        </div>

                        <button className="btn btn-danger w-100 py-3 fw-bold shadow-sm" disabled={loading}>
                            {loading ? 'Logging...' : 'Confirm Expense'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LogExpenseModal;