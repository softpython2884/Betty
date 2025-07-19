
'use server';

import { db } from '@/lib/db';
import {
  users,
  cosmetics,
  userCosmetics,
  type Cosmetic,
  UserCosmetic,
} from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/session';
import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function getCosmetics() {
  return await db.query.cosmetics.findMany();
}

export async function getMyCosmetics(): Promise<UserCosmetic[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }
  return await db.query.userCosmetics.findMany({
    where: eq(userCosmetics.userId, user.id),
    with: {
      cosmetic: true,
    },
  });
}

export async function purchaseCosmetic(cosmeticId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Utilisateur non authentifié.' };
  }

  const cosmeticToPurchase = await db.query.cosmetics.findFirst({
    where: eq(cosmetics.id, cosmeticId),
  });

  if (!cosmeticToPurchase) {
    return { success: false, message: 'Cosmétique non trouvé.' };
  }

  if ((user.orbs || 0) < cosmeticToPurchase.price) {
    return { success: false, message: "Vous n'avez pas assez d'orbes." };
  }

  const alreadyOwned = await db.query.userCosmetics.findFirst({
    where: and(
      eq(userCosmetics.userId, user.id),
      eq(userCosmetics.cosmeticId, cosmeticId)
    ),
  });

  if (alreadyOwned) {
    return { success: false, message: 'Vous possédez déjà ce cosmétique.' };
  }

  try {
    await db.transaction(async (tx) => {
      // Deduct orbs
      await tx
        .update(users)
        .set({ orbs: (user.orbs || 0) - cosmeticToPurchase.price })
        .where(eq(users.id, user.id));

      // Grant cosmetic
      await tx.insert(userCosmetics).values({
        id: uuidv4(),
        userId: user.id,
        cosmeticId: cosmeticId,
        equipped: cosmeticToPurchase.type === 'title_style', // auto-equip title styles
      });
    });

    revalidatePath('/shop');
    revalidatePath('/profile');
    revalidatePath('/dashboard'); // Orbs are shown in sidebar potentially

    return { success: true, message: 'Achat réussi !' };
  } catch (error) {
    console.error('Purchase error:', error);
    return {
      success: false,
      message: 'Une erreur est survenue lors de l’achat.',
    };
  }
}

export async function equipCosmetic(
  cosmeticId: string
): Promise<{ success: boolean; message: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Utilisateur non authentifié.' };
  }

  const cosmeticToEquip = await db.query.cosmetics.findFirst({
    where: eq(cosmetics.id, cosmeticId),
  });
  if (!cosmeticToEquip) {
    return { success: false, message: 'Cosmétique non trouvé.' };
  }

  try {
    await db.transaction(async (tx) => {
      // Unequip all other cosmetics of the same type
      const otherCosmetics = await tx.query.cosmetics.findMany({
        where: eq(cosmetics.type, cosmeticToEquip.type),
      });
      const otherCosmeticIds = otherCosmetics.map((c) => c.id);

      if (otherCosmeticIds.length > 0) {
        await tx
          .update(userCosmetics)
          .set({ equipped: false })
          .where(
            and(
              eq(userCosmetics.userId, user.id),
              inArray(userCosmetics.cosmeticId, otherCosmeticIds)
            )
          );
      }

      // Equip the new one
      await tx
        .update(userCosmetics)
        .set({ equipped: true })
        .where(
          and(
            eq(userCosmetics.userId, user.id),
            eq(userCosmetics.cosmeticId, cosmeticId)
          )
        );
    });

    revalidatePath('/profile');
    revalidatePath(`/profile/${user.id}`);
    revalidatePath('/dashboard');
    return { success: true, message: 'Cosmétique équipé !' };
  } catch (error) {
    console.error('Equip error:', error);
    return {
      success: false,
      message: 'Une erreur est survenue lors de l’équipement.',
    };
  }
}
