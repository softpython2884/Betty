'use client';

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileJson, Loader2, Wand2, Copy } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { generateReadme } from '@/ai/flows/generate-readme-flow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Label } from '@/components/ui/label';

export default function ReadmeGeneratorPage() {
  const [projectDescription, setProjectDescription] = useState('');
  const [fileStructure, setFileStructure] = useState('');
  const [readmeContent, setReadmeContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectDescription.trim()) {
      toast({ variant: 'destructive', title: 'Description requise', description: 'Veuillez décrire votre projet.' });
      return;
    }

    setLoading(true);
    setReadmeContent('');

    try {
      const result = await generateReadme({ projectDescription, fileStructure });
      setReadmeContent(result.readmeContent);
    } catch (error) {
      console.error('Error generating README:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de l\'IA',
        description: 'Désolé, une erreur est survenue lors de la génération du README.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(readmeContent);
    toast({ title: 'Copié !', description: 'Le contenu du README a été copié dans le presse-papiers.' });
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3">
            <FileJson className="text-primary h-10 w-10" /> Générateur de README
          </h1>
          <p className="text-muted-foreground mt-2">
            Décrivez votre projet, et laissez l'IA créer une documentation professionnelle pour vous.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
            <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Informations sur le projet</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="project-description">Décrivez votre projet</Label>
                        <Textarea
                            id="project-description"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="Ex: Une application de gestion de tâches avec Next.js, TypeScript et une base de données SQLite..."
                            rows={6}
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="file-structure">Structure des fichiers (Optionnel)</Label>
                        <Textarea
                            id="file-structure"
                            value={fileStructure}
                            onChange={(e) => setFileStructure(e.target.value)}
                            placeholder="Collez ici la sortie de la commande `tree` ou décrivez la structure..."
                            rows={10}
                            disabled={loading}
                            className="font-mono text-xs"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Générer le README
                    </Button>
                </form>
            </CardContent>
            </Card>

            <Card className="shadow-md sticky top-24">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>README.md Généré</CardTitle>
                        {readmeContent && (
                            <Button variant="outline" size="sm" onClick={handleCopy}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copier
                            </Button>
                        )}
                    </div>
                    <CardDescription>Aperçu du fichier généré par l'IA.</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] overflow-y-auto border rounded-md p-4 bg-muted/30">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                        </div>
                    ) : readmeContent ? (
                        <article className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{readmeContent}</ReactMarkdown>
                        </article>
                    ) : (
                        <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground">
                            <FileJson className="h-16 w-16 mb-4" />
                            <p>L'aperçu de votre README apparaîtra ici.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}
