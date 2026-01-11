import React, { useState } from 'react';
import { X, Target, Calendar, Flag } from 'lucide-react';
import { coreApi } from '../../utils/api';
import { toast } from 'react-toastify';

const CreateGoalModal = ({ onClose, onGoalCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        description: '',
        priority: 'MEDIUM',
        deadline: ''
    });

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await coreApi.post('/goals', formData);
            toast.success("Goal Created Successfully!");
            onGoalCreated();
            onClose();
        } catch (err) {
            toast.error("Failed to create goal");
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
            <div className="card border-0 shadow-lg p-4" style={{ width: '450px', borderRadius: '16px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Set New Goal</h5>
                    <button onClick={onClose} className="btn btn-light rounded-circle p-2"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="small fw-bold text-muted">GOAL NAME</label>
                        <input name="name" className="form-control bg-light border-0 py-2" onChange={handleChange} required placeholder="e.g. New Car"/>
                    </div>

                    <div className="row g-2 mb-3">
                        <div className="col-6">
                            <label className="small fw-bold text-muted">TARGET (R)</label>
                            <input name="targetAmount" type="number" className="form-control bg-light border-0 py-2" onChange={handleChange} required placeholder="0.00"/>
                        </div>
                        <div className="col-6">
                            <label className="small fw-bold text-muted">DEADLINE</label>
                            <input name="deadline" type="date" className="form-control bg-light border-0 py-2" onChange={handleChange}/>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="small fw-bold text-muted">PRIORITY</label>
                        <select name="priority" className="form-select bg-light border-0" onChange={handleChange} value={formData.priority}>
                            <option value="HIGH">High Priority 🔴</option>
                            <option value="MEDIUM">Medium Priority 🟡</option>
                            <option value="LOW">Low Priority 🟢</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="small fw-bold text-muted">DESCRIPTION / PLAN</label>
                        <textarea name="description" className="form-control bg-light border-0" rows="3" onChange={handleChange} placeholder="What is the plan?"></textarea>
                    </div>

                    <button className="btn btn-primary w-100 py-3 fw-bold">Create Goal</button>
                </form>
            </div>
        </div>
    );
};

export default CreateGoalModal;