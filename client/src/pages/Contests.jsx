import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Calendar, ChevronLeft, ChevronRight,
    ExternalLink, MapPin, Filter, Trophy
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const PLATFORM_CONFIG = {
    'LeetCode': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    'Codeforces': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    'CodeChef': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    'AtCoder': { color: 'text-white', bg: 'bg-white/10', border: 'border-white/20' },
    'Default': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
};

const ContestCard = ({ contest }) => {
    const config = PLATFORM_CONFIG[contest.platform] || PLATFORM_CONFIG['Default'];

    // Format start time
    const startDate = new Date(contest.start_time * 1000);
    const dateStr = startDate.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });
    const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Calculate end time
    const endDate = new Date((contest.start_time + contest.duration) * 1000);
    const endTimeStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const addToCalendar = () => {
        const text = `${contest.name}`;
        const dates = `${startDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${endDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}`;
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${dates}&details=${encodeURIComponent(contest.url)}&location=${contest.platform}`;
        window.open(url, '_blank');
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-xl border ${config.border} ${config.bg} hover:border-opacity-50 transition-all group relative overflow-hidden`}
        >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

            <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center p-3 bg-black/20 rounded-lg min-w-[60px] h-fit">
                    <span className="text-xs font-bold text-zinc-400 uppercase">{startDate.toLocaleDateString([], { month: 'short' })}</span>
                    <span className={`text-xl font-bold ${config.color}`}>{startDate.getDate()}</span>
                </div>

                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-zinc-400 font-mono">
                            {dateStr} • {timeStr} - {endTimeStr}
                        </span>
                        <a
                            href={contest.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-500 hover:text-white transition-colors p-1"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>

                    <h3 className="text-white font-bold leading-tight pr-6">
                        {contest.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                        <span className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                        {contest.platform}
                    </div>

                    <div className="pt-3 mt-2 border-t border-white/5 flex items-center gap-3">
                        <button
                            onClick={addToCalendar}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                            <Calendar size={12} /> Add to Calendar
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const CalendarView = ({ currentDate, setCurrentDate, events }) => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 is Sunday

    // Generate dates
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDayEvents = (date) => {
        if (!date) return [];
        return events.filter(e => {
            const d = new Date(e.start_time * 1000);
            return d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear();
        });
    };

    return (
        <div className="glass-card flex flex-col h-full border border-white/10 overflow-hidden">
            {/* Calendar Header */}
            <div className="p-4 flex justify-between items-center border-b border-white/10 bg-white/5">
                <h2 className="text-lg font-bold text-white">
                    {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg text-white">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg text-white">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-white/10">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-900/50">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(100px,_1fr)] overflow-y-auto">
                {days.map((date, i) => {
                    const dayEvents = getDayEvents(date);
                    const isToday = date && new Date().toDateString() === date.toDateString();

                    return (
                        <div
                            key={i}
                            className={`
                                min-h-[100px] border-b border-r border-white/5 p-2 flex flex-col gap-1 relative transition-colors
                                ${!date ? 'bg-zinc-900/40' : 'bg-transparent hover:bg-white/5'}
                                ${isToday ? 'bg-indigo-500/10' : ''}
                            `}
                        >
                            {date && (
                                <span className={`
                                    text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1
                                    ${isToday ? 'bg-indigo-600 text-white' : 'text-zinc-500'}
                                `}>
                                    {date.getDate()}
                                </span>
                            )}

                            {dayEvents.map((evt, idx) => {
                                const config = PLATFORM_CONFIG[evt.platform] || PLATFORM_CONFIG['Default'];
                                return (
                                    <div
                                        key={idx}
                                        title={evt.name}
                                        className={`
                                            text-[10px] px-1.5 py-1 rounded border-l-2 truncate cursor-pointer
                                            bg-white/5 hover:bg-white/10 text-zinc-300
                                            ${evt.platform === 'Codeforces' ? 'border-red-500' :
                                                evt.platform === 'LeetCode' ? 'border-yellow-500' :
                                                    evt.platform === 'AtCoder' ? 'border-white' : 'border-blue-500'}
                                        `}
                                    >
                                        {evt.name}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Contests = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('All');
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/dashboard/contests`);
                setContests(res.data || []);
            } catch (err) {
                console.error("Failed to fetch contests", err);
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    const filteredContests = contests.filter(c =>
        (platformFilter === 'All' || c.platform === platformFilter) &&
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col gap-6">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search Contests..."
                        className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="relative min-w-[200px]">
                    <select
                        value={platformFilter}
                        onChange={e => setPlatformFilter(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none appearance-none cursor-pointer"
                    >
                        <option value="All">All Platforms</option>
                        <option value="LeetCode">LeetCode</option>
                        <option value="Codeforces">Codeforces</option>
                        <option value="AtCoder">AtCoder</option>
                        <option value="CodeChef">CodeChef</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Left Column: List View */}
                <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={20} />
                        Upcoming Contests
                    </h2>
                    <p className="text-zinc-400 text-sm -mt-2">Don't miss scheduled events</p>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {loading ? (
                            <div className="text-center py-10 text-zinc-500">Loading contests...</div>
                        ) : filteredContests.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500">No contests found</div>
                        ) : (
                            filteredContests.map((contest, i) => (
                                <ContestCard key={i} contest={contest} />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Calendar View */}
                <div className="lg:col-span-8 h-full min-h-[500px]">
                    <CalendarView
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        events={contests}
                    />
                </div>
            </div>
        </div>
    );
};

export default Contests;
