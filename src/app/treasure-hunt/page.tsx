'use client';

import { useEffect, useState, useTransition } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Key, Lightbulb, CheckCircle, Send, Trophy, Skull } from 'lucide-react';
import { getTodaysHunt, submitHuntFlag } from '../actions/treasure-hunt';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const dynamic = 'force-dynamic';

export default function TreasureHuntPage() {
  const [hunt, setHunt] = useState<{ id: string; htmlContent: string; hint: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedFlag, setSubmittedFlag] = useState('');
  const [isSubmitting, startSubmitting] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function loadHunt() {
      setIsLoading(true);
      try {
        const { hunt: huntData, isCompleted: completedStatus } = await getTodaysHunt();
        setHunt(huntData);
        setIsCompleted(completedStatus);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger la chasse au trésor du jour.' });
      } finally {
        setIsLoading(false);
      }
    }
    loadHunt();
  }, [toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hunt || !submittedFlag.trim()) return;

    startSubmitting(async () => {
        const result = await submitHuntFlag(hunt.id, submittedFlag);
        if (result.success) {
            toast({ title: 'Félicitations !', description: result.message });
            setIsCompleted(true);
        } else {
            toast({ variant: 'destructive', title: 'Dommage !', description: result.message });
        }
    });
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
    }
    if (!hunt) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground">
          <Skull className="h-24 w-24 mb-4" />
          <p>La chasse au trésor n'a pas pu être générée aujourd'hui.</p>
          <p>Veuillez réessayer plus tard.</p>
        </div>
      );
    }

    return (
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Le Site Mystère</CardTitle>
                    <CardDescription>Inspectez le code source de ce site pour trouver le flag caché.</CardDescription>
                </CardHeader>
                <CardContent>
                    <iframe
                        srcDoc={hunt.htmlContent}
                        className="w-full h-[600px] border rounded-md"
                        sandbox="allow-scripts"
                        title="Chasse au Trésor du Jour"
                    />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
             <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Key />Soumettre le Flag</CardTitle>
                </CardHeader>
                <CardContent>
                    {isCompleted ? (
                         <Alert variant="default" className="bg-green-500/10 border-green-500/20">
                            <Trophy className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Terminé !</AlertTitle>
                            <AlertDescription className="text-green-700">
                               Vous avez déjà trouvé le trésor d'aujourd'hui. Revenez demain !
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input 
                                placeholder="Ex: B3TTY-FLAG-..."
                                value={submittedFlag}
                                onChange={(e) => setSubmittedFlag(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2" />}
                                Valider
                            </Button>
                        </form>
                    )}
                </CardContent>
             </Card>
              <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb /> Indice</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground italic">{hunt.hint}</p>
                </CardContent>
             </Card>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight">Chasse au Trésor du Jour</h1>
          <p className="text-muted-foreground mt-2">Chaque jour, un nouveau défi. Trouvez le flag caché dans le code pour gagner des récompenses !</p>
        </div>
        {renderContent()}
      </div>
    </AppShell>
  );
}
