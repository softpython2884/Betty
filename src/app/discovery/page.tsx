
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Compass, Search, User, FolderKanban, Swords, Crown, Medal, Trophy, Loader2 } from "lucide-react";
import { useState, useTransition, useEffect, useCallback } from "react";
import { globalSearch, getLeaderboardData, type SearchResult, type LeaderboardUser } from "../actions/discovery";
import { debounce } from "lodash";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { UserCosmetic } from "@/lib/db/schema";
import GradientText from "@/components/ui/gradient-text";

export const dynamic = 'force-dynamic';

const SearchResults = ({ results, loading }: { results: SearchResult, loading: boolean }) => {
    const hasResults = results.users.length > 0 || results.projects.length > 0 || results.quests.length > 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!hasResults) {
        return <p className="text-muted-foreground text-center py-4">Aucun résultat trouvé.</p>
    }

    return (
        <div className="space-y-6">
            {results.users.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Utilisateurs</h3>
                    <div className="space-y-2">
                        {results.users.map(user => (
                            <Link href={`/profile/${user.id}`} key={user.id}>
                                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                                    <User className="text-primary"/>
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            {results.projects.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Projets</h3>
                    <div className="space-y-2">
                         {results.projects.map(project => (
                            <Link href={`/projects/${project.id}`} key={project.id}>
                                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                                    <FolderKanban className="text-primary"/>
                                    <div>
                                        <p className="font-semibold">{project.title}</p>
                                        <p className="text-sm text-muted-foreground">Statut: {project.status}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            {results.quests.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Quêtes</h3>
                    <div className="space-y-2">
                        {results.quests.map(quest => (
                            <Link href={`/quests/${quest.id}`} key={quest.id}>
                                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                                    <Swords className="text-primary"/>
                                    <div>
                                        <p className="font-semibold">{quest.title}</p>
                                        <p className="text-sm text-muted-foreground">{quest.xp} XP - {quest.category}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const Leaderboard = ({ title, icon: Icon, users }: { title: string, icon: React.ElementType, users: LeaderboardUser[] }) => {
    const getTrophyColor = (index: number) => {
        if (index === 0) return "text-yellow-500";
        if (index === 1) return "text-gray-400";
        if (index === 2) return "text-amber-700";
        return "text-muted-foreground";
    };

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon className="text-primary" /> {title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {users.map((user, index) => {
                        const equippedTitleStyle = user.cosmetics?.find(uc => uc.cosmetic.type === 'title_style' && uc.equipped)?.cosmetic;
                        const titleColors = equippedTitleStyle ? (equippedTitleStyle.data as any).colors : undefined;
                        return (
                            <li key={user.id} className="flex items-center gap-4">
                                <Trophy className={getTrophyColor(index)} />
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatar || `https://i.pravatar.cc/40?u=${user.id}`} data-ai-hint="user avatar" />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold">{user.name}</p>
                                    {titleColors ? (
                                        <GradientText colors={titleColors} className="text-sm">{user.title}</GradientText>
                                     ) : (
                                        <p className="text-sm text-muted-foreground">{user.title}</p>
                                     )}
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{user.questCount !== undefined ? `${user.questCount} quêtes` : `${user.xp} XP`}</p>
                                    <p className="text-sm text-muted-foreground">Niv. {user.level}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </CardContent>
        </Card>
    )
};


export default function DiscoveryPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult>({ users: [], projects: [], quests: [] });
    const [leaderboards, setLeaderboards] = useState<{ byXp: LeaderboardUser[], byQuests: LeaderboardUser[] }>({ byXp: [], byQuests: [] });
    const [isSearching, startSearchTransition] = useTransition();
    const [isLoadingBoards, setIsLoadingBoards] = useState(true);

    const debouncedSearch = useCallback(
        debounce((searchQuery: string) => {
            if (!searchQuery.trim()) {
                setResults({ users: [], projects: [], quests: [] });
                return;
            }
            startSearchTransition(async () => {
                const searchResults = await globalSearch(searchQuery);
                setResults(searchResults);
            });
        }, 300),
        []
    );

    useEffect(() => {
        debouncedSearch(query);
    }, [query, debouncedSearch]);

    useEffect(() => {
        async function loadLeaderboards() {
            setIsLoadingBoards(true);
            const boardData = await getLeaderboardData();
            setLeaderboards(boardData);
            setIsLoadingBoards(false);
        }
        loadLeaderboards();
    }, []);

    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3"><Compass className="text-primary h-10 w-10"/> Découverte</h1>
                    <p className="text-muted-foreground mt-2">Explorez la communauté, trouvez des projets et découvrez qui est au sommet.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Recherche Globale</CardTitle>
                                <CardDescription>Trouvez n'importe quoi sur la plateforme.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        placeholder="Chercher un utilisateur, un projet..." 
                                        className="pl-10"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>
                                {query && (
                                    <div className="mt-4">
                                        <SearchResults results={results} loading={isSearching} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {isLoadingBoards ? (
                             <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                <Leaderboard title="Top par XP" icon={Crown} users={leaderboards.byXp} />
                                <Leaderboard title="Top des Quêtes" icon={Medal} users={leaderboards.byQuests} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
