import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/profile/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, BarChart, Book, Bot, Gem, ShieldCheck, Star, Swords } from "lucide-react";

const student = {
  name: "Alex",
  level: 5,
  xp: 450,
  xpToNextLevel: 1000,
  title: "Novice Coder",
};

const badges = [
  { name: "First Quest", icon: Star, description: "Completed your first quest." },
  { name: "JS Initiate", icon: Gem, description: "Mastered the basics of JavaScript." },
  { name: "Bug Squasher", icon: Bot, description: "Fixed a tricky bug." },
  { name: "Peer Reviewer", icon: ShieldCheck, description: "Provided helpful feedback." },
];

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
                <div>
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
            </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Completed Quests" value={completedQuests.length} icon={Book} footer="Keep up the great work!"/>
            <StatsCard title="Total XP Earned" value={student.xp} icon={BarChart} footer={`${student.xpToNextLevel - student.xp} XP to next level`}/>
            <StatsCard title="Badges" value={badges.length} icon={Award} footer="Collect them all!"/>
            <StatsCard title="Quests Available" value="12" icon={Swords} footer={<Link href="/quests" className="text-primary hover:underline">View Quests</Link>} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 shadow-md">
                <CardHeader>
                    <CardTitle>Badges & Achievements</CardTitle>
                    <CardDescription>A collection of your heroic deeds.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                    {badges.map(badge => (
                        <div key={badge.name} className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="p-3 bg-accent/20 rounded-full mb-2">
                                <badge.icon className="h-8 w-8 text-accent-foreground" />
                            </div>
                            <p className="font-semibold text-sm">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 shadow-md">
                <CardHeader>
                    <CardTitle>Completed Quests</CardTitle>
                    <CardDescription>A log of your successfully completed adventures.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quest Name</TableHead>
                                <TableHead>XP Gained</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Project</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {completedQuests.map((quest, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{quest.name}</TableCell>
                                <TableCell><Badge variant="outline" className="text-green-600 border-green-400">{quest.xp} XP</Badge></TableCell>
                                <TableCell>{quest.date}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">View</Button>
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
