
"use server";

import { db } from "@/lib/db";
import { quests, curriculums, questConnections, projects as projectsTable, type NewQuest, type Quest, type Curriculum, type NewCurriculum, users, type Project, type NewProject, questCompletions } from "@/lib/db/schema";
import { and, eq, inArray, or, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { addMemberToFlowUpProject, createFlowUpProject, listFlowUpProjectMembers } from "@/lib/flowup";
import { getCurrentUser } from "@/lib/session";

// Curriculum Actions
export async function createCurriculum(data: Omit<NewCurriculum, 'id' | 'createdAt'>): Promise<Curriculum> {
    const id = uuidv4();
    const newCurriculum = { 
        id,
        ...data,
        createdAt: new Date(),
    };
    await db.insert(curriculums).values(newCurriculum);
    revalidatePath("/admin/quests");
    const result = await db.query.curriculums.findFirst({ where: eq(curriculums.id, id) });
    if (!result) throw new Error("Failed to create curriculum.");
    return result;
}

export async function updateCurriculum(id: string, data: Partial<Omit<NewCurriculum, 'id' | 'createdAt' | 'createdBy'>>): Promise<Curriculum> {
    await db.update(curriculums).set(data).where(eq(curriculums.id, id));
    revalidatePath("/admin/quests");
    const result = await db.query.curriculums.findFirst({ where: eq(curriculums.id, id) });
    if (!result) throw new Error("Failed to update curriculum.");
    return result;
}

export async function getCurriculums(): Promise<Curriculum[]> {
    return await db.query.curriculums.findMany();
}

export async function deleteCurriculum(id: string): Promise<{ success: boolean; message: string }> {
    try {
        await db.transaction(async (tx) => {
            const questsToDelete = await tx.select({ id: quests.id }).from(quests).where(eq(quests.curriculumId, id));
            const questIdsToDelete = questsToDelete.map(q => q.id);

            if (questIdsToDelete.length > 0) {
                await tx.delete(questConnections).where(or(
                    inArray(questConnections.fromId, questIdsToDelete),
                    inArray(questConnections.toId, questIdsToDelete)
                ));
                await tx.delete(quests).where(inArray(quests.id, questIdsToDelete));
            }
            
            await tx.delete(curriculums).where(eq(curriculums.id, id));
        });

        revalidatePath('/admin/quests');
        return { success: true, message: "Cursus supprimé avec succès." };
    } catch (error: any) {
        console.error("Error deleting curriculum:", error);
        return { success: false, message: "Une erreur interne est survenue." };
    }
}


// Quest Actions
export async function createQuest(data: Omit<NewQuest, 'id'>): Promise<Quest> {
    const id = uuidv4();
    const newQuest = {
        id,
        ...data,
    };

    await db.insert(quests).values(newQuest);

    revalidatePath("/admin/quests");
    revalidatePath("/quests");
    
    const result = await db.query.quests.findFirst({
        where: eq(quests.id, id),
    });

    if (!result) {
        throw new Error("Failed to create or find the quest after insertion.");
    }

    return result;
}

export async function updateQuest(id: string, data: Partial<Omit<NewQuest, 'id' | 'curriculumId'>>): Promise<Quest> {
    await db.update(quests).set(data).where(eq(quests.id, id));

    revalidatePath("/admin/quests");
    revalidatePath("/quests");
    revalidatePath(`/quests/${id}`);

    const result = await db.query.quests.findFirst({
        where: eq(quests.id, id),
    });

    if (!result) {
        throw new Error("Failed to update or find the quest after modification.");
    }

    return result;
}

export async function deleteQuest(id: string): Promise<{ success: boolean; message: string }> {
     try {
        await db.transaction(async (tx) => {
            // Delete connections where this quest is either a source or a destination
            await tx.delete(questConnections).where(or(
                eq(questConnections.fromId, id),
                eq(questConnections.toId, id)
            ));
            
            // Delete the quest itself
            await tx.delete(quests).where(eq(quests.id, id));
        });

        revalidatePath('/admin/quests');
        revalidatePath('/quests');
        return { success: true, message: "Quête supprimée avec succès." };
    } catch (error: any) {
        console.error("Error deleting quest:", error);
        return { success: false, message: "Une erreur interne est survenue." };
    }
}

export async function getQuestById(questId: string) {
    return await db.query.quests.findFirst({
        where: eq(quests.id, questId),
        with: {
            resources: {
                with: {
                    resource: true
                }
            },
            project: true,
            curriculum: true,
        }
    });
}

// Project Actions
export async function getProjectById(projectId: string) {
    const user = await getCurrentUser();
    if (!user) {
        return null;
    }

    // Admins can see any project
    if (user.role === 'admin') {
        return await db.query.projects.findFirst({
            where: eq(projectsTable.id, projectId),
            with: { curriculum: { columns: { name: true } } },
        });
    }

    // Regular users can only see their own projects
    const project = await db.query.projects.findFirst({
        where: and(
            eq(projectsTable.id, projectId),
            eq(projectsTable.ownerId, user.id) // Basic security check
        ),
         with: {
            curriculum: {
                columns: {
                    name: true,
                },
            },
        },
    });
    return project;
}

export async function getOrCreateQuestProject(questId: string, questTitle: string, curriculumId: string, curriculumName: string) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    // 1. Check if a project for this CURRICULUM already exists for this user
    let project = await db.query.projects.findFirst({
        where: and(
            eq(projectsTable.curriculumId, curriculumId), 
            eq(projectsTable.ownerId, user.id)
        ),
    });

    if (project) {
        return project;
    }

    // 2. If not, create one in FlowUp
    const projectTitle = `${user.name} - ${curriculumName}`;
    const projectDescription = `Projet pour le cursus ${curriculumName} de l'utilisateur ${user.name}.`;
    
    const flowUpProject = await createFlowUpProject(projectTitle, projectDescription);

    if (!flowUpProject || !flowUpProject.uuid) {
        throw new Error("Failed to create project in FlowUp.");
    }
    
    // 3. Save the new project in our local DB
    const newProject: NewProject = {
        id: flowUpProject.uuid, // Use the UUID from FlowUp as our primary key
        title: flowUpProject.name,
        status: "In Progress",
        isQuestProject: true,
        questId: null, // A curriculum project isn't tied to one quest initially
        curriculumId: curriculumId, // Link to the curriculum
        ownerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await db.insert(projectsTable).values(newProject);
    
    // Return the newly created project from our DB
    project = await db.query.projects.findFirst({
        where: eq(projectsTable.id, newProject.id),
    });
    
    if (!project) {
        throw new Error("Failed to retrieve the project after creation.");
    }

    return project;
}


export async function updateQuestPosition(questId: string, position: { top: string, left: string }) {
    await db.update(quests)
        .set({ positionTop: position.top, positionLeft: position.left })
        .where(eq(quests.id, questId));
    revalidatePath('/admin/quests');
}

export async function getQuestsByCurriculum(curriculumId: string): Promise<Quest[]> {
    if (!curriculumId) return [];
    return await db.query.quests.findMany({
        where: eq(quests.curriculumId, curriculumId),
    });
}

// Quest Connection Actions
export async function getQuestConnections(curriculumId: string) {
    // This is a bit complex. We want all connections where BOTH quests belong to the curriculum.
    const curriculumQuests = await db.select({ id: quests.id }).from(quests).where(eq(quests.curriculumId, curriculumId));
    if (curriculumQuests.length === 0) return [];
    
    const questIds = curriculumQuests.map(q => q.id);

    return await db.query.questConnections.findMany({
        where: and(
            inArray(questConnections.fromId, questIds),
            inArray(questConnections.toId, questIds)
        ),
    });
}

export async function createConnection(fromId: string, toId: string) {
    // Prevent self-connection and duplicate connections
    if (fromId === toId) return;
    const existing = await db.query.questConnections.findFirst({
        where: and(eq(questConnections.fromId, fromId), eq(questConnections.toId, toId))
    });
    if (existing) return;

    await db.insert(questConnections).values({ fromId, toId }).onConflictDoNothing();
    revalidatePath('/admin/quests');
}

export async function deleteConnection(fromId: string, toId: string) {
    await db.delete(questConnections).where(
        and(
            eq(questConnections.fromId, fromId),
            eq(questConnections.toId, toId)
        )
    );
    revalidatePath('/admin/quests');
}

// Project Actions
export async function createPersonalProject(title: string, description: string) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const flowUpProject = await createFlowUpProject(title, description);
    
    if (!flowUpProject || !flowUpProject.uuid) {
        throw new Error("Failed to create project in FlowUp or API response is invalid.");
    }
    
    const newProject: NewProject = {
        id: flowUpProject.uuid,
        title: flowUpProject.name,
        status: "Active",
        isQuestProject: false,
        ownerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        questId: null,
        curriculumId: null, // Personal projects are not tied to a curriculum
    };

    await db.insert(projectsTable).values(newProject);
    revalidatePath('/projects');
    return newProject;
}

