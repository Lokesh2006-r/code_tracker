import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, Filter, CheckCircle } from 'lucide-react';
// import axios from 'axios';
import API from "../api";

const ExportPage = () => {
    const [filters, setFilters] = useState({
        department: 'All',
        year: 'All',
        platform: 'LeetCode',
        reportType: 'performance',
        contestName: '',
        contestDate: ''
    });
    const [downloading, setDownloading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleExport = async () => {
        setDownloading(true);
        setSuccess(false);
        try {
            const params = {};
            if (filters.department !== 'All') params.department = filters.department;
            if (filters.year !== 'All') params.year = filters.year;

            if (filters.reportType === 'contest') {
                params.platform = filters.platform;
                params.contest_name = filters.contestName || 'Contest Report'; // Default if empty
                params.contest_date = filters.contestDate;
            }

            // const response = await axios.get('http://localhost:8000/api/export/download', {
            //     params,
            //     responseType: 'blob' // Important for files
            // });
            const response = await API.get(
                '/export/download',
                {
                    params,
                    responseType: 'blob'
                }
            );


            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Performance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setSuccess(true);
        } catch (err) {
            console.error("Export failed", err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">Export Data</h1>
                <p className="text-slate-400">Generate comprehensive Excel reports</p>
            </div>

            <div className="glass-card p-8 max-w-3xl border border-white/10 bg-black/40">
                <div className="flex items-start gap-6 mb-8">
                    <div className="p-4 rounded-xl bg-white/10 text-white border border-white/10">
                        <FileSpreadsheet size={40} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Performance Report</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Download a detailed breakdown of student performance across all platforms.
                            The report includes LeetCode solved counts, Codeforces ratings, and global rankings.
                        </p>
                    </div>
                </div>

                <div className="bg-zinc-900/50 rounded-xl p-6 mb-8 border border-white/10">
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Filter size={18} className="text-zinc-400" /> Options
                    </h4>

                    {/* Report Type Toggle */}
                    <div className="flex bg-black p-1 rounded-lg mb-6 w-full md:w-fit border border-white/10">
                        <button
                            onClick={() => setFilters({ ...filters, reportType: 'performance' })}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filters.reportType === 'performance' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Performance Report
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, reportType: 'contest' })}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filters.reportType === 'contest' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Contest Data
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Department</label>
                            <select
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-white/50 transition-colors"
                                value={filters.department}
                                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                            >
                                <option value="All">All Departments</option>
                                <option value="CSE">Computer Science</option>
                                <option value="ECE">Electronics</option>
                                <option value="IT">Information Tech</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Year</label>
                            <select
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-white/50 transition-colors"
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            >
                                <option value="All">All Years</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>

                        {filters.reportType === 'contest' && (
                            <>
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Platform</label>
                                    <select
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-white/50 transition-colors"
                                        value={filters.platform}
                                        onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                                    >
                                        <option value="LeetCode">LeetCode</option>
                                        <option value="Codeforces">Codeforces</option>
                                        <option value="CodeChef">CodeChef</option>
                                        <option value="HackerRank">HackerRank</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Contest Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-white/50 transition-colors"
                                        value={filters.contestDate}
                                        onChange={(e) => setFilters({ ...filters, contestDate: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Contest Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Weekly Contest 320"
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-white/50 transition-colors"
                                        value={filters.contestName}
                                        onChange={(e) => setFilters({ ...filters, contestName: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExport}
                        disabled={downloading}
                        className="flex-1 py-4 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black rounded-xl font-bold shadow-lg shadow-white/10 transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/20"
                    >
                        {downloading ? (
                            'Generating Report...'
                        ) : (
                            <>
                                <Download size={20} /> Download Excel
                            </>
                        )}
                    </button>
                </div>

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2 justify-center"
                    >
                        <CheckCircle size={16} /> Report downloaded successfully!
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ExportPage;
