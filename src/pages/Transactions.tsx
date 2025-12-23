import React, { useState } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import {
    Search,
    Trash2,
    Edit,
    Download,
    Plus,
    Tag,
    ArrowUpCircle,
    ArrowDownCircle,
    Filter
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { saveDB } from '../db/database';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { motion, AnimatePresence } from 'framer-motion';

const TransactionsPage: React.FC = () => {
    const { transactions, refresh } = useFinanceData();
    const { db, user } = useAppContext();

    const currencySymbol = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : user?.currency === 'JPY' ? '¥' : '$';
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = (t.description || t.category).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleDelete = (id: number) => {
        if (window.confirm('Permanently remove this ledger entry?')) {
            try {
                db?.run(`DELETE FROM transactions WHERE id = ${id}`);
                saveDB();
                refresh();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const exportToCSV = () => {
        const headers = ["Date", "Description", "Category", "Type", "Amount"];
        const rows = filteredTransactions.map(t => [
            t.date,
            t.description || t.category,
            t.category,
            t.type,
            t.amount
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "financial_ledger_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 pb-24">
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6">
                <div className="relative flex-1 max-w-2xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search ledger by description or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={exportToCSV}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Download size={18} /> Export CSV
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/30"
                    >
                        <Plus size={18} /> Add Entry
                    </button>
                </div>
            </div>

            <div className="glass-card shadow-2xl border-white/50 dark:border-white/5">
                <div className="p-6 md:px-8 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 p-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType('income')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Inflow
                        </button>
                        <button
                            onClick={() => setFilterType('expense')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Outflow
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                        <Filter size={14} /> Total Records: {filteredTransactions.length}
                    </div>
                </div>

                {/* Mobile View / Cards */}
                <div className="block md:hidden p-4 space-y-4">
                    {filteredTransactions.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                            No ledger entries found
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredTransactions.map((t) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={t.id}
                                    className="p-5 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-slate-100">{t.description || t.category}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.date}</p>
                                            </div>
                                        </div>
                                        <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-slate-100'}`}>
                                            {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-lg uppercase tracking-widest">
                                            {t.category}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingTransaction(t); setIsModalOpen(true); }}
                                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Desktop View / Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-8 py-6">Ledger Entry</th>
                                <th className="px-8 py-6">Classification</th>
                                <th className="px-8 py-6">Timestamp</th>
                                <th className="px-8 py-6 text-right">Value</th>
                                <th className="px-8 py-6 text-right">Utility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        Zero results matched your ledger query
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {t.type === 'income' ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{t.description || t.category}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                                <Tag size={12} className="opacity-40" />
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums uppercase">
                                            {t.date}
                                        </td>
                                        <td className={`px-8 py-6 text-sm font-black text-right tabular-nums ${t.type === 'income' ? 'text-emerald-500 font-black' : 'text-slate-900 dark:text-slate-100'}`}>
                                            {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => {
                                                        setEditingTransaction(t);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors hover:bg-white dark:hover:bg-slate-800 rounded-lg shadow-sm"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors hover:bg-white dark:hover:hover:bg-slate-800 rounded-lg shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                }}
                onSuccess={refresh}
                initialData={editingTransaction}
            />
        </div>
    );
};

export default TransactionsPage;
