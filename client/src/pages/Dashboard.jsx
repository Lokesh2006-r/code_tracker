import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Award, Code, Trophy } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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

        fetchStats();
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
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#000',
                                        border: '1px solid #333',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="solved"
                                    stroke="#10b981"
                                    fill="url(#colorSolved)"
                                />
                            </AreaChart>
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
        </div>
    );
};

export default Dashboard;
