
"use server";

import { db } from "@/lib/db";
import { events, type Event, type NewEvent } from "@/lib/db/schema";
import { and, eq, or, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { getProjectsForCurrentUser } from "./quests";

export async function getEvents(): Promise<Event[]> {
    const user = await getCurrentUser();
    if (!user) {
        return [];
    }
    
    // Admins see all events
    if (user.role === 'admin') {
        return db.query.events.findMany();
    }
    
    // Students and professors see their personal events, global events,
    // and team events for projects they are a part of.
    const userProjects = await getProjectsForCurrentUser();
    const userProjectIds = userProjects.map(p => p.id);

    return await db.query.events.findMany({
        where: or(
            eq(events.type, 'global'),
            eq(events.userId, user.id),
            userProjectIds.length > 0 ? inArray(events.projectId, userProjectIds) : undefined
        )
    });
}

export async function createEvent(data: Omit<NewEvent, 'id' | 'createdAt' | 'authorId'>): Promise<Event> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated.");
    }
    
    // Authorization check
    if (data.type === 'global' && user.role !== 'admin') {
        throw new Error("Only admins can create global events.");
    }
    if (data.type === 'team' && user.role === 'student') {
        // A more robust check would verify if the user is a manager of the project
        throw new Error("Students cannot create team events.");
    }
    if (data.type === 'personal' && data.userId !== user.id) {
         throw new Error("You can only create personal events for yourself.");
    }


    const newEvent: NewEvent = {
        id: uuidv4(),
        ...data,
        authorId: user.id,
        createdAt: new Date(),
    };

    await db.insert(events).values(newEvent);
    revalidatePath('/agenda');

    const result = await db.query.events.findFirst({ where: eq(events.id, newEvent.id) });
    if (!result) throw new Error("Failed to create event");
    return result;
}

export async function updateEvent(id: string, data: Partial<Omit<NewEvent, 'id' | 'createdAt' | 'authorId'>>): Promise<Event> {
     const user = await getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated.");
    }

    const existingEvent = await db.query.events.findFirst({ where: eq(events.id, id) });
    if (!existingEvent) {
        throw new Error("Event not found.");
    }

    // Authorization check
    if (user.role !== 'admin' && existingEvent.authorId !== user.id) {
         throw new Error("You are not authorized to update this event.");
    }
    
    await db.update(events).set(data).where(eq(events.id, id));
    revalidatePath('/agenda');

    const result = await db.query.events.findFirst({ where: eq(events.id, id) });
    if (!result) throw new Error("Failed to update event");
    return result;
}

export async function deleteEvent(id: string): Promise<{ success: boolean }> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated.");
    }
    const existingEvent = await db.query.events.findFirst({ where: eq(events.id, id) });
    if (!existingEvent) {
        throw new Error("Event not found.");
    }

    // Authorization check
    if (user.role !== 'admin' && existingEvent.authorId !== user.id) {
         throw new Error("You are not authorized to delete this event.");
    }

    await db.delete(events).where(eq(events.id, id));
    revalidatePath('/agenda');
    return { success: true };
}
