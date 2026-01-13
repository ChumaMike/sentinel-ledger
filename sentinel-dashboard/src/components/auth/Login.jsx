import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '../../utils/api.js'; // 👈 Using your new API helper
import { toast } from 'react-toastify';

const FNB_TEAL = "#00a7a7";

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 🌟 POST to /api/auth/login
            const res = await authApi.post('/login', formData);

            if (res.data.status === "SUCCESS") {
                // 💾 Save User & Token
                localStorage.setItem('user', JSON.stringify({
                    token: res.data.token,
                    ...res.data.user
                }));

                toast.success("Welcome back!");
                onLoginSuccess(); // Notify App.jsx to show Dashboard
            }
        } catch(error){
            console.error(error);
            toast.error(error.response?.data?.message || "Login Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-0 shadow-lg p-4"
            style={{ width: '100%', maxWidth: '420px', borderRadius: '24px' }}
        >
            <div className="d-flex justify-content-center mb-4">
                <div className="p-3 rounded-circle" style={{ backgroundColor: 'rgba(0,167,167,0.1)' }}>
                    <ShieldCheck size={48} style={{ color: FNB_TEAL }} />
                </div>
            </div>

            <div className="text-center mb-4">
                <h3 className="fw-bold mb-1">Sentinel Access</h3>
                <p className="text-muted small">Secure Banking Environment</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-0"><Mail size={18}/></span>
                        <input
                            type="email"
                            className="form-control bg-light border-0 fs-6"
                            placeholder="Email Address"
                            required
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-0"><Lock size={18}/></span>
                        <input
                            type="password"
                            className="form-control bg-light border-0 fs-6"
                            placeholder="Password"
                            required
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                </div>

                <button
                    className="btn btn-lg w-100 text-white fw-bold py-3 d-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: FNB_TEAL, borderRadius: '12px' }}
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : <>ACCESS VAULT <ArrowRight size={18}/></>}
                </button>
            </form>

            <div className="mt-4 pt-3 border-top text-center">
                <p className="text-muted small mb-2">New to Sentinel?</p>
                {/* 🌟 Button to switch to Registration */}
                <button
                    onClick={onSwitchToRegister}
                    className="btn btn-outline-dark w-100 fw-bold"
                    style={{ borderRadius: '12px' }}
                >
                    Create Digital Identity
                </button>
            </div>
        </motion.div>
    );
};

export default Login;
