
"use server";

import { db } from "@/lib/db";
import { users, projects, quests, questCompletions, type User, type Project, type Quest, type UserCosmetic } from "@/lib/db/schema";
import { and, eq, like, desc, sql, inArray } from "drizzle-orm";

export type LeaderboardUser = Pick<User, "id" | "name" | "level" | "xp" | "title" | "avatar" > & {
    questCount?: number;
    cosmetics?: (UserCosmetic & { cosmetic: { id: string; type: string; data: any; }})[];
};

export async function getLeaderboardData(): Promise<{ byXp: LeaderboardUser[], byQuests: LeaderboardUser[] }> {
    const topByXpRaw = await db.query.users.findMany({
        where: eq(users.role, 'student'),
        orderBy: [desc(users.level), desc(users.xp)],
        limit: 10,
        columns: { id: true, name: true, level: true, xp: true, title: true, avatar: true },
    });

    const topByQuestsRaw = await db.query.users.findMany({
        where: eq(users.role, 'student'),
        orderBy: [desc(sql`(SELECT count(*) FROM quest_completions WHERE quest_completions.user_id = users.id)`)],
        limit: 10,
        columns: { id: true, name: true, level: true, xp: true, title: true, avatar: true },
        with: {
            questCompletions: { columns: { questId: true } }
        }
    });

    const userIds = [...new Set([...topByXpRaw.map(u => u.id), ...topByQuestsRaw.map(u => u.id)])];
    
    let userCosmetics: Record<string, any[]> = {};
    if (userIds.length > 0) {
        const cosmeticsData = await db.query.userCosmetics.findMany({
            where: inArray(users.id, userIds),
            with: { cosmetic: true }
        });
        userCosmetics = cosmeticsData.reduce((acc, uc) => {
            if (!acc[uc.userId]) acc[uc.userId] = [];
            acc[uc.userId].push(uc);
            return acc;
        }, {} as Record<string, any[]>);
    }
    
    const topByXp = topByXpRaw.map(u => ({ ...u, cosmetics: userCosmetics[u.id] || [] }));

    const topByQuests = topByQuestsRaw.map(u => ({
        ...u,
        questCount: u.questCompletions.length,
        cosmetics: userCosmetics[u.id] || []
    }));
    
    return { byXp: topByXp, byQuests: topByQuests as LeaderboardUser[] };
}


export type SearchResult = {
    users: Pick<User, "id" | "name" | "email" | "role" >[],
    projects: Pick<Project, "id" | "title" | "status">[],
    quests: Pick<Quest, "id" | "title" | "category" | "xp">[],
}

export async function globalSearch(query: string): Promise<SearchResult> {
    if (!query) {
        return { users: [], projects: [], quests: [] };
    }

    const searchQuery = `%${query}%`;

    const [foundUsers, foundProjects, foundQuests] = await Promise.all([
        db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        })
        .from(users)
        .where(like(users.name, searchQuery))
        .limit(5),

        db.select({
            id: projects.id,
            title: projects.title,
            status: projects.status,
        })
        .from(projects)
        .where(like(projects.title, searchQuery))
        .limit(5),
        
        db.select({
            id: quests.id,
            title: quests.title,
            category: quests.category,
            xp: quests.xp,
        })
        .from(quests)
        .where(and(like(quests.title, searchQuery), eq(quests.status, "published")))
        .limit(5),
    ]);

    return {
        users: foundUsers,
        projects: foundProjects,
        quests: foundQuests,
    }
}
