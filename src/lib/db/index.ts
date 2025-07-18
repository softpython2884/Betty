import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

const dbFolderPath = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
  console.log('Created db directory at:', dbFolderPath);
}

const sqlite = new Database(path.join(dbFolderPath, 'betty.db'));

export const db = drizzle(sqlite, { schema });

// NOTE: The migrate function has been removed from here.
// Migrations should be run via the `npm run db:migrate` script.
// Running migrations on every request is not the correct approach
// and was causing the application to crash.
