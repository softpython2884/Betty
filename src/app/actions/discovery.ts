
"use server";

import { db } from "@/lib/db";
import { users, projects, quests, questCompletions, type User, type Project, type Quest } from "@/lib/db/schema";
import { and, eq, like, desc, sql } from "drizzle-orm";

export type LeaderboardUser = Pick<User, "id" | "name" | "level" | "xp" | "title"> & {
    questCount?: number;
};

export async function getLeaderboardData(): Promise<{ byXp: LeaderboardUser[], byQuests: LeaderboardUser[] }> {
    const topByXp = await db.select({
        id: users.id,
        name: users.name,
        level: users.level,
        xp: users.xp,
        title: users.title,
    })
    .from(users)
    .where(eq(users.role, 'student'))
    .orderBy(desc(users.level), desc(users.xp))
    .limit(10);

    const topByQuests = await db.select({
        id: users.id,
        name: users.name,
        level: users.level,
        xp: users.xp,
        title: users.title,
        questCount: sql<number>`count(${questCompletions.questId})`.mapWith(Number),
    })
    .from(users)
    .leftJoin(questCompletions, eq(users.id, questCompletions.userId))
    .where(eq(users.role, 'student'))
    .groupBy(users.id)
    .orderBy(desc(sql`count(${questCompletions.questId})`))
    .limit(10);
    
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
