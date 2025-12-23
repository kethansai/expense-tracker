import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';

let db: Database | null = null;

export const initDB = async () => {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  // Load from localstorage if exists
  const savedData = localStorage.getItem('expense_db');
  if (savedData) {
    const u8 = new Uint8Array(JSON.parse(savedData));
    db = new SQL.Database(u8);
  } else {
    db = new SQL.Database();
  }

  // Always ensure tables exist
  db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password_hash TEXT,
        currency TEXT DEFAULT 'USD',
        pin_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount REAL,
        type TEXT CHECK(type IN ('income', 'expense')),
        category TEXT,
        date TEXT,
        description TEXT,
        is_recurring INTEGER DEFAULT 0,
        recurring_frequency TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        category TEXT,
        amount_limit REAL,
        period TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        amount REAL,
        due_date TEXT,
        category TEXT,
        is_paid INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);

  saveDB();
  return db;
};

export const saveDB = () => {
  if (!db) return;
  const data = db.export();
  const arr = Array.from(data);
  localStorage.setItem('expense_db', JSON.stringify(arr));
};

export const getDB = () => db;
