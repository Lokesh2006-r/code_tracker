import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Code, Trophy, Search, Trash2, Pencil } from 'lucide-react';
import API from "../api";
import AddStudentModal from '../components/AddStudentModal';

const StudentRow = ({ student, idx, onDelete, onEdit }) => {
    // Summing solved count from all platforms
    const totalSolved = (
        (student.stats?.leetcode?.total_solved || 0) +
        (student.stats?.codechef?.solved || 0) +
        (student.stats?.codeforces?.solved || 0) +
        (student.stats?.hackerrank?.solved || 0)
    );

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="border-b border-white/5 hover:bg-white/5 transition-colors"
        >
            <td className="py-4 px-4 text-white font-medium">{student.reg_no}</td>
            <td className="py-4 px-4 text-white hover:text-zinc-300">
                <Link to={`/student/${student.reg_no}`}>{student.name}</Link>
            </td>
            <td className="py-4 px-4 text-zinc-400">{student.year}</td>
            <td className="py-4 px-4 text-white font-mono">{totalSolved}</td>
            <td className="py-4 px-4">
                <span className={`px-2 py-1 rounded text-xs border ${totalSolved > 500 ? 'bg-white/10 text-white border-white/20' :
                    totalSolved > 200 ? 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20' :
                        'bg-zinc-800/50 text-zinc-500 border-zinc-800'
                    }`}>
                    {totalSolved > 500 ? 'Expert' : totalSolved > 200 ? 'Intermediate' : 'Beginner'}
                </span>
            </td>
            <td className="py-4 px-4 text-right flex justify-end gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                    title="Edit Student"
                >
                    <Pencil size={16} />
                </button>
                <Link to={`/student/${student.reg_no}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors inline-block">
                    <ChevronRight size={16} />
                </Link>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 transition-colors"
                    title="Delete Student"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </motion.tr>
    );
};

const DepartmentDetails = () => {
    const { deptName } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await API.get(`/api/students/?department=${deptName}`);
                setStudents(res.data);
            } catch (err) {
                console.error("Failed to fetch department students", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [deptName]);

    const handleDelete = async (regNo) => {
        if (!window.confirm(`Are you sure you want to delete student ${regNo}?`)) return;

        try {
            await API.delete(`/students/${regNo}`);
            setStudents(prev => prev.filter(s => s.reg_no !== regNo));
        } catch (err) {
            alert("Failed to delete student");
        }
    };

    const [editingStudent, setEditingStudent] = useState(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{deptName} Department</h1>
                    <p className="text-zinc-400">Performance Overview</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        placeholder="Search student..."
                        className="pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white outline-none focus:border-white/30 hover:bg-zinc-800 transition-colors w-64"
                    />
                </div>
            </div>

            <div className="glass-card overflow-hidden border border-white/10 bg-black/40">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                            <th className="py-4 px-4 font-semibold">Reg No</th>
                            <th className="py-4 px-4 font-semibold">Name</th>
                            <th className="py-4 px-4 font-semibold">Year</th>
                            <th className="py-4 px-4 font-semibold">Problems Solved</th>
                            <th className="py-4 px-4 font-semibold">Status</th>
                            <th className="py-4 px-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="py-8 text-center text-zinc-500">Loading data...</td></tr>
                        ) : students.length === 0 ? (
                            <tr><td colSpan="6" className="py-8 text-center text-zinc-500">No students found in this department.</td></tr>
                        ) : (
                            students.map((student, idx) => (
                                <StudentRow
                                    key={student.reg_no}
                                    student={student}
                                    idx={idx}
                                    onDelete={() => handleDelete(student.reg_no)}
                                    onEdit={() => setEditingStudent(student)}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AddStudentModal
                isOpen={!!editingStudent}
                onClose={() => setEditingStudent(null)}
                onAdd={() => {
                    // Refresh list
                    const fetchStudents = async () => {
                        const res = await API.get(`/api/students/?department=${deptName}`);
                        setStudents(res.data);
                    };
                    fetchStudents();
                    setEditingStudent(null);
                }}
                studentToEdit={editingStudent}
            />
        </div>
    );
};

export default DepartmentDetails;
