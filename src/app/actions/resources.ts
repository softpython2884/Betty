
"use server";

import { db } from "@/lib/db";
import { resources, questResources, documents, type Resource, type NewResource, type Document, type NewDocument } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

// Global Resources
export async function createResource(data: Omit<NewResource, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>): Promise<Resource> {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const id = uuidv4();
    const newResource = {
        id,
        ...data,
        authorId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.insert(resources).values(newResource);
    revalidatePath("/admin/resources");
    revalidatePath("/resources");
    
    const result = await db.query.resources.findFirst({ where: eq(resources.id, id) });
    if (!result) throw new Error("Failed to create resource");
    return result;
}

export async function updateResource(id: string, data: Partial<Omit<NewResource, 'id' | 'authorId' | 'createdAt'>>): Promise<Resource> {
    const valuesToUpdate = { ...data, updatedAt: new Date() };
    await db.update(resources).set(valuesToUpdate).where(eq(resources.id, id));
    revalidatePath("/admin/resources");
    revalidatePath("/resources");
    revalidatePath(`/resources/${id}`);

    const result = await db.query.resources.findFirst({ where: eq(resources.id, id) });
    if (!result) throw new Error("Failed to update resource");
    return result;
}

export async function deleteResource(id: string): Promise<{ success: boolean }> {
    await db.transaction(async (tx) => {
        await tx.delete(questResources).where(eq(questResources.resourceId, id));
        await tx.delete(resources).where(eq(resources.id, id));
    });
    revalidatePath("/admin/resources");
    revalidatePath("/resources");
    return { success: true };
}

export async function getResources(): Promise<Resource[]> {
    return await db.query.resources.findMany({
        with: {
            author: {
                columns: {
                    name: true,
                }
            },
            quests: {
                with: {
                    quest: {
                        columns: { title: true }
                    }
                }
            }
        },
        orderBy: (resources, { desc }) => [desc(resources.createdAt)]
    });
}

export async function getResourceById(id: string) {
    return await db.query.resources.findFirst({
        where: eq(resources.id, id),
        with: {
            author: { columns: { name: true } },
            quests: { with: { quest: { columns: { id: true, title: true } } } }
        }
    });
}

export async function linkResourceToQuest(resourceId: string, questId: string | null): Promise<{ success: boolean }> {
    await db.delete(questResources).where(eq(questResources.resourceId, resourceId));
    if (questId) {
        await db.insert(questResources).values({ resourceId, questId });
    }
    revalidatePath("/admin/resources");
    return { success: true };
}


// Project-specific Documents
export async function getDocumentsForProject(projectId: string): Promise<Document[]> {
    return await db.query.documents.findMany({
        where: eq(documents.projectId, projectId),
        orderBy: (documents, { desc }) => [desc(documents.createdAt)]
    });
}

export async function createDocument(projectId: string, title: string, content: string): Promise<Document> {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const newDoc: NewDocument = {
        id: uuidv4(),
        projectId,
        title,
        content,
        authorId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await db.insert(documents).values(newDoc);
    revalidatePath(`/projects/${projectId}`);
    
    const result = await db.query.documents.findFirst({ where: eq(documents.id, newDoc.id) });
    if (!result) throw new Error("Failed to create document");
    return result;
}

export async function updateDocument(id: string, data: Partial<Omit<NewDocument, 'id' | 'authorId' | 'createdAt'>>): Promise<Document> {
    const valuesToUpdate = { ...data, updatedAt: new Date() };
    await db.update(documents).set(valuesToUpdate).where(eq(documents.id, id));
    
    if (data.projectId) {
        revalidatePath(`/projects/${data.projectId}`);
    }

    const result = await db.query.documents.findFirst({ where: eq(documents.id, id) });
    if (!result) throw new Error("Failed to update document");
    return result;
}

    
