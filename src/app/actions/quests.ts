
"use server";

import { db } from "@/lib/db";
import { quests, questConnections, curriculums, type NewQuest, type Quest, type Curriculum, type NewCurriculum } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

// Curriculum Actions
export async function createCurriculum(data: Omit<NewCurriculum, 'id' | 'createdAt' | 'createdBy'>, createdBy: string): Promise<Curriculum> {
    const id = uuidv4();
    const newCurriculum = { 
        id,
        ...data,
        createdBy,
        createdAt: new Date(),
    };
    await db.insert(curriculums).values(newCurriculum);
    revalidatePath("/admin/quests");
    const result = await db.query.curriculums.findFirst({ where: eq(curriculums.id, id) });
    if (!result) throw new Error("Failed to create curriculum.");
    return result;
}

export async function getCurriculums(): Promise<Curriculum[]> {
    return await db.query.curriculums.findMany();
}


// Quest Actions
export async function createQuest(data: Omit<NewQuest, 'id' | 'createdAt'>): Promise<Quest> {
    const id = uuidv4();
    const newQuest = {
        id,
        ...data
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

export async function getQuestsByCurriculum(curriculumId: string): Promise<Quest[]> {
    return await db.query.quests.findMany({
        where: eq(quests.curriculumId, curriculumId),
    });
}

export async function getQuestConnections(curriculumId: string) {
    // This is a bit more complex. We'll get all connections for now.
    // A better implementation would join tables to filter by curriculum.
    return await db.query.questConnections.findMany();
}
