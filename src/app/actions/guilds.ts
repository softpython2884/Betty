
"use server";

import { db } from "@/lib/db";
import { guilds, users, type NewGuild, type Guild } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export async function createGuild(data: { name: string; description: string; crest: string; }): Promise<Guild> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const newGuild: NewGuild = {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        crest: data.crest,
        createdAt: new Date(),
        leaderId: null, // Can be assigned later
    };

    await db.insert(guilds).values(newGuild);
    revalidatePath('/admin/guilds');
    revalidatePath('/guilds');
    
    const result = await db.query.guilds.findFirst({ where: eq(guilds.id, newGuild.id) });
    if (!result) throw new Error("Failed to create guild.");
    return result;
}

export async function getGuildsWithMembers() {
    return await db.query.guilds.findMany({
        with: {
            members: {
                columns: {
                    id: true,
                    name: true,
                    avatar: true,
                    level: true,
                    title: true,
                }
            }
        }
    });
}

export async function joinGuild(guildId: string): Promise<{ success: boolean, message: string }> {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, message: "Utilisateur non authentifié." };
    }
    
    if (user.guildId) {
        return { success: false, message: "Vous êtes déjà dans une guilde." };
    }

    try {
        await db.update(users)
            .set({ guildId: guildId })
            .where(eq(users.id, user.id));

        revalidatePath('/guilds');
        revalidatePath('/profile');

        return { success: true, message: "Vous avez rejoint la guilde !" };
    } catch (error: any) {
        console.error("Error joining guild:", error);
        return { success: false, message: "Une erreur interne est survenue." };
    }
}

export async function leaveGuild(): Promise<{ success: boolean, message: string }> {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, message: "Utilisateur non authentifié." };
    }
    
    if (!user.guildId) {
        return { success: false, message: "Vous n'êtes dans aucune guilde." };
    }

    try {
        await db.update(users)
            .set({ guildId: null })
            .where(eq(users.id, user.id));

        revalidatePath('/guilds');
        revalidatePath('/profile');

        return { success: true, message: "Vous avez quitté la guilde." };
    } catch (error: any) {
        console.error("Error leaving guild:", error);
        return { success: false, message: "Une erreur interne est survenue." };
    }
}
