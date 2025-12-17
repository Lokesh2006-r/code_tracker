import React, { useState, useEffect } from 'react';

import API from "../api";

// import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Award, Code, Trophy } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';




const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 relative overflow-hidden group hover:shadow-2xl hover:bg-white/15 transition-all duration-300"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
            <Icon size={80} className={color} />
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon size={20} />
                </div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{value}</div>
            {subtext && <div className="text-xs text-slate-500 font-medium">{subtext}</div>}
        </div>
    </motion.div>
);

const data = [
    { name: 'Week 1', solved: 400 },
    { name: 'Week 2', solved: 300 },
    { name: 'Week 3', solved: 550 },
    { name: 'Week 4', solved: 480 },
    { name: 'Week 5', solved: 700 },
    { name: 'Week 6', solved: 850 },
];

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_students: 0,
        total_solved: 0,
        active_contests: 0,
        department_counts: {}
    });

    useEffect(() => {
        // Fetch Dashboard Data
        const fetchStats = async () => {
            try {
                const res = await API.get('/api/dashboard/stats');
                setStats(res.data);
            } catch (e) {
                console.error("Failed to fetch dashboard stats");
            }
        };

        fetchStats();
        // Poll every 30s
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Overview</h1>
                    <p className="text-slate-400">Welcome back, Administrator</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-white/5">
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={stats.total_students} subtext="Registered" icon={Users} color="text-zinc-200" />
                <StatCard title="Total Solved" value={stats.total_solved.toLocaleString()} subtext="Across all platforms" icon={Code} color="text-emerald-400" />
                <StatCard title="Active Contests" value={stats.active_contests} subtext="This weekend" icon={Trophy} color="text-amber-300" />
                <StatCard title="Departments" value={Object.keys(stats.department_counts).length} subtext="Active Branches" icon={TrendingUp} color="text-purple-300" />
            </div>

            {/* Charts Trend */}
            <div className="glass-card p-6 border border-white/10 bg-black/40">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <TrendingUp size={20} className="text-zinc-400" />
                    Solved Trend (Global)
                </h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#e4e4e7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#e4e4e7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="solved" stroke="#e4e4e7" strokeWidth={3} fillOpacity={1} fill="url(#colorSolved)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
