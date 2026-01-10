import React from 'react';
import { ShieldCheck, LayoutDashboard, Send, Lock, User } from 'lucide-react';

const FNB_TEAL = "#00a7a7";

const Sidebar = ({ activeTab, setActiveTab, userProfile }) => {
    return (
        <nav className="d-flex flex-column p-4 text-white shadow-lg"
             style={{ width: '280px', minWidth: '280px', backgroundColor: '#1a1a1a', zIndex: 1000 }}>

            {/* LOGO AREA */}
            <div className="d-flex align-items-center mb-5 px-2">
                <ShieldCheck size={32} style={{ color: FNB_TEAL }} />
                <div className="ms-3">
                    <div className="fw-bold h5 mb-0" style={{ letterSpacing: '1px' }}>SENTINEL</div>
                    <div className="small opacity-50" style={{ fontSize: '10px' }}>ENTERPRISE BANKING</div>
                </div>
            </div>

            {/* NAVIGATION LINKS */}
            <div className="nav flex-column gap-3 mb-auto">
                <button onClick={() => setActiveTab('dashboard')}
                        className={`btn d-flex align-items-center gap-3 p-3 text-start border-0 ${activeTab === 'dashboard' ? 'text-white shadow' : 'text-white-50'}`}
                        style={{ backgroundColor: activeTab === 'dashboard' ? FNB_TEAL : 'transparent', borderRadius: '12px' }}>
                    <LayoutDashboard size={20}/> Dashboard
                </button>

                <button onClick={() => setActiveTab('payments')}
                        className={`btn d-flex align-items-center gap-3 p-3 text-start border-0 ${activeTab === 'payments' ? 'text-white shadow' : 'text-white-50'}`}
                        style={{ backgroundColor: activeTab === 'payments' ? FNB_TEAL : 'transparent', borderRadius: '12px' }}>
                    <Send size={20}/> Payments
                </button>
            </div>

            {/* ADMIN SECTION */}
            <div className="pt-4 border-top border-secondary mt-3 mb-4">
                <small className="text-muted fw-bold mb-3 d-block ps-2" style={{fontSize: '10px'}}>SYSTEM ACCESS</small>
                <button onClick={() => setActiveTab('admin')}
                        className={`btn d-flex align-items-center gap-3 p-3 text-start w-100 border-0 ${activeTab === 'admin' ? 'bg-danger text-white shadow' : 'text-white-50 hover-bg-dark'}`}
                        style={{ borderRadius: '12px', transition: 'all 0.2s' }}>
                    <div className="bg-white bg-opacity-10 p-1 rounded">
                        <Lock size={16}/>
                    </div>
                    <span className="small fw-bold">Admin Console</span>
                </button>
            </div>

            {/* USER PROFILE FOOTER */}
            <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="bg-dark text-white p-2 rounded-circle border border-secondary">
                        <User size={18} />
                    </div>
                    <div className="overflow-hidden">
                        <div className="fw-bold small text-truncate">{userProfile.name || 'User'}</div>
                        <div className="opacity-50" style={{ fontSize: '10px' }}>{userProfile.email}</div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;