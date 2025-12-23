import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    PieChart,
    Calendar,
    Settings,
    Menu,
    X,
    CreditCard,
    LogIn
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Transactions', icon: CreditCard, path: '/transactions' },
    { name: 'Analytics', icon: PieChart, path: '/analytics' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

export const Sidebar: React.FC = () => {
    const { user, setUser } = useAppContext();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-6 left-6 z-[60] p-3 md:hidden glass-card shadow-2xl border-white/50 dark:border-white/10"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[50] md:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={cn(
                "fixed inset-y-0 left-0 z-[55] w-72 transition-all duration-500 transform md:translate-x-0 glass-card m-4 border-white/50 dark:border-white/5 shadow-2xl flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-[110%] md:translate-x-0"
            )}>
                <div className="flex flex-col h-full p-8">
                    <div className="flex items-center gap-4 mb-12 px-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-xl shadow-indigo-500/40">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                Expense
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tracker Pro</p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/40"
                                        : "text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon size={22} className={cn(
                                            "transition-transform group-hover:scale-110 relative z-10"
                                        )} />
                                        <span className="font-bold text-sm relative z-10">{item.name}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 -z-0"
                                            />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                        <div className="p-5 rounded-[1.5rem] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">
                                Active Profile
                            </p>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                    {user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate flex-1">
                                    {user?.email}
                                </p>
                            </div>
                            <button
                                onClick={() => setUser(null)}
                                className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-black hover:bg-rose-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <LogIn size={14} className="rotate-180" />
                                SIGN OUT
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
