
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { questCompletions } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const questCompletionsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(questCompletions)
      .where(eq(questCompletions.userId, userId));
    
    const questCompletionsCount = Number(questCompletionsResult[0].count);

    return NextResponse.json({ questCompletionsCount });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
