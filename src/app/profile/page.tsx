

"use client";

import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/profile/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, BarChart, Book, Bot, CheckCircle, Code, Fingerprint, Gem, GitBranch, KeyRound, Link as LinkIcon, ShieldCheck, Star, Swords, Trophy, Construction, User as UserIcon, Save, Eye, EyeOff, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User, Cosmetic } from "@/lib/db/schema";
import { Loader2 } from "lucide-react";
import { updateUser } from "../actions/users";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import GradientText from "@/components/ui/gradient-text";
import { getMyCosmetics, equipCosmetic } from "../actions/shop";

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
  const [myCosmetics, setMyCosmetics] = useState<Cosmetic[]>([]);
  const [isSavingFlowUp, startSavingFlowUp] = useTransition();
  const [isEquipping, startEquipping] = useTransition();
  const [showFpat, setShowFpat] = useState(false);
  const { toast } = useToast();

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setStudent(data.user);
        const cosmeticsData = await getMyCosmetics();
        setMyCosmetics(cosmeticsData);
      } else {
        toast({ variant: 'destructive', title: "Could not fetch user data." });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: "Error fetching data." });
    }
  };
  
  useEffect(() => {
    fetchUserData();
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

  const handleFlowUpUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!student) return;

    startSavingFlowUp(async () => {
        const formData = new FormData(event.currentTarget);
        const flowUpUuid = formData.get('flowup_uuid') as string;
        const flowUpFpat = formData.get('flowup_fpat') as string;

        const result = await updateUser(student.id, { flowUpUuid, flowUpFpat });
        
        if (result.success) {
            toast({ title: "FlowUp Info Saved", description: "Your FlowUp credentials have been updated." });
            setStudent(prev => prev ? { ...prev, flowUpUuid, flowUpFpat } : null);
        } else {
             toast({ variant: "destructive", title: "Update Failed", description: result.message });
        }
    });
  }

  const handleEquipCosmetic = (cosmeticId: string) => {
      startEquipping(async () => {
          const result = await equipCosmetic(cosmeticId);
          if (result.success) {
              toast({ title: "Cosmétique équipé !" });
              await fetchUserData(); // Refresh data to show equipped state
          } else {
              toast({ variant: 'destructive', title: "Erreur", description: result.message });
          }
      });
  };

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
  const flowUpConnected = !!student.flowUpUuid && !!student.flowUpFpat;
  const equippedTitleStyle = myCosmetics.find(c => c.type === 'title_style' && c.equipped);
  const titleColors = equippedTitleStyle ? JSON.parse(equippedTitleStyle.data).colors : undefined;


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
                     {titleColors ? (
                         <GradientText colors={titleColors} className="text-xl">{student.title}</GradientText>
                     ) : (
                        <p className="text-xl text-muted-foreground">{student.title}</p>
                     )}
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
                        <CardTitle>Cosmétiques</CardTitle>
                        <CardDescription>Équipez les styles que vous avez débloqués.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {myCosmetics.filter(c => c.type === 'title_style').map(c => (
                            <div key={c.id} className="flex justify-between items-center">
                                <span className="text-sm font-medium">{c.name}</span>
                                <Button size="sm" variant={c.equipped ? "default" : "outline"} onClick={() => handleEquipCosmetic(c.id)} disabled={isEquipping || c.equipped}>
                                    {c.equipped ? <CheckCircle className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    {c.equipped ? 'Équipé' : 'Équiper'}
                                </Button>
                            </div>
                        ))}
                         {myCosmetics.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Visitez la <Link href="/shop" className="text-primary underline">boutique</Link> pour acheter des cosmétiques.
                            </p>
                         )}
                    </CardContent>
                </Card>
             </div>

            <div className="lg:col-span-2 space-y-8">
                 <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Intégration FlowUp</CardTitle>
                        <CardDescription>Connectez votre compte FlowUp pour synchroniser vos projets.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {flowUpConnected && (
                            <Alert variant="default" className="bg-green-500/10 border-green-500/20 mb-4">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-800">Compte FlowUp Connecté</AlertTitle>
                                <AlertDescription className="text-green-700">
                                    Votre compte est prêt à synchroniser les projets.
                                </AlertDescription>
                            </Alert>
                         )}
                        <form onSubmit={handleFlowUpUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="flowup_uuid">FlowUp User UUID</Label>
                                <Input id="flowup_uuid" name="flowup_uuid" defaultValue={student.flowUpUuid || ""} placeholder="Entrez votre User UUID de FlowUp"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="flowup_fpat">FlowUp FPAT (Personal Access Token)</Label>
                                <div className="relative">
                                    <Input id="flowup_fpat" name="flowup_fpat" type={showFpat ? "text" : "password"} defaultValue={student.flowUpFpat || ""} placeholder="Entrez votre token FPAT de FlowUp"/>
                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowFpat(!showFpat)}>
                                        {showFpat ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                    </Button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isSavingFlowUp}>
                                {isSavingFlowUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Sauvegarder les informations FlowUp
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
