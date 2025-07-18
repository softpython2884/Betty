import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import fs from 'fs';
import path from 'path';

const dbFolderPath = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
  console.log('Created db directory at:', dbFolderPath);
}

const sqlite = new Database(path.join(dbFolderPath, 'betty.db'));

export const db = drizzle(sqlite, { schema });

// This should only be run when you need to apply new migrations.
// For local dev, you can run `npm run db:migrate`
// For production, this should be part of your build/deploy process.
migrate(db, { migrationsFolder: 'drizzle' });
