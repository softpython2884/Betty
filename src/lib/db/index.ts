
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

// Define a global variable to hold the database connection
// This is to avoid creating new connections on every hot-reload in development
declare global {
  // eslint-disable-next-line no-var
  var db: BetterSQLite3Database<typeof schema> | undefined;
}

const dbFolderPath = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
}
const dbPath = path.join(dbFolderPath, 'betty.db');

// Initialize the database connection
const sqlite = new Database(dbPath);
let db: BetterSQLite3Database<typeof schema>;

// Use a global variable in development to prevent issues with HMR
if (process.env.NODE_ENV === 'production') {
  db = drizzle(sqlite, { schema });
} else {
  if (!global.db) {
    global.db = drizzle(sqlite, { schema });
  }
  db = global.db;
}

export { db };
