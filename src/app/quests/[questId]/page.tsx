
import { redirect } from 'next/navigation';
import { AppShell } from "@/components/layout/AppShell";
import { AiMentor } from "@/components/quests/AiMentor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FolderKanban, Play, ShieldQuestion, BookOpen, AlertTriangle } from 'lucide-react';
import { getQuestById } from '@/app/actions/quests';
import Link from 'next/link';
import { QuestQuiz } from '@/components/quests/QuestQuiz';

export default async function QuestDetail({ params }: { params: { questId: string } }) {
  const questData = await getQuestById(params.questId);

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
              <CardDescription>{questData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Votre Tâche</h3>
              <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md border">{questData.description || "Aucune tâche spécifique définie."}</p>
            </CardContent>
          </Card>
          
          {questData.resources.length > 0 && (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/> Ressources Recommandées</CardTitle>
                    <CardDescription>Consultez ces documents pour vous aider à réussir la quête.</CardDescription>
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
            code={""} // In the future, this code could be fetched from the project's main file
            error={""} // This would come from a real-time code execution environment
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
                    <Link href={`/projects/${questData.id}`}>
                        <Play className="mr-2" />
                        Ouvrir le Projet de Quête
                    </Link>
                </Button>
            </CardContent>
          </Card>
          
          <QuestQuiz questId={questData.id} />

          <div className="flex justify-end gap-4">
              <Button variant="outline" disabled={!isQuizCompleted}>Demander une Revue par les Pairs</Button>
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
