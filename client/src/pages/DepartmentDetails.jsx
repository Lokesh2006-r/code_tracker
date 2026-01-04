import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Code, Search, Trash2, Pencil, RefreshCw } from 'lucide-react';
import axios from 'axios';
import AddStudentModal from '../components/AddStudentModal';

// ✅ API base URL from env
const API_BASE_URL = import.meta.env.VITE_API_URL;

const StudentRow = ({ student, idx, onDelete, onEdit }) => {
    const totalSolved =
        (student.stats?.leetcode?.total_solved || 0) +
        (student.stats?.codechef?.solved || 0) +
        (student.stats?.codeforces?.solved || 0) +
        (student.stats?.hackerrank?.solved || 0);

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="border-b border-white/5 hover:bg-white/5"
        >
            <td className="py-4 px-4 text-white">{student.reg_no}</td>
            <td className="py-4 px-4 text-white">
                <Link to={`/student/${student.reg_no}`} className="hover:underline">
                    {student.name}
                </Link>
            </td>
            <td className="py-4 px-4 text-zinc-400">{student.year}</td>
            <td className="py-4 px-4 text-white font-mono">{totalSolved}</td>
            <td className="py-4 px-4">
                <span className={`px-2 py-1 rounded text-xs ${
                    totalSolved > 500
                        ? 'bg-white/10 text-white'
                        : totalSolved > 200
                        ? 'bg-zinc-500/10 text-zinc-300'
                        : 'bg-zinc-800/50 text-zinc-500'
                }`}>
                    {totalSolved > 500 ? 'Expert' : totalSolved > 200 ? 'Intermediate' : 'Beginner'}
                </span>
            </td>
            <td className="py-4 px-4 flex justify-end gap-2">
                <button onClick={onEdit} className="p-2 bg-zinc-800 rounded-lg">
                    <Pencil size={16} />
                </button>
                <Link to={`/student/${student.reg_no}`} className="p-2 bg-white/5 rounded-lg">
                    <ChevronRight size={16} />
                </Link>
                <button onClick={onDelete} className="p-2 bg-red-900/30 text-red-400 rounded-lg">
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
    const [searchQuery, setSearchQuery] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadStudents = async () => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/students/?department=${deptName}`
            );
            const sorted = (res.data || []).sort((a, b) =>
                String(a.reg_no).localeCompare(String(b.reg_no), undefined, { numeric: true })
            );
            setStudents(sorted);
        } catch (err) {
            console.error("Failed to fetch department students", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        if (refreshing) return;
        if (!window.confirm("Verify and refresh all students in this department?")) return;

        setRefreshing(true);
        try {
            await axios.post(
                `${API_BASE_URL}/api/students/refresh-department?department=${deptName}`
            );
            await loadStudents();
        } catch {
            alert("Failed to refresh data");
        } finally {
            setRefreshing(false);
        }
    };

    const handleDelete = async (regNo) => {
        if (!window.confirm(`Delete student ${regNo}?`)) return;

        try {
            await axios.delete(
                `${API_BASE_URL}/api/students/${regNo}`
            );
            setStudents(prev => prev.filter(s => s.reg_no !== regNo));
        } catch {
            alert("Failed to delete student");
        }
    };

    useEffect(() => {
        loadStudents();
    }, [deptName]);

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.reg_no?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">{deptName} Department</h1>
                    <p className="text-zinc-400">Performance Overview</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex gap-2"
                    >
                        <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                        {refreshing ? "Verifying..." : "Verify & Refresh"}
                    </button>

                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search student..."
                            className="pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="glass-card border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-white/5 text-zinc-500 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3">Reg No</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Year</th>
                            <th className="px-4 py-3">Solved</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8 text-zinc-500">Loading...</td></tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-8 text-zinc-500">No students found</td></tr>
                        ) : (
                            filteredStudents.map((student, idx) => (
                                <StudentRow
                                    key={student.reg_no}
                                    student={student}
                                    idx={idx}
                                    onEdit={() => setEditingStudent(student)}
                                    onDelete={() => handleDelete(student.reg_no)}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AddStudentModal
                isOpen={!!editingStudent}
                onClose={() => setEditingStudent(null)}
                studentToEdit={editingStudent}
                onAdd={() => {
                    loadStudents();
                    setEditingStudent(null);
                }}
            />
        </div>
    );
};

export default DepartmentDetails;
