
"use client"
import { useState } from 'react';
import { Lightbulb, BookText, Loader2 } from 'lucide-react';
import { generateCodeHints, GenerateCodeHintsInput, GenerateCodeHintsOutput } from '@/ai/flows/generate-code-hints';
import { explainCodeSnippet, ExplainCodeSnippetInput, ExplainCodeSnippetOutput } from '@/ai/flows/explain-code-snippet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AiMentorProps {
  code: string;
  error: string;
  task: string;
}

export function AiMentor({ code, error, task }: AiMentorProps) {
  const [loading, setLoading] = useState<'' | 'hint' | 'explain'>('');
  const [hint, setHint] = useState<GenerateCodeHintsOutput | null>(null);
  const [explanation, setExplanation] = useState<ExplainCodeSnippetOutput | null>(null);
  const { toast } = useToast();

  const handleGetHint = async () => {
    setLoading('hint');
    setHint(null);
    setExplanation(null);
    try {
      const input: GenerateCodeHintsInput = { code, error, task };
      const result = await generateCodeHints(input);
      setHint(result);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la récupération de l\'indice',
        description: 'Le mentor IA n\'a pas pu générer d\'indice. Veuillez réessayer.',
      });
      console.error(e);
    } finally {
      setLoading('');
    }
  };

  const handleExplainCode = async () => {
    setLoading('explain');
    setHint(null);
    setExplanation(null);
    try {
      const input: ExplainCodeSnippetInput = { code };
      const result = await explainCodeSnippet(input);
      setExplanation(result);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la récupération de l\'explication',
        description: 'Le mentor IA n\'a pas pu expliquer le code. Veuillez réessayer.',
      });
      console.error(e);
    } finally {
      setLoading('');
    }
  };


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary" /> Mentor IA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button onClick={handleGetHint} disabled={loading !== ''}>
            {loading === 'hint' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Obtenir un indice
          </Button>
          <Button onClick={handleExplainCode} variant="outline" disabled={loading !== ''}>
             {loading === 'explain' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BookText className="mr-2 h-4 w-4" />
            )}
            Expliquer mon code
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {hint && (
          <div className="space-y-4 rounded-lg border bg-secondary/30 p-4">
            <div>
              <h3 className="font-semibold text-secondary-foreground">Indice:</h3>
              <p className="text-muted-foreground">{hint.hint}</p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-foreground">Question à considérer:</h3>
              <p className="text-muted-foreground">{hint.question}</p>
            </div>
          </div>
        )}

        {explanation && (
           <div className="space-y-4 rounded-lg border bg-secondary/30 p-4">
            <div>
              <h3 className="font-semibold text-secondary-foreground">Explication:</h3>
              <p className="text-muted-foreground">{explanation.explanation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