export async function getProjectsForCurrentUser(): Promise<Project[]> {
    const user = await getCurrentUser();
    if (!user) {
        return [];
    }

    if (user.role === 'admin') {
        // Admin sees all projects
        return await db.query.projects.findMany({
             with: {
                curriculum: { columns: { name: true } },
            },
            orderBy: (projects, { desc }) => [desc(projects.createdAt)],
        });
    }

    return await db.query.projects.findMany({
        where: eq(projectsTable.ownerId, user.id),
        with: {
            curriculum: {
                columns: {
                    name: true,
                },
            },
        },
        orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });
}

export async function getProjectMembers(projectUuid: string): Promise<any[]> {
    const members = await listFlowUpProjectMembers(projectUuid);
    return members || [];
}

export async function addMemberToProject(projectUuid: string, emailToInvite: string) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const project = await db.query.projects.findFirst({ where: eq(projectsTable.id, projectUuid) });
    // Admin can add members to any project, owners can add to their own.
    if (!project || (project.ownerId !== user.id && user.role !== 'admin')) {
        throw new Error("Unauthorized or project not found");
    }
    
    const invitedUser = await db.query.users.findFirst({ where: eq(users.email, emailToInvite) });
    if (!invitedUser) {
        throw new Error("User to invite not found in the platform.");
    }
    
    await addMemberToFlowUpProject(projectUuid, emailToInvite);

    revalidatePath(`/projects/${projectUuid}`);
    return { success: true, message: "Member invited to FlowUp project." };
}

export async function getQuestLeaderboard(questId: string) {
    return await db.query.questCompletions.findMany({
        where: eq(questCompletions.questId, questId),
        with: {
            user: {
                columns: {
                    id: true,
                    name: true,
                }
            }
        },
        orderBy: [asc(questCompletions.completedAt)],
        limit: 10,
    });
}
    
