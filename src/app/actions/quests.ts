
"use server";

import { db } from "@/lib/db";
import { quests, questConnections, type NewQuest, type Quest } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

export async function createQuest(data: Omit<NewQuest, 'id' | 'createdAt'>): Promise<Quest> {
    const id = uuidv4();
    const newQuest = {
        id,
        ...data
    };

    await db.insert(quests).values(newQuest);

    revalidatePath("/admin/quests");
    revalidatePath("/quests");
    
    // We need to query it back to get the full object, since insert doesn't return it with all drivers
    const result = await db.query.quests.findFirst({
        where: eq(quests.id, id),
    });

    if (!result) {
        throw new Error("Failed to create or find the quest after insertion.");
    }

    return result;
}

export async function getQuestsByCurriculum(curriculum: string): Promise<Quest[]> {
    return await db.query.quests.findMany({
        where: eq(quests.curriculum, curriculum),
    });
}

export async function getQuestConnections(curriculum: string) {
    // This is a bit more complex. We'll get all connections for now.
    // A better implementation would join tables to filter by curriculum.
    return await db.query.questConnections.findMany();
}
