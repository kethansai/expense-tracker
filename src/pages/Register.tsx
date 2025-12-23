import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, Lock, UserPlus, ArrowRight, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { saveDB } from '../db/database';

const Register: React.FC = () => {
    const { db, setUser } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password || !confirmPassword) {
            setError('All parameters are mandatory');
            return;
        }

        if (password !== confirmPassword) {
            setError('Phrase mismatch detected');
            return;
        }

        try {
            if (!db) throw new Error('System not ready');

            // Check if user exists
            const checkUser = db.exec(`SELECT * FROM users WHERE email='${email}'`);
            if (checkUser.length > 0 && checkUser[0].values.length > 0) {
                setError('Identity already registered');
                return;
            }

            db.run(`INSERT INTO users (email, password_hash) VALUES ('${email}', '${password}')`);
            saveDB();

            const result = db.exec(`SELECT * FROM users WHERE email='${email}'`);
            const userData = result[0].values[0];
            const user = {
                id: userData[0] as number,
                email: userData[1] as string,
                currency: 'USD'
            };
            setUser(user);
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Registry authorization failure');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] animate-float"></div>
                <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] animate-float" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-xl glass-card p-12 md:p-16 border-white/50 dark:border-white/5 shadow-2xl"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ rotate: -45, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-purple-500/30 mb-8"
                    >
                        <UserPlus size={36} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Create Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold uppercase text-[10px] tracking-[0.3em]">Join the Quantum Financial Network</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-8">
                    {error && (
                        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Tag</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-bold"
                                placeholder="operator@nexus.io"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Phrase</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Phrase</label>
                            <div className="relative group">
                                <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-purple-500/30 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        <span className="relative z-10">RECRUIT OPERATOR</span>
                        <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 skew-x-12" />
                    </button>
                </form>

                <div className="mt-14 text-center border-t border-slate-100 dark:border-slate-800 pt-8">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Existing Node?{' '}
                        <Link to="/login" className="font-black text-purple-600 hover:text-purple-500 hover:underline underline-offset-4">
                            CONNECT SESSION
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
