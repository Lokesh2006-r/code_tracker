import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;


const AddStudentModal = ({ isOpen, onClose, onAdd, studentToEdit = null }) => {
    const [formData, setFormData] = useState({
        name: '', reg_no: '', department: 'CSE', year: '1',
        handles: { leetcode: '', codeforces: '', codechef: '', hackerrank: '' }
    });
    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Populate data on open
    React.useEffect(() => {
        if (isOpen) {
            if (studentToEdit) {
                setFormData({
                    name: studentToEdit.name,
                    reg_no: studentToEdit.reg_no,
                    department: studentToEdit.department,
                    year: studentToEdit.year,
                    handles: {
                        leetcode: studentToEdit.handles?.leetcode || '',
                        codeforces: studentToEdit.handles?.codeforces || '',
                        codechef: studentToEdit.handles?.codechef || '',
                        hackerrank: studentToEdit.handles?.hackerrank || ''
                    }
                });
                // Auto-set verification to allow saving immediately without re-verifying if user wants
                // Or force verify? Let's just set true to allow click if they don't change anything
                setVerification(true);
            } else {
                // Reset form
                setFormData({
                    name: '', reg_no: '', department: 'CSE', year: '1',
                    handles: { leetcode: '', codeforces: '', codechef: '', hackerrank: '' }
                });
                setVerification(null);
            }
            setError(null);
        }
    }, [isOpen, studentToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('handle_')) {
            const platform = name.replace('handle_', '');
            setFormData(prev => ({ ...prev, handles: { ...prev.handles, [platform]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const verifyProfiles = async () => {
        setLoading(true);
        setError(null);
        setVerification(null);
        try {
            axios.post(`${API_BASE_URL}/api/students/verify-profiles`, formData.handles);

            setVerification(res.data);
        } catch (err) {
            setError("Failed to verify profiles. Check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (studentToEdit) {
                await axios.put(`${API_BASE_URL}/api/students/${studentToEdit.reg_no}`, formData);
            } else {
                await axios.post(`${API_BASE_URL}/api/students/`, formData);
            }
            onAdd();
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to save student.");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">{studentToEdit ? 'Edit Student' : 'Add New Student'}</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <input name="name" value={formData.name} placeholder="Full Name" onChange={handleChange} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" />
                            <input name="reg_no" value={formData.reg_no} placeholder="Register Number" onChange={handleChange} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" disabled={!!studentToEdit} />
                            <select name="department" value={formData.department} onChange={handleChange} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none">
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="IT">IT</option>
                            </select>
                            <select name="year" value={formData.year} onChange={handleChange} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none">
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>

                        {/* Handles */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Platform Handles</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="handle_leetcode" value={formData.handles.leetcode} placeholder="LeetCode Username" onChange={handleChange} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none" />
                                <input name="handle_codeforces" value={formData.handles.codeforces} placeholder="Codeforces Username" onChange={handleChange} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                                <input name="handle_codechef" value={formData.handles.codechef} placeholder="CodeChef Username" onChange={handleChange} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-900 outline-none" />
                                <input name="handle_hackerrank" value={formData.handles.hackerrank} placeholder="HackerRank Username" onChange={handleChange} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-600 outline-none" />
                            </div>
                        </div>

                        {/* Verification Result */}
                        {verification && typeof verification === 'object' && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                                    <CheckCircle size={18} /> Verification Successful
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {verification.leetcode && (
                                        <div>
                                            <span className="text-slate-400">LeetCode:</span>
                                            <span className="text-white ml-2">{verification.leetcode.total_solved} Solved (Rank {verification.leetcode.ranking})</span>
                                        </div>
                                    )}
                                    {verification.codeforces && (
                                        <div>
                                            <span className="text-slate-400">Codeforces:</span>
                                            <span className="text-white ml-2">{verification.codeforces.rating} Rating ({verification.codeforces.rank})</span>
                                        </div>
                                    )}
                                    {verification.hackerrank && (
                                        <div>
                                            <span className="text-slate-400">HackerRank:</span>
                                            <span className="text-white ml-2">{verification.hackerrank.badges} Badges ({verification.hackerrank.solved} Pts)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-2">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                        <button onClick={verifyProfiles} disabled={loading} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verify Profiles'}
                        </button>
                        <button onClick={handleSave} disabled={!verification} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors">
                            {studentToEdit ? 'Update Student' : 'Save Student'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddStudentModal;
