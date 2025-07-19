
"use server";

import { db } from "@/lib/db";
import { quests, curriculums, questConnections, projects as projectsTable, type NewQuest, type Quest, type Curriculum, type NewCurriculum, users } from "@/lib/db/schema";
import { and, eq, inArray, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { addMemberToFlowUpProject, createFlowUpProject } from "@/lib/flowup";
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
        // If the project exists but is not linked to this quest, link it.
        // This part might need adjustment if a curriculum project should not be quest-specific.
        // For now, we'll just return the existing curriculum project.
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
    const newProject = {
        id: flowUpProject.uuid, // Use the UUID from FlowUp as our primary key
        title: flowUpProject.name,
        status: "In Progress",
        isQuestProject: true,
        questId: null, // A curriculum project isn't tied to one quest initially
        curriculumId: curriculumId, // Link to the curriculum
        ownerId: user.id,
        createdAt: new Date(),
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
    
    const newProject = {
        id: flowUpProject.uuid,
        title: flowUpProject.name,
        status: "Active",
        isQuestProject: false,
        ownerId: user.id,
        createdAt: new Date(),
        curriculumId: null, // Explicitly set to null
        questId: null,
    };

    await db.insert(projectsTable).values(newProject);
    revalidatePath('/projects');
    return newProject;
}

export async function addMemberToProject(projectUuid: string, emailToInvite: string) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const project = await db.query.projects.findFirst({ where: eq(projectsTable.id, projectUuid) });
    if (!project || project.ownerId !== user.id) {
        throw new Error("Unauthorized or project not found");
    }
    
    // You might want to check if the invited user exists in your local DB
    const invitedUser = await db.query.users.findFirst({ where: eq(users.email, emailToInvite) });
    if (!invitedUser) {
        throw new Error("User to invite not found in the platform.");
    }
    
    // Add member in FlowUp
    await addMemberToFlowUpProject(projectUuid, emailToInvite);

    revalidatePath(`/projects/${projectUuid}`);
    return { success: true, message: "Member invited to FlowUp project." };
}
