
"use server";

import { db } from "@/lib/db";
import { quests, questConnections, curriculums, type NewQuest, type Quest, type Curriculum, type NewCurriculum } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

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


// Quest Actions
export async function createQuest(data: Omit<NewQuest, 'id' | 'status'>): Promise<Quest> {
    const id = uuidv4();
    const newQuest = {
        id,
        ...data,
        status: 'draft' as const,
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

export async function updateQuest(id: string, data: Partial<Omit<NewQuest, 'id' | 'curriculumId' | 'status'>>): Promise<Quest> {
    await db.update(quests).set(data).where(eq(quests.id, id));

    revalidatePath("/admin/quests");
    revalidatePath("/quests");

    const result = await db.query.quests.findFirst({
        where: eq(quests.id, id),
    });

    if (!result) {
        throw new Error("Failed to update or find the quest after modification.");
    }

    return result;
}

export async function setQuestStatus(questId: string, status: 'draft' | 'published'): Promise<Quest> {
    await db.update(quests).set({ status }).where(eq(quests.id, questId));

    revalidatePath("/admin/quests");
    revalidatePath("/quests");

    const result = await db.query.quests.findFirst({
        where: eq(quests.id, questId),
    });

     if (!result) {
        throw new Error("Failed to update or find the quest after modification.");
    }
    
    return result;
}

export async function updateQuestPosition(questId: string, position: { top: string, left: string }) {
    await db.update(quests)
        .set({ positionTop: position.top, positionLeft: position.left })
        .where(eq(quests.id, questId));
    revalidatePath('/admin/quests');
}

export async function getQuestsByCurriculum(curriculumId: string): Promise<Quest[]> {
    return await db.query.quests.findMany({
        where: eq(quests.curriculumId, curriculumId),
    });
}


// Connection Actions
export async function getQuestConnections(curriculumId: string) {
    // This is still a bit broad, but works for now. It fetches all connections.
    // A more optimized query would join through quests to filter by curriculumId.
    return await db.query.questConnections.findMany();
}

export async function createConnection(fromId: string, toId: string) {
    await db.insert(questConnections).values({ fromId, toId });
    revalidatePath('/admin/quests');
}

export async function deleteConnection(fromId: string, toId: string) {
    await db.delete(questConnections).where(and(eq(questConnections.fromId, fromId), eq(questConnections.toId, toId)));
    revalidatePath('/admin/quests');
}
