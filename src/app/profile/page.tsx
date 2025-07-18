import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/profile/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, BarChart, Book, Bot, CheckCircle, Code, Fingerprint, Gem, GitBranch, KeyRound, Link as LinkIcon, ShieldCheck, Star, Swords, Trophy, Construction } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// TODO: Replace with real data
const student = {
  name: "Alex",
  level: 5,
  xp: 450,
  xpToNextLevel: 1000,
  orbs: 320,
  title: "Novice Coder",
  flowUpConnected: false,
};

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
  const xpProgress = (student.xp / student.xpToNextLevel) * 100;

  return (
    <AppShell>
      <div className="space-y-8">
        <Card className="shadow-md overflow-hidden">
            <div className="bg-muted/30 p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                    <Image
                        src="https://placehold.co/128x128"
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
                            <span className="font-medium">{student.xp} / {student.xpToNextLevel} XP</span>
                            <span className="text-muted-foreground">To Level {student.level + 1}</span>
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
            <StatsCard title="XP Total" value={student.xp} icon={BarChart} footer={`${student.xpToNextLevel - student.xp} XP pour le prochain niveau`}/>
            <StatsCard title="Succès Débloqués" value={achievements.length} icon={Award} footer="Collectionnez-les tous !"/>
            <StatsCard title="Orbes" value={student.orbs} icon={Gem} footer="Monnaie pour quêtes spéciales."/>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
             <div className="lg:col-span-1 space-y-8">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Intégration FlowUp</CardTitle>
                        <CardDescription>
                            {student.flowUpConnected
                                ? "Votre compte est connecté à FlowUp."
                                : "Connectez votre compte pour gérer vos projets personnels."
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {student.flowUpConnected ? (
                           <div className="flex items-center gap-2 text-green-600 font-medium p-3 bg-green-500/10 rounded-md border border-green-500/20">
                               <CheckCircle className="h-5 w-5"/>
                               <span>Connecté à FlowUp</span>
                           </div>
                       ) : (
                           <form className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="flowup-uuid">FlowUp User UUID</Label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input id="flowup-uuid" placeholder="Votre User UUID de FlowUp" className="pl-10" />
                                    </div>
                                    <div className="text-xs text-muted-foreground pt-1 flex gap-4">
                                        <a href="#" className="hover:underline">Où trouver mon UUID ?</a>
                                        <a href="#" className="hover:underline">Autoriser l'application</a>
                                    </div>
                                </div>
                                
                                <Button className="w-full">
                                    <LinkIcon className="mr-2"/>
                                    Lier mon compte FlowUp
                                </Button>
                           </form>
                       )}
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
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Succès</CardTitle>
                        <CardDescription>Une collection de vos exploits.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                        {achievements.map(achievement => (
                             <TooltipProvider key={achievement.name}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div className="p-3 bg-muted rounded-full mb-2">
                                                <achievement.icon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <p className="font-semibold text-sm">{achievement.name}</p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{achievement.description}</p>
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
