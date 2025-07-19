
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  User,
  FolderKanban,
  Calendar,
  Loader2,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  GraduationCap,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getSubmissionById, gradeSubmission, type SubmissionDetails } from '@/app/actions/projects';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { gradeProject } from '@/ai/flows/grade-project-flow';
import { Separator } from '@/components/ui/separator';

export const dynamic = 'force-dynamic';

type AiFeedback = {
  suggestedGrade: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
};

export default function GradeSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;
  const { toast } = useToast();

  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGrading, startGradingTransition] = useTransition();
  const [isAnalyzing, startAnalyzingTransition] = useTransition();
  
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [finalGrade, setFinalGrade] = useState<number | string>('');
  const [finalFeedback, setFinalFeedback] = useState('');

  useEffect(() => {
    if (!submissionId) return;

    async function loadSubmission() {
      setLoading(true);
      const data = await getSubmissionById(submissionId);
      if (!data) {
        toast({ variant: 'destructive', title: 'Soumission non trouvée' });
        router.push('/admin/grading');
      } else {
        setSubmission(data);
        if (data.grade) setFinalGrade(data.grade);
        if (data.feedback) setFinalFeedback(data.feedback);
      }
      setLoading(false);
    }
    loadSubmission();
  }, [submissionId, router, toast]);

  const handleAiAnalysis = () => {
    if (!submission) return;

    startAnalyzingTransition(async () => {
        setAiFeedback(null);
        try {
            const quest = submission.project.curriculum?.quests[0];
            const result = await gradeProject({
                questTitle: quest?.title || submission.project.title,
                questDescription: quest?.description || "Aucune description de quête.",
                projectTitle: submission.project.title,
                projectDocuments: submission.project.documents.map(d => ({title: d.title, content: d.content || ''})),
            });
            setAiFeedback(result);
            setFinalGrade(result.suggestedGrade);
            setFinalFeedback(result.feedback);
            toast({ title: "Analyse IA terminée", description: "Les suggestions ont été pré-remplies." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Erreur d'analyse IA", description: "L'IA n'a pas pu analyser le projet."})
        }
    });
  }

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalGrade || !finalFeedback) return;

    startGradingTransition(async () => {
        const result = await gradeSubmission(submissionId, Number(finalGrade), finalFeedback);
        if (result.success) {
            toast({ title: "Notation enregistrée !", description: result.message });
            router.push('/admin/grading');
        } else {
            toast({ variant: 'destructive', title: "Erreur de notation", description: result.message });
        }
    });
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!submission) {
    return null; // or a not found component
  }

  const isAlreadyGraded = submission.status === 'graded';

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <Button asChild variant="outline" className="mb-4">
            <Link href="/admin/grading">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la file d'attente
            </Link>
          </Button>
          <h1 className="text-4xl font-headline tracking-tight">Évaluation du Projet</h1>
          <p className="text-muted-foreground mt-2">
            Évaluation de "{submission.project.title}" pour {submission.user.name}.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Détails de la Soumission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{submission.user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={`/projects/${submission.projectId}`}
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    {submission.project.title}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Soumis le {format(new Date(submission.submittedAt), 'd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Wand2 className='text-primary' /> Assistant IA</CardTitle>
                    <CardDescription>Obtenez une première analyse du projet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleAiAnalysis} disabled={isAnalyzing} className='w-full'>
                        {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                        Lancer l'Analyse IA
                    </Button>
                </CardContent>
            </Card>

            {isAnalyzing && (
                 <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p>L'IA analyse le projet...</p>
                        <p className="text-xs text-center">Cela peut prendre jusqu'à une minute.</p>
                    </CardContent>
                 </Card>
            )}

            {aiFeedback && (
                <Card>
                    <CardHeader>
                        <CardTitle>Analyse de l'IA</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Note Suggérée</h4>
                            <Badge variant="secondary" className='text-lg'>{aiFeedback.suggestedGrade} / 100</Badge>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><ThumbsUp className='text-green-500'/> Points Forts</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {aiFeedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><ThumbsDown className='text-orange-500'/> Pistes d'Amélioration</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {aiFeedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleGradeSubmit}>
                <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><GraduationCap className='text-primary'/> Notation Finale</CardTitle>
                    <CardDescription>Entrez la note et le feedback final pour l'étudiant.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isAlreadyGraded && (
                        <div className='p-4 rounded-md bg-blue-500/10 text-blue-800 border border-blue-500/20'>
                            <p className='font-semibold'>Ce projet a déjà été noté.</p>
                            <p className='text-sm'>Vous pouvez modifier la note si nécessaire.</p>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="grade" className="text-lg">Note Finale (/100)</Label>
                        <Input 
                            id="grade"
                            type="number"
                            min="0"
                            max="100"
                            value={finalGrade}
                            onChange={(e) => setFinalGrade(e.target.value)}
                            className="text-2xl font-bold h-14 w-48"
                            required
                            disabled={isGrading}
                        />
                    </div>
                     <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="feedback" className="text-lg">Feedback pour l'étudiant</Label>
                        <Textarea 
                            id="feedback"
                            rows={15}
                            value={finalFeedback}
                            onChange={(e) => setFinalFeedback(e.target.value)}
                            placeholder="Commencez par les points positifs, puis les axes d'amélioration..."
                            required
                            disabled={isGrading}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" size="lg" disabled={isGrading}>
                        {isGrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                        {isAlreadyGraded ? "Mettre à jour la notation" : "Valider la Notation"}
                    </Button>
                </CardFooter>
                </Card>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
