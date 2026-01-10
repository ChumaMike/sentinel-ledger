import React, { useEffect, useState } from 'react';
import { coreApi } from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, CreditCard, PlusCircle, TrendingUp } from 'lucide-react'; // Added TrendingUp
import GoalCard from '../components/GoalCard';
import { toast } from 'react-toastify';
import CreateAccountModal from '../components/CreateAccountModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [goals, setGoals] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Fake data for the chart
    const spendingData = [
        { name: 'Food', value: 400 },
        { name: 'Transport', value: 300 },
        { name: 'Tech', value: 300 },
        { name: 'Rent', value: 200 },
    ];

    // 🌟 FIX 1: Define fetchData OUTSIDE useEffect so we can pass it to the Modal
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

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="container py-4">
            {/* 1. HEADER & TOTAL BALANCE */}
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

            {/* MODAL POPUP */}
            {showModal && (
                <CreateAccountModal
                    onClose={() => setShowModal(false)}
                    onAccountCreated={fetchData} // 🌟 Now this works!
                />
            )}

            {/* 2. ACCOUNTS SECTION (Add Button + List) */}
            <div className="row mb-4">
                <div className="col-12">
                    <h5 className="fw-bold mb-3">Your Accounts</h5>
                    <div className="row g-3">
                        {/* 🌟 "ADD NEW" BUTTON */}
                        <div className="col-md-4">
                            <div
                                className="card h-100 border-2 border-dashed d-flex align-items-center justify-content-center text-muted p-4"
                                style={{ borderRadius: '16px', minHeight: '180px', cursor: 'pointer', borderColor: '#ccc', backgroundColor: '#f8f9fa' }}
                                onClick={() => setShowModal(true)}
                            >
                                <div className="text-center">
                                    <div className="bg-white p-3 rounded-circle d-inline-block mb-2 shadow-sm">
                                        <PlusCircle size={24} className="text-primary"/>
                                    </div>
                                    <h6 className="fw-bold mb-0">Open New Account</h6>
                                </div>
                            </div>
                        </div>

                        {/* 🌟 FIX 2: MAPPING EXISTING ACCOUNTS */}
                        {accounts.map(acc => (
                            <div className="col-md-4" key={acc.accountId}>
                                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
                                    <div className="d-flex justify-content-between mb-3">
                                        <h6 className="text-muted small fw-bold text-uppercase">{acc.accountType}</h6>
                                        <span className={`badge rounded-pill px-2 ${acc.balance < 500 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                                            {acc.status}
                                        </span>
                                    </div>
                                    <h3 className="fw-bold mb-4">R {acc.balance.toLocaleString()}</h3>
                                    <div className="d-flex align-items-center gap-2 bg-light p-2 rounded text-muted small">
                                        <CreditCard size={14} />
                                        <span>{acc.accountNumber}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. WIDGETS ROW (Charts, Goals, History) */}
            <div className="row g-4">
                {/* SPENDING CHART */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100 p-3 rounded-4">
                        <h5 className="fw-bold mb-3">Spending Breakdown</h5>
                        <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={spendingData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {spendingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* GOALS */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100 p-3 rounded-4">
                        <h5 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
                            My Goals <PlusCircle size={20} className="text-primary cursor-pointer"/>
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

                {/* RECENT ACTIVITY */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100 rounded-4">
                        <div className="p-3 pb-0">
                            <h5 className="fw-bold mb-3">Recent Activity</h5>
                        </div>
                        <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                            <ul className="list-group list-group-flush">
                                {transactions.length > 0 ? (
                                    transactions.slice(0, 5).map(tx => (
                                        <li key={tx.transactionId} className="list-group-item p-3 d-flex justify-content-between align-items-center border-0">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light p-2 rounded-circle">
                                                    <CreditCard size={18} className="text-muted"/>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-truncate" style={{maxWidth: '120px'}}>{tx.description}</div>
                                                    <small className="text-muted" style={{fontSize: '10px'}}>{tx.timestamp ? tx.timestamp.split('T')[0] : 'N/A'}</small>
                                                </div>
                                            </div>
                                            <span className={tx.transactionType === 'EXPENSE' ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                                {tx.transactionType === 'EXPENSE' ? '-' : '+'} R {tx.amount}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <div className="text-center text-muted py-4">No transactions yet</div>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;