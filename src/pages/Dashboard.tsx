import React, { useState } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { AddTransactionModal } from '../components/AddTransactionModal';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    Plus,
    ShoppingBag,
    Coffee,
    Home,
    Bell,
    Target,
    ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const CategoryIcon = ({ category }: { category: string }) => {
    switch (category.toLowerCase()) {
        case 'food': return <Coffee size={18} />;
        case 'shopping': return <ShoppingBag size={18} />;
        case 'bills': return <Home size={18} />;
        case 'salary': return <TrendingUp size={18} />;
        default: return <Plus size={18} />;
    }
};

const Dashboard: React.FC = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const { transactions, stats, budgets, reminders, monthlyData, refresh } = useFinanceData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : user?.currency === 'JPY' ? '¥' : '$';

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const totalPlannedBudget = budgets.reduce((sum, b) => sum + b.amount_limit, 0);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const spentInBudgetedCategories = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(thisMonth) && budgets.some(b => b.category === t.category))
        .reduce((sum, t) => sum + t.amount, 0);
    const remainingBudgetAmount = Math.max(0, totalPlannedBudget - spentInBudgetedCategories);
    const safeToSpend = Math.max(0, stats.balance - remainingBudgetAmount);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-24"
        >
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Total Balance Card */}
                <motion.div
                    variants={itemVariants}
                    className="flex-1 glass-card p-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white border-0 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group min-h-[300px]"
                >
                    <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                        <Wallet size={320} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{getTimeBasedGreeting()}</p>
                                    <h3 className="text-2xl font-black">{user?.email.split('@')[0]}</h3>
                                </div>
                                <div className="text-right glass-card border-white/20 px-4 py-2 bg-white/10">
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Safe to Spend</p>
                                    <p className="text-xl font-black">{currencySymbol}{safeToSpend.toLocaleString()}</p>
                                </div>
                            </div>
                            <p className="text-indigo-100/70 text-sm font-bold mb-1">Available Liquidity</p>
                            <h2 className="text-6xl font-black tracking-tighter drop-shadow-lg">
                                {currencySymbol}{stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                        <div className="mt-12 flex flex-wrap gap-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-white text-indigo-700 px-8 py-4 rounded-[1.5rem] text-sm font-black flex items-center gap-3 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                            >
                                <Plus size={20} /> ADD TRANSACTION
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Income & Expense Mini Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:flex xl:flex-col gap-6 xl:w-80">
                    <motion.div
                        variants={itemVariants}
                        className="glass-card p-8 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 flex flex-col justify-between group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Monthly Inflow</p>
                            <h3 className="text-3xl font-black text-emerald-500 tracking-tight">{currencySymbol}{stats.totalIncome.toLocaleString()}</h3>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="glass-card p-8 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 flex flex-col justify-between group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                            <TrendingDown size={28} />
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Monthly Outflow</p>
                            <h3 className="text-3xl font-black text-rose-500 tracking-tight">{currencySymbol}{stats.totalExpenses.toLocaleString()}</h3>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Visual/Chart Section */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div variants={itemVariants} className="glass-card p-4 sm:p-8 min-h-[450px]">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                            <div>
                                <h3 className="font-black text-2xl tracking-tight">Spending Dynamics</h3>
                                <p className="text-slate-500 text-xs font-bold">Your financial velocity this year</p>
                            </div>
                            <button
                                onClick={() => navigate('/analytics')}
                                className="text-xs font-black text-indigo-600 flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                            >
                                EXPLORE ANALYTICS <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="h-[320px] w-full mt-4">
                            {monthlyData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData}>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                            contentStyle={{
                                                borderRadius: '24px',
                                                border: 'none',
                                                padding: '16px',
                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Bar
                                            dataKey="expense"
                                            radius={[10, 10, 0, 0]}
                                            fill="#6366f1"
                                            barSize={32}
                                            onClick={() => navigate('/transactions')}
                                            className="cursor-pointer"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                        <ArrowUpRight size={64} className="mb-4 opacity-20" />
                                    </motion.div>
                                    <p className="text-sm font-bold uppercase tracking-widest">Awaiting Data Points</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* Budget Status Section */}
                        <motion.div variants={itemVariants} className="glass-card p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                                        <Target size={20} />
                                    </div>
                                    <h3 className="font-black text-lg">Budgets</h3>
                                </div>
                                <button onClick={() => navigate('/settings')} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest">Adjust</button>
                            </div>
                            <div className="space-y-6">
                                {budgets.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic py-4">No active budgets.</p>
                                ) : (
                                    budgets.slice(0, 3).map(b => {
                                        const spent = transactions
                                            .filter(t => t.category === b.category && t.type === 'expense')
                                            .reduce((sum, t) => sum + t.amount, 0);
                                        const percent = Math.min((spent / b.amount_limit) * 100, 100);
                                        return (
                                            <div key={b.id} className="space-y-2.5">
                                                <div className="flex justify-between text-xs font-black">
                                                    <span className="text-slate-600 dark:text-slate-300 uppercase tracking-tight">{b.category}</span>
                                                    <span className={percent > 90 ? 'text-rose-500' : 'text-slate-500'}>
                                                        {Math.round(percent)}%
                                                    </span>
                                                </div>
                                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percent}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className={`h-full ${percent > 90 ? 'bg-rose-500 shadow-lg shadow-rose-500/30' : 'bg-indigo-600 shadow-lg shadow-indigo-500/30'}`}
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>

                        {/* Reminders Section */}
                        <motion.div variants={itemVariants} className="glass-card p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                                        <Bell size={20} />
                                    </div>
                                    <h3 className="font-black text-lg">Key Dates</h3>
                                </div>
                                <button onClick={() => navigate('/calendar')} className="text-[10px] font-black text-slate-400 hover:text-purple-600 uppercase tracking-widest">Calendar</button>
                            </div>
                            <div className="space-y-4">
                                {reminders.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic py-4 text-center">Your schedule is clear.</p>
                                ) : (
                                    reminders.slice(0, 3).map(r => (
                                        <div key={r.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 group hover:shadow-lg transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm">
                                                {new Date(r.due_date).getDate()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{r.title}</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(r.due_date).toLocaleString('default', { month: 'short' })}</p>
                                            </div>
                                            <p className="text-xs font-black text-slate-900 dark:text-slate-100">{currencySymbol}{r.amount.toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Recent Transactions List */}
                <div className="space-y-8">
                    <motion.div variants={itemVariants} className="glass-card p-8 min-h-[450px]">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="font-black text-xl tracking-tight">Recent Activity</h3>
                            <button
                                onClick={() => navigate('/transactions')}
                                className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-[0.2em]"
                            >
                                ALL LOGS
                            </button>
                        </div>

                        <div className="space-y-6">
                            {transactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                                    <ShoppingBag size={48} className="mb-4 opacity-10" />
                                    <p className="text-xs font-bold uppercase tracking-widest leading-loose">No recent activity<br />registered</p>
                                </div>
                            ) : (
                                transactions.slice(0, 6).map((t) => (
                                    <div key={t.id} className="flex items-center gap-5 group cursor-pointer">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${t.type === 'income'
                                            ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-emerald-500/40'
                                            : 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-rose-500/40'
                                            }`}>
                                            <CategoryIcon category={t.category} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 transition-colors">{t.description || t.category}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.category} • {t.date}</p>
                                        </div>
                                        <div className={`text-sm font-black tracking-tight ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-slate-100'
                                            }`}>
                                            {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Budget Tip */}
                    <motion.div
                        variants={itemVariants}
                        className="p-8 rounded-[2rem] bg-indigo-600/5 border border-indigo-600/10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">AI Insight</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold italic relative z-10">
                            "{stats.totalExpenses > stats.totalIncome * 0.7
                                ? "Critical: Outflow exceeds safe thresholds. Consider delaying non-essential shopping until next cycle."
                                : "Excellent: Your current savings rate is ahead of projection. You've earned a small bonus for your future self!"}"
                        </p>
                    </motion.div>
                </div>
            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refresh}
            />
        </motion.div>
    );
};

export default Dashboard;
