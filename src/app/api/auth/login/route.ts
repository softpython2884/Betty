
'use server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';
const key = new TextEncoder().encode(SECRET_KEY);

export async function POST(req: NextRequest) {
  console.log('--- Login API Endpoint Hit ---');
  try {
    const body = await req.json();
    console.log('Request body received:', body);
    const { email, password } = body;

    if (!email || !password) {
      console.log('Validation failed: Email or password missing.');
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    console.log(`Attempting to find user with email: ${email}`);
    const user = await db.select().from(users).where(eq(users.email, email)).get();

    if (!user) {
      console.log(`User not found for email: ${email}`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    console.log('User found:', { id: user.id, email: user.email, role: user.role });

    console.log('Comparing password for user:', user.email);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Password comparison failed for user:', user.email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    console.log('Password is valid for user:', user.email);

    const { password: _, ...userWithoutPassword } = user;

    console.log('Creating JWT for user:', user.email);
    const token = await new SignJWT(userWithoutPassword)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d') // Token expires in 1 day
      .sign(key);
    console.log('JWT created successfully.');

    console.log('Setting auth_token cookie.');
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    console.log('Cookie set.');

    console.log('Login successful, returning user data.');
    return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error('---!!!! LOGIN API CRITICAL ERROR !!!!---:', error);
    // Log the error object with more details
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
