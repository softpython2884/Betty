
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
            "avatar" text,
            "guild_id" text,
            "created_at" integer NOT NULL,
            FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON UPDATE no action ON DELETE set null
        );
        CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");
    `,
    guilds: `
        CREATE TABLE "guilds" (
            "id" text PRIMARY KEY NOT NULL,
            "name" text NOT NULL,
            "description" text NOT NULL,
            "crest" text,
            "leader_id" text,
            "created_at" integer NOT NULL,
            FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE set null
        );
        CREATE UNIQUE INDEX "guilds_name_unique" ON "guilds" ("name");
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
    submissions: `
        CREATE TABLE "submissions" (
            "id" text PRIMARY KEY NOT NULL,
            "project_id" text NOT NULL,
            "user_id" text NOT NULL,
            "submitted_at" integer NOT NULL,
            "status" text DEFAULT 'pending' NOT NULL,
            "grade" integer,
            "feedback" text,
            "graded_by" text,
            "graded_at" integer,
            FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("graded_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
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
    badges: `
        CREATE TABLE "badges" (
            "id" text PRIMARY KEY NOT NULL,
            "name" text NOT NULL,
            "description" text NOT NULL,
            "icon" text NOT NULL,
            "type" text NOT NULL
        );
    `,
    user_badges: `
        CREATE TABLE "user_badges" (
            "id" text PRIMARY KEY NOT NULL,
            "user_id" text NOT NULL,
            "badge_id" text NOT NULL,
            "pinned" integer DEFAULT false NOT NULL,
            "achieved_at" integer NOT NULL,
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON UPDATE no action ON DELETE no action
        );
    `,
    announcements: `
        CREATE TABLE "announcements" (
            "id" text PRIMARY KEY NOT NULL,
            "title" text NOT NULL,
            "message" text NOT NULL,
            "author_id" text NOT NULL,
            "created_at" integer NOT NULL,
            "is_active" integer DEFAULT true NOT NULL,
            FOREIGN KEY ("author_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        );
    `,
    daily_hunts: `
        CREATE TABLE "daily_hunts" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "date" integer NOT NULL,
            "html_content" text NOT NULL,
            "flag" text NOT NULL,
            "hint" text NOT NULL
        );
        CREATE UNIQUE INDEX "daily_hunts_date_unique" ON "daily_hunts" ("date");
    `,
    daily_hunt_completions: `
        CREATE TABLE "daily_hunt_completions" (
            "hunt_id" integer NOT NULL,
            "user_id" text NOT NULL,
            "completed_at" integer NOT NULL,
            FOREIGN KEY ("hunt_id") REFERENCES "daily_hunts"("id") ON UPDATE no action ON DELETE cascade,
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE cascade,
            PRIMARY KEY("hunt_id", "user_id")
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
        { name: 'flowup_fpat', definition: 'TEXT' },
        { name: 'avatar', definition: 'TEXT' },
        { name: 'guild_id', definition: 'TEXT REFERENCES guilds(id)' },
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

// Seed badges if they don't exist
try {
    const countResult = sqlite.prepare('SELECT count(*) as count FROM badges').get() as { count: number };
    if (countResult.count === 0) {
        console.log("Seeding badges...");
        const badgesToSeed = [
          // Milestones (11)
            { id: 'first-quest', name: 'Premiers Pas', description: 'Terminer votre toute première quête.', icon: 'Star', type: 'milestone' },
            { id: 'quest-initiate', name: 'Initié des Quêtes', description: 'Terminer 10 quêtes.', icon: 'Swords', type: 'milestone' },
            { id: 'quest-master', name: 'Maître des Quêtes', description: 'Terminer 25 quêtes.', icon: 'Swords', type: 'milestone' },
            { id: 'quest-legend', name: 'Légende des Quêtes', description: 'Terminer 50 quêtes.', icon: 'Swords', type: 'milestone' },
            { id: 'project-architect', name: 'Architecte de Projets', description: 'Créer 10 projets personnels.', icon: 'Construction', type: 'milestone' },
            { id: 'orb-hoarder', name: 'Amateur d\'Orbes', description: 'Posséder 1000 orbes.', icon: 'Gem', type: 'milestone' },
            { id: 'level-10', name: 'Vétéran', description: 'Atteindre le niveau 10.', icon: 'Shield', type: 'milestone' },
            { id: 'level-25', name: 'Élite', description: 'Atteindre le niveau 25.', icon: 'Shield', type: 'milestone' },
            { id: 'level-50', name: 'Champion', description: 'Atteindre le niveau 50.', icon: 'Shield', type: 'milestone' },
            { id: 'first-purchase', name: 'Premier Achat', description: 'Acheter votre premier article dans la boutique.', icon: 'ShoppingCart', type: 'milestone' },
            { id: 'collaborator', name: 'Collaborateur', description: 'Rejoindre ou inviter quelqu\'un à un projet.', icon: 'Users', type: 'milestone' },

            // Skill Badges (15)
            { id: 'js-initiate', name: 'Initié JavaScript', description: 'Maîtriser les bases de JavaScript.', icon: 'Code', type: 'skill' },
            { id: 'html-adept', name: 'Adepte du HTML', description: 'Maîtriser les balises sémantiques.', icon: 'Code', type: 'skill' },
            { id: 'css-stylist', name: 'Styliste CSS', description: 'Maîtriser Flexbox et Grid.', icon: 'Code', type: 'skill' },
            { id: 'react-guru', name: 'Gourou de React', description: 'Maîtriser la bibliothèque React.', icon: 'Code', type: 'skill' },
            { id: 'nextjs-navigator', name: 'Navigateur Next.js', description: 'Maîtriser le routage et le SSR.', icon: 'Code', type: 'skill' },
            { id: 'tailwind-wizard', name: 'Sorcier Tailwind', description: 'Maîtriser les classes utilitaires.', icon: 'Code', type: 'skill' },
            { id: 'node-ninja', name: 'Ninja de Node.js', description: 'Construire un serveur backend.', icon: 'Code', type: 'skill' },
            { id: 'express-expert', name: 'Expert Express', description: 'Créer une API REST.', icon: 'Code', type: 'skill' },
            { id: 'sql-squire', name: 'Écuyer SQL', description: 'Effectuer des jointures complexes.', icon: 'Database', type: 'skill' },
            { id: 'drizzle-druid', name: 'Druide de Drizzle', description: 'Maîtriser l\'ORM Drizzle.', icon: 'Database', type: 'skill' },
            { id: 'git-guardian', name: 'Gardien de Git', description: 'Gérer les branches et les fusions.', icon: 'GitMerge', type: 'skill' },
            { id: 'docker-dockhand', name: 'Docker de Docker', description: 'Conteneuriser une application.', icon: 'Container', type: 'skill' },
            { id: 'ts-tycoon', name: 'Magnat de TypeScript', description: 'Utiliser les types génériques et avancés.', icon: 'Code', type: 'skill' },
            { id: 'auth-author', name: 'Auteur de l\'Authentification', description: 'Implémenter un système d\'authentification sécurisé.', icon: 'Key', type: 'skill' },
            { id: 'ai-artisan', name: 'Artisan de l\'IA', description: 'Intégrer une fonctionnalité Genkit.', icon: 'BrainCircuit', type: 'skill' },

            // Achievements & Hidden (24)
            { id: 'top-contributor', name: 'Top Contributeur', description: 'Finir #1 dans un défi hebdomadaire.', icon: 'Trophy', type: 'rank' },
            { id: 'bug-squasher', name: 'Écraseur de Bugs', description: 'Résoudre une quête particulièrement difficile.', icon: 'Bug', type: 'achievement' },
            { id: 'speed-runner', name: 'Speed Runner', description: 'Terminer une quête en un temps record.', icon: 'Zap', type: 'achievement' },
            { id: 'perfectionist', name: 'Perfectionniste', description: 'Obtenir 100% à un quiz du premier coup.', icon: 'Target', type: 'achievement' },
            { id: 'explorer', name: 'Explorateur', description: 'Visiter toutes les pages de la plateforme.', icon: 'Compass', type: 'achievement' },
            { id: 'night-owl', name: 'Oiseau de Nuit', description: 'Soumettre une quête entre minuit et 4h du matin.', icon: 'Moon', type: 'achievement' },
            { id: 'early-bird', name: 'Lève-tôt', description: 'Soumettre une quête entre 4h et 7h du matin.', icon: 'Sun', type: 'achievement' },
            { id: 'style-maven', name: 'Expert en Style', description: 'Posséder tous les styles de titre.', icon: 'Palette', type: 'achievement' },
            { id: 'dedicated', name: 'Dévoué', description: 'Se connecter 7 jours d\'affilée.', icon: 'Calendar', type: 'achievement' },
            { id: 'academic', name: 'Académique', description: 'Lire 10 articles de ressources.', icon: 'BookOpen', type: 'achievement' },
            { id: 'curious', name: 'Curieux', description: 'Poser 10 questions à l\'IA Codex.', icon: 'HelpCircle', type: 'achievement' },
            { id: 'socialite', name: 'Mondain', description: 'Participer à 5 événements d\'équipe.', icon: 'Users', type: 'achievement' },
            { id: 'secret-finder-1', name: 'Chercheur de Secrets', description: 'Vous avez trouvé quelque chose de caché !', icon: 'Eye', type: 'achievement' },
            { id: 'full-stack', name: 'Full-Stack', description: 'Terminer une quête Frontend et une quête Backend.', icon: 'Layers', type: 'achievement' },
            { id: 'hat-trick', name: 'Tour du Chapeau', description: 'Terminer 3 quêtes en une seule journée.', icon: 'Swords', type: 'achievement' },
            { id: 'weekly-warrior', name: 'Guerrier Hebdomadaire', description: 'Terminer 4 quêtes hebdomadaires consécutives.', icon: 'CalendarCheck', type: 'achievement' },
            { id: 'ai-kickstarter', name: 'Kickstarter IA', description: 'Créer un projet avec l\'IA Kick-starter.', icon: 'Rocket', type: 'achievement' },
            { id: 'readme-writer', name: 'Rédacteur de README', description: 'Générer un README avec l\'IA.', icon: 'FileJson', type: 'achievement' },
            { id: 'concept-conqueror', name: 'Conquérant de Concepts', description: 'Utiliser l\'Expliqueur de Concepts 5 fois.', icon: 'Brain', type: 'achievement' },
            { id: 'mentor-in-training', name: 'Mentor en Formation', description: 'Laisser un feedback constructif sur un projet.', icon: 'MessageSquare', type: 'achievement' },
            { id: 'unstoppable', name: 'Inarrêtable', description: 'Atteindre le niveau 100.', icon: 'Crown', type: 'achievement' },
            { id: 'over-9000', name: 'Plus de 9000 !', description: 'Dépasser 9000 XP.', icon: 'Flame', type: 'achievement' },
            { id: 'the-final-frontier', name: 'L\'Ultime Frontière', description: 'Terminer le dernier projet du cursus principal.', icon: 'Flag', type: 'achievement' },
            { id: 'collector', name: 'Collectionneur', description: 'Obtenir 25 badges.', icon: 'Archive', type: 'achievement' },
        ];
        const stmt = sqlite.prepare('INSERT INTO badges (id, name, description, icon, type) VALUES (?, ?, ?, ?, ?)');
        for (const badge of badgesToSeed) {
            stmt.run(badge.id, badge.name, badge.description, badge.icon, badge.type);
        }
        console.log("Badges seeded successfully.");
    }
} catch (error) {
    console.error("Error seeding badges:", error);
}


export { db };
