import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDB, getDB, saveDB } from '../db/database';
import type { Database } from 'sql.js';

interface AppContextType {
    db: Database | null;
    loading: boolean;
    refreshData: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
    user: any | null;
    setUser: (user: any | null) => void;
    isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<Database | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        const initialize = async () => {
            const database = await initDB();
            setDb(database);
            setLoading(false);

            // Auto login if possible (placeholder)
            const savedUser = localStorage.getItem('user');
            if (savedUser) setUser(JSON.parse(savedUser));
        };
        initialize();
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const refreshData = () => {
        // This can be used to trigger updates in components
        saveDB();
        setDb(getDB());
    };

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    const handleSetUser = (u: any | null) => {
        setUser(u);
        if (u) localStorage.setItem('user', JSON.stringify(u));
        else localStorage.removeItem('user');
    };

    return (
        <AppContext.Provider value={{
            db,
            loading,
            refreshData,
            isDarkMode,
            toggleTheme,
            user,
            setUser: handleSetUser,
            isAuthenticated: !!user
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
