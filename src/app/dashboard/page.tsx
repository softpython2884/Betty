import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, FolderKanban, User, Link as LinkIcon, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PwaInstallCard } from "@/components/pwa/PwaInstallCard";
import Image from "next/image";

// TODO: Replace with real data fetching
const questHighlights = [
  { title: "The Forest of Functions", xp: 200, status: "available" },
  { title: "The CSS Caverns", xp: 150, status: "completed" },
  { title: "The Array Archipelago", xp: 250, status: "locked" },
];

const recentProjects = [
    { title: "Project: The Forest of Functions", lastUpdate: "2 hours ago" },
    { title: "Side Project: My Portfolio", lastUpdate: "1 day ago" },
]

// TODO: Replace with real data from user session
const isFlowUpConnected = false;

export default function DashboardPage() {

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
            <h1 className="text-4xl md:text-5xl font-headline tracking-tight">Tableau de bord de l'Aventurier</h1>
            <p className="text-muted-foreground mt-2">Votre voyage commence ici. Prêt à relever de nouveaux défis ?</p>
        </div>

        <div className="relative w-full aspect-[20/6] rounded-lg overflow-hidden shadow-lg">
            <Image 
                src="https://scontent-mrs2-2.xx.fbcdn.net/v/t39.30808-6/429641439_792522079563968_5846022648137048441_n.png?stp=dst-png_s960x960&_nc_cat=101&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=5I0-avC20-UQ7kNvwHTz3uL&_nc_oc=Adm7PcJpJN9FkLvbtwW-ed7kN1WBMjgU4vAoh0qF3t_RzCLiUCH7iBxsydW6oWWM79E&_nc_zt=23&_nc_ht=scontent-mrs2-2.xx&_nc_gid=tiGu0MPrT57O8jdtloH_yg&oh=00_AfR6HouFGe7qWwnWpWj6nhcnST2OyPVhKFSUeFKw6dIdpQ&oe=688090F3"
                alt="Betty Academy Banner"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                data-ai-hint="academy banner"
            />
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
