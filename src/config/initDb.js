const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/hedging.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    user_type TEXT DEFAULT 'farmer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Crops table
  db.run(`CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'oilseed',
    unit TEXT DEFAULT 'quintal'
  )`);

  // Price history table
  db.run(`CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_id INTEGER NOT NULL,
    price REAL NOT NULL,
    date DATE NOT NULL,
    market TEXT DEFAULT 'NCDEX',
    FOREIGN KEY (crop_id) REFERENCES crops(id)
  )`);

  // Hedging contracts table
  db.run(`CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    crop_id INTEGER NOT NULL,
    contract_type TEXT NOT NULL,
    quantity REAL NOT NULL,
    strike_price REAL NOT NULL,
    current_price REAL,
    entry_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    pnl REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (crop_id) REFERENCES crops(id)
  )`);

  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    contract_id INTEGER,
    transaction_type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
  )`);

  // Alerts table
  db.run(`CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    crop_id INTEGER NOT NULL,
    alert_type TEXT NOT NULL,
    threshold_price REAL NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (crop_id) REFERENCES crops(id)
  )`);

  console.log('Database schema created successfully!');
});

db.close();
