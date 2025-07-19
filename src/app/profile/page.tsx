
"use client";

import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/profile/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, BarChart, Book, Bot, CheckCircle, Code, Fingerprint, Gem, GitBranch, KeyRound, Link as LinkIcon, ShieldCheck, Star, Swords, Trophy, Construction, User as UserIcon, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/db/schema";
import { Loader2 } from "lucide-react";
import { updateUser } from "../actions/users";
import Link from "next/link";

// TODO: Replace with real data fetching for achievements and quests
const achievements = [
  { name: "First Quest", icon: Star, description: "Completed your first quest." },
  { name: "JS Initiate", icon: Code, description: "Mastered the basics of JavaScript." },
  { name: "Bug Squasher", icon: Bot, description: "Fixed a tricky bug." },
  { name: "Peer Reviewer", icon: ShieldCheck, description: "Provided helpful feedback to a peer." },
  { name: "Git Starter", icon: GitBranch, description: "Made your first commit." },
  { name: "Connected", icon: LinkIcon, description: "Successfully linked your FlowUp account." },
];

const badges = [
    { name: "Quest Master", icon: Swords, description: "Completed 25 quests." },
    { name: "React Guru", icon: Gem, description: "Mastered the React library." },
    { name: "Project Architect", icon: Construction, description: "Created 10 personal projects." },
    { name: "Top Contributor", icon: Trophy, description: "Finished #1 in a weekly challenge." },
];

const featuredBadges = badges.slice(0, 3); // User can select 3 to feature

const completedQuests = [
    { name: "The HTML Hamlet", xp: 100, date: "2023-10-01" },
    { name: "The CSS Caverns", xp: 150, date: "2023-10-05" },
    { name: "The Array Archipelago", xp: 200, date: "2023-10-12" },
]

export default function ProfilePage() {
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUser() {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            setStudent(data.user);
        } else {
            toast({ variant: 'destructive', title: "Could not fetch user data." });
        }
    }
    fetchUser();
  }, [toast]);
  
  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!student) return;

      setLoading(true);
      const formData = new FormData(event.currentTarget);
      const name = formData.get('name') as string;

      const result = await updateUser(student.id, { name });

      if (result.success) {
          toast({ title: "Profile Updated", description: "Your changes have been saved." });
          setStudent(prev => prev ? { ...prev, name } : null);
      } else {
          toast({ variant: "destructive", title: "Update Failed", description: result.message });
      }
      setLoading(false);
  }

  if (!student) {
    return (
        <AppShell>
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        </AppShell>
    );
  }

  const xpToNextLevel = (student.level || 1) * 1000;
  const xpProgress = student.xp ? (student.xp / xpToNextLevel) * 100 : 0;
  const flowUpConnected = !!student.flowUpUuid;

  return (
    <AppShell>
      <div className="space-y-8">
        <Card className="shadow-md overflow-hidden">
            <div className="bg-muted/30 p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                    <Image
                        src={`https://i.pravatar.cc/128?u=${student.id}`}
                        alt="Student Avatar"
                        width={128}
                        height={128}
                        className="rounded-full border-4 border-background shadow-lg"
                        data-ai-hint="user avatar"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg border-2 border-background">
                        {student.level}
                    </div>
                </div>
                <div className="flex-1">
                    <h1 className="text-4xl font-headline tracking-tight">{student.name}</h1>
                    <p className="text-xl text-muted-foreground">{student.title}</p>
                    <div className="mt-4 w-full md:w-72">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{student.xp} / {xpToNextLevel} XP</span>
                            <span className="text-muted-foreground">To Level {student.level ? student.level + 1 : 2}</span>
                        </div>
                        <Progress value={xpProgress} className="h-3" />
                    </div>
                </div>
                 <div className="flex gap-4">
                    {featuredBadges.map(badge => (
                        <TooltipProvider key={badge.name}>
                            <Tooltip>
                                <TooltipTrigger>
                                     <div className="p-4 bg-accent/20 rounded-full hover:bg-accent/30 transition-colors">
                                        <badge.icon className="h-10 w-10 text-accent-foreground" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">{badge.name}</p>
                                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                 </div>
            </div>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Quêtes Terminées" value={completedQuests.length} icon={Book} footer="Continuez comme ça !"/>
            <StatsCard title="XP Total" value={student.xp || 0} icon={BarChart} footer={`${xpToNextLevel - (student.xp || 0)} XP pour le prochain niveau`}/>
            <StatsCard title="Succès Débloqués" value={achievements.length} icon={Award} footer="Collectionnez-les tous !"/>
            <StatsCard title="Orbes" value={student.orbs || 0} icon={Gem} footer="Monnaie pour quêtes spéciales."/>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
             <div className="lg:col-span-1 space-y-8">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Modifier le Profil</CardTitle>
                        <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom</Label>
                                <Input id="name" name="name" defaultValue={student.name} />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Enregistrer les modifications
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                 <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Sécurité</CardTitle>
                        <CardDescription>Gérez les paramètres de sécurité de votre compte.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/change-password">
                            <Button variant="outline" className="w-full">
                                <KeyRound className="mr-2 h-4 w-4" />
                                Changer le mot de passe
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Badges</CardTitle>
                        <CardDescription>Vos accomplissements majeurs.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                        {badges.map(badge => (
                             <TooltipProvider key={badge.name}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div className="p-3 bg-muted rounded-full mb-2">
                                                <badge.icon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <p className="font-semibold text-sm">{badge.name}</p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{badge.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </CardContent>
                </Card>
             </div>

            <Card className="lg:col-span-2 shadow-md">
                <CardHeader>
                    <CardTitle>Quêtes Terminées</CardTitle>
                    <CardDescription>Un journal de vos aventures réussies.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom de la Quête</TableHead>
                                <TableHead>XP Gagné</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Projet</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {completedQuests.map((quest, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{quest.name}</TableCell>
                                <TableCell><Badge variant="outline" className="text-green-600 border-green-400">{quest.xp} XP</Badge></TableCell>
                                <TableCell>{quest.date}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Voir</Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}
