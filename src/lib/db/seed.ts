
import { db } from '.';
import { users } from './schema';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('Seeding database...');
    const adminEmail = 'admin@betty.fr';
    const adminPassword = 'cresus';

    const existingAdmin = await db.query.users.findFirst({
        where: eq(users.email, adminEmail),
    });

    if (existingAdmin) {
        console.log('Admin user already exists.');
        return;
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
}

main().catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
});
