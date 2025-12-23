export interface Transaction {
    id: number;
    user_id: number;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    description: string;
    is_recurring: boolean;
    recurring_frequency?: string;
}

export interface Budget {
    id: number;
    user_id: number;
    category: string;
    amount_limit: number;
    period: string;
}

export interface User {
    id: number;
    email: string;
    currency: string;
    pin_code?: string;
    created_at: string;
}
