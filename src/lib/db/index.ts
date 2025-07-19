
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
    `,
    tasks: `
        CREATE TABLE "tasks" (
            "id" text PRIMARY KEY NOT NULL,
            "title" text NOT NULL,
            "description" text,
            "status" text DEFAULT 'backlog' NOT NULL,
            "urgency" text DEFAULT 'normal' NOT NULL,
            "order" integer DEFAULT 0 NOT NULL,
            "deadline" integer,
            "project_id" text NOT NULL,
            "created_at" integer NOT NULL,
            FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON UPDATE no action ON DELETE no action
        );
    `,
    documents: `
        CREATE TABLE "documents" (
            "id" text PRIMARY KEY NOT NULL,
            "title" text NOT NULL,
            "content" text,
            "project_id" text NOT NULL,
            "author_id" text NOT NULL,
            "created_at" integer NOT NULL,
            "updated_at" integer NOT NULL,
            FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("author_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        );
    `
};

for (const [tableName, creationSql] of Object.entries(tablesToCreate)) {
    try {
        sqlite.prepare(`SELECT * FROM ${tableName} LIMIT 1`).get();
    } catch (error: any) {
        if (error.message.includes('no such table')) {
            console.log(`Table ${tableName} not found, creating it...`);
            sqlite.exec(creationSql);
            console.log(`Successfully created ${tableName} table and related objects.`);
        }
    }
}

// --- Self-healing mechanism for column addition ---
try {
    const projectsInfo = sqlite.prepare("PRAGMA table_info(projects)").all();
    const projectColumns = projectsInfo.map((col: any) => col.name);

    if (!projectColumns.includes('curriculum_id')) {
        console.log("Column 'curriculum_id' not found in 'projects' table, adding it...");
        sqlite.exec("ALTER TABLE projects ADD COLUMN curriculum_id TEXT REFERENCES curriculums(id)");
        console.log("Successfully added 'curriculum_id' column.");
    }
    
    if (!projectColumns.includes('quest_id')) {
        console.log("Column 'quest_id' not found in 'projects' table, adding it...");
        sqlite.exec("ALTER TABLE projects ADD COLUMN quest_id TEXT REFERENCES quests(id)");
        console.log("Successfully added 'quest_id' column.");
    }

    if (!projectColumns.includes('updated_at')) {
        console.log("Column 'updated_at' not found in 'projects' table, adding it...");
        sqlite.exec("ALTER TABLE projects ADD COLUMN updated_at INTEGER");
        console.log("Successfully added 'updated_at' column.");
    }

    const tasksInfo = sqlite.prepare("PRAGMA table_info(tasks)").all();
    const taskColumns = tasksInfo.map((col: any) => col.name);

    if (!taskColumns.includes('urgency')) {
        console.log("Column 'urgency' not found in 'tasks' table, adding it...");
        sqlite.exec("ALTER TABLE tasks ADD COLUMN urgency TEXT DEFAULT 'normal' NOT NULL");
        console.log("Successfully added 'urgency' column.");
    }

} catch (error) {
    // This might fail if the 'tasks' table doesn't exist yet, which is fine
    if (!error.message.includes('no such table')) {
        console.error("Error during table self-healing:", error);
    }
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
