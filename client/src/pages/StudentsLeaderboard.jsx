import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Trophy, Medal, Award, Filter } from 'lucide-react';

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
                const res = await axios.get('http://localhost:8000/api/students'); // Removed trailing slash
                setStudents(res.data);
            } catch (err) {
                console.error("Failed to fetch students", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // Process data: Calculate totals and weighted score
    const processedStudents = students.map(s => {
        const stats = s.stats || {};
        const lc = stats.leetcode || {};
        const cc = stats.codechef || {};
        const cf = stats.codeforces || {};
        const hr = stats.hackerrank || {};

        const totalSolved = (lc.total_solved || 0) + (cc.solved || 0) + (cf.solved || 0) + (hr.solved || 0);

        // Weighted Score Calculation
        // Hard * 5 + Medium * 3 + Easy * 1
        const lcEasy = lc.easy || 0;
        const lcMedium = lc.medium || 0;
        const lcHard = lc.hard || 0;

        const weightedScore = (lcHard * 5) + (lcMedium * 3) + (lcEasy * 1);

        return {
            ...s,
            totalSolved,
            lcEasy,
            lcMedium,
            lcHard,
            weightedScore,
            lcRating: lc.rating || 0,
            ccRating: cc.rating || 0,
            ccRank: cc.global_rank || 'N/A',
            dept: s.department || 'Unknown'
        };
    }).sort((a, b) => {
        // Sort by Weighted Score first, then Total Solved
        if (b.weightedScore !== a.weightedScore) return b.weightedScore - a.weightedScore;
        return b.totalSolved - a.totalSolved;
    });

    // Apply Filters
    const filteredStudents = processedStudents.filter(s => {
        const matchesDept = departmentFilter === 'All' || s.dept === departmentFilter;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.reg_no.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDept && matchesSearch;
    });

    const categories = ['All', 'CSE', 'ECE', 'IT', 'AI', 'EEE', 'MECH', 'CIVIL'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                        <Trophy className="text-yellow-500" /> Leaderboard
                    </h1>
                    <p className="text-zinc-400">Top performers based on problem difficulty analysis</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            placeholder="Search name or reg no..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white outline-none focus:border-white/30 hover:bg-zinc-800 transition-colors w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Department Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Filter size={18} className="text-zinc-500 min-w-[18px]" />
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setDepartmentFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${departmentFilter === cat
                            ? 'bg-white text-black font-medium'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-white/10'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="glass-card overflow-hidden border border-white/10 bg-black/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500 text-center">
                                <th className="py-4 px-4 font-semibold text-left">Rank</th>
                                <th className="py-4 px-4 font-semibold text-left">Student</th>
                                <th className="py-4 px-4 font-semibold text-purple-400">Score</th>
                                <th className="py-4 px-4 font-semibold">Total Solved</th>
                                <th className="py-4 px-4 font-semibold text-emerald-400">Easy</th>
                                <th className="py-4 px-4 font-semibold text-amber-400">Medium</th>
                                <th className="py-4 px-4 font-semibold text-red-400">Hard</th>
                                <th className="py-4 px-4 font-semibold text-zinc-300">LC Rating</th>
                                <th className="py-4 px-4 font-semibold text-zinc-300">CC Rating</th>
                                <th className="py-4 px-4 font-semibold">Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="10" className="py-8 text-center text-zinc-500">Loading ranking...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan="10" className="py-8 text-center text-zinc-500">No students found.</td></tr>
                            ) : (
                                filteredStudents.map((student, idx) => (
                                    <motion.tr
                                        key={student.reg_no}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`border-b border-white/5 transition-colors ${idx < 3 ? 'bg-white/[0.02]' : 'hover:bg-white/[0.02]'
                                            }`}
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2 pl-2">
                                                <RankBadge rank={idx + 1} />
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>
                                                <div className="font-medium text-white">{student.name}</div>
                                                <div className="text-xs text-zinc-500">{student.reg_no}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center font-bold text-purple-400">
                                            {student.weightedScore}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-lg font-bold text-white">{student.totalSolved}</span>
                                        </td>
                                        <td className="py-4 px-4 text-center font-mono text-emerald-400">{student.lcEasy}</td>
                                        <td className="py-4 px-4 text-center font-mono text-amber-400">{student.lcMedium}</td>
                                        <td className="py-4 px-4 text-center font-mono text-red-400">{student.lcHard}</td>
                                        <td className="py-4 px-4 text-center font-mono text-zinc-400">{student.lcRating || '-'}</td>
                                        <td className="py-4 px-4 text-center font-mono text-zinc-400">{student.ccRating || '-'}</td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 border border-white/5">
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
        </div>
    );
};

export default StudentsLeaderboard;
