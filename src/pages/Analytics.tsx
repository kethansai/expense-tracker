import React from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { useAppContext } from '../context/AppContext';
import {
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    TrendingUp,
    TrendingDown,
    Activity
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { motion } from 'framer-motion';

const AnalyticsPage: React.FC = () => {
    const { stats, categoryData, monthlyData, loading } = useFinanceData();
    const { isDarkMode, user } = useAppContext();

    const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : user?.currency === 'JPY' ? '¥' : '$';

    if (loading) return (
        <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-[450px] bg-slate-100 dark:bg-slate-800/30 rounded-[2.5rem]"></div>
                <div className="h-[450px] bg-slate-100 dark:bg-slate-800/30 rounded-[2.5rem]"></div>
            </div>
        </div>
    );

    const hasData = categoryData.length > 0 || monthlyData.length > 0;

    const savingsRate = stats.totalIncome > 0
        ? Math.max(0, Math.min(100, Math.round(((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100)))
        : 0;

    const tooltipStyle = {
        borderRadius: '24px',
        border: 'none',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        backgroundColor: isDarkMode ? '#0f172a' : 'rgba(255, 255, 255, 0.95)',
        color: isDarkMode ? '#f8fafc' : '#0f172a',
        padding: '16px'
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-24"
        >
            {!hasData && (
                <motion.div variants={itemVariants} className="glass-card p-20 text-center flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-8 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-700 animate-spin-slow"></div>
                        <Activity size={40} className="text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Financial Void Detected</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mt-4 font-bold text-sm leading-relaxed">
                        The charts are waiting for your input. Add transactions to generate high-fidelity financial insights.
                    </p>
                </motion.div>
            )}

            {hasData && (
                <>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Expense Breakdown Pie Chart */}
                        <motion.div variants={itemVariants} className="glass-card p-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
                                    <PieChartIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl tracking-tight">Capital Allocation</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense distribution</p>
                                </div>
                            </div>

                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={85}
                                            outerRadius={120}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: '800', fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800/50 pt-8">
                                {categoryData.map((entry) => (
                                    <div key={entry.name} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{entry.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">{currencySymbol}{entry.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Income vs Expense Bar Chart */}
                        <motion.div variants={itemVariants} className="glass-card p-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 shadow-inner">
                                    <BarChartIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl tracking-tight">Temporal Trends</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inflow vs Outflow</p>
                                </div>
                            </div>

                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={tooltipStyle}
                                            itemStyle={{ fontWeight: '800' }}
                                        />
                                        <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} barSize={20} />
                                        <Bar dataKey="expense" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-8 flex justify-center gap-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Inflow</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/40"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Outflow</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Cash Flow Trend Area Chart */}
                    <motion.div variants={itemVariants} className="glass-card p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 shadow-inner">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl tracking-tight">Net Mobility</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash flow momentum</p>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }}
                                    />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={0}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorCash)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Summary Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div variants={itemVariants} className="glass-card p-10 border-emerald-500/10 bg-emerald-500/5 group">
                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6">Aggregate Inflow</h4>
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 group-hover:rotate-6 transition-transform">
                                    <TrendingUp size={32} />
                                </div>
                                <span className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">{currencySymbol}{stats.totalIncome.toLocaleString()}</span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-card p-10 border-rose-500/10 bg-rose-500/5 group">
                            <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-6">Aggregate Outflow</h4>
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500 flex items-center justify-center text-white shadow-2xl shadow-rose-500/40 group-hover:-rotate-6 transition-transform">
                                    <TrendingDown size={32} />
                                </div>
                                <span className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">{currencySymbol}{stats.totalExpenses.toLocaleString()}</span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-card p-10 border-indigo-500/10 bg-indigo-500/5 flex flex-col justify-between group">
                            <div>
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Retention Velocity</h4>
                                <p className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">
                                    {savingsRate}%
                                </p>
                            </div>
                            <div className="mt-8 w-full bg-slate-200 dark:bg-slate-800/50 h-3 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${savingsRate}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50"
                                ></motion.div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default AnalyticsPage;
