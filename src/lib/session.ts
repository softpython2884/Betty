
'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from './db/schema';

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';
const key = new TextEncoder().encode(SECRET_KEY);

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, key);
        if (!payload.id || typeof payload.id !== 'string') {
            return null;
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.id),
        });

        if (!user) {
           return null;
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;

    } catch (error) {
        console.error("Auth 'me' error:", error);
        return null;
    }
}
