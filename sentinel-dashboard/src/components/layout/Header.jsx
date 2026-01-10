import React from 'react';
import { LogOut } from 'lucide-react';

const Header = ({ activeTab, onLogout }) => {
    // Dynamic Title Logic
    const title = activeTab === 'dashboard' ? 'Overview' :
        activeTab === 'payments' ? 'Transfer Funds' :
            'Admin Console';

    return (
        <header className="bg-white border-bottom py-3 px-5 d-flex justify-content-between align-items-center sticky-top">
            <h4 className="fw-bold mb-0 text-dark">{title}</h4>

            <button onClick={onLogout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 rounded-3 px-3">
                <LogOut size={16} /> <span className="fw-bold">LOGOUT</span>
            </button>
        </header>
    );
};

export default Header;