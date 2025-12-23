import React, { useState } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { ChevronLeft, ChevronRight, ArrowUpCircle, Bell, Calendar as CalendarIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarPage: React.FC = () => {
    const { transactions, reminders, loading } = useFinanceData();
    const { user } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : user?.currency === 'JPY' ? '¥' : '$';

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); };
    const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); };

    const getTransactionsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return transactions.filter(t => t.date === dateStr);
    };

    if (loading) return <div className="animate-pulse glass-card h-[600px] p-10 rounded-[2.5rem]"></div>;

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-24"
        >
            <div className="xl:col-span-2 glass-card p-4 sm:p-10 shadow-2xl">
                <div className="flex justify-between items-center mb-12 px-2">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Temporal Ledger View</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={prevMonth} className="p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextMonth} className="p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all shadow-sm">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-3 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-3">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-3">
                    {days.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} className="h-20 sm:h-32 opacity-0"></div>;

                        const dayTransactions = getTransactionsForDay(day);
                        const hasIncome = dayTransactions.some(t => t.type === 'income');
                        const hasExpense = dayTransactions.some(t => t.type === 'expense');

                        return (
                            <motion.div
                                key={day}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedDay(day)}
                                className={`h-20 sm:h-32 rounded-3xl p-3 sm:p-4 relative group transition-all cursor-pointer overflow-hidden border ${selectedDay === day
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xl shadow-indigo-500/40 z-10'
                                    : 'bg-white/30 dark:bg-slate-800/20 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                    }`}
                            >
                                <span className={`text-base font-black ${selectedDay === day ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{day}</span>
                                <div className="absolute top-4 right-4 flex flex-col gap-1.5">
                                    {hasIncome && <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${selectedDay === day ? 'bg-white' : 'bg-emerald-500 shadow-emerald-500/50'}`}></div>}
                                    {hasExpense && <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${selectedDay === day ? 'bg-indigo-200' : 'bg-rose-500 shadow-rose-500/50'}`}></div>}
                                </div>

                                {dayTransactions.length > 0 && (
                                    <div className="absolute bottom-4 left-4 hidden sm:block">
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${selectedDay === day ? 'text-indigo-100' : 'text-slate-400'}`}>
                                            {dayTransactions.length} Items
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-8">
                <AnimatePresence mode="wait">
                    {selectedDay ? (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-card p-10 shadow-2xl sticky top-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="font-black text-2xl tracking-tight">Day Summary</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        {currentDate.toLocaleString('default', { month: 'short' })} {selectedDay}, {year}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedDay(null)} className="text-[10px] font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest">Bills Only</button>
                            </div>
                            <div className="space-y-4">
                                {getTransactionsForDay(selectedDay).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                                        <CalendarIcon size={48} className="mb-4 opacity-10" />
                                        <p className="text-xs font-black uppercase tracking-widest">No entries for this cycle</p>
                                    </div>
                                ) : (
                                    getTransactionsForDay(selectedDay).map(t => (
                                        <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {t.type === 'income' ? <ArrowUpCircle size={20} /> : <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{t.description || t.category}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.category}</p>
                                            </div>
                                            <p className={`text-xs font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-slate-100'}`}>
                                                {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reminders"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-card p-10 shadow-2xl sticky top-8"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 shadow-inner">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-2xl tracking-tight">Active Reminders</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending Invoices</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {reminders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] p-8">
                                        <ArrowUpCircle size={48} className="mb-4 opacity-10" />
                                        <p className="text-xs font-black uppercase tracking-widest leading-loose">No upcoming<br />commitments scheduled</p>
                                    </div>
                                ) : (
                                    reminders.map(r => (
                                        <div key={r.id} className="p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-slate-900/50 border border-indigo-100/50 dark:border-slate-800/50 group hover:shadow-xl transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-lg">{r.category}</h4>
                                                <span className="text-sm font-black text-slate-900 dark:text-slate-100">{currencySymbol}{r.amount.toLocaleString()}</span>
                                            </div>
                                            <p className="text-base font-black text-slate-900 dark:text-slate-100 mb-2 truncate">{r.title}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DEADLINE: {new Date(r.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default CalendarPage;
