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

    -- Ajoute la colonne whitelisted si elle n'existe pas déjà
    PRAGMA foreign_keys = OFF;
    BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS users_temp AS SELECT * FROM users;
    ALTER TABLE users ADD COLUMN whitelisted INTEGER DEFAULT 0;
    COMMIT;

    -- Table des preuves de paiement en attente  
    CREATE TABLE IF NOT EXISTS pending (  
      user_id INTEGER PRIMARY KEY,  
      username TEXT,  
      proof TEXT,  
      requested_at TEXT  
    );  

    -- Table des abonnements (utilisée dans /valider, /abonnes, etc.)  
    CREATE TABLE IF NOT EXISTS subscribers (  
      user_id INTEGER PRIMARY KEY,  
      username TEXT,  
      expires TEXT  
    );
  `);

  console.log('✅ Base de données SQLite initialisée avec succès.');
}

export default db;