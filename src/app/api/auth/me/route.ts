
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';
const key = new TextEncoder().encode(SECRET_KEY);

export async function GET(req: NextRequest) {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, key);
        if (!payload.id || typeof payload.id !== 'string') {
            throw new Error("Invalid token payload");
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.id),
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json({ user: userWithoutPassword }, { status: 200 });

    } catch (error) {
        console.error("Auth 'me' error:", error);
        return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
}


