import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Lock, Mail, Phone, User, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', password: '', pin: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8081/api/auth/register', formData);
            toast.success("Welcome to Sentinel! Please Login.");
            onSwitchToLogin(); // Switch back to login screen
        }catch(error){
            console.error(error);
            toast.error(error.response?.data || "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="card border-0 shadow-lg p-4" style={{ borderRadius: '24px', width: '100%', maxWidth: '420px' }}>

            <div className="text-center mb-4">
                <div className="bg-dark text-white rounded-circle d-inline-flex p-3 mb-3">
                    <UserPlus size={32} />
                </div>
                <h4 className="fw-bold">Join Sentinel</h4>
                <p className="text-muted small">Create your digital banking identity</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-0"><User size={18}/></span>
                        <input type="text" className="form-control bg-light border-0 fs-6" placeholder="Full Name"
                               required onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                </div>

                <div className="mb-3">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-0"><Mail size={18}/></span>
                        <input type="email" className="form-control bg-light border-0 fs-6" placeholder="Email Address"
                               required onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                </div>

                <div className="mb-3">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-0"><Phone size={18}/></span>
                        <input type="tel" className="form-control bg-light border-0 fs-6" placeholder="Phone Number"
                               required onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                </div>

                <div className="mb-3">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-0"><Lock size={18}/></span>
                        <input type="password" className="form-control bg-light border-0 fs-6" placeholder="Create Password"
                               required onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                </div>

                <div className="mb-4">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-0"><Lock size={18}/></span>
                        <input type="password" className="form-control bg-light border-0 fs-6" placeholder="Create 4-Digit PIN"
                               maxLength="4" required onChange={e => setFormData({...formData, pin: e.target.value})} />
                    </div>
                    <div className="form-text small">This PIN will be used for transactions inside the vault.</div>
                </div>

                <button className="btn btn-dark btn-lg w-100 fw-bold d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                    {loading ? 'Creating Identity...' : <>Create Account <ArrowRight size={18}/></>}
                </button>
            </form>

            <div className="text-center mt-4">
                <button onClick={onSwitchToLogin} className="btn btn-link text-decoration-none text-muted fw-bold small">
                    Already have an account? Login
                </button>
            </div>
        </motion.div>
    );
};

export default Register;