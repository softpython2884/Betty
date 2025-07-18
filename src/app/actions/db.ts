'use server';

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

export async function migrateDb() {
  try {
    // Point to the folder where drizzle-kit generates migration files
    migrate(db, { migrationsFolder: './drizzle' });
    return { success: true, message: 'Database migrated successfully!' };
  } catch (error: any) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
    };
  }
}

export async function seedDb() {
  try {
    console.log('Seeding database...');
    const adminEmail = 'admin@betty.fr';
    const adminPassword = 'cresus';

    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, adminEmail),
    });

    if (existingAdmin) {
      return { success: true, message: 'Admin user already exists.' };
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await db.insert(users).values({
      id: uuidv4(),
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
    });

    console.log('Admin user created successfully.');
    return { success: true, message: 'Admin user created successfully.' };
  } catch (error: any) {
    console.error('Error during seeding:', error);
    return { success: false, message: `Seeding failed: ${error.message}` };
  }
}
