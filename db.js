// db.js

import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

export function initDB() {
  db.exec(`
    -- Table des utilisateurs
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      code TEXT UNIQUE,
      filleuls TEXT DEFAULT '[]',
      premium_until TEXT DEFAULT NULL,
      whitelisted INTEGER DEFAULT 0
    );

    -- Table des preuves de paiement en attente  
    CREATE TABLE IF NOT EXISTS pending (  
      user_id INTEGER PRIMARY KEY,  
      username TEXT,  
      proof TEXT,  
      requested_at TEXT  
    );  

    -- Table des abonnements  
    CREATE TABLE IF NOT EXISTS subscribers (  
      user_id INTEGER PRIMARY KEY,  
      username TEXT,  
      expires TEXT  
    );
  `);

  console.log('✅ Base de données SQLite initialisée avec succès.');
}

export default db;
