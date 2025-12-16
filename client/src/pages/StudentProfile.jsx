import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Code, Trophy, Star, TrendingUp, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import API from "../api";

const CircularProgress = ({ value, total, color, label }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="transform -rotate-90 w-full h-full">
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-700" />
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={color}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-sm font-bold">{value}</span>
                    <span className="text-[10px] text-slate-400">/{total}</span>
                </div>
            </div>
            <span className="text-xs font-medium text-slate-400 mt-2">{label}</span>
        </div>
    );
};

const PlatformCard = ({ platform, icon: Icon, data, color, type = 'default' }) => (
    <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                <Icon size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">{platform}</h3>
        </div>

        {type === 'leetcode' && (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <CircularProgress value={data?.easy || 0} total={data?.total_solved || 0} color="text-green-500" label="Easy" />
                    <CircularProgress value={data?.medium || 0} total={data?.total_solved || 0} color="text-yellow-500" label="Medium" />
                    <CircularProgress value={data?.hard || 0} total={data?.total_solved || 0} color="text-red-500" label="Hard" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-4">
                    <div className="bg-white/5 p-2 rounded text-center">
                        <div className="text-white font-bold">{data?.rating ? Math.round(data.rating) : 'N/A'}</div>
                        <div className="text-slate-500">Current Rating</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded text-center">
                        <div className="text-white font-bold">{data?.max_rating || 'N/A'}</div>
                        <div className="text-slate-500">Max Rating</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded text-center col-span-2">
                        <div className="text-white font-bold">{data?.attended || 0}</div>
                        <div className="text-slate-500">Contests Attended</div>
                    </div>
                </div>
            </div>
        )}

        {type === 'codeforces' && (
            <div className="text-center py-2">
                <div className="text-4xl font-bold text-white mb-2">{data?.rating || 'Unrated'}</div>
                <div className="text-sm text-slate-400">Current Rating</div>
                {data?.rank && <div className="mt-2 text-xs font-mono bg-white/5 p-1 rounded inline-block px-2 capitalize">{data.rank}</div>}

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-4">
                    <div className="bg-white/5 p-2 rounded">
                        <div className="text-white font-bold text-base">{data?.max_rating || 0}</div>
                        <div className="text-slate-500">Max Rating</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded">
                        <div className="text-white font-bold text-base">{data?.contests || 0}</div>
                        <div className="text-slate-500">Contests</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded col-span-2">
                        <div className="text-white font-bold text-base">{data?.solved || 0}</div>
                        <div className="text-slate-500">Problems Solved</div>
                    </div>
                </div>
            </div>
        )}

        {type === 'rating' && (
            <div className="text-center py-4">
                <div className="text-4xl font-bold text-white mb-2">{data?.rating || 'Unrated'}</div>
                <div className="text-sm text-slate-400">Current Rating</div>
                {data?.global_rank && <div className="mt-4 text-xs font-mono bg-white/5 p-2 rounded">Global Rank: #{data.global_rank}</div>}

                {(data?.solved !== undefined || data?.contests !== undefined) && (
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-4">
                        {data.solved !== undefined && (
                            <div className="bg-white/5 p-2 rounded">
                                <div className="text-white font-bold text-base">{data.solved}</div>
                                <div className="text-slate-500">Solved</div>
                            </div>
                        )}
                        {data.contests !== undefined && (
                            <div className="bg-white/5 p-2 rounded">
                                <div className="text-white font-bold text-base">{data.contests}</div>
                                <div className="text-slate-500">Contests</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
);

const StudentProfile = () => {
    const { regNo } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await API.get(`/students/${regNo}`);
                setStudent(res.data);
            } catch (err) {
                console.error("Failed to fetch student", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [regNo]);

    if (loading) return <div className="p-10 text-white">Loading...</div>;
    if (!student) return <div className="p-10 text-white">Student not found</div>;

    const stats = student.stats || {};

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{student.name}</h1>
                    <div className="flex items-center gap-4 text-zinc-400 text-sm">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {student.department} - {student.year} Year</span>
                        <div className="flex items-center gap-2">
                            <span className="bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded text-xs border border-white/10">{student.reg_no}</span>
                            <button
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const res = await API.post(`/students/${student.reg_no}/refresh`);
                                        setStudent(res.data);
                                    } catch (err) {
                                        alert("Failed to refresh stats");
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="px-2 py-0.5 rounded text-xs border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center gap-1"
                            >
                                <TrendingUp size={12} /> Verify/Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PlatformCard
                    platform="LeetCode"
                    icon={Code}
                    color="text-yellow-500"
                    type="leetcode"
                    data={stats.leetcode}
                />
                <PlatformCard
                    platform="Codeforces"
                    icon={TrendingUp}
                    color="text-red-500"
                    type="codeforces"
                    data={stats.codeforces}
                />
                <PlatformCard
                    platform="CodeChef"
                    icon={Star}
                    color="text-orange-900"
                    type="rating"
                    data={stats.codechef}
                />
                <PlatformCard
                    platform="HackerRank"
                    icon={Code}
                    color="text-green-600"
                    type="rating"
                    data={{
                        rating: (stats.hackerrank?.badges || 0) + ' Badges',
                        global_rank: 'N/A',
                        solved: stats.hackerrank?.solved,
                        // contests: not applicable really
                    }}
                />
            </div>

            {/* Additional Stats Section */}
            <div className="glass-card p-6 border border-white/10 bg-black/40">
                <h3 className="text-xl font-bold text-white mb-4">Total Aggregated Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-900 border border-white/10">
                        <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Solved</div>
                        <div className="text-2xl font-bold text-white">
                            {(stats.leetcode?.total_solved || 0) +
                                (stats.codeforces?.solved || 0) +
                                (stats.codechef?.solved || 0) +
                                (stats.hackerrank?.solved || 0)}
                        </div>
                    </div>
                    {/* Add more aggregated stats here */}
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
