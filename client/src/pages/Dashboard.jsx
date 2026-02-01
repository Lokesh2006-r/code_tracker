import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Award, Code, Trophy, Calendar, ExternalLink } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ✅ API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL;

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 relative overflow-hidden group hover:shadow-2xl hover:bg-white/5 transition-all duration-300"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Icon size={80} className={color} />
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon size={20} />
                </div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                    {title}
                </h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
                {value}
            </div>
            {subtext && <div className="text-xs text-slate-500">{subtext}</div>}
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_students: 0,
        total_solved: 0,
        active_contests: 0,
        department_stats: []
    });
    const [contests, setContests] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(
                    `${API_BASE_URL}/api/dashboard/stats`
                );
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };

        const fetchContests = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/dashboard/contests`);
                setContests(res.data || []);
            } catch (err) {
                console.error("Failed to fetch contests", err);
            }
        };

        fetchStats();
        fetchContests();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const topDept = [...(stats.department_stats || [])]
        .sort((a, b) => b.avg_solved - a.avg_solved)[0];

    const chartData = [
        { name: 'Week 1', solved: Math.round(stats.total_solved * 0.7) },
        { name: 'Week 2', solved: Math.round(stats.total_solved * 0.8) },
        { name: 'Week 3', solved: Math.round(stats.total_solved * 0.9) },
        { name: 'Current', solved: stats.total_solved },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400">Real-time platform statistics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.total_students}
                    subtext="Registered across departments"
                    icon={Users}
                    color="text-blue-400"
                />
                <StatCard
                    title="Total Solved"
                    value={stats.total_solved.toLocaleString()}
                    subtext="Problems across all platforms"
                    icon={Code}
                    color="text-emerald-400"
                />
                <StatCard
                    title="Active Contests"
                    value={stats.active_contests}
                    subtext="Upcoming & Ongoing"
                    icon={Trophy}
                    color="text-yellow-400"
                />
                <StatCard
                    title="Top Department"
                    value={topDept ? topDept.id : 'N/A'}
                    subtext={topDept ? `Avg ${topDept.avg_solved} solved` : '-'}
                    icon={Award}
                    color="text-purple-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 border border-white/10 lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-400" />
                        Submission Trend
                    </h3>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 2 }}
                                    contentStyle={{
                                        backgroundColor: '#18181b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="solved"
                                    stroke="url(#lineGradient)"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#18181b', stroke: '#8b5cf6', strokeWidth: 2 }}
                                    activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-6">Departments</h3>
                    <div className="space-y-4">
                        {(stats.department_stats || []).map((dept, i) => (
                            <div key={i} className="flex justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-white font-medium">{dept.id}</span>
                                <span className="text-slate-400">{dept.students}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upcoming Contests Section */}
            <div className="glass-card p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar size={20} className="text-orange-400" />
                    Upcoming Contests
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {contests.length > 0 ? (
                        contests.map((contest, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-10 -mt-10" />

                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${contest.platform === 'LeetCode' ? 'bg-yellow-500/20 text-yellow-500' :
                                        contest.platform === 'Codeforces' ? 'bg-red-500/20 text-red-400' :
                                            contest.platform === 'AtCoder' ? 'bg-white/20 text-white' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {contest.platform}
                                    </span>
                                    <a
                                        href={contest.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>

                                <h4 className="text-white font-bold text-sm mb-1 line-clamp-1" title={contest.name}>
                                    {contest.name}
                                </h4>

                                <div className="flex flex-col gap-1 mt-3">
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <Calendar size={12} />
                                        {new Date(contest.start_time * 1000).toLocaleString([], {
                                            weekday: 'short', month: 'short', day: 'numeric',
                                            hour: 'numeric', minute: 'numeric'
                                        })}
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        Duration: {(contest.duration / 3600).toFixed(1)} hrs
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <div className="inline-block p-4 rounded-full bg-white/5 mb-3">
                                <Trophy size={32} className="text-zinc-600" />
                            </div>
                            <p className="text-zinc-500">No upcoming contests found right now.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
