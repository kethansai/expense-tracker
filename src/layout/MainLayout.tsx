import { Sidebar } from './Sidebar';
import { useAppContext } from '../context/AppContext';
import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isDarkMode, toggleTheme, loading } = useAppContext();
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        return path.substring(1).charAt(0).toUpperCase() + path.substring(2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600/20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex text-slate-900 dark:text-slate-50 transition-colors duration-500">
            <Sidebar />

            <main className="flex-1 md:ml-72 min-h-screen px-4 py-8 md:px-12 md:py-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-14 md:mt-0">
                    <div className="space-y-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={location.pathname + 'title'}
                        >
                            <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">
                                Finance Portal
                            </h2>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                                {getPageTitle()}
                            </h1>
                        </motion.div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2 glass-card px-4 py-2 border-slate-200/50 dark:border-slate-800/50">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search insight..."
                                className="bg-transparent border-none outline-none text-sm w-40"
                            />
                        </div>

                        <button className="p-3 rounded-2xl glass-card text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all border-slate-200/50 dark:border-slate-800/50 relative">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full ring-4 ring-white dark:ring-slate-900"></span>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-2xl glass-card text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all border-slate-200/50 dark:border-slate-800/50"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};
