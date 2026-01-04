import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Users, ChevronRight, Code } from 'lucide-react';
import axios from 'axios';
import AddStudentModal from '../components/AddStudentModal';

// ✅ API base URL from env
const API_BASE_URL = import.meta.env.VITE_API_URL;

const DepartmentCard = ({ id, name, students, avg_solved, icon: Icon, color, onAddStudent }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="glass-card p-6 relative overflow-hidden group cursor-pointer"
    >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10">
            <Icon size={120} />
        </div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
                <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
                    <Icon size={24} />
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onAddStudent(); }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                    <Plus size={20} />
                </button>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
            <div className="flex gap-4 text-zinc-400 text-sm">
                <span className="flex gap-1"><Users size={16} /> {students} Students</span>
                <span className="flex gap-1"><Code size={16} /> Avg {avg_solved || 0}</span>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
                <Link to={`/department/${id}`} className="text-sm flex items-center gap-2 text-zinc-300 hover:text-white">
                    View Details <ChevronRight size={18} />
                </Link>
            </div>
        </div>
    </motion.div>
);

const Department = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);

    const getDeptName = (id) => ({
        CSE: 'Computer Science',
        ECE: 'Electronics',
        IT: 'Information Tech',
        AI: 'Artificial Intelligence',
        EEE: 'Electrical & Electronics',
        MECH: 'Mechanical',
        CIVIL: 'Civil',
    }[id] || id);

    const getDeptColor = (id) => ({
        CSE: 'text-zinc-200',
        ECE: 'text-zinc-400',
        IT: 'text-zinc-300',
        AI: 'text-zinc-500',
    }[id] || 'text-zinc-400');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(
                    `${API_BASE_URL}/api/dashboard/stats`
                );

                const stats = res.data.department_stats || [];
                setDepartments(
                    stats.map(d => ({
                        id: d.id,
                        name: getDeptName(d.id),
                        students: d.students,
                        avg_solved: d.avg_solved,
                        icon: Code,
                        color: getDeptColor(d.id)
                    }))
                );
            } catch (err) {
                console.error("Failed department stats", err);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Departments</h1>
                    <p className="text-zinc-400">Manage students by department</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-white text-black rounded-lg flex items-center gap-2"
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
                onAdd={() => {}}
            />
        </div>
    );
};

export default Department;
