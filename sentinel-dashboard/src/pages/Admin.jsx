import React, { useEffect, useState } from 'react';
import { coreApi } from '../utils/api';
import { toast } from 'react-toastify';
import { Landmark, ArrowDownCircle, Search } from 'lucide-react';

const Admin = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAcc, setSelectedAcc] = useState(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('Cash Deposit');

    // Load ALL accounts (In a real app, this would need an Admin Token)
    useEffect(() => {
        coreApi.get('/accounts').then(res => setAccounts(res.data));
    }, []);

    const handleDeposit = async (e) => {
        e.preventDefault();
        try {
            await coreApi.post('/accounts/deposit', {
                accountNumber: selectedAcc.accountNumber,
                amount: amount,
                description: description
            });
            toast.success(`R${amount} Deposited Successfully!`);

            // Refresh list to see new balance
            const res = await coreApi.get('/accounts');
            setAccounts(res.data);
            setSelectedAcc(null); // Close form
            setAmount('');
        } catch (err) {
            toast.error("Deposit Failed");
        }
    };

    return (
        <div className="container py-4">
            <div className="d-flex align-items-center gap-3 mb-4 text-white p-4 rounded-4 shadow" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
                <Landmark size={40} />
                <div>
                    <h2 className="fw-bold mb-0">Central Bank Console</h2>
                    <p className="mb-0 opacity-75">System Administration & Liquidity Management</p>
                </div>
            </div>

            <div className="row">
                {/* LEFT: Account List */}
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="fw-bold mb-0">System Accounts</h5>
                        </div>
                        <div className="list-group list-group-flush">
                            {accounts.map(acc => (
                                <button
                                    key={acc.accountId}
                                    onClick={() => setSelectedAcc(acc)}
                                    className={`list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-center ${selectedAcc?.accountId === acc.accountId ? 'bg-light' : ''}`}
                                >
                                    <div>
                                        <div className="fw-bold">{acc.accountName || 'Unnamed Account'}</div>
                                        <div className="small text-muted">{acc.accountType} • {acc.accountNumber}</div>
                                    </div>
                                    <span className="badge bg-primary rounded-pill p-2">
                                        R {acc.balance.toLocaleString()}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Action Panel */}
                <div className="col-md-5">
                    {selectedAcc ? (
                        <div className="card border-0 shadow-lg rounded-4 p-4 sticky-top" style={{ top: '20px' }}>
                            <h5 className="fw-bold mb-3 text-primary">Inject Funds</h5>
                            <div className="alert alert-light mb-4">
                                <small className="text-muted d-block">TARGET ACCOUNT</small>
                                <strong>{selectedAcc.accountName}</strong>
                                <br/>
                                <small>{selectedAcc.accountNumber}</small>
                            </div>

                            <form onSubmit={handleDeposit}>
                                <div className="mb-3">
                                    <label className="fw-bold small text-muted">AMOUNT (ZAR)</label>
                                    <input type="number" className="form-control form-control-lg fw-bold"
                                           value={amount} onChange={e => setAmount(e.target.value)} autoFocus required />
                                </div>
                                <div className="mb-4">
                                    <label className="fw-bold small text-muted">REFERENCE</label>
                                    <input type="text" className="form-control"
                                           value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                                <button className="btn btn-success w-100 py-3 fw-bold rounded-3">
                                    CONFIRM DEPOSIT
                                </button>
                                <button type="button" onClick={() => setSelectedAcc(null)} className="btn btn-link text-muted w-100 mt-2 text-decoration-none">
                                    Cancel
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center text-muted py-5 border rounded-4 border-dashed bg-light">
                            <ArrowDownCircle size={48} className="mb-3 opacity-25" />
                            <h5>Select an account to manage funds</h5>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;