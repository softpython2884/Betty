
"use server";

import { db } from "@/lib/db";
import { guilds, users, questCompletions, type NewGuild, type Guild } from "@/lib/db/schema";
import { and, eq, sql, desc, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export type GuildWithStats = Guild & {
    members: (Pick<User, 'id' | 'name' | 'avatar' | 'level' | 'title' | 'xp' | 'guildId'>)[];
    totalXp: number;
    totalQuestsCompleted: number;
}

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

export async function getGuildsWithStats(): Promise<GuildWithStats[]> {
    const allGuilds = await db.query.guilds.findMany({
        with: {
            members: {
                columns: {
                    id: true,
                    name: true,
                    avatar: true,
                    level: true,
                    title: true,
                    xp: true,
                    guildId: true
                }
            }
        }
    });

    const memberIds = allGuilds.flatMap(g => g.members.map(m => m.id));
    let questCounts: Record<string, number> = {};

    if (memberIds.length > 0) {
        const questCompletionsData = await db.select({
            userId: questCompletions.userId,
            count: sql<number>`count(*)`
        })
        .from(questCompletions)
        .where(inArray(questCompletions.userId, memberIds))
        .groupBy(questCompletions.userId);

        questCounts = questCompletionsData.reduce((acc, row) => {
            acc[row.userId] = Number(row.count);
            return acc;
        }, {} as Record<string, number>);
    }


    const guildsWithStats = allGuilds.map(guild => {
        const totalXp = guild.members.reduce((sum, member) => sum + (member.xp || 0), 0);
        const totalQuestsCompleted = guild.members.reduce((sum, member) => sum + (questCounts[member.id] || 0), 0);

        return {
            ...guild,
            totalXp,
            totalQuestsCompleted
        }
    });
    
    // Sort guilds by total XP descending
    guildsWithStats.sort((a, b) => b.totalXp - a.totalXp);
    
    return guildsWithStats;
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
