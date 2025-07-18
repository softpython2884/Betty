
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { curriculumAssignments, type CurriculumAssignment } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function getCurriculumAssignments(curriculumId: string): Promise<CurriculumAssignment[]> {
    return db.query.curriculumAssignments.findMany({
        where: eq(curriculumAssignments.curriculumId, curriculumId),
    });
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
