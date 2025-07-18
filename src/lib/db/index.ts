import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import fs from 'fs';
import path from 'path';

const dbFolderPath = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
}

const sqlite = new Database(path.join(dbFolderPath, 'betty.db'));

export const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: 'drizzle' });
