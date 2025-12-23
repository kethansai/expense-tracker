import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
    const { setUser, db } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Missing credentials for authentication');
            return;
        }

        try {
            if (!db) throw new Error('Database not initialized');

            const result = db.exec(`SELECT * FROM users WHERE email='${email}' AND password_hash='${password}'`);

            if (result.length > 0 && result[0].values.length > 0) {
                const userData = result[0].values[0];
                const user = {
                    id: userData[0] as number,
                    email: userData[1] as string,
                    currency: (userData[3] as string) || 'USD'
                };
                setUser(user);
                navigate('/');
            } else {
                setError('Invalid credentials for this entity');
            }
        } catch (err: any) {
            setError('Session initialization failure');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] animate-float"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] animate-float" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-xl glass-card p-12 md:p-16 border-white/50 dark:border-white/5 shadow-2xl"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-500/30 mb-8"
                    >
                        <LogIn size={36} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Access Vault</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold uppercase text-[10px] tracking-[0.3em]">Quantum Ledger Systems</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-8">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-black uppercase tracking-widest"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Tag</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                                placeholder="commander@nexus.io"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Phrase</label>
                            <button
                                type="button"
                                onClick={() => setError('Contact administrative node for phrase reset.')}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest"
                            >
                                Lost Phrase?
                            </button>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        <span className="relative z-10">INITIALIZE SESSION</span>
                        <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 skew-x-12" />
                    </button>
                </form>

                <div className="mt-14 text-center border-t border-slate-100 dark:border-slate-800 pt-8">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        New Operator?{' '}
                        <Link to="/register" className="font-black text-indigo-600 hover:text-indigo-500 hover:underline underline-offset-4">
                            CREATE PROFILE
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
