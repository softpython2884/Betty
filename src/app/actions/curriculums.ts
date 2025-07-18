
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { curriculumAssignments, curriculums, type CurriculumAssignment, type Curriculum } from "@/lib/db/schema";
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
