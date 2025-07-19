
"use server";

import { db } from "@/lib/db";
import { projects, submissions, users } from "@/lib/db/schema";
import type { NewProject, Project, Submission } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { and, eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from "next/cache";

export async function submitProjectForReview(projectId: string): Promise<{ success: boolean; message: string }> {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, message: "Utilisateur non authentifié." };
    }

    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.ownerId, user.id)),
    });

    if (!project) {
        return { success: false, message: "Projet non trouvé ou non autorisé." };
    }

    if (project.status === "Submitted") {
        return { success: false, message: "Ce projet a déjà été soumis." };
    }

    try {
        await db.transaction(async (tx) => {
            // Update project status
            await tx.update(projects).set({ status: "Submitted" }).where(eq(projects.id, projectId));

            // Create submission record
            await tx.insert(submissions).values({
                id: uuidv4(),
                projectId: projectId,
                userId: user.id,
                submittedAt: new Date(),
                status: "pending",
            });
        });

        revalidatePath(`/projects/${projectId}`);
        revalidatePath('/admin/grading');
        return { success: true, message: "Projet soumis pour évaluation avec succès !" };

    } catch (error: any) {
        console.error("Error submitting project:", error);
        return { success: false, message: "Une erreur interne est survenue." };
    }
}

export type PendingSubmission = (Submission & {
    project: Pick<Project, 'id' | 'title'>;
    user: Pick<User, 'id' | 'name'>;
});

export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
    const user = await getCurrentUser();
    if (!user || user.role === 'student') {
        return [];
    }

    const result = await db.query.submissions.findMany({
        where: eq(submissions.status, 'pending'),
        with: {
            project: {
                columns: {
                    id: true,
                    title: true,
                }
            },
            user: {
                columns: {
                    id: true,
                    name: true,
                }
            }
        },
        orderBy: desc(submissions.submittedAt),
    });

    return result as PendingSubmission[];
}
