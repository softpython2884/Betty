'use client';

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Loader2, Wand2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { explainConcept } from '@/ai/flows/explain-concept-flow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ConceptExplainerPage() {
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setLoading(true);
    setExplanation('');

    try {
      const result = await explainConcept({ concept });
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Error explaining concept:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de l\'IA',
        description: 'Désolé, une erreur est survenue lors de la génération de l\'explication.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3">
            <BrainCircuit className="text-primary h-10 w-10" /> Expliqueur de Concept
          </h1>
          <p className="text-muted-foreground mt-2">
            Un concept de programmation vous semble flou ? Demandez à l'IA de vous l'expliquer simplement.
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quel concept souhaitez-vous comprendre ?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExplain} className="flex flex-col sm:flex-row items-center gap-2">
              <Input
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ex: 'Les closures en JavaScript', 'Le polymorphisme en POO'..."
                disabled={loading}
                className="flex-grow"
              />
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Expliquer
              </Button>
            </form>
          </CardContent>
        </Card>

        {(loading || explanation) && (
          <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Explication</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                    </div>
                ) : (
                    <article className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
                    </article>
                )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
