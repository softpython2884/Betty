
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { curriculumAssignments, curriculums, questCompletions, type CurriculumAssignment, type Curriculum } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";

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

    try {
        await db.insert(questCompletions).values({
            userId: user.id,
            questId: questId,
            completedAt: new Date(),
        }).onConflictDoNothing();
        
        revalidatePath('/quests');
        revalidatePath(`/quests/${questId}`);

        return { success: true, message: "Quête terminée avec succès !" };
    } catch (error: any) {
        console.error("Error completing quest:", error);
        return { success: false, message: "Une erreur interne est survenue." };
    }
}
