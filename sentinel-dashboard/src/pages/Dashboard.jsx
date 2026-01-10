import React, { useEffect, useState } from 'react';
import { coreApi } from '../utils/api';
import { Wallet, CreditCard, PlusCircle, MinusCircle, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

// 🌟 UPDATED PATHS
import FinancialHealthChart from '../components/dashboard/FinancialHealthChart';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import GoalCard from '../components/dashboard/GoalCard';

// 🌟 UPDATED PATHS FOR MODALS
import CreateAccountModal from '../components/modals/CreateAccountModal';
import LogExpenseModal from '../components/modals/LogExpenseModal';
import CreateGoalModal from '../components/modals/CreateGoalModal';

const Dashboard = () => {
    // 1. Data State
    const [accounts, setAccounts] = useState([]);
    const [goals, setGoals] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // 2. UI State (Modals)
    const [showModal, setShowModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);

    // 3. Helper Data
    const myAccountNumbers = accounts.map(a => a.accountNumber);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // 4. Fetch Logic
    const fetchData = async () => {
        try {
            const accRes = await coreApi.get('/accounts');
            const goalRes = await coreApi.get('/goals');
            const txRes = await coreApi.get('/accounts/history');

            setAccounts(accRes.data);
            setGoals(goalRes.data);
            setTransactions(txRes.data);
        } catch (err) {
            toast.error("Failed to load dashboard data");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container py-4">

            {/* --- MODALS --- */}
            {showModal && <CreateAccountModal onClose={() => setShowModal(false)} onAccountCreated={fetchData} />}
            {showExpenseModal && <LogExpenseModal onClose={() => setShowExpenseModal(false)} onExpenseLogged={fetchData} />}
            {showGoalModal && <CreateGoalModal onClose={() => setShowGoalModal(false)} onGoalCreated={fetchData} />}

            {/* --- HEADER --- */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="bg-dark text-white p-4 rounded-4 shadow-lg d-flex justify-content-between align-items-center">
                        <div>
                            <span className="text-white-50">Total Balance</span>
                            <h1 className="display-4 fw-bold mb-0">R {totalBalance.toLocaleString()}</h1>
                        </div>
                        <div className="bg-white bg-opacity-10 p-3 rounded-circle">
                            <Wallet size={40} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ACCOUNTS & ACTIONS ROW --- */}
            <div className="row mb-4">
                <div className="col-12">
                    <h5 className="fw-bold mb-3">Your Accounts</h5>
                    <div className="row g-3">

                        {/* Action: Log Expense */}
                        <div className="col-md-2">
                            <div className="card h-100 border-0 shadow-sm d-flex align-items-center justify-content-center text-danger p-3 cursor-pointer"
                                 style={{ borderRadius: '16px', minHeight: '180px', backgroundColor: '#fff5f5' }}
                                 onClick={() => setShowExpenseModal(true)}>
                                <div className="text-center">
                                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-2"><MinusCircle size={24} /></div>
                                    <h6 className="fw-bold mb-0 text-danger">Log Expense</h6>
                                    <small className="text-muted opacity-75" style={{fontSize: '10px'}}>Track Spending</small>
                                </div>
                            </div>
                        </div>

                        {/* Action: New Account */}
                        <div className="col-md-2">
                            <div className="card h-100 border-2 border-dashed d-flex align-items-center justify-content-center text-muted p-4"
                                 style={{ borderRadius: '16px', minHeight: '180px', cursor: 'pointer', borderColor: '#ccc', backgroundColor: '#f8f9fa' }}
                                 onClick={() => setShowModal(true)}>
                                <div className="text-center">
                                    <div className="bg-white p-3 rounded-circle d-inline-block mb-2 shadow-sm"><PlusCircle size={24} className="text-primary"/></div>
                                    <h6 className="fw-bold mb-0">Open Account</h6>
                                </div>
                            </div>
                        </div>

                        {/* Account Cards */}
                        {accounts.map(acc => (
                            <div className="col-md-4" key={acc.accountId}>
                                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
                                    <div className="d-flex justify-content-between mb-2">
                                        <h5 className="fw-bold mb-0 text-truncate">{acc.accountName || 'Unnamed Account'}</h5>
                                        <span className={`badge rounded-pill px-2 d-flex align-items-center ${acc.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                            {acc.status || 'ACTIVE'}
                                        </span>
                                    </div>
                                    <small className="text-muted text-uppercase fw-bold" style={{fontSize: '10px'}}>{acc.accountType} ACCOUNT</small>
                                    <h3 className="fw-bold mt-3 mb-3">R {acc.balance.toLocaleString()}</h3>
                                    <div className="d-flex align-items-center gap-2 bg-light p-2 rounded text-muted small">
                                        <CreditCard size={14} />
                                        <span className="font-monospace">{acc.accountNumber}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- WIDGETS ROW --- */}
            <div className="row g-4">

                {/* 1. CHART WIDGET */}
                <div className="col-md-4">
                    <FinancialHealthChart
                        transactions={transactions}
                        accounts={accounts}
                        myAccountNumbers={myAccountNumbers}
                    />
                </div>

                {/* 2. GOALS WIDGET */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100 p-3 rounded-4">
                        <h5 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
                            My Goals
                            <PlusCircle size={20} className="text-primary cursor-pointer hover-scale" onClick={() => setShowGoalModal(true)} />
                        </h5>
                        <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                            {goals.length > 0 ? (
                                goals.map(goal => <GoalCard key={goal.goalId} goal={goal} />)
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <TrendingUp size={32} className="mb-2 opacity-50"/>
                                    <p>No goals yet. Start saving!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. ACTIVITY WIDGET */}
                <div className="col-md-4">
                    <RecentActivityList
                        transactions={transactions}
                        myAccountNumbers={myAccountNumbers}
                    />
                </div>

            </div>
        </div>
    );
};

export default Dashboard;