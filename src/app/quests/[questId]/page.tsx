
"use client";

import { redirect, useRouter } from 'next/navigation';
import { AppShell } from "@/components/layout/AppShell";
import { AiMentor } from "@/components/quests/AiMentor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FolderKanban, Play, BookOpen, Gem, Star, Swords, Loader2 } from 'lucide-react';
import { getQuestById, getOrCreateQuestProject } from '@/app/actions/quests';
import Link from 'next/link';
import { QuestQuiz } from '@/components/quests/QuestQuiz';
import { useEffect, useState, useTransition } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Quest, Project } from '@/lib/db/schema';
import { Badge } from '@/components/ui/badge';
import { completeQuestForCurrentUser } from '@/app/actions/curriculums';

type QuestWithDetails = Quest & {
  resources: { resource: { id: string; title: string } }[];
  project: Project | null;
};

export default function QuestDetail() {
  const params = useParams();
  const router = useRouter();
  const questId = params.questId as string;
  const [questData, setQuestData] = useState<QuestWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!questId) return;
    
    async function loadQuest() {
      setLoading(true);
      try {
        const data = await getQuestById(questId);
        if (!data) {
           toast({ variant: 'destructive', title: "Quête non trouvée" });
           redirect('/quests');
        } else {
            setQuestData(data as QuestWithDetails);
        }
      } catch (error) {
        toast({ variant: 'destructive', title: "Erreur de chargement de la quête" });
      } finally {
        setLoading(false);
      }
    }
    loadQuest();
  }, [questId, toast]);

  const handleCompleteQuest = () => {
    startSubmitTransition(async () => {
        const result = await completeQuestForCurrentUser(questId);
        if (result.success) {
            toast({
                title: "Quête terminée !",
                description: `Félicitations ! "${questData?.title}" est maintenant marquée comme terminée.`,
            });
            router.push('/quests');
        } else {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: result.message
            });
        }
    });
  };

  const handleProjectAccess = async () => {
      if (!questData) return;
      
      setIsProjectLoading(true);
      try {
          const project = await getOrCreateQuestProject(
              questData.id, 
              questData.title, 
              questData.description || "Aucune description de quête fournie."
          );
          router.push(`/projects/${project.id}`);
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Erreur de création de projet", description: error.message });
      } finally {
          setIsProjectLoading(false);
      }
  };


  if (loading) {
      return (
          <AppShell>
              <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
          </AppShell>
      )
  }

  if (!questData) {
    return redirect('/quests');
  }

  return (
    <AppShell>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">{questData.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2 text-sm">Récompenses</h3>
                    <div className="flex gap-4">
                        <Badge variant="secondary" className="text-lg"><Star className="mr-2 text-yellow-500"/> {questData.xp} XP</Badge>
                        {questData.orbs && questData.orbs > 0 && <Badge variant="secondary" className="text-lg"><Gem className="mr-2 text-blue-500"/> {questData.orbs} Orbes</Badge>}
                    </div>
                </div>
                <div>
                     <h3 className="font-semibold mb-2 text-sm">Catégorie</h3>
                     <Badge variant="outline"><Swords className="mr-2"/>{questData.category}</Badge>
                </div>
                <div>
                    <h3 className="font-semibold mb-2 text-sm">Votre Tâche</h3>
                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md border">{questData.description || "Aucune tâche spécifique définie."}</p>
                </div>
            </CardContent>
          </Card>
          
          {questData.resources.length > 0 && (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/> Ressources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {questData.resources.map(({ resource }) => (
                        <Link href={`/resources/${resource.id}`} key={resource.id}>
                            <Button variant="outline" className="w-full justify-start">
                                {resource.title}
                            </Button>
                        </Link>
                    ))}
                </CardContent>
            </Card>
          )}
          
          <AiMentor 
            code={""}
            error={""}
            task={questData.description || "Aucune tâche spécifique définie."}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Espace de Travail du Projet</CardTitle>
              <CardDescription>Tout le travail pour cette quête se fait dans son projet dédié.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-64">
                <FolderKanban className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold">Projet: {questData.title}</h3>
                <p className="text-muted-foreground mb-6">Votre hub central pour cette quête.</p>
                <Button size="lg" onClick={handleProjectAccess} disabled={isProjectLoading}>
                    {isProjectLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Play className="mr-2" />}
                    {questData.project ? "Ouvrir le Projet de Quête" : "Créer et Ouvrir le Projet"}
                </Button>
            </CardContent>
          </Card>
          
          <QuestQuiz questId={questData.id} onQuizComplete={setIsQuizCompleted} />

          <div className="flex justify-end gap-4">
              <Button onClick={handleCompleteQuest} disabled={!isQuizCompleted || isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Valider la Quête et Terminer
              </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}