import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Tag, Calendar as CalendarIcon, FileText, Camera } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { saveDB } from '../db/database';
import { motion, AnimatePresence } from 'framer-motion';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const CATEGORIES = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Fees', 'Bills', 'EMIs', 'Investments', 'Insurance', 'Shopping', 'Health', 'Food', 'Travel', 'Other']
};

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const { db, user } = useAppContext();
    const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
    const [category, setCategory] = useState(initialData?.category || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState(initialData?.description || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
            setAmount(initialData.amount.toString());
            setCategory(initialData.category);
            setDate(initialData.date);
            setDescription(initialData.description || '');
        } else {
            setType('expense');
            setAmount('');
            setCategory('');
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!amount || !category || !date) {
            setError('Missing required financial parameters');
            return;
        }

        try {
            if (!db || !user) throw new Error('System not initialized');

            if (initialData) {
                db.run(`
                    UPDATE transactions 
                    SET amount = ${parseFloat(amount)}, type = '${type}', category = '${category}', date = '${date}', description = '${description.replace(/'/g, "''")}'
                    WHERE id = ${initialData.id}
                `);
            } else {
                db.run(`
                    INSERT INTO transactions (user_id, amount, type, category, date, description)
                    VALUES (${user.id}, ${parseFloat(amount)}, '${type}', '${category}', '${date}', '${description.replace(/'/g, "''")}')
                `);
            }

            saveDB();
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Registry failure: Operation aborted');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-xl glass-card p-10 shadow-2xl relative z-10 border-white/50 dark:border-white/5"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                                    {initialData ? 'Update Entry' : 'New Ledger Entry'}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transaction Parameters</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-rose-500"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-black uppercase tracking-widest"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'expense'
                                        ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xl'
                                        : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    <Minus size={18} /> Outflow
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('income')}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'income'
                                        ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xl'
                                        : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    <Plus size={18} /> Inflow
                                </button>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantum of Value</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl group-focus-within:text-indigo-600 transition-colors">
                                        {user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : user?.currency === 'JPY' ? '¥' : '$'}
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800 rounded-[1.5rem] py-8 pl-14 pr-8 outline-none focus:ring-4 focus:ring-indigo-500/10 text-5xl font-black tracking-tighter transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-all font-bold text-sm"
                                        >
                                            <option value="">Select Category</option>
                                            {CATEGORIES[type].map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Stamp</label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Context</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={2}
                                        className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none font-bold text-sm"
                                        placeholder="Add descriptive context..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 hidden sm:block">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Evidence</label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 group cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <Camera size={32} className="mb-3 opacity-20 group-hover:scale-110 transition-transform" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Attach Receipt Image</p>
                                    <p className="text-[8px] mt-1 font-bold">Neural Engine Scanning Pending</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-5 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 group mt-4 overflow-hidden relative ${type === 'expense'
                                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/40'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/40'
                                    }`}
                            >
                                <span className="relative z-10">{initialData ? 'COMMIT UPDATE' : 'AUTHORIZE REGISTRY'}</span>
                                <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
