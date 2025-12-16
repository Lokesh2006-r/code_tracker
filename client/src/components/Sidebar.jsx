import React from 'react';
import { LayoutDashboard, Users, GraduationCap, FileSpreadsheet, LogOut, Code2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const NavItem = ({ to, icon: Icon, label }) => {
    return (
        <NavLink to={to} className={({ isActive }) => clsx(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
            isActive ? "text-black bg-white shadow-lg shadow-white/10" : "text-zinc-400 hover:text-white hover:bg-white/5"
        )}>
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 bg-white"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                    <Icon size={20} className={clsx("relative z-10 transition-colors", isActive ? "text-black" : "group-hover:text-white")} />
                    <span className="relative z-10 font-medium tracking-wide">{label}</span>
                </>
            )}
        </NavLink>
    );
};

const Sidebar = () => {
    return (
        <aside className="w-72 glass-panel h-screen flex flex-col p-6 z-20 border-r border-white/10 bg-black/40">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-zinc-500 flex items-center justify-center shadow-lg shadow-white/10">
                    <Code2 size={24} className="text-black" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                        CodeTrack
                    </h1>
                    <p className="text-xs text-zinc-500 font-medium">Faculty Dashboard</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/department" icon={Users} label="Departments" />
                <NavItem to="/students" icon={GraduationCap} label="Students" />
                <NavItem to="/export" icon={FileSpreadsheet} label="Export Data" />
            </nav>

            <div className="pt-6 border-t border-white/10">
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
                    <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
