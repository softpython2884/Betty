
"use server";

import { db } from "@/lib/db";
import { projects, submissions, users, documents } from "@/lib/db/schema";
import type { NewProject, Project, Submission, User } from "@/lib/db/schema";
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

    if (project.status === "Submitted" || project.status === "Completed") {
        return { success: false, message: "Ce projet a déjà été soumis ou complété." };
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


export type SubmissionDetails = Submission & {
  project: Project & {
    curriculum: {
      name: string;
      quests: {
        id: string;
        title: string;
        description: string | null;
      }[];
    } | null;
    documents: {
        id: string;
        title: string;
        content: string | null;
    }[];
  };
  user: Pick<User, 'id' | 'name' | 'email'>;
};

export async function getSubmissionById(submissionId: string): Promise<SubmissionDetails | null> {
    const user = await getCurrentUser();
    if (!user || user.role === 'student') return null;

    const result = await db.query.submissions.findFirst({
        where: eq(submissions.id, submissionId),
        with: {
            user: { columns: { id: true, name: true, email: true } },
            project: {
                with: {
                    curriculum: {
                        with: {
                            quests: {
                                columns: { id: true, title: true, description: true }
                            }
                        }
                    },
                    documents: {
                        columns: { id: true, title: true, content: true }
                    }
                }
            }
        }
    });

    return result as SubmissionDetails || null;
}

export async function gradeSubmission(
    submissionId: string,
    grade: number,
    feedback: string
): Promise<{ success: boolean; message: string }> {
    const grader = await getCurrentUser();
    if (!grader || grader.role === 'student') {
        return { success: false, message: "Non autorisé." };
    }

    const submission = await db.query.submissions.findFirst({
        where: eq(submissions.id, submissionId)
    });

    if (!submission) {
        return { success: false, message: "Soumission non trouvée." };
    }
    
    try {
        await db.transaction(async (tx) => {
            // Update the submission record
            await tx.update(submissions).set({
                status: 'graded',
                grade: grade,
                feedback: feedback,
                gradedBy: grader.id,
                gradedAt: new Date(),
            }).where(eq(submissions.id, submissionId));

            // Update the project status
            await tx.update(projects).set({
                status: 'Completed' // Or another status based on grade
            }).where(eq(projects.id, submission.projectId));
            
            // Here, you would typically also award XP/Orbs to the user
            // and trigger badge checks based on the grade.
        });

        revalidatePath('/admin/grading');
        revalidatePath(`/admin/grading/${submissionId}`);

        return { success: true, message: "Évaluation enregistrée avec succès." };

    } catch(error: any) {
        console.error("Error grading submission:", error);
        return { success: false, message: "Une erreur interne est survenue." };
    }
}
