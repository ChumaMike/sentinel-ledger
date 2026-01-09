import React, { useEffect, useState } from 'react';
import { coreApi } from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, CreditCard, PlusCircle } from 'lucide-react';
import GoalCard from '../components/GoalCard';
import { toast } from 'react-toastify';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [goals, setGoals] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // Fake data for the chart until you log real expenses
    const spendingData = [
        { name: 'Food', value: 400 },
        { name: 'Transport', value: 300 },
        { name: 'Tech', value: 300 },
        { name: 'Rent', value: 200 },
    ];

    useEffect(() => {
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

            <div className="row g-4">
                {/* 2. SPENDING CHART */}
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

                {/* 3. GOALS SECTION */}
                <div className="col-md-4">
                    <h5 className="fw-bold mb-3 d-flex justify-content-between">
                        My Goals <PlusCircle size={20} className="text-primary cursor-pointer"/>
                    </h5>
                    {goals.length > 0 ? (
                        goals.map(goal => <GoalCard key={goal.goalId} goal={goal} />)
                    ) : (
                        <div className="alert alert-light text-center">No goals set yet! 🎯</div>
                    )}
                </div>

                {/* 4. RECENT TRANSACTIONS */}
                <div className="col-md-4">
                    <h5 className="fw-bold mb-3">Recent Activity</h5>
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <ul className="list-group list-group-flush">
                            {transactions.slice(0, 5).map(tx => (
                                <li key={tx.transactionId} className="list-group-item p-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-2 rounded-circle">
                                            <CreditCard size={18} className="text-muted"/>
                                        </div>
                                        <div>
                                            <div className="fw-bold">{tx.description}</div>
                                            <small className="text-muted">{tx.timestamp.split('T')[0]}</small>
                                        </div>
                                    </div>
                                    <span className={tx.transactionType === 'EXPENSE' ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                        {tx.transactionType === 'EXPENSE' ? '-' : '+'} R {tx.amount}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;