import React, { useState } from 'react';
import { X, Save, CheckCircle } from 'lucide-react';
import { coreApi } from '../../utils/api';
import { toast } from 'react-toastify';

const EditGoalModal = ({ goal, onClose, onGoalUpdated }) => {
    const [formData, setFormData] = useState({ ...goal });

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await coreApi.put(`/goals/${goal.goalId}`, formData);
            toast.success("Goal Updated!");
            onGoalUpdated();
            onClose();
        } catch(error){
            console.error(error);
            toast.error("Update failed");
        }
    };

    const markComplete = async () => {
        try {
            await coreApi.put(`/goals/${goal.goalId}`, { ...formData, status: 'COMPLETED', currentAmount: goal.targetAmount });
            toast.success("Goal Completed! 🎉");
            onGoalUpdated();
            onClose();
        } catch(error){
            console.error(error);
            toast.error("Failed"); }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
            <div className="card border-0 shadow-lg p-4" style={{ width: '500px', borderRadius: '16px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Edit Goal: {goal.name}</h5>
                    <button onClick={onClose} className="btn btn-light rounded-circle p-2"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-3 bg-light rounded-3 mb-3">
                        <label className="small fw-bold text-muted d-block mb-2">MANUAL PROGRESS ADJUSTMENT</label>
                        <div className="input-group">
                            <span className="input-group-text border-0">Current Saved: R</span>
                            <input
                                name="currentAmount"
                                type="number"
                                className="form-control border-0 fw-bold"
                                value={formData.currentAmount}
                                onChange={handleChange}
                            />
                        </div>
                        <small className="text-muted">Target: R {goal.targetAmount}</small>
                    </div>

                    <div className="row g-2 mb-3">
                        <div className="col-6">
                            <label className="small fw-bold text-muted">PRIORITY</label>
                            <select name="priority" className="form-select border-0 bg-light" value={formData.priority} onChange={handleChange}>
                                <option value="HIGH">High 🔴</option>
                                <option value="MEDIUM">Medium 🟡</option>
                                <option value="LOW">Low 🟢</option>
                            </select>
                        </div>
                        <div className="col-6">
                            <label className="small fw-bold text-muted">STATUS</label>
                            <select name="status" className="form-select border-0 bg-light" value={formData.status} onChange={handleChange}>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="small fw-bold text-muted">DESCRIPTION / NOTES</label>
                        <textarea name="description" className="form-control border-0 bg-light" rows="3" value={formData.description || ''} onChange={handleChange} />
                    </div>

                    <div className="d-flex gap-2">
                        <button type="button" onClick={markComplete} className="btn btn-success flex-grow-1 fw-bold">
                            <CheckCircle size={18} className="me-2"/> Mark Done
                        </button>
                        <button type="submit" className="btn btn-primary flex-grow-1 fw-bold">
                            <Save size={18} className="me-2"/> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGoalModal;