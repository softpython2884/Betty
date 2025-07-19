'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Rocket, Sparkles } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { kickstartProjectAction } from '@/app/actions/projects';

export default function ProjectKickstarterPage() {
  const [idea, setIdea] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      toast({ variant: 'destructive', title: 'Idée requise', description: 'Veuillez décrire votre idée de projet.' });
      return;
    }

    startTransition(async () => {
      const result = await kickstartProjectAction(idea);

      if (result.success && result.projectId) {
        toast({
          title: 'Projet Lancé !',
          description: 'Votre nouveau projet a été créé avec succès. Redirection...',
        });
        router.push(`/projects/${result.projectId}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur de Création',
          description: result.message,
        });
      }
    });
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3">
            <Rocket className="text-primary h-10 w-10" /> Project Kick-starter
          </h1>
          <p className="text-muted-foreground mt-2">
            Transformez une simple idée en un projet structuré, avec un nom, une description et un README, le tout en un clic.
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quelle est votre idée de génie ?</CardTitle>
            <CardDescription>
              Décrivez votre concept en quelques mots. L'IA s'occupe du reste.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-idea">Votre idée</Label>
                <Textarea
                  id="project-idea"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Ex: Une application de type 'to-do list' avec authentification utilisateur et des projets collaboratifs..."
                  rows={5}
                  disabled={isPending}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto" size="lg">
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Lancer le Projet
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
