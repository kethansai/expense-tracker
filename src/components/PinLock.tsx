import React, { useState, useEffect } from 'react';
import { Lock, Delete } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PinLock: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const { user, db } = useAppContext();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [savedPin, setSavedPin] = useState<string | null>(null);

    useEffect(() => {
        if (db && user) {
            const res = db.exec(`SELECT pin_code FROM users WHERE id = ${user.id}`);
            if (res.length > 0 && res[0].values[0][0]) {
                setSavedPin(res[0].values[0][0] as string);
            } else {
                setIsSettingUp(true);
            }
        }
    }, [db, user]);

    const handleNumber = (n: number) => {
        if (pin.length < 4) setPin(prev => prev + n);
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        if (isSettingUp) {
            if (pin.length === 4) {
                db?.run(`UPDATE users SET pin_code = '${pin}' WHERE id = ${user.id}`);
                import('../db/database').then(m => m.saveDB());
                onSuccess();
            }
        } else {
            if (pin === savedPin) {
                onSuccess();
            } else {
                setError(true);
                setPin('');
                setTimeout(() => setError(false), 500);
            }
        }
    };

    useEffect(() => {
        if (pin.length === 4) {
            handleSubmit();
        }
    }, [pin]);

    return (
        <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-500">
            <div className={`text-center space-y-4 mb-12 transition-transform duration-300 ${error ? 'animate-shake' : ''}`}>
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/30">
                    <Lock size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">
                        {isSettingUp ? 'Set Security PIN' : 'Enter PIN'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {isSettingUp ? 'Create a 4-digit PIN for extra security' : `Welcome back! Please verify it's you.`}
                    </p>
                </div>
            </div>

            <div className="flex gap-4 mb-12">
                {[1, 2, 3, 4].map((_, i) => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i
                            ? 'bg-indigo-600 border-indigo-600 scale-125'
                            : 'border-slate-300 dark:border-slate-700'
                            }`}
                    ></div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button
                        key={n}
                        onClick={() => handleNumber(n)}
                        className="w-full aspect-square rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-2xl font-black text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
                    >
                        {n}
                    </button>
                ))}
                <div className="w-full"></div>
                <button
                    onClick={() => handleNumber(0)}
                    className="w-full aspect-square rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-2xl font-black text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    className="w-full aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90"
                >
                    <Delete size={24} />
                </button>
            </div>

            {isSettingUp && (
                <p className="mt-12 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    This PIN will be required every time you open the app.
                </p>
            )}
        </div>
    );
};

export default PinLock;
