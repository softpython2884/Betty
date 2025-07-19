
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { curriculumAssignments, curriculums, questCompletions, quests, users, type CurriculumAssignment, type Curriculum } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";
import { checkAndAwardBadges } from "./badges";
import { getTitleForLevel } from "@/lib/levels";

export async function getCurriculumAssignments(curriculumId: string): Promise<CurriculumAssignment[]> {
    return db.query.curriculumAssignments.findMany({
        where: eq(curriculumAssignments.curriculumId, curriculumId),
    });
}

export async function getAssignedCurriculumsForUser(): Promise<Curriculum[]> {
    const user = await getCurrentUser();
    if (!user) {
        return [];
    }

    const assignments = await db.query.curriculumAssignments.findMany({
        where: eq(curriculumAssignments.userId, user.id),
        with: {
            curriculum: true,
        },
    });
    
    // Filter out assignments where the curriculum might be null or undefined
    // And then map to the curriculum object.
    return assignments
        .filter(a => !!a.curriculum)
        .map(a => a.curriculum as Curriculum);
}

export async function updateCurriculumAssignment(
    curriculumId: string,
    userId: string,
    isAssigned: boolean
): Promise<{ success: boolean; message: string }> {
    try {
        if (isAssigned) {
            // Add assignment
            await db.insert(curriculumAssignments).values({ curriculumId, userId }).onConflictDoNothing();
        } else {
            // Remove assignment
            await db.delete(curriculumAssignments).where(
                and(
                    eq(curriculumAssignments.curriculumId, curriculumId),
                    eq(curriculumAssignments.userId, userId)
                )
            );
        }
        revalidatePath('/admin/quests');
        return { success: true, message: 'Assignment updated successfully.' };
    } catch (error: any) {
        console.error("Error updating assignment:", error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}

export async function getCompletedQuestsForCurrentUser(): Promise<Set<string>> {
    const user = await getCurrentUser();
    if (!user) {
        return new Set();
    }
    const completions = await db.query.questCompletions.findMany({
        where: eq(questCompletions.userId, user.id),
    });
    return new Set(completions.map(c => c.questId));
}

export async function completeQuestForCurrentUser(questId: string): Promise<{ success: boolean; message: string }> {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, message: "Utilisateur non authentifié." };
    }

    // --- Read operations outside the transaction ---
    const existingCompletion = await db.query.questCompletions.findFirst({
        where: and(eq(questCompletions.userId, user.id), eq(questCompletions.questId, questId))
    });

    if (existingCompletion) {
        // Quest already completed, do nothing further.
        return { success: true, message: "Quête déjà terminée." };
    }

    const quest = await db.query.quests.findFirst({
        where: eq(quests.id, questId),
        columns: { xp: true, orbs: true }
    });

    if (!quest) {
        return { success: false, message: "Quête non trouvée." };
    }

    // --- Calculations outside the transaction ---
    let currentUserLevel = user.level || 1;
    let currentUserXp = user.xp || 0;
    let currentUserOrbs = user.orbs || 0;

    currentUserXp += quest.xp;
    currentUserOrbs += quest.orbs || 0;

    let xpForNextLevel = currentUserLevel * 1000;
    let newTitle = user.title;
    let hasLeveledUp = false;

    while (currentUserXp >= xpForNextLevel) {
        currentUserLevel += 1;
        currentUserXp -= xpForNextLevel;
        xpForNextLevel = currentUserLevel * 1000;
        hasLeveledUp = true;
    }

    if (hasLeveledUp) {
        newTitle = getTitleForLevel(currentUserLevel);
    }
    
    // --- Write operations inside the transaction ---
    try {
        db.transaction((tx) => {
            // 1. Mark quest as completed
            tx.insert(questCompletions).values({
                userId: user.id,
                questId: questId,
                completedAt: new Date(),
            }).run();
            
            // 2. Update user stats
            tx.update(users).set({
                level: currentUserLevel,
                xp: currentUserXp,
                orbs: currentUserOrbs,
                title: newTitle,
            }).where(eq(users.id, user.id)).run();
        });
        
    } catch (error: any) {
        console.error("Error completing quest transaction:", error);
        return { success: false, message: "Une erreur interne est survenue lors de la sauvegarde." };
    }
    
    // --- Post-transaction logic ---
    await checkAndAwardBadges(user.id);
    
    revalidatePath('/quests');
    revalidatePath(`/quests/${questId}`);
    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return { success: true, message: "Quête terminée avec succès !" };
}
