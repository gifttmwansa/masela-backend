const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// Locally: store the database inside /server
// On Railway: set DB_DIR=/data so the database lives on the persistent volume
const DB_DIR = process.env.DB_DIR || __dirname;

fs.mkdirSync(DB_DIR, { recursive: true });

const DB_PATH = path.join(DB_DIR, "masela.db");

const db = new Database(DB_PATH);

// SQLite settings
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS crochet_wishlist (
    id TEXT PRIMARY KEY,
    item TEXT NOT NULL,
    target_date TEXT,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS book_notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS book_checklist (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS book_photo (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    filename TEXT
  );

  CREATE TABLE IF NOT EXISTS writing_pieces (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS medicine_achievements (
    id TEXT PRIMARY KEY,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    note TEXT,
    date TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    filename TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO settings (key, value)
  VALUES ('medicine_current_year', '1');

  INSERT OR IGNORE INTO settings (key, value)
  VALUES ('medicine_total_years', '6');

  INSERT OR IGNORE INTO settings (key, value)
  VALUES ('medicine_school', 'University of Zambia');
`);

module.exports = db;