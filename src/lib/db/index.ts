import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import fs from 'fs';
import path from 'path';

// Create the db directory if it doesn't exist
const dbFolderPath = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath);
}

const sqlite = new Database('db/betty.db');

export const db = drizzle(sqlite, { schema });

// This will run migrations on startup
migrate(db, { migrationsFolder: 'drizzle' });
