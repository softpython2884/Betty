
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { announcements, type Announcement, type NewAnnouncement } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser } from "@/lib/session";

export async function createAnnouncement(data: { title: string; message: string; }): Promise<Announcement> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error("Unauthorized");
    }

    try {
        const newAnnouncement: NewAnnouncement = await db.transaction(async (tx) => {
            // Deactivate all previous announcements
            await tx.update(announcements).set({ isActive: false }).where(eq(announcements.isActive, true));

            // Insert the new announcement
            const newAnn: NewAnnouncement = {
                id: uuidv4(),
                title: data.title,
                message: data.message,
                authorId: user.id,
                createdAt: new Date(),
                isActive: true,
            };
            await tx.insert(announcements).values(newAnn);

            return newAnn;
        });

        revalidatePath('/dashboard');
        revalidatePath('/admin/settings');
        
        return newAnnouncement as Announcement;

    } catch (error) {
        console.error("Error creating announcement:", error);
        throw new Error("Failed to create announcement.");
    }
}

export async function getActiveAnnouncement(): Promise<Announcement | null> {
    const result = await db.query.announcements.findFirst({
        where: eq(announcements.isActive, true),
        orderBy: (announcements, { desc }) => [desc(announcements.createdAt)],
    });
    return result || null;
}
