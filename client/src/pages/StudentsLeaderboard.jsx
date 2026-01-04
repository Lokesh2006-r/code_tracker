import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Trophy, Medal, Filter } from 'lucide-react';

// ✅ API base URL from env
const API_BASE_URL = import.meta.env.VITE_API_URL;

const RankBadge = ({ rank }) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={20} />;
    if (rank === 2) return <Medal className="text-gray-300" size={20} />;
    if (rank === 3) return <Medal className="text-amber-600" size={20} />;
    return <span className="text-zinc-500 font-mono font-bold">#{rank}</span>;
};

const StudentsLeaderboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get(
                    `${API_BASE_URL}/api/students`
                );
                setStudents(res.data);
            } catch (err) {
                console.error("Failed to fetch students", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const processedStudents = students
        .map(s => {
            const stats = s.stats || {};
            const lc = stats.leetcode || {};
            const cc = stats.codechef || {};
            const cf = stats.codeforces || {};
            const hr = stats.hackerrank || {};

            const totalSolved =
                (lc.total_solved || 0) +
                (cc.solved || 0) +
                (cf.solved || 0) +
                (hr.solved || 0);

            const weightedScore =
                (lc.hard || 0) * 5 +
                (lc.medium || 0) * 3 +
                (lc.easy || 0);

            return {
                ...s,
                totalSolved,
                weightedScore,
                lcEasy: lc.easy || 0,
                lcMedium: lc.medium || 0,
                lcHard: lc.hard || 0,
                lcRating: lc.rating || 0,
                ccRating: cc.rating || 0,
                dept: s.department || 'Unknown'
            };
        })
        .sort((a, b) =>
            b.weightedScore !== a.weightedScore
                ? b.weightedScore - a.weightedScore
                : b.totalSolved - a.totalSolved
        );

    const filteredStudents = processedStudents.filter(s =>
        (departmentFilter === 'All' || s.dept === departmentFilter) &&
        (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.reg_no.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const categories = ['All', 'CSE', 'ECE', 'IT', 'AI', 'EEE', 'MECH', 'CIVIL'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex gap-2">
                        <Trophy className="text-yellow-500" /> Leaderboard
                    </h1>
                    <p className="text-zinc-400">
                        Ranked by difficulty-weighted score
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search name or reg no..."
                        className="pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white w-64"
                    />
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                <Filter size={18} className="text-zinc-500 mt-1" />
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setDepartmentFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm ${
                            departmentFilter === cat
                                ? 'bg-white text-black'
                                : 'bg-zinc-900 text-zinc-400 border border-white/10'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="glass-card border border-white/10 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase text-zinc-500">
                        <tr>
                            <th className="px-4 py-3">Rank</th>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3 text-purple-400">Score</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3 text-emerald-400">Easy</th>
                            <th className="px-4 py-3 text-amber-400">Medium</th>
                            <th className="px-4 py-3 text-red-400">Hard</th>
                            <th className="px-4 py-3">LC Rating</th>
                            <th className="px-4 py-3">CC Rating</th>
                            <th className="px-4 py-3">Dept</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="text-center py-8 text-zinc-500">
                                    Loading leaderboard...
                                </td>
                            </tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center py-8 text-zinc-500">
                                    No students found
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student, idx) => (
                                <motion.tr
                                    key={student.reg_no}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="border-b border-white/5"
                                >
                                    <td className="px-4 py-3">
                                        <RankBadge rank={idx + 1} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-white font-medium">{student.name}</div>
                                        <div className="text-xs text-zinc-500">{student.reg_no}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-purple-400">
                                        {student.weightedScore}
                                    </td>
                                    <td className="px-4 py-3 text-center text-white font-bold">
                                        {student.totalSolved}
                                    </td>
                                    <td className="px-4 py-3 text-center text-emerald-400">{student.lcEasy}</td>
                                    <td className="px-4 py-3 text-center text-amber-400">{student.lcMedium}</td>
                                    <td className="px-4 py-3 text-center text-red-400">{student.lcHard}</td>
                                    <td className="px-4 py-3 text-center text-zinc-400">{student.lcRating || '-'}</td>
                                    <td className="px-4 py-3 text-center text-zinc-400">{student.ccRating || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="px-2 py-1 bg-zinc-800 rounded text-xs">
                                            {student.dept}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentsLeaderboard;
