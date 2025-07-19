
"use server";

import { db } from "@/lib/db";
import { tasks, type Task, type NewTask } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

export async function getTasksByProject(projectId: string): Promise<Task[]> {
    return await db.query.tasks.findMany({
        where: eq(tasks.projectId, projectId),
        orderBy: (tasks, { asc }) => [asc(tasks.order)],
    });
}

export async function createTask(
    projectId: string, 
    title: string
): Promise<Task> {
    const id = uuidv4();

    // Get the max order value for the current status and add 1
    const maxOrderResult = await db.select({ value: sql<number>`max("order")` }).from(tasks).where(and(eq(tasks.projectId, projectId), eq(tasks.status, 'backlog')));
    const newOrder = (maxOrderResult[0].value || 0) + 1;

    const newTask: NewTask = {
        id,
        title,
        projectId,
        status: 'backlog',
        order: newOrder,
        createdAt: new Date(),
    };
    
    await db.insert(tasks).values(newTask);
    revalidatePath(`/projects/${projectId}`);
    
    const result = await db.query.tasks.findFirst({ where: eq(tasks.id, id) });
    if (!result) throw new Error("Failed to create task");
    
    return result;
}

export async function updateTaskStatusAndOrder(
    taskId: string,
    projectId: string,
    newStatus: 'backlog' | 'sprint' | 'review' | 'completed',
    newOrder: number
): Promise<{ success: boolean }> {
    try {
        await db.update(tasks)
            .set({ status: newStatus, order: newOrder })
            .where(eq(tasks.id, taskId));

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update task status and order:", error);
        return { success: false };
    }
}

export async function updateTaskUrgency(
    taskId: string,
    projectId: string,
    urgency: 'normal' | 'important' | 'urgent'
): Promise<{ success: boolean }> {
    await db.update(tasks)
        .set({ urgency })
        .where(eq(tasks.id, taskId));
    
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

    
