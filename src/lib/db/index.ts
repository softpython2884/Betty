
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

// --- Self-healing mechanism for quizzes tables ---
try {
    // Check if the quizzes table exists
    sqlite.prepare('SELECT id FROM quizzes LIMIT 1').get();
} catch (error: any) {
    if (error.message.includes('no such table')) {
        console.log("Quizzes table not found, creating it and related tables...");
        // The table doesn't exist, so create it and its dependencies
        sqlite.exec(`
            CREATE TABLE \`quizzes\` (
                \`id\` text PRIMARY KEY NOT NULL,
                \`title\` text NOT NULL,
                \`quest_id\` text,
                \`passing_score\` integer DEFAULT 80 NOT NULL,
                FOREIGN KEY (\`quest_id\`) REFERENCES \`quests\`(\`id\`) ON UPDATE no action ON DELETE no action
            );
            CREATE TABLE \`quiz_questions\` (
                \`id\` text PRIMARY KEY NOT NULL,
                \`quiz_id\` text NOT NULL,
                \`text\` text NOT NULL,
                \`type\` text NOT NULL,
                FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON UPDATE no action ON DELETE no action
            );
            CREATE TABLE \`quiz_options\` (
                \`id\` text PRIMARY KEY NOT NULL,
                \`question_id\` text NOT NULL,
                \`text\` text NOT NULL,
                \`is_correct\` integer DEFAULT false NOT NULL,
                FOREIGN KEY (\`question_id\`) REFERENCES \`quiz_questions\`(\`id\`) ON UPDATE no action ON DELETE no action
            );
             CREATE UNIQUE INDEX \`quizzes_quest_id_unique\` ON \`quizzes\` (\`quest_id\`);
        `);
        console.log("Successfully created quizzes, quiz_questions, and quiz_options tables.");
    } else {
        // Re-throw other errors
        throw error;
    }
}
// --- End of self-healing mechanism ---


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
