
"use server";

import { db } from "@/lib/db";
import { badges, userBadges, type Badge, questCompletions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { and, eq, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { useToast } from "@/hooks/use-toast";

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

// This function is called after a user completes a significant action (e.g., a quest)
// to check if they've earned any new badges.
export async function checkAndAwardBadges(userId: string) {
    try {
        const userOwnedBadges = await db.query.userBadges.findMany({
            where: eq(userBadges.userId, userId),
            columns: { badgeId: true }
        });
        const ownedBadgeIds = new Set(userOwnedBadges.map(b => b.badgeId));
        
        // --- Badge Logic ---
        const badgesToAward: {id: string, name: string}[] = [];

        // 1. "First Quest" Badge
        if (!ownedBadgeIds.has('first-quest')) {
            const questCountResult = await db.select({ count: sql<number>`count(*)` }).from(questCompletions).where(eq(questCompletions.userId, userId));
            const questCount = Number(questCountResult[0].count);
            
            if (questCount >= 1) {
                badgesToAward.push({ id: 'first-quest', name: 'Première Quête' });
            }
        }
        
        // 2. "Quest Master" Badge
        if (!ownedBadgeIds.has('quest-master')) {
             const questCountResult = await db.select({ count: sql<number>`count(*)` }).from(questCompletions).where(eq(questCompletions.userId, userId));
             const questCount = Number(questCountResult[0].count);

             if (questCount >= 25) {
                 badgesToAward.push({ id: 'quest-master', name: 'Maître des Quêtes' });
             }
        }

        // --- Awarding ---
        if (badgesToAward.length > 0) {
            await db.insert(userBadges).values(badgesToAward.map(badge => ({
                id: crypto.randomUUID(),
                userId: userId,
                badgeId: badge.id,
                achievedAt: new Date(),
            })));

            // Revalidate paths to show new badges
            revalidatePath('/profile');
            revalidatePath(`/profile/${userId}`);
            
            // This is a server action, so we can't directly call useToast.
            // This is a limitation we'll accept for now. A more complex solution
            // would involve a websocket or notification system.
            console.log(`Awarded badges to user ${userId}:`, badgesToAward.map(b => b.name).join(', '));
        }

    } catch (error) {
        console.error(`Failed to check/award badges for user ${userId}:`, error);
    }
}
