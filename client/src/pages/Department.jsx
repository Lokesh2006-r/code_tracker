import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Users, ChevronRight, Code } from 'lucide-react';
import AddStudentModal from '../components/AddStudentModal';

const DepartmentCard = ({ id, name, students, avg_solved, icon: Icon, color, onAddStudent }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="glass-card p-6 relative overflow-hidden group cursor-pointer"
    >
        <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
            <Icon size={120} />
        </div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
                <div className={`p-3 rounded-xl bg-white/5 ${color} shadow-lg shadow-black/20`}>
                    <Icon size={24} />
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onAddStudent(); }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors shadow-lg shadow-white/5"
                >
                    <Plus size={20} />
                </button>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
            <div className="flex items-center gap-4 text-zinc-400 text-sm font-medium">
                <span className="flex items-center gap-1"><Users size={16} /> {students} Students</span>
                <span className="flex items-center gap-1"><Code size={16} /> Avg {avg_solved || 0} Solved</span>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-zinc-300 group-hover:text-white group-hover:translate-x-2 transition-all">
                <Link to={`/department/${id}`} className="text-sm font-semibold flex items-center gap-2 hover:underline">
                    View Details <ChevronRight size={18} />
                </Link>
            </div>
        </div>
    </motion.div>
);

import axios from 'axios';

const Department = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);

    const getDeptName = (id) => {
        const names = {
            'CSE': 'Computer Science',
            'ECE': 'Electronics',
            'IT': 'Information Tech',
            'AI': 'Artificial Intelligence',
            'EEE': 'Electrical & Electronics',
            'MECH': 'Mechanical',
            'CIVIL': 'Civil',
        };
        return names[id] || id;
    };

    const getDeptColor = (id) => {
        const colors = {
            'CSE': 'text-zinc-200',
            'ECE': 'text-zinc-400',
            'IT': 'text-zinc-300',
            'AI': 'text-zinc-500',
        };
        return colors[id] || 'text-zinc-400';
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/dashboard/stats');
                const stats = res.data.department_stats || [];
                const formatted = stats.map(d => ({
                    id: d.id,
                    name: getDeptName(d.id),
                    students: d.students,
                    avg_solved: d.avg_solved,
                    icon: Code,
                    color: getDeptColor(d.id)
                }));
                setDepartments(formatted);
            } catch (err) {
                console.error("Failed department stats", err);
            }
        };
        fetchStats();
    }, []);

    const handleAddStudent = () => {
        // Refresh list or show success toast
        console.log("Student added!");
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Departments</h1>
                    <p className="text-zinc-400">Manage students and faculty by department</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-medium transition-colors shadow-lg shadow-white/10 flex items-center gap-2 border border-white/20"
                >
                    <Plus size={18} />
                    Add Student
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept, idx) => (
                    <DepartmentCard
                        key={idx}
                        {...dept}
                        onAddStudent={() => setIsModalOpen(true)}
                    />
                ))}
            </div>

            <AddStudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddStudent}
            />
        </div>
    );
};

export default Department;
