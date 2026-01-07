import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const FNB_TEAL = "#00a7a7";

const Login = ({ onLoginSuccess }) => {
    const [pin, setPin] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8081/api/auth/login', { pin });
            if (res.data.status === "SUCCESS") {
                localStorage.setItem('sentinel_token', res.data.token);
                // 🌟 Save profile data as a string
                localStorage.setItem('sentinel_profile', JSON.stringify(res.data.user));
                onLoginSuccess();
            }
        } catch (err) {
            toast.error("Access Denied");
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#1a1a1a' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-0 shadow-lg p-5 text-center"
                style={{ width: '400px', borderRadius: '24px', backgroundColor: '#fff' }}
            >
                <div className="d-flex justify-content-center mb-4">
                    <div className="p-3 rounded-circle" style={{ backgroundColor: 'rgba(0,167,167,0.1)' }}>
                        <ShieldCheck size={48} style={{ color: FNB_TEAL }} />
                    </div>
                </div>

                <h3 className="fw-bold mb-1">Sentinel Access</h3>
                <p className="text-muted small mb-4">Enter your digital security PIN to continue</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 position-relative">
                        <input
                            type="password"
                            className="form-control form-control-lg text-center fw-bold border-0 bg-light"
                            placeholder="****"
                            maxLength="4"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            style={{ letterSpacing: '8px', fontSize: '24px' }}
                        />
                    </div>
                    <button className="btn btn-lg w-100 text-white fw-bold py-3" style={{ backgroundColor: FNB_TEAL, borderRadius: '12px' }}>
                        AUTHORIZE SESSION
                    </button>
                </form>

                <div className="mt-4 pt-3 border-top">
                    <div className="d-flex align-items-center justify-content-center gap-2 text-muted small">
                        <Lock size={14} />
                        <span>End-to-End Encrypted Tunnel</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;