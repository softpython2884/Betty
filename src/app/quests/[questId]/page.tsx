
"use client";

import { redirect } from 'next/navigation';
import { AppShell } from "@/components/layout/AppShell";
import { AiMentor } from "@/components/quests/AiMentor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FolderKanban, Play, ShieldQuestion, BookOpen, Gem, Star, Swords } from 'lucide-react';
import { getQuestById } from '@/app/actions/quests';
import Link from 'next/link';
import { QuestQuiz } from '@/components/quests/QuestQuiz';
import { useEffect, useState, useParams } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Quest } from '@/lib/db/schema';
import { Badge } from '@/components/ui/badge';

type QuestWithResources = Quest & {
  resources: { resource: { id: string; title: string } }[];
};

export default function QuestDetail() {
  const params = useParams();
  const questId = params.questId as string;
  const [questData, setQuestData] = useState<QuestWithResources | null>(null);
  const [loading, setLoading] = useState(true);
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
            setQuestData(data as QuestWithResources);
        }
      } catch (error) {
        toast({ variant: 'destructive', title: "Erreur de chargement de la quête" });
      } finally {
        setLoading(false);
      }
    }
    loadQuest();
  }, [questId, toast]);

  const markAsComplete = () => {
    if (!questId) return;
    const completedQuests = JSON.parse(localStorage.getItem('completedQuests') || '[]');
    if (!completedQuests.includes(questId)) {
        completedQuests.push(questId);
        localStorage.setItem('completedQuests', JSON.stringify(completedQuests));
        toast({ title: "Quête terminée !", description: `Félicitations ! "${questData?.title}" est maintenant marquée comme terminée.` });
    } else {
        toast({ title: "Déjà terminée", description: "Cette quête est déjà dans votre liste de quêtes terminées." });
    }
  }

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

  // A real implementation would check the student's progress
  const isQuizCompleted = false;

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
                        {questData.orbs > 0 && <Badge variant="secondary" className="text-lg"><Gem className="mr-2 text-blue-500"/> {questData.orbs} Orbes</Badge>}
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
                <Button size="lg" asChild>
                    <Link href={`/projects/${questId}`}>
                        <Play className="mr-2" />
                        Ouvrir le Projet de Quête
                    </Link>
                </Button>
            </CardContent>
          </Card>
          
          <QuestQuiz questId={questData.id} />

          <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={markAsComplete}>
                  <Check className="mr-2 h-4 w-4" />
                  Marquer comme terminée (Simulate)
              </Button>
              <Button disabled={!isQuizCompleted}>
                  <Check className="mr-2 h-4 w-4" />
                  Soumettre la Quête pour Évaluation
              </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
