import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, FolderKanban, User, Link as LinkIcon, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PwaInstallCard } from "@/components/pwa/PwaInstallCard";

const questHighlights = [
  { title: "The Forest of Functions", xp: 200, status: "available" },
  { title: "The CSS Caverns", xp: 150, status: "completed" },
  { title: "The Array Archipelago", xp: 250, status: "locked" },
];

const recentProjects = [
    { title: "Project: The Forest of Functions", lastUpdate: "2 hours ago" },
    { title: "Side Project: My Portfolio", lastUpdate: "1 day ago" },
]

export default function DashboardPage() {
  const isFlowUpConnected = false; // Mock data

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight">Tableau de bord de l'Aventurier</h1>
          <p className="text-muted-foreground mt-2">Votre voyage commence ici. Prêt à relever de nouveaux défis ?</p>
        </div>

        <PwaInstallCard />

        {!isFlowUpConnected && (
            <Card className="shadow-md bg-secondary/50 border-primary/50">
                <CardHeader className="flex flex-row items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle>Connectez votre compte FlowUp</CardTitle>
                        <CardDescription>Pour une expérience optimale et pour gérer vos projets personnels, liez votre compte FlowUp.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Link href="/profile">
                        <Button variant="default">
                            Lier mon compte FlowUp
                            <ArrowRight className="ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Swords className="text-primary"/> Prochaines Quêtes</CardTitle>
              <CardDescription>Les défis qui vous attendent sur votre chemin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questHighlights.map((quest, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div>
                        <p className="font-semibold">{quest.title}</p>
                        <p className="text-sm text-muted-foreground">{quest.xp} XP</p>
                    </div>
                    <Button variant={quest.status === 'available' ? 'default' : 'outline'} size="sm" disabled={quest.status === 'locked'}>
                        {quest.status === 'available' ? 'Commencer' : quest.status === 'completed' ? 'Revoir' : 'Verrouillé'}
                    </Button>
                </div>
              ))}
              <Link href="/quests" className="w-full">
                <Button variant="outline" className="w-full">
                    Voir l'Arbre des Quêtes
                    <ArrowRight className="ml-2"/>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FolderKanban className="text-primary"/> Projets Récents</CardTitle>
              <CardDescription>Reprenez là où vous êtes arrêté.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {recentProjects.map((project, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <div>
                            <p className="font-semibold">{project.title}</p>
                            <p className="text-sm text-muted-foreground">Dernière activité : {project.lastUpdate}</p>
                        </div>
                        <Button variant="outline" size="sm">Ouvrir</Button>
                    </div>
                ))}
                 <Link href="/projects" className="w-full">
                    <Button variant="outline" className="w-full">
                        Voir tous les projets
                        <ArrowRight className="ml-2"/>
                    </Button>
                 </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
