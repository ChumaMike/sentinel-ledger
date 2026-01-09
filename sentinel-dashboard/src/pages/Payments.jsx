import React, { useState, useEffect } from 'react';
import { coreApi } from '../utils/api'; // Use your helper!
import { toast } from 'react-toastify';
import { Send } from 'lucide-react';

const FNB_TEAL = "#00a7a7";
const FNB_AMBER = "#ffb81c";

const Payments = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [transfer, setTransfer] = useState({
        fromAcc: '', toAcc: '', amount: '', description: ''
    });

    // Fetch accounts so we can populate the "From" dropdown
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await coreApi.get('/accounts');
                setAccounts(res.data);
                if (res.data.length > 0) {
                    setTransfer(prev => ({ ...prev, fromAcc: res.data[0].accountNumber }));
                }
            } catch (err) {
                toast.error("Could not load accounts");
            }
        };
        fetchAccounts();
    }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 🌟 Using the Cleaner API helper (no need to manually add headers)
            const url = `/accounts/transfer?fromAcc=${transfer.fromAcc}&toAcc=${transfer.toAcc}&amount=${transfer.amount}&description=${encodeURIComponent(transfer.description)}`;

            const res = await coreApi.post(url);
            toast.success(res.data);
            setTransfer(prev => ({ ...prev, toAcc: '', amount: '', description: '' }));
        } catch (err) {
            toast.error(err.response?.data?.message || "Transfer Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="col-md-8 mx-auto">
            <div className="card border-0 shadow-lg p-5" style={{ borderTop: `6px solid ${FNB_AMBER}`, borderRadius: '20px' }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-light p-3 rounded-circle text-primary">
                        <Send size={24} style={{ color: FNB_TEAL }}/>
                    </div>
                    <h3 className="fw-bold mb-0" style={{ color: FNB_TEAL }}>New Payment</h3>
                </div>

                <form onSubmit={handleTransfer}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">PAY FROM</label>
                        <select className="form-select form-select-lg bg-light border-0"
                                value={transfer.fromAcc}
                                onChange={e => setTransfer({...transfer, fromAcc: e.target.value})}>
                            {accounts.map(acc => (
                                <option key={acc.accountId} value={acc.accountNumber}>
                                    {acc.accountType} - {acc.accountNumber} (R {acc.balance.toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">BENEFICIARY ACCOUNT</label>
                            <input type="text" className="form-control form-control-lg bg-light border-0"
                                   value={transfer.toAcc} onChange={e => setTransfer({...transfer, toAcc: e.target.value})}
                                   placeholder="e.g. 100200300" required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">AMOUNT (ZAR)</label>
                            <input type="number" className="form-control form-control-lg bg-light border-0 fw-bold"
                                   value={transfer.amount} onChange={e => setTransfer({...transfer, amount: e.target.value})}
                                   placeholder="0.00" required />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted">DESCRIPTION</label>
                        <input type="text" className="form-control form-control-lg bg-light border-0"
                               value={transfer.description} onChange={e => setTransfer({...transfer, description: e.target.value})}
                               placeholder="e.g. Rent, Dinner" required />
                    </div>

                    <button className="btn btn-lg w-100 fw-bold text-white py-3 shadow-sm" style={{ backgroundColor: FNB_TEAL }} disabled={loading}>
                        {loading ? 'PROCESSING...' : 'PAY NOW'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Payments;