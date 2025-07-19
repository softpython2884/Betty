import 'dotenv/config';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '@/lib/db';

async function main() {
    try {
        console.log("Running migrations...");
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log("Migrations finished successfully!");
        process.exit(0);
    } catch(error) {
        console.error("Error during migration:", error);
        process.exit(1);
    }
}

main();
