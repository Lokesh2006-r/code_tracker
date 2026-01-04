import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Code, Star, TrendingUp, MapPin } from 'lucide-react';
import axios from 'axios';

// ✅ API base URL from env
const API_BASE_URL = import.meta.env.VITE_API_URL;

const CircularProgress = ({ value, total, color, label }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-full h-full">
                    <circle cx="48" cy="48" r={radius} strokeWidth="6" fill="transparent" className="text-slate-700" />
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        strokeWidth="6"
                        fill="transparent"
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
            <span className="text-xs text-slate-400 mt-2">{label}</span>
        </div>
    );
};

const PlatformCard = ({ platform, icon: Icon, data, color, type }) => (
    <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                <Icon size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">{platform}</h3>
        </div>

        {type === 'leetcode' && (
            <>
                <div className="flex justify-between mb-4">
                    <CircularProgress value={data?.easy || 0} total={data?.total_solved || 0} color="text-green-500" label="Easy" />
                    <CircularProgress value={data?.medium || 0} total={data?.total_solved || 0} color="text-yellow-500" label="Medium" />
                    <CircularProgress value={data?.hard || 0} total={data?.total_solved || 0} color="text-red-500" label="Hard" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-4">
                    <div className="bg-white/5 p-2 rounded text-center">
                        <div className="text-white font-bold">{Math.round(data?.rating || 0)}</div>
                        <div className="text-slate-500">Rating</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded text-center">
                        <div className="text-white font-bold">{data?.max_rating || 'N/A'}</div>
                        <div className="text-slate-500">Max</div>
                    </div>
                </div>
            </>
        )}

        {type === 'rating' && (
            <div className="text-center">
                <div className="text-4xl font-bold text-white">{data?.rating || 'N/A'}</div>
                <div className="text-xs text-slate-400 mt-2">Current Rating</div>
            </div>
        )}
    </div>
);

const StudentProfile = () => {
    const { regNo } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStudent = async () => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/students/${regNo}`
            );
            setStudent(res.data);
        } catch {
            setStudent(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudent();
    }, [regNo]);

    if (loading) return <div className="p-10 text-white">Loading...</div>;
    if (!student) return <div className="p-10 text-white">Student not found</div>;

    const stats = student.stats || {};

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg bg-zinc-900 border border-white/10"
                >
                    <ChevronLeft size={20} />
                </button>

                <div>
                    <h1 className="text-3xl font-bold text-white">{student.name}</h1>
                    <div className="flex gap-4 text-zinc-400 text-sm">
                        <span className="flex gap-1">
                            <MapPin size={14} />
                            {student.department} - {student.year} Year
                        </span>
                        <span className="bg-zinc-900 px-2 rounded border border-white/10">
                            {student.reg_no}
                        </span>
                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const res = await axios.post(
                                        `${API_BASE_URL}/api/students/${student.reg_no}/refresh`
                                    );
                                    setStudent(res.data);
                                } catch {
                                    alert("Failed to refresh");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="text-xs px-2 py-0.5 bg-white/5 rounded border border-white/20 flex gap-1"
                        >
                            <TrendingUp size={12} /> Verify/Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PlatformCard platform="LeetCode" icon={Code} color="text-yellow-500" type="leetcode" data={stats.leetcode} />
                <PlatformCard platform="Codeforces" icon={TrendingUp} color="text-red-500" type="rating" data={stats.codeforces} />
                <PlatformCard platform="CodeChef" icon={Star} color="text-orange-900" type="rating" data={stats.codechef} />
            </div>
        </div>
    );
};

export default StudentProfile;
