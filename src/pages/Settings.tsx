import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useFinanceData } from '../hooks/useFinanceData';
import {
    User,
    Shield,
    Database,
    Download,
    Trash2,
    Target,
    Plus,
    X,
    Bell,
    Check,
    Edit2,
    Languages,
    ArrowRight
} from 'lucide-react';
import { saveDB } from '../db/database';
import type { Budget, Reminder } from '../hooks/useFinanceData';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Fees', 'Bills', 'EMIs', 'Investments', 'Insurance', 'Shopping', 'Health', 'Food', 'Travel', 'Other'];

const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const SettingsPage: React.FC = () => {
    const { user, setUser, db } = useAppContext();
    const { budgets, reminders, refresh } = useFinanceData();

    const [isAddingBudget, setIsAddingBudget] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [newBudget, setNewBudget] = useState({ category: '', amount: '', period: 'monthly' });

    const [isAddingReminder, setIsAddingReminder] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [newReminder, setNewReminder] = useState({ title: '', amount: '', due_date: '', category: '' });

    const [msg, setMsg] = useState({ type: '', text: '' });

    const showMessage = (type: string, text: string) => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    };

    const handleClearData = () => {
        if (window.confirm('IRREVERSIBLE ACTION: Purge all financial records?')) {
            db?.run(`DELETE FROM transactions WHERE user_id = ${user.id}`);
            db?.run(`DELETE FROM budgets WHERE user_id = ${user.id}`);
            db?.run(`DELETE FROM reminders WHERE user_id = ${user.id}`);
            saveDB();
            refresh();
            showMessage('success', 'Ledger purged successfully');
        }
    };

    const handleExport = () => {
        const data = db?.export();
        if (data) {
            const blob = new Blob([data.buffer as any], { type: 'application/x-sqlite3' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'financial_vault_backup.sqlite';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleSaveBudget = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBudget.category || !newBudget.amount) return;

        try {
            if (editingBudget) {
                db?.run(`
                    UPDATE budgets 
                    SET category = '${newBudget.category}', amount_limit = ${parseFloat(newBudget.amount)}, period = '${newBudget.period}'
                    WHERE id = ${editingBudget.id}
                `);
            } else {
                db?.run(`
                    INSERT INTO budgets (user_id, category, amount_limit, period)
                    VALUES (${user.id}, '${newBudget.category}', ${parseFloat(newBudget.amount)}, '${newBudget.period}')
                `);
            }
            saveDB();
            refresh();
            setNewBudget({ category: '', amount: '', period: 'monthly' });
            setIsAddingBudget(false);
            setEditingBudget(null);
            showMessage('success', `Financial threshold ${editingBudget ? 'updated' : 'initialized'}`);
        } catch (err) {
            showMessage('error', 'Execution failed: Budget not saved');
        }
    };

    const handleDeleteBudget = (id: number) => {
        if (window.confirm('Exterminate this budget threshold?')) {
            db?.run(`DELETE FROM budgets WHERE id = ${id}`);
            saveDB();
            refresh();
            showMessage('success', 'Threshold removed');
        }
    };

    const handleSaveReminder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReminder.title || !newReminder.amount || !newReminder.due_date) return;

        try {
            if (editingReminder) {
                db?.run(`
                    UPDATE reminders 
                    SET title = '${newReminder.title.replace(/\'/g, "''")}', amount = ${parseFloat(newReminder.amount)}, due_date = '${newReminder.due_date}', category = '${newReminder.category}'
                    WHERE id = ${editingReminder.id}
                `);
            } else {
                db?.run(`
                    INSERT INTO reminders (user_id, title, amount, due_date, category, is_paid)
                    VALUES (${user.id}, '${newReminder.title.replace(/\'/g, "''")}', ${parseFloat(newReminder.amount)}, '${newReminder.due_date}', '${newReminder.category}', 0)
                `);
            }
            saveDB();
            refresh();
            setNewReminder({ title: '', amount: '', due_date: '', category: '' });
            setIsAddingReminder(false);
            setEditingReminder(null);
            showMessage('success', `Temporal alert ${editingReminder ? 'reconfigured' : 'engaged'}`);
        } catch (err) {
            showMessage('error', 'Alert registry failed');
        }
    };

    const handleDeleteReminder = (id: number) => {
        if (window.confirm('Deactivate this temporal alert?')) {
            db?.run(`DELETE FROM reminders WHERE id = ${id}`);
            saveDB();
            refresh();
            showMessage('success', 'Alert terminated');
        }
    };

    const handleResetPin = () => {
        if (window.confirm('SECURITY OVERRIDE: Clear existing vault PIN?')) {
            db?.run(`UPDATE users SET pin_code = NULL WHERE id = ${user.id}`);
            saveDB();
            showMessage('success', 'Security barrier cleared');
        }
    };

    const handleMarkAsPaid = (reminder: Reminder) => {
        try {
            db?.run(`UPDATE reminders SET is_paid = 1 WHERE id = ${reminder.id}`);
            db?.run(`
                INSERT INTO transactions (user_id, amount, type, category, date, description)
                VALUES (${user.id}, ${reminder.amount}, 'expense', '${reminder.category}', '${new Date().toISOString().split('T')[0]}', 'Settled: ${reminder.title.replace(/\'/g, "''")}')
            `);
            saveDB();
            refresh();
            showMessage('success', 'Invoice settled and ledger updated');
        } catch (err) {
            showMessage('error', 'Settlement failed');
        }
    };

    const handleCurrencyChange = (code: string) => {
        db?.run(`UPDATE users SET currency = '${code}' WHERE id = ${user.id}`);
        saveDB();
        setUser({ ...user, currency: code });
        showMessage('success', `Monetary unit switched to ${code}`);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto space-y-12 pb-32"
        >
            <AnimatePresence>
                {msg.text && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`fixed top-12 right-12 z-[100] p-6 rounded-[2rem] shadow-2xl border-white/50 dark:border-white/5 backdrop-blur-xl ${msg.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                            }`}
                    >
                        <p className="text-xs font-black uppercase tracking-widest">{msg.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Section */}
            <motion.section variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-4 px-4 border-l-4 border-indigo-600">
                    <User size={24} className="text-indigo-600" />
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Identity</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Configuration</p>
                    </div>
                </div>
                <div className="glass-card p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute -right-16 -bottom-16 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                        <Shield size={320} />
                    </div>
                    <div className="flex items-center gap-8 z-10">
                        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                            {user?.email[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Email</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{user?.email}</p>
                        </div>
                    </div>
                    <button className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all z-10">
                        Edit Identity
                    </button>
                </div>
            </motion.section>

            {/* Budgeting Section */}
            <motion.section variants={itemVariants} className="space-y-6">
                <div className="flex items-center justify-between px-4 border-l-4 border-indigo-600">
                    <div className="flex items-center gap-4">
                        <Target size={24} className="text-indigo-600" />
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Fiscal Thresholds</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Optimization</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddingBudget(true)}
                        className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl shadow-indigo-500/30 hover:scale-110 active:scale-95 transition-all"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {budgets.length === 0 ? (
                        <div className="col-span-full glass-card p-20 text-center border-dashed">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Target size={32} className="text-slate-300" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Zero active thresholds defined</p>
                        </div>
                    ) : (
                        budgets.map(b => (
                            <div key={b.id} className="glass-card p-8 border-l-8 border-l-indigo-600 flex justify-between items-center group hover:translate-x-2 transition-all">
                                <div>
                                    <h4 className="font-black text-lg text-slate-900 dark:text-slate-100 mb-1">{b.category}</h4>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                        LIMIT: {CURRENCIES.find(c => c.code === user.currency)?.symbol}{b.amount_limit.toLocaleString()} / {b.period}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setEditingBudget(b);
                                            setNewBudget({ category: b.category, amount: b.amount_limit.toString(), period: b.period });
                                            setIsAddingBudget(true);
                                        }}
                                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBudget(b.id)}
                                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.section>

            {/* Security Section */}
            <motion.section variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-4 px-4 border-l-4 border-rose-600">
                    <Shield size={24} className="text-rose-600" />
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Security Barrier</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cryptographic Protection</p>
                    </div>
                </div>
                <div className="glass-card p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-600">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h4 className="font-black text-xl">Vault PIN Access</h4>
                            <p className="text-xs font-bold text-slate-500 max-w-sm">Encrypted numeric barrier enabled. Prevents unauthorized dashboard access.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleResetPin}
                        className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/30 hover:bg-rose-700 transition-all"
                    >
                        CLEAR SECURITY BARRIER
                    </button>
                </div>
            </motion.section>

            {/* Currency Section */}
            <motion.section variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-4 px-4 border-l-4 border-emerald-600">
                    <Languages size={24} className="text-emerald-600" />
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Monetary Standards</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency Configuration</p>
                    </div>
                </div>
                <div className="glass-card p-10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {CURRENCIES.map(c => (
                            <button
                                key={c.code}
                                onClick={() => handleCurrencyChange(c.code)}
                                className={`p-8 rounded-[2rem] border-4 transition-all flex flex-col items-center group relative overflow-hidden ${user.currency === c.code
                                    ? 'border-emerald-500 bg-emerald-500/5'
                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-white/30 dark:bg-slate-900/40'}`}
                            >
                                <span className={`text-4xl block mb-2 font-black transition-transform group-hover:scale-110 ${user.currency === c.code ? 'text-emerald-600' : 'text-slate-300'}`}>
                                    {c.symbol}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${user.currency === c.code ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    {c.code}
                                </span>
                                {user.currency === c.code && (
                                    <div className="absolute top-3 right-3">
                                        <Check size={16} className="text-emerald-600" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Data Management Section */}
            <motion.section variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-4 px-4 border-l-4 border-orange-600">
                    <Database size={24} className="text-orange-600" />
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Data Integrity</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Infrastructure Management</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button
                        onClick={handleExport}
                        className="glass-card p-10 flex items-center justify-between group hover:border-indigo-500/50 transition-all"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Download size={28} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-black text-xl">Export Ledger</h4>
                                <p className="text-xs font-bold text-slate-500">Immutable SQL backup</p>
                            </div>
                        </div>
                        <ArrowRight size={24} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
                    </button>

                    <button
                        onClick={handleClearData}
                        className="glass-card p-10 flex items-center justify-between group hover:border-rose-500/50 transition-all"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Trash2 size={28} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-black text-xl text-rose-600">Atomic Purge</h4>
                                <p className="text-xs font-bold text-slate-500">Wipe all financial traces</p>
                            </div>
                        </div>
                        <ArrowRight size={24} className="text-slate-300 group-hover:text-rose-600 group-hover:translate-x-2 transition-all" />
                    </button>
                </div>
            </motion.section>

            {/* Modals for Budget and Reminder would be here similarly redesigned */}
            <AnimatePresence>
                {(isAddingBudget || editingBudget) && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddingBudget(false); setEditingBudget(null); }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md glass-card p-10 relative z-10 shadow-2xl">
                            <h3 className="text-2xl font-black mb-8">{editingBudget ? 'Update Threshold' : 'Engage Budget'}</h3>
                            <form onSubmit={handleSaveBudget} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Classification</label>
                                    <select className="input-premium" value={newBudget.category} onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Monetary Limit</label>
                                    <input type="number" className="input-premium" placeholder="0.00" value={newBudget.amount} onChange={e => setNewBudget({ ...newBudget, amount: e.target.value })} />
                                </div>
                                <button type="submit" className="btn-premium w-full mt-4">COMMIT THRESHOLD</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SettingsPage;
