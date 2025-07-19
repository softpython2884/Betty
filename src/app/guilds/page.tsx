
"use client";

import { useEffect, useState, useTransition } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getGuildsWithStats, joinGuild, leaveGuild, type GuildWithStats } from '../actions/guilds';
import { type User } from '@/lib/db/schema';
import * as Icons from "lucide-react";
import { Loader2, LogIn, LogOut, Users, Star, Crown, Swords } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/session';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';
import CountUp from '@/components/ui/count-up';

export const dynamic = 'force-dynamic';

const GuildCard = ({ guild, rank, userGuildId, onAction }: { guild: GuildWithStats, rank: number, userGuildId: string | null | undefined, onAction: () => void }) => {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleJoin = () => {
        startTransition(async () => {
            const result = await joinGuild(guild.id);
            if (result.success) {
                toast({ title: "Bienvenue !", description: result.message });
                onAction();
            } else {
                toast({ variant: 'destructive', title: "Erreur", description: result.message });
            }
        });
    }
    
    const handleLeave = () => {
        startTransition(async () => {
            const result = await leaveGuild();
            if (result.success) {
                toast({ title: "À bientôt !", description: result.message });
                onAction();
            } else {
                toast({ variant: 'destructive', title: "Erreur", description: result.message });
            }
        });
    }

    const Icon = guild.crest && Icons[guild.crest as keyof typeof Icons] 
        ? Icons[guild.crest as keyof typeof Icons] as React.ElementType 
        : Icons.Shield;
    const isMember = userGuildId === guild.id;
    const canJoin = !userGuildId;
    const isTopGuild = rank === 1;

    return (
        <Card className={cn("shadow-md flex flex-col transition-all duration-300", isTopGuild && "border-primary shadow-primary/20")}>
            <CardHeader className="text-center items-center relative">
                 <div className="absolute top-2 left-2 text-4xl font-black text-muted-foreground/20">#{rank}</div>
                 {isTopGuild && <Crown className="absolute top-2 right-2 text-yellow-500 h-8 w-8" />}
                <div className="p-4 rounded-full bg-muted border mb-2">
                    <Icon className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>{guild.name}</CardTitle>
                <CardDescription>{guild.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-2 bg-muted/50 rounded-md">
                        <p className="font-bold text-lg text-primary flex items-center justify-center gap-2"><Star className='h-5 w-5' /> <CountUp to={guild.totalXp} /></p>
                        <p className="text-xs text-muted-foreground">XP Total</p>
                    </div>
                     <div className="p-2 bg-muted/50 rounded-md">
                        <p className="font-bold text-lg text-primary flex items-center justify-center gap-2"><Swords className='h-5 w-5'/> <CountUp to={guild.totalQuestsCompleted} /></p>
                        <p className="text-xs text-muted-foreground">Quêtes</p>
                    </div>
                 </div>
                 <div className="flex items-center justify-center gap-2">
                     <Users className="text-muted-foreground" />
                     <span className="font-bold">{guild.members.length}</span> Membres
                 </div>
                 <div className="flex flex-wrap justify-center gap-2">
                    {guild.members.slice(0, 7).map(member => (
                        <Avatar key={member.id}>
                            <AvatarImage src={member.avatar || `https://i.pravatar.cc/40?u=${member.id}`} data-ai-hint="user avatar" />
                            <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ))}
                    {guild.members.length > 7 && (
                        <Avatar>
                            <AvatarFallback>+{guild.members.length - 7}</AvatarFallback>
                        </Avatar>
                    )}
                 </div>
            </CardContent>
            <CardFooter>
                {isMember ? (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogOut className="mr-2" />} 
                                Quitter la Guilde
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr de vouloir quitter {guild.name} ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Vous pourrez rejoindre une autre guilde plus tard.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLeave}>Quitter</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <Button className="w-full" disabled={isPending || !canJoin} onClick={handleJoin}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogIn className="mr-2" />}
                         Rejoindre
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default function GuildsPage() {
    const [guilds, setGuilds] = useState<GuildWithStats[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [guildsData, userDataRes] = await Promise.all([
                getGuildsWithStats(),
                getCurrentUser()
            ]);
            setGuilds(guildsData);
            setUser(userDataRes);
        } catch (error) {
            console.error("Failed to fetch guilds data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <AppShell>
                 <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            </AppShell>
        );
    }
    
    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">Les Guildes</h1>
                    <p className="text-muted-foreground mt-2">Trouvez votre place, unissez vos forces et représentez votre faction dans le classement.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {guilds.map((guild, index) => (
                        <GuildCard key={guild.id} guild={guild} rank={index + 1} userGuildId={user?.guildId} onAction={fetchData} />
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
