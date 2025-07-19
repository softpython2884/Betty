
"use server";

import { db } from "@/lib/db";
import { snippets, snippetVotes, users, type NewSnippet, type Snippet, type SnippetVote } from "@/lib/db/schema";
import { and, eq, sql, desc, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export type SnippetWithAuthorAndVotes = Snippet & {
    author: { name: string, avatar: string | null };
    score: number;
    userVote: number; // +1, -1, or 0
};

export async function getSnippets(): Promise<SnippetWithAuthorAndVotes[]> {
    const currentUser = await getCurrentUser();
    
    const allSnippets = await db.query.snippets.findMany({
        with: {
            author: {
                columns: {
                    name: true,
                    avatar: true,
                }
            },
            votes: true,
        },
        orderBy: [desc(snippets.createdAt)]
    });

    return allSnippets.map(snippet => {
        const score = snippet.votes.reduce((acc, vote) => acc + vote.vote, 0);
        const userVote = currentUser ? (snippet.votes.find(v => v.userId === currentUser.id)?.vote || 0) : 0;
        
        // We don't need the full votes array on the client
        const { votes, ...snippetWithoutVotes } = snippet;

        return {
            ...snippetWithoutVotes,
            score,
            userVote,
        };
    });
}

export async function createSnippet(data: Pick<NewSnippet, 'title' | 'description' | 'language' | 'code'>): Promise<Snippet> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated.");
    }

    const newSnippet: NewSnippet = {
        id: uuidv4(),
        ...data,
        authorId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await db.insert(snippets).values(newSnippet);
    revalidatePath('/snippets');

    const result = await db.query.snippets.findFirst({ where: eq(snippets.id, newSnippet.id) });
    if (!result) throw new Error("Failed to create snippet.");
    return result;
}

export async function voteSnippet(snippetId: string, vote: 1 | -1): Promise<{ newScore: number, newUserVote: number }> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated.");
    }

    const existingVote = await db.query.snippetVotes.findFirst({
        where: and(
            eq(snippetVotes.snippetId, snippetId),
            eq(snippetVotes.userId, user.id)
        )
    });

    await db.transaction(async (tx) => {
        if (existingVote) {
            // If the user clicks the same vote button again, remove their vote (toggle off)
            if (existingVote.vote === vote) {
                await tx.delete(snippetVotes).where(and(
                    eq(snippetVotes.snippetId, snippetId),
                    eq(snippetVotes.userId, user.id)
                ));
            } else { // If they change their vote
                await tx.update(snippetVotes).set({ vote: vote }).where(and(
                    eq(snippetVotes.snippetId, snippetId),
                    eq(snippetVotes.userId, user.id)
                ));
            }
        } else { // If it's a new vote
            await tx.insert(snippetVotes).values({
                snippetId,
                userId: user.id,
                vote
            });
        }
    });

    // Recalculate score
    const allVotes = await db.query.snippetVotes.findMany({ where: eq(snippetVotes.snippetId, snippetId) });
    const newScore = allVotes.reduce((acc, v) => acc + v.vote, 0);
    const newUserVote = allVotes.find(v => v.userId === user.id)?.vote || 0;

    revalidatePath('/snippets');

    return { newScore, newUserVote };
}
