import React, { useEffect, useState } from 'react';
import { coreApi } from '../utils/api';
import { Plus, Edit2, Calendar, Flag } from 'lucide-react'; // Add icons
import CreateGoalModal from '../components/modals/CreateGoalModal';
import EditGoalModal from '../components/modals/EditGoalModal'; // Import New Modal

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null); // State for editing

    const fetchData = async () => {
        const gRes = await coreApi.get('/goals');
        setGoals(gRes.data);
    };

    useEffect(() => { fetchData(); }, []);

    // Helper for Priority Colors
    const getPriorityColor = (p) => {
        if (p === 'HIGH') return 'text-danger bg-danger-subtle';
        if (p === 'MEDIUM') return 'text-warning bg-warning-subtle';
        return 'text-success bg-success-subtle';
    };

    return (
        <div className="container-fluid">
            {showCreateModal && <CreateGoalModal onClose={() => setShowCreateModal(false)} onGoalCreated={fetchData} />}
            {editingGoal && <EditGoalModal goal={editingGoal} onClose={() => setEditingGoal(null)} onGoalUpdated={fetchData} />}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark">My Goals</h3>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary d-flex align-items-center gap-2 rounded-3 fw-bold">
                    <Plus size={18} /> New Goal
                </button>
            </div>

            <div className="row g-4">
                {goals.map(goal => {
                    const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    const isAchieved = goal.status === 'COMPLETED' || percent >= 100;

                    return (
                        <div key={goal.goalId} className="col-md-6 col-lg-4">
                            <div className={`card border-0 shadow-sm p-4 h-100 rounded-4 ${isAchieved ? 'bg-success-subtle' : 'bg-white'}`}>

                                {/* Header with Priority & Edit */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <span className={`badge ${getPriorityColor(goal.priority)}`}>{goal.priority}</span>
                                    <button onClick={() => setEditingGoal(goal)} className="btn btn-sm btn-light rounded-circle">
                                        <Edit2 size={14} className="text-muted"/>
                                    </button>
                                </div>

                                <h5 className="fw-bold mb-1">{goal.name}</h5>
                                <p className="text-muted small mb-3 text-truncate">{goal.description || "No description set."}</p>

                                {/* Progress Bar */}
                                <div className="d-flex justify-content-between align-items-end mb-1">
                                    <h2 className="fw-bold mb-0">{percent.toFixed(0)}%</h2>
                                    {goal.deadline && (
                                        <small className="text-muted d-flex align-items-center gap-1">
                                            <Calendar size={12}/> {goal.deadline}
                                        </small>
                                    )}
                                </div>
                                <div className="progress mb-3" style={{ height: '8px', borderRadius: '10px' }}>
                                    <div className={`progress-bar ${isAchieved ? 'bg-success' : 'bg-primary'}`} style={{ width: `${percent}%` }}></div>
                                </div>

                                <div className="d-flex justify-content-between small fw-bold text-muted">
                                    <span>R {goal.currentAmount.toLocaleString()}</span>
                                    <span>Target: R {goal.targetAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Goals;