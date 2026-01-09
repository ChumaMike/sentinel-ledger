import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

const GoalCard = ({ goal }) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;

    return (
        <div className="card border-0 shadow-sm p-3 mb-3" style={{ borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-light p-2 rounded-circle text-primary">
                        <Target size={20} />
                    </div>
                    <h6 className="mb-0 fw-bold">{goal.name}</h6>
                </div>
                <span className="badge bg-success bg-opacity-10 text-success">
                    {Math.round(progress)}%
                </span>
            </div>

            <h4 className="fw-bold mb-1">R {goal.currentAmount.toLocaleString()}</h4>
            <small className="text-muted">Target: R {goal.targetAmount.toLocaleString()}</small>

            <div className="progress mt-3" style={{ height: '8px', borderRadius: '10px' }}>
                <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="mt-3 d-flex align-items-center gap-2 text-muted small">
                <TrendingUp size={14} />
                <span>Save <strong>R 500/wk</strong> to hit target by June</span>
            </div>
        </div>
    );
};

export default GoalCard;