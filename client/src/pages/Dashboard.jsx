import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users, AlertCircle, FileText, UserPlus, ArrowRight,
    TrendingUp, Award, BookOpen
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const QuickAction = ({ icon: Icon, label, to, color }) => (
    <Link
        to={to}
        className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-colors group"
    >
        <div className={`p-2 rounded-lg bg-black ${color}`}>
            <Icon size={20} />
        </div>
        <span className="font-medium text-zinc-300 group-hover:text-white">{label}</span>
        <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" size={16} />
    </Link>
);

const HighlightCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-zinc-500 font-medium text-sm uppercase tracking-wide">{title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5`} style={{ color: color }}>
                <Icon size={24} />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                <span className="text-emerald-400 font-medium">{trend}</span> since last week
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_students: 0,
        total_solved: 0,
        department_stats: [],
        skill_distribution: { expert: 0, intermediate: 0, beginner: 0 },
        inactive_students: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/dashboard/stats');
                setStats(res.data);
            } catch (e) {
                console.error("Failed to fetch dashboard stats", e);
            }
        };
        fetchStats();
    }, []);

    const deptData = (stats.department_stats || []).map(d => ({
        name: d.id,
        avg: d.avg_solved,
        count: d.students
    })).sort((a, b) => b.avg - a.avg); // Sort by performance

    return (
        <div className="space-y-8 animate-fade-in pb-12">

            {/* Header with Quick Actions */}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
                    <p className="text-zinc-400">Monitor student progress and manage academic activities.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
                    <QuickAction to="/department" icon={UserPlus} label="Manage Students" color="text-blue-400" />
                    <QuickAction to="/export" icon={FileText} label="Download Reports" color="text-emerald-400" />
                </div>
            </div>

            {/* Critical Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <HighlightCard
                    title="Total Enrollment"
                    value={stats.total_students}
                    icon={Users}
                    color="#60a5fa"
                    trend="+12"
                />
                <HighlightCard
                    title="Avg Problems / Student"
                    value={stats.total_students ? Math.round(stats.total_solved / stats.total_students) : 0}
                    icon={TrendingUp}
                    color="#fbbf24"
                    trend="+5%"
                />
                <HighlightCard
                    title="Needs Attention"
                    value={stats.inactive_students}
                    icon={AlertCircle}
                    color="#f87171"
                // trend="-2"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Department Review Container */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Award size={18} className="text-purple-400" /> Department Performance
                            </h2>
                            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Ranked by Avg Solved</span>
                        </div>

                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptData} layout="vertical" margin={{ left: 40, right: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="#71717a" tick={{ fill: '#a1a1aa' }} width={50} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                        cursor={{ fill: '#27272a' }}
                                    />
                                    <Bar dataKey="avg" radius={[0, 4, 4, 0]} barSize={20}>
                                        {deptData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#fbbf24' : '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Skill Level Summary */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <BookOpen size={18} className="text-emerald-400" /> Learning Progress
                    </h2>

                    <div className="space-y-6">
                        {/* Expert */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-white font-medium">Experts (>500 Solved)</span>
                                <span className="text-emerald-400 font-bold">{stats.skill_distribution?.expert}</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.skill_distribution?.expert / stats.total_students) * 100}%` }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Intermediate */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-white font-medium">Intermediate (>200 Solved)</span>
                                <span className="text-amber-400 font-bold">{stats.skill_distribution?.intermediate}</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.skill_distribution?.intermediate / stats.total_students) * 100}%` }}
                                    className="h-full bg-amber-500"
                                />
                            </div>
                        </div>

                        {/* Beginner */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-white font-medium">Beginners</span>
                                <span className="text-blue-400 font-bold">{stats.skill_distribution?.beginner}</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.skill_distribution?.beginner / stats.total_students) * 100}%` }}
                                    className="h-full bg-blue-500"
                                />
                            </div>
                        </div>

                        <div className="pt-6 mt-2 border-t border-white/10">
                            <Link to="/students" className="text-sm text-zinc-400 hover:text-white flex items-center gap-2 justify-center">
                                View Leaderboard <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
