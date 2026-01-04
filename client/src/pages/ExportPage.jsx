import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileDown } from 'lucide-react';

// ✅ API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL;

const ExportPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [department, setDepartment] = useState('All');
    const [year, setYear] = useState('All');
    const [platform, setPlatform] = useState('LeetCode');
    const [contestName, setContestName] = useState('');
    const [loading, setLoading] = useState(false);

    const departments = ["All", "CSE", "ECE", "IT", "AI", "EEE", "MECH", "CIVIL"];
    const years = ["All", "1", "2", "3", "4"];

    const handleDownload = async () => {
        try {
            setLoading(true);

            const params = { department, year };

            if (activeTab === 'contest') {
                if (!contestName) {
                    alert("Please enter a contest name");
                    setLoading(false);
                    return;
                }
                params.platform = platform;
                params.contest_name = contestName;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/export/download`,
                {
                    params,
                    responseType: 'blob',
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const timestamp = new Date().toISOString().split('T')[0];
            const filename =
                activeTab === 'contest'
                    ? `${platform}_${contestName}_Report_${timestamp}.xlsx`
                    : `Student_Report_${department}_${timestamp}.xlsx`;

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to download report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Export Data</h1>
                <p className="text-zinc-400">
                    Download student performance reports and contest data.
                </p>
            </div>

            <div className="glass-card p-1 rounded-xl inline-flex border border-white/10">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium ${
                        activeTab === 'general'
                            ? 'bg-zinc-800 text-white'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    General Report
                </button>
                <button
                    onClick={() => setActiveTab('contest')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium ${
                        activeTab === 'contest'
                            ? 'bg-zinc-800 text-white'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    Contest Data
                </button>
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 border border-white/10"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="text-sm text-zinc-400">Department</label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white"
                        >
                            {departments.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-zinc-400">Year</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white"
                        >
                            {years.map(y => (
                                <option key={y} value={y}>
                                    {y === "All" ? "All Years" : `${y} Year`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {activeTab === 'contest' && (
                        <>
                            <div>
                                <label className="text-sm text-zinc-400">Platform</label>
                                <select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white"
                                >
                                    <option>LeetCode</option>
                                    <option>CodeChef</option>
                                    <option>Codeforces</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400">Contest Name</label>
                                <input
                                    value={contestName}
                                    onChange={(e) => setContestName(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white"
                                    placeholder="Weekly Contest / Starters ID"
                                />
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl flex justify-center gap-2"
                >
                    <FileDown size={20} />
                    {loading ? "Processing..." : "Download Excel Report"}
                </button>
            </motion.div>

            <div className="text-center text-sm text-zinc-500">
                Data generated based on latest synchronization.
            </div>
        </div>
    );
};

export default ExportPage;
