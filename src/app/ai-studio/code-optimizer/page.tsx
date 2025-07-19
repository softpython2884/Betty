'use client';

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, Languages, Sparkles } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { optimizeCode } from '@/ai/flows/optimize-code-flow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function CodeOptimizerPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState<{ optimizedCode: string; explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({ variant: 'destructive', title: 'Code requis', description: 'Veuillez entrer du code à optimiser.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await optimizeCode({ code, language });
      setResult(response);
    } catch (error) {
      console.error('Error optimizing code:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de l\'IA',
        description: 'Désolé, une erreur est survenue lors de l\'optimisation.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3">
            <Wand2 className="text-primary h-10 w-10" /> Optimiseur de Code
          </h1>
          <p className="text-muted-foreground mt-2">
            Laissez l'IA refactoriser votre code pour le rendre plus performant et lisible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Votre Code</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOptimize} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Langage de Programmation</Label>
                   <Input
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="Ex: javascript, python, c..."
                    disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code-input">Collez votre code ici</Label>
                  <Textarea
                    id="code-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="function example() { ... }"
                    rows={15}
                    disabled={loading}
                    className="font-mono text-xs"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Optimiser mon Code
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="shadow-md sticky top-24">
            <CardHeader>
              <CardTitle>Résultat de l'Optimisation</CardTitle>
              <CardDescription>La version améliorée de votre code et les explications.</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] overflow-y-auto border rounded-md p-4 bg-muted/30">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : result ? (
                <article className="prose prose-sm dark:prose-invert max-w-none">
                  <h3>Code Optimisé</h3>
                  <pre><code className={`language-${language}`}>{result.optimizedCode}</code></pre>
                  <h3>Explication</h3>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.explanation}</ReactMarkdown>
                </article>
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground">
                  <Wand2 className="h-16 w-16 mb-4" />
                  <p>Le résultat de l'optimisation apparaîtra ici.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
