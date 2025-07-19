

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
const tablesToCreate: { [key: string]: string } = {
    users: `
        CREATE TABLE "users" (
            "id" text PRIMARY KEY NOT NULL,
            "name" text NOT NULL,
            "email" text NOT NULL,
            "password" text NOT NULL,
            "role" text NOT NULL,
            "status" text NOT NULL,
            "level" integer DEFAULT 1,
            "xp" integer DEFAULT 0,
            "orbs" integer DEFAULT 0,
            "title" text DEFAULT 'Novice Coder',
            "flowup_uuid" text,
            "flowup_fpat" text,
            "must_change_password" integer DEFAULT false,
            "created_at" integer NOT NULL
        );
        CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");
    `,
    curriculums: `
        CREATE TABLE "curriculums" (
            "id" text PRIMARY KEY NOT NULL,
            "name" text NOT NULL,
            "subtitle" text NOT NULL,
            "goal" text NOT NULL,
            "created_by" text NOT NULL,
            "created_at" integer NOT NULL,
            FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        );
    `,
    curriculum_assignments: `
        CREATE TABLE "curriculum_assignments" (
            "curriculum_id" text NOT NULL,
            "user_id" text NOT NULL,
            "status" text DEFAULT 'not-started' NOT NULL,
            "progress" integer DEFAULT 0,
            "completed_at" integer,
            FOREIGN KEY ("curriculum_id") REFERENCES "curriculums"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
            PRIMARY KEY("curriculum_id", "user_id")
        );
    `,
    quests: `
         CREATE TABLE "quests" (
            "id" text PRIMARY KEY NOT NULL,
            "title" text NOT NULL,
            "description" text,
            "category" text NOT NULL,
            "xp" integer NOT NULL,
            "orbs" integer DEFAULT 0,
            "status" text NOT NULL,
            "position_top" text NOT NULL,
            "position_left" text NOT NULL,
            "curriculum_id" text NOT NULL,
            FOREIGN KEY ("curriculum_id") REFERENCES "curriculums"("id") ON UPDATE no action ON DELETE no action
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
    projects: `
        CREATE TABLE "projects" (
            "id" text PRIMARY KEY NOT NULL,
            "title" text NOT NULL,
            "status" text NOT NULL,
            "is_quest_project" integer DEFAULT false,
            "quest_id" text,
            "owner_id" text NOT NULL,
            "created_at" integer NOT NULL,
            "curriculum_id" text,
            "updated_at" integer,
            FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("curriculum_id") REFERENCES "curriculums"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
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
    resources: `
        CREATE TABLE "resources" (
            "id" text PRIMARY KEY NOT NULL,
            "title" text NOT NULL,
            "content" text NOT NULL,
            "author_id" text NOT NULL,
            "created_at" integer NOT NULL,
            "updated_at" integer NOT NULL,
            FOREIGN KEY ("author_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
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
    `,
    events: `
        CREATE TABLE "events" (
            "id" text PRIMARY KEY NOT NULL,
            "title" text NOT NULL,
            "description" text,
            "start_time" integer NOT NULL,
            "end_time" integer NOT NULL,
            "type" text NOT NULL,
            "user_id" text,
            "project_id" text,
            "author_id" text NOT NULL,
            "created_at" integer NOT NULL,
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("author_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        );
    `,
    quest_connections: `
         CREATE TABLE "quest_connections" (
            "from_id" text NOT NULL,
            "to_id" text NOT NULL,
            FOREIGN KEY ("from_id") REFERENCES "quests"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("to_id") REFERENCES "quests"("id") ON UPDATE no action ON DELETE no action,
            PRIMARY KEY("from_id", "to_id")
        );
    `,
    quest_resources: `
         CREATE TABLE "quest_resources" (
            "quest_id" text NOT NULL,
            "resource_id" text NOT NULL,
            FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON UPDATE no action ON DELETE no action,
            PRIMARY KEY("quest_id", "resource_id")
        );
    `,
    cosmetics: `
         CREATE TABLE "cosmetics" (
            "id" text PRIMARY KEY NOT NULL,
            "name" text NOT NULL,
            "description" text NOT NULL,
            "type" text NOT NULL,
            "price" integer NOT NULL,
            "data" text NOT NULL
        );
    `,
    user_cosmetics: `
        CREATE TABLE "user_cosmetics" (
            "id" text PRIMARY KEY NOT NULL,
            "user_id" text NOT NULL,
            "cosmetic_id" text NOT NULL,
            "equipped" integer DEFAULT false NOT NULL,
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("cosmetic_id") REFERENCES "cosmetics"("id") ON UPDATE no action ON DELETE no action
        );
    `,
};

sqlite.pragma('journal_mode = WAL');
sqlite.exec("BEGIN");
try {
    for (const [tableName, creationSql] of Object.entries(tablesToCreate)) {
        try {
            sqlite.prepare(`SELECT 1 FROM ${tableName} LIMIT 1`).get();
        } catch (error: any) {
            if (error.message.includes('no such table')) {
                console.log(`Table ${tableName} not found, creating it...`);
                sqlite.exec(creationSql);
                console.log(`Successfully created ${tableName} table and related objects.`);
            } else {
                throw error;
            }
        }
    }
    sqlite.exec("COMMIT");
} catch (e) {
    console.error("Failed during schema setup, rolling back.", e);
    sqlite.exec("ROLLBACK");
}


// --- Self-healing mechanism for column addition ---
const columnsToAdd: { [key: string]: { name: string, definition: string }[] } = {
    projects: [
        { name: 'curriculum_id', definition: 'TEXT REFERENCES curriculums(id)' },
        { name: 'updated_at', definition: 'INTEGER' }
    ],
    tasks: [
        { name: 'urgency', definition: "TEXT DEFAULT 'normal' NOT NULL" }
    ],
    users: [
        { name: 'flowup_fpat', definition: 'TEXT' }
    ]
};

try {
    for (const [tableName, columns] of Object.entries(columnsToAdd)) {
        const tableInfo = sqlite.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string }[];
        const existingColumns = new Set(tableInfo.map(col => col.name));
        for (const column of columns) {
            if (!existingColumns.has(column.name)) {
                console.log(`Column '${column.name}' not found in '${tableName}' table, adding it...`);
                sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${column.definition}`);
                console.log(`Successfully added '${column.name}' column.`);
            }
        }
    }
} catch (error) {
    console.error("Error during column self-healing:", error);
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

// Seed cosmetics if they don't exist
try {
    const countResult = sqlite.prepare('SELECT count(*) as count FROM cosmetics').get() as { count: number };
    if (countResult.count === 0) {
        console.log("Seeding cosmetics...");
        const cosmeticsToSeed = [
            { id: 'title-style-1', name: 'Aube Ardente', description: 'Un gradient chaud et vibrant.', type: 'title_style', price: 100, data: JSON.stringify({ colors: ['#f85a2d', '#f48937', '#ecb345'] }) },
            { id: 'title-style-2', name: 'Nuit Électrique', description: 'Un gradient froid et mystérieux.', type: 'title_style', price: 150, data: JSON.stringify({ colors: ['#7928a1', '#ce4993', '#ff6b81'] }) },
            { id: 'title-style-3', name: 'Vague Synthétique', description: 'Un style rétrofuturiste.', type: 'title_style', price: 200, data: JSON.stringify({ colors: ['#00f2fe', '#4facfe', '#00f2fe'] }) },
        ];
        const stmt = sqlite.prepare('INSERT INTO cosmetics (id, name, description, type, price, data) VALUES (?, ?, ?, ?, ?, ?)');
        for (const cosmetic of cosmeticsToSeed) {
            stmt.run(cosmetic.id, cosmetic.name, cosmetic.description, cosmetic.type, cosmetic.price, cosmetic.data);
        }
        console.log("Cosmetics seeded successfully.");
    }
} catch (error) {
    console.error("Error seeding cosmetics:", error);
}


export { db };
