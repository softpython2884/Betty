

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, FolderKanban, AlertTriangle, ArrowRight, Lock, Megaphone } from "lucide-react";
import Link from "next/link";
import { PwaInstallCard } from "@/components/pwa/PwaInstallCard";
import Image from "next/image";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getProjectsForCurrentUser } from "../actions/quests";
import { getAssignedCurriculumsForUser, getCompletedQuestsForCurrentUser } from "../actions/curriculums";
import { getQuestsByCurriculum, getQuestConnections } from "../actions/quests";
import type { Quest, Curriculum } from "@/lib/db/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getActiveAnnouncement } from "../actions/announcements";

// Helper to determine quest status based on completion data and connections
function getQuestStatuses(quests: Quest[], connections: {from: string, to: string}[], completedQuests: Set<string>): Map<string, 'completed' | 'available' | 'locked'> {
    const statuses = new Map<string, 'completed' | 'available' | 'locked'>();
    const questMap = new Map(quests.map(q => [q.id, q]));

    // Mark all completed quests
    completedQuests.forEach(questId => {
        if (questMap.has(questId)) {
            statuses.set(questId, 'completed');
        }
    });

    let changedInLoop = true;
    while(changedInLoop) {
        changedInLoop = false;
        quests.forEach(quest => {
            if (statuses.has(quest.id)) return; // Already processed

            const prerequisites = connections.filter(c => c.to === quest.id).map(c => c.from);
            
            if (prerequisites.length === 0) {
                 statuses.set(quest.id, 'available');
                 changedInLoop = true;
                 return;
            }

            const allPrerequisitesMet = prerequisites.every(prereqId => {
                return questMap.has(prereqId) && statuses.get(prereqId) === 'completed';
            });

            if (allPrerequisitesMet) {
                statuses.set(quest.id, 'available');
                changedInLoop = true;
            }
        });
    }

    // Any remaining quests are locked
    quests.forEach(quest => {
        if (!statuses.has(quest.id)) {
            statuses.set(quest.id, 'locked');
        }
    });

    return statuses;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const [
    allProjects,
    assignedCurriculums,
    completedQuestsSet,
    activeAnnouncement,
  ] = await Promise.all([
    getProjectsForCurrentUser(),
    getAssignedCurriculumsForUser(),
    getCompletedQuestsForCurrentUser(),
    getActiveAnnouncement(),
  ]);

  let questHighlights: { id: string, title: string, xp: number, status: 'available' | 'completed' | 'locked' }[] = [];

  if (assignedCurriculums.length > 0) {
    // For simplicity, we'll get quests from the first assigned curriculum for the dashboard
    const firstCurriculumId = assignedCurriculums[0].id;
    const [quests, connections] = await Promise.all([
      getQuestsByCurriculum(firstCurriculumId),
      getQuestConnections(firstCurriculumId)
    ]);
    
    const publishedQuests = quests.filter(q => q.status === 'published');
    const questStatusMap = getQuestStatuses(publishedQuests, connections.map(c => ({ from: c.fromId, to: c.toId })), completedQuestsSet);
    
    questHighlights = Array.from(questStatusMap.entries())
      .map(([questId, status]) => {
        const quest = publishedQuests.find(q => q.id === questId);
        if (!quest) return null;
        return { id: quest.id, title: quest.title, xp: quest.xp, status };
      })
      .filter(Boolean) as any[];

    // Sort to show available first, then locked, then completed
    questHighlights.sort((a, b) => {
        const statusOrder = { available: 0, locked: 1, completed: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });
  }

  const recentProjects = allProjects.slice(0, 3);
  const isFlowUpConnected = !!user.flowUpUuid;

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
            <h1 className="text-4xl md:text-5xl font-headline tracking-tight">Tableau de bord de {user.name}</h1>
            <p className="text-muted-foreground mt-2">Votre voyage commence ici. Prêt à relever de nouveaux défis ?</p>
        </div>

        {activeAnnouncement && (
            <Alert>
                <Megaphone className="h-4 w-4" />
                <AlertTitle>{activeAnnouncement.title}</AlertTitle>
                <AlertDescription>
                    {activeAnnouncement.message}
                </AlertDescription>
            </Alert>
        )}

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
              {questHighlights.slice(0, 3).map((quest) => (
                <div key={quest.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div>
                        <p className="font-semibold">{quest.title}</p>
                        <p className="text-sm text-muted-foreground">{quest.xp} XP</p>
                    </div>
                    <Button asChild variant={quest.status === 'available' ? 'default' : 'outline'} size="sm" disabled={quest.status === 'locked'}>
                      <Link href={`/quests/${quest.id}`}>
                        {quest.status === 'available' ? 'Commencer' : quest.status === 'completed' ? 'Revoir' : <><Lock className="h-4 w-4 mr-2" /> Verrouillé</>}
                      </Link>
                    </Button>
                </div>
              ))}
               {questHighlights.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune quête à l'horizon. Contactez un professeur !</p>
              )}
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
              <CardDescription>Reprenez là où vous vous êtes arrêté.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {recentProjects.map((project) => (
                    <div key={project.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <div>
                            <p className="font-semibold">{project.title}</p>
                            <p className="text-sm text-muted-foreground">Dernière activité : {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/projects/${project.id}`}>Ouvrir</Link>
                        </Button>
                    </div>
                ))}
                 {recentProjects.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Vous n'avez aucun projet pour le moment.</p>
                )}
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
