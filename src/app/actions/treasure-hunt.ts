
'use server';

import { db } from '@/lib/db';
import { dailyHunts, dailyHuntCompletions, users, NewDailyHunt } from '@/lib/db/schema';
import { generateTreasureHunt } from '@/ai/flows/generate-treasure-hunt-flow';
import { eq, and, sql } from 'drizzle-orm';
import { startOfToday } from 'date-fns';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

const THEMES = [
  'Portfolio de photographe',
  'Page de produit pour une boisson énergisante',
  'Blog de voyage',
  'Site vitrine pour un café local',
  'Page de lancement pour une application mobile',
  'CV en ligne d’un développeur web',
  'Site d’un festival de musique indépendant',
];

export async function getTodaysHunt(): Promise<{
  hunt: {
    id: string;
    htmlContent: string;
    hint: string;
  } | null;
  isCompleted: boolean;
}> {
  const today = startOfToday();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Utilisateur non authentifié.');
  }

  let hunt = await db.query.dailyHunts.findFirst({
    where: eq(dailyHunts.date, today),
  });

  if (!hunt) {
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const generatedHunt = await generateTreasureHunt({ theme: randomTheme });

    const newHunt: NewDailyHunt = {
      date: today,
      htmlContent: generatedHunt.htmlContent,
      flag: generatedHunt.flag,
      hint: generatedHunt.hint,
    };
    const result = await db.insert(dailyHunts).values(newHunt).returning();
    hunt = result[0];
  }

  if (!hunt) {
    return { hunt: null, isCompleted: false };
  }

  const completion = await db.query.dailyHuntCompletions.findFirst({
    where: and(
      eq(dailyHuntCompletions.huntId, hunt.id),
      eq(dailyHuntCompletions.userId, user.id)
    ),
  });
  
  const { flag, ...huntWithoutFlag } = hunt;

  return { hunt: huntWithoutFlag, isCompleted: !!completion };
}

export async function submitHuntFlag(
  huntId: string,
  submittedFlag: string
): Promise<{ success: boolean; message: string; reward?: { xp: number; orbs: number } }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Utilisateur non authentifié.' };
  }

  const hunt = await db.query.dailyHunts.findFirst({
    where: eq(dailyHunts.id, huntId),
  });

  if (!hunt) {
    return { success: false, message: 'Chasse au trésor non trouvée.' };
  }

  if (hunt.flag.trim().toLowerCase() !== submittedFlag.trim().toLowerCase()) {
    return { success: false, message: 'Mauvais flag. Continuez à chercher !' };
  }
  
  const alreadyCompleted = await db.query.dailyHuntCompletions.findFirst({
      where: and(
          eq(dailyHuntCompletions.huntId, huntId),
          eq(dailyHuntCompletions.userId, user.id)
      )
  });
  
  if (alreadyCompleted) {
      return { success: false, message: 'Vous avez déjà terminé cette chasse aujourd\'hui.' };
  }

  // Grant rewards
  const reward = { xp: 250, orbs: 10 };
  await db.transaction(async (tx) => {
      await tx.update(users)
        .set({
          xp: (user.xp || 0) + reward.xp,
          orbs: (user.orbs || 0) + reward.orbs,
        })
        .where(eq(users.id, user.id));

      await tx.insert(dailyHuntCompletions).values({
          huntId: huntId,
          userId: user.id,
          completedAt: new Date(),
      });
  });

  revalidatePath('/treasure-hunt');
  revalidatePath('/dashboard');

  return { success: true, message: `Félicitations ! Vous avez trouvé le flag et gagné ${reward.xp} XP et ${reward.orbs} orbes !`, reward };
}
