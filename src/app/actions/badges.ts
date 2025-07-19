// This is a new file
"use server";

import { db } from "@/lib/db";
import { badges, userBadges, type Badge } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAvailableBadges(): Promise<Badge[]> {
    return await db.query.badges.findMany();
}

export async function getUserBadges(): Promise<(typeof userBadges.$inferSelect & { badge: Badge })[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    return await db.query.userBadges.findMany({
        where: eq(userBadges.userId, user.id),
        with: {
            badge: true
        }
    });
}

export async function pinBadge(badgeId: string, shouldBePinned: boolean): Promise<{ success: boolean; message: string }> {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, message: "Utilisateur non authentifié." };
    }

    // Check if user owns the badge first
    const ownership = await db.query.userBadges.findFirst({
        where: and(eq(userBadges.userId, user.id), eq(userBadges.badgeId, badgeId)),
    });

    if (!ownership) {
        return { success: false, message: "Vous ne possédez pas ce badge." };
    }
    
    // Check how many badges are already pinned
    if (shouldBePinned) {
        const pinnedCountResult = await db.select({ count: sql<number>`count(*)` }).from(userBadges).where(and(eq(userBadges.userId, user.id), eq(userBadges.pinned, true)));
        const pinnedCount = Number(pinnedCountResult[0].count);

        if (pinnedCount >= 3) {
            return { success: false, message: "Vous ne pouvez épingler que 3 badges au maximum." };
        }
    }
    
    await db.update(userBadges)
        .set({ pinned: shouldBePinned })
        .where(and(eq(userBadges.userId, user.id), eq(userBadges.badgeId, badgeId)));
        
    revalidatePath('/profile');
    revalidatePath(`/profile/${user.id}`);

    return { success: true, message: "Badge mis à jour." };
}

// NOTE: The logic for awarding badges would be more complex in a real app.
// It would likely be triggered by specific events (e.g., completing 10 quests).
// This is a placeholder for demonstration.
export async function checkAndAwardBadges(userId: string) {
    // Example: Award "First Quest" badge
    // This function would be called after a user completes their first quest.
}
