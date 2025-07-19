
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

// --- Self-healing mechanism for table creation ---
const tablesToCreate = {
    quizzes: `
        CREATE TABLE "quizzes" (
            "id" text PRIMARY KEY NOT NULL,
            "title" text NOT NULL,
            "quest_id" text,
            "passing_score" integer DEFAULT 80 NOT NULL,
            FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON UPDATE no action ON DELETE no action
        );
        CREATE UNIQUE INDEX "quizzes_quest_id_unique" ON "quizzes" ("quest_id");
    `,
    quiz_questions: `
        CREATE TABLE "quiz_questions" (
            "id" text PRIMARY KEY NOT NULL,
            "quiz_id" text NOT NULL,
            "text" text NOT NULL,
            "type" text NOT NULL,
            FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON UPDATE no action ON DELETE no action
        );
    `,
    quiz_options: `
        CREATE TABLE "quiz_options" (
            "id" text PRIMARY KEY NOT NULL,
            "question_id" text NOT NULL,
            "text" text NOT NULL,
            "is_correct" integer DEFAULT false NOT NULL,
            FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON UPDATE no action ON DELETE no action
        );
    `,
    quest_completions: `
        CREATE TABLE "quest_completions" (
            "user_id" text NOT NULL,
            "quest_id" text NOT NULL,
            "completed_at" integer NOT NULL,
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON UPDATE no action ON DELETE no action,
            PRIMARY KEY("user_id", "quest_id")
        );
    `
};

for (const [tableName, creationSql] of Object.entries(tablesToCreate)) {
    try {
        sqlite.prepare(`SELECT * FROM ${tableName} LIMIT 1`).get();
    } catch (error: any) {
        if (error.message.includes('no such table')) {
            console.log(`${tableName} table not found, creating it...`);
            sqlite.exec(creationSql);
            console.log(`Successfully created ${tableName} table and related objects.`);
        }
    }
}

// --- Self-healing mechanism for column addition ---
try {
    const tableInfo = sqlite.prepare("PRAGMA table_info(projects)").all();
    const columnNames = tableInfo.map((col: any) => col.name);

    if (!columnNames.includes('curriculum_id')) {
        console.log("Column 'curriculum_id' not found in 'projects' table, adding it...");
        sqlite.exec("ALTER TABLE projects ADD COLUMN curriculum_id TEXT");
        console.log("Successfully added 'curriculum_id' column.");
    }

    if (!columnNames.includes('quest_id')) {
        console.log("Column 'quest_id' not found in 'projects' table, adding it...");
        sqlite.exec("ALTER TABLE projects ADD COLUMN quest_id TEXT");
        console.log("Successfully added 'quest_id' column.");
    }
} catch (error) {
    console.error("Error during 'projects' table self-healing:", error);
}

// --- End of self-healing mechanisms ---

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
