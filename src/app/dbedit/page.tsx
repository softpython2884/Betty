'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

async function migrateDbAction() {
  try {
    console.log('DB migration started...');
    migrate(db, { migrationsFolder: 'drizzle' });
    console.log('DB migration completed successfully.');
    return { success: true, message: 'Database migrated successfully!' };
  } catch (error: any) {
    console.error('DB migration failed:', error);
    return { success: false, message: `Migration failed: ${error.message}` };
  }
}

async function seedDbAction() {
  try {
    console.log('Seeding database...');
    const adminEmail = 'admin@betty.fr';
    const adminPassword = 'cresus';

    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, adminEmail),
    });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      return { success: true, message: 'Admin user already exists. Seeding not required.' };
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
    console.log('Seeding finished.');
    return { success: true, message: 'Database seeded successfully! Admin user created.' };
  } catch (error: any) {
    console.error('Error during seeding:', error);
    return { success: false, message: `Seeding failed: ${error.message}` };
  }
}

// Simple component to render the page and handle form actions
export default async function DbEditPage() {
    let migrateResult: { success: boolean, message: string } | null = null;
    let seedResult: { success: boolean, message: string } | null = null;
    
    // This is a simplified way to handle form actions for this temporary page.
    // In a real app, you'd use a more robust state management solution.
    const migrate = async () => {
        'use server';
        migrateResult = await migrateDbAction();
    }
    const seed = async () => {
        'use server';
        seedResult = await seedDbAction();
    }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <Card className="w-full max-w-xl shadow-2xl">
        <CardHeader>
          <CardTitle>Database Management (Temporary)</CardTitle>
          <CardDescription>
            Use these actions to set up or reset the database.
            <strong className="text-destructive"> This page should be deleted in production.</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Migrate Database Schema</h3>
            <p className="text-sm text-muted-foreground">
              This applies the latest schema changes from your `drizzle` folder to the database. Run this first.
            </p>
            <form action={migrate}>
                <Button className="w-full">Run Migration</Button>
            </form>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Seed Database</h3>
            <p className="text-sm text-muted-foreground">
              This populates the database with initial data, like the default admin user.
            </p>
            <form action={seed}>
                 <Button className="w-full" variant="secondary">Run Seeder</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
