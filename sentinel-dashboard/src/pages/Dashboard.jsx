import React, { useEffect, useState } from 'react';
import { coreApi } from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, CreditCard, PlusCircle, TrendingUp, ArrowUpRight, ArrowDownLeft, MinusCircle } from 'lucide-react'; // 🌟 Fixed Import
import GoalCard from '../components/GoalCard';
import { toast } from 'react-toastify';
import CreateAccountModal from '../components/CreateAccountModal';
import LogExpenseModal from '../components/LogExpenseModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [goals, setGoals] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // Modals State
    const [showModal, setShowModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false); // 🌟 Fixed: Moved inside component

    // Helper: Get my account numbers to detect outgoing transfers
    const myAccountNumbers = accounts.map(a => a.accountNumber);

    // 🌟 1. DYNAMIC SPENDING CHART LOGIC (Replaces fake data)
    // Filter only expenses or outgoing transfers
    const expenses = transactions.filter(tx =>
        tx.transactionType === 'EXPENSE' ||
        (myAccountNumbers.includes(tx.senderAccountNumber) && tx.transactionType !== 'DEPOSIT')
    );

    // Aggregate by Category found in description brackets [Category]
    const categoryMap = {};
    expenses.forEach(tx => {
        const match = tx.description ? tx.description.match(/\[(.*?)\]/) : null;
        const category = match ? match[1] : 'Uncategorized';

        if (!categoryMap[category]) categoryMap[category] = 0;
        categoryMap[category] += tx.amount;
    });

    // Convert to Array for Recharts
    let spendingData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
    }));

    // Placeholder if empty
    if (spendingData.length === 0) {
        spendingData = [{ name: 'No Expenses', value: 100 }];
    }

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
            {/* HEADER & TOTAL BALANCE */}
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

            {/* MODALS */}
            {showModal && (
                <CreateAccountModal
                    onClose={() => setShowModal(false)}
                    onAccountCreated={fetchData}
                />
            )}

            {/* 🌟 NEW EXPENSE MODAL */}
            {showExpenseModal && (
                <LogExpenseModal
                    onClose={() => setShowExpenseModal(false)}
                    onExpenseLogged={fetchData}
                />
            )}

            {/* ACCOUNTS SECTION */}
            <div className="row mb-4">
                <div className="col-12">
                    <h5 className="fw-bold mb-3">Your Accounts</h5>
                    <div className="row g-3">

                        {/* 🌟 NEW: LOG EXPENSE BUTTON (Red) */}
                        <div className="col-md-2">
                            <div
                                className="card h-100 border-0 shadow-sm d-flex align-items-center justify-content-center text-danger p-3 cursor-pointer"
                                style={{ borderRadius: '16px', minHeight: '180px', cursor: 'pointer', backgroundColor: '#fff5f5' }}
                                onClick={() => setShowExpenseModal(true)}
                            >
                                <div className="text-center">
                                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-2">
                                        <MinusCircle size={24} />
                                    </div>
                                    <h6 className="fw-bold mb-0 text-danger">Log Expense</h6>
                                    <small className="text-muted opacity-75" style={{fontSize: '10px'}}>Track Spending</small>
                                </div>
                            </div>
                        </div>

                        {/* OPEN NEW ACCOUNT BUTTON */}
                        <div className="col-md-2">
                            <div
                                className="card h-100 border-2 border-dashed d-flex align-items-center justify-content-center text-muted p-4"
                                style={{ borderRadius: '16px', minHeight: '180px', cursor: 'pointer', borderColor: '#ccc', backgroundColor: '#f8f9fa' }}
                                onClick={() => setShowModal(true)}
                            >
                                <div className="text-center">
                                    <div className="bg-white p-3 rounded-circle d-inline-block mb-2 shadow-sm">
                                        <PlusCircle size={24} className="text-primary"/>
                                    </div>
                                    <h6 className="fw-bold mb-0">Open Account</h6>
                                </div>
                            </div>
                        </div>

                        {/* EXISTING ACCOUNTS */}
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

            <div className="row g-4">
                {/* SPENDING CHART (Now Dynamic!) */}
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
                                    transactions.slice(0, 5).map(tx => {
                                        const isMyOutgoing = myAccountNumbers.includes(tx.senderAccountNumber);
                                        const isDeposit = tx.transactionType === 'DEPOSIT';
                                        const isExpense = !isDeposit && isMyOutgoing;

                                        return (
                                            <li key={tx.transactionId} className="list-group-item p-3 d-flex justify-content-between align-items-center border-0">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className={`p-2 rounded-circle ${isExpense ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                                                        {isExpense ? <ArrowUpRight size={18}/> : <ArrowDownLeft size={18}/>}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <div className="fw-bold text-truncate" style={{maxWidth: '120px'}}>
                                                            {isDeposit ? "Cash Deposit" : (isExpense ? `To: ${tx.receiverAccountNumber || 'Merchant'}` : `From: ${tx.senderAccountNumber}`)}
                                                        </div>
                                                        <small className="text-muted" style={{fontSize: '10px'}}>
                                                            {tx.description || (isExpense ? 'Transfer Out' : 'Transfer In')}
                                                        </small>
                                                    </div>
                                                </div>
                                                <span className={isExpense ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                                    {isExpense ? '-' : '+'} R {tx.amount}
                                                </span>
                                            </li>
                                        );
                                    })
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