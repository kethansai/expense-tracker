import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Transaction } from '../types';

export interface Budget {
    id: number;
    category: string;
    amount_limit: number;
    period: string;
}

export interface Reminder {
    id: number;
    title: string;
    amount: number;
    due_date: string;
    category: string;
    is_paid: boolean;
}

export const useFinanceData = () => {
    const { db, user } = useAppContext();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
    });
    const [categoryData, setCategoryData] = useState<{ name: string, value: number, color: string }[]>([]);
    const [monthlyData, setMonthlyData] = useState<{ name: string, income: number, expense: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        if (!db || !user) return;

        try {
            // Fetch Transactions
            const transResult = db.exec(`
                SELECT * FROM transactions 
                WHERE user_id = ${user.id} 
                ORDER BY date DESC 
            `);

            const mappedTransactions: Transaction[] = [];
            if (transResult.length > 0) {
                const { columns, values } = transResult[0];
                values.forEach(row => {
                    const trans: any = {};
                    columns.forEach((col, i) => {
                        trans[col] = row[i];
                    });
                    mappedTransactions.push({
                        ...trans,
                        is_recurring: !!trans.is_recurring
                    } as Transaction);
                });
            }
            setTransactions(mappedTransactions);

            // Fetch Budgets
            const budgetResult = db.exec(`
                SELECT * FROM budgets WHERE user_id = ${user.id}
            `);
            const mappedBudgets: Budget[] = [];
            if (budgetResult.length > 0) {
                const { columns, values } = budgetResult[0];
                values.forEach(row => {
                    const b: any = {};
                    columns.forEach((col, i) => b[col] = row[i]);
                    mappedBudgets.push(b as Budget);
                });
            }
            setBudgets(mappedBudgets);

            // Fetch Reminders
            const reminderResult = db.exec(`
                SELECT * FROM reminders WHERE user_id = ${user.id} AND is_paid = 0 ORDER BY due_date ASC
            `);
            const mappedReminders: Reminder[] = [];
            if (reminderResult.length > 0) {
                const { columns, values } = reminderResult[0];
                values.forEach(row => {
                    const r: any = {};
                    columns.forEach((col, i) => r[col] = row[i]);
                    mappedReminders.push({ ...r, is_paid: !!r.is_paid } as Reminder);
                });
            }
            setReminders(mappedReminders);

            // Fetch Stats
            const statsResult = db.exec(`
                SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
                FROM transactions 
                WHERE user_id = ${user.id}
            `);

            if (statsResult.length > 0 && statsResult[0].values[0]) {
                const income = (statsResult[0].values[0][0] as number) || 0;
                const expense = (statsResult[0].values[0][1] as number) || 0;
                setStats({
                    totalIncome: income,
                    totalExpenses: expense,
                    balance: income - expense
                });
            }

            // Fetch Category Breakdown (Expenses only)
            const categoryResult = db.exec(`
                SELECT category, SUM(amount) as total
                FROM transactions 
                WHERE user_id = ${user.id} AND type = 'expense'
                GROUP BY category
                ORDER BY total DESC
            `);

            if (categoryResult.length > 0) {
                const colors = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];
                setCategoryData(categoryResult[0].values.map((v, i) => ({
                    name: v[0] as string,
                    value: v[1] as number,
                    color: colors[i % colors.length]
                })));
            } else {
                setCategoryData([]);
            }

            // Fetch Monthly Trend
            const monthlyResult = db.exec(`
                SELECT 
                    strftime('%Y-%m', date) as month,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as inc,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as exp
                FROM transactions 
                WHERE user_id = ${user.id}
                GROUP BY month
                ORDER BY month ASC
                LIMIT 6
            `);

            if (monthlyResult.length > 0) {
                setMonthlyData(monthlyResult[0].values.map(v => {
                    const [year, month] = (v[0] as string).split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return {
                        name: date.toLocaleString('default', { month: 'short' }),
                        income: v[1] as number,
                        expense: v[2] as number
                    };
                }));
            } else {
                setMonthlyData([]);
            }

        } catch (err) {
            console.error("Failed to fetch finance data:", err);
        } finally {
            setLoading(false);
        }
    }, [db, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        transactions,
        budgets,
        reminders,
        stats,
        categoryData,
        monthlyData,
        loading,
        refresh: fetchData
    };
};
