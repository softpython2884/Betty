import { db } from './index';
import { users } from './schema';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('Seeding database...');

  const adminEmail = 'admin@betty.fr';
  const adminPassword = 'cresus';

  // Check if admin user already exists
  const existingAdmin = await db.select().from(users).where(users.email.eq(adminEmail)).get();

  if (existingAdmin) {
    console.log('Admin user already exists.');
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await db.insert(users).values({
      id: uuidv4(),
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
    }).run();
    console.log('Admin user created successfully.');
  }

  console.log('Seeding finished.');
  process.exit(0);
}

main().catch((e) => {
  console.error('Error during seeding:', e);
  process.exit(1);
});
