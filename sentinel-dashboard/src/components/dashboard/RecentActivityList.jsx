import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const RecentActivityList = ({ transactions, myAccountNumbers }) => {
    return (
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
    );
};

export default RecentActivityList;