// frontend/src/components/FinancialHealthChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const FinancialHealthChart = ({ transactions, accounts, myAccountNumbers }) => {

    // 1. Calculate Expenses Logic
    const expenses = transactions.filter(tx =>
        tx.transactionType === 'EXPENSE' ||
        (myAccountNumbers.includes(tx.senderAccountNumber) && tx.transactionType !== 'DEPOSIT')
    );

    const categoryMap = {};
    expenses.forEach(tx => {
        const match = tx.description ? tx.description.match(/\[(.*?)\]/) : null;
        const category = match ? match[1] : 'Uncategorized';

        if (!categoryMap[category]) categoryMap[category] = 0;
        categoryMap[category] += tx.amount;
    });

    let chartData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
    }));

    // 2. Add Available Balance Slice
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    if (totalBalance > 0) {
        chartData.push({
            name: 'Available Funds',
            value: totalBalance,
            isBalance: true
        });
    }

    // 3. Colors & Labels
    const CHART_COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#FF4444'];
    const BALANCE_COLOR = '#e0e0e0';

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="card border-0 shadow-sm h-100 p-3 rounded-4">
            <h5 className="fw-bold mb-3">Financial Health</h5>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%" cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={renderCustomizedLabel}
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isBalance ? BALANCE_COLOR : CHART_COLORS[index % CHART_COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `R ${value.toLocaleString()}`} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FinancialHealthChart;