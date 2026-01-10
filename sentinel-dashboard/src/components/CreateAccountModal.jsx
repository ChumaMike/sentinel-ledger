import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { coreApi } from '../utils/api';
import { toast } from 'react-toastify';

const CreateAccountModal = ({ onClose, onAccountCreated }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('SAVINGS');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await coreApi.post('/accounts/create', { name, type });
            toast.success("Account Opened Successfully!");
            onAccountCreated(); // Tell Dashboard to refresh
            onClose(); // Close modal
        } catch (err) {
            toast.error("Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="card border-0 shadow-lg p-4" style={{ width: '400px', borderRadius: '16px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Open New Account</h5>
                    <button onClick={onClose} className="btn btn-light rounded-circle p-2">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">ACCOUNT NAME</label>
                        <input
                            type="text"
                            className="form-control bg-light border-0 py-3"
                            placeholder="e.g. Holiday Savings"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted">ACCOUNT TYPE</label>
                        <select
                            className="form-select bg-light border-0 py-3"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="SAVINGS">Savings Account</option>
                            <option value="CHEQUE">Cheque / Current</option>
                            <option value="BUSINESS">Business Account</option>
                        </select>
                    </div>

                    <button className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                        {loading ? 'Opening...' : <>Open Account <Check size={18}/></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAccountModal;