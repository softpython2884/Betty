
"use client";

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { AiMentor } from "@/components/quests/AiMentor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FolderKanban, Play, ShieldQuestion, Lightbulb, BookOpen } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

// Dummy data for a quest
const questData = {
  id: "3",
  title: "JavaScript Intro: La Forêt des Fonctions",
  description: "Aventurez-vous dans la Forêt des Fonctions, où vous apprendrez l'art ancien d'écrire et d'appeler vos propres fonctions JavaScript. Votre tâche est de créer une fonction qui salue un autre aventurier.",
  task: "Écrivez une fonction JavaScript nommée `greet` qui accepte un argument, `name`, et retourne la chaîne 'Bonjour, ' suivie du nom.",
  initialCode: `// Votre code ici\n\nfunction greet(name) {\n  \n}\n`,
  hasQuiz: true,
  linkedResources: [
      { id: 'res_2', title: 'Comprendre `this` en JS' },
      { id: 'res_4', title: 'Introduction à Git' }
  ]
};

const quizData = {
    title: "Quiz: Les bases de JavaScript",
    questions: [
        {
            id: 'q1',
            type: 'mcq',
            text: 'Quel mot-clé est utilisé pour déclarer une variable en JavaScript qui peut être réassignée ?',
            options: ['let', 'const', 'var', 'variable'],
            answer: 'let'
        },
        {
            id: 'q2',
            type: 'true-false',
            text: 'Les variables `const` peuvent être réassignées après leur déclaration.',
            answer: 'false'
        }
    ]
}

export default function QuestCodeSpacePage({ params }: { params: { questId: string } }) {
  const [code, setCode] = useState(questData.initialCode);
  const [error, setError] = useState("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleQuizSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // In a real app, you would grade the quiz here.
      // For this prototype, we'll just mark it as completed.
      setShowFeedback(true);
      setQuizCompleted(true);
  }

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
              <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md border">{questData.task}</p>
            </CardContent>
          </Card>
          
          {questData.linkedResources.length > 0 && (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/> Ressources Recommandées</CardTitle>
                    <CardDescription>Consultez ces documents pour vous aider à réussir la quête.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {questData.linkedResources.map(resource => (
                        <Link href={`/resources/${resource.id}`} key={resource.id}>
                            <Button variant="outline" className="w-full justify-start">
                                {resource.title}
                            </Button>
                        </Link>
                    ))}
                </CardContent>
            </Card>
          )}
          
          <AiMentor code={code} error={error} task={questData.task} />
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
                    <Link href={`/projects/${params.questId}`}>
                        <Play className="mr-2" />
                        Ouvrir le Projet de Quête
                    </Link>
                </Button>
            </CardContent>
          </Card>
          
          {questData.hasQuiz && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldQuestion className="text-primary"/> Quiz de Validation</CardTitle>
                <CardDescription>Vous devez réussir ce quiz pour valider la quête.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuizSubmit} className="space-y-6">
                    {/* Question 1 */}
                    <div className="space-y-2">
                        <Label className="font-semibold">1. {quizData.questions[0].text}</Label>
                        <RadioGroup>
                            {quizData.questions[0].options.map(opt => (
                                <div key={opt} className="flex items-center space-x-2">
                                    <RadioGroupItem value={opt} id={`q1-${opt}`} />
                                    <Label htmlFor={`q1-${opt}`}>{opt}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    {/* Question 2 */}
                    <div className="space-y-2">
                        <Label className="font-semibold">2. {quizData.questions[1].text}</Label>
                         <RadioGroup>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="q2-true" />
                                <Label htmlFor="q2-true">Vrai</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="q2-false" />
                                <Label htmlFor="q2-false">Faux</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {showFeedback && (
                        <div className="p-4 bg-green-500/10 text-green-700 rounded-md border border-green-500/20">
                            <h4 className="font-semibold">Quiz Soumis !</h4>
                            <p className="text-sm">Votre score est de 100%. Excellent travail !</p>
                        </div>
                    )}

                    {!quizCompleted && <Button type="submit">Soumettre le Quiz</Button>}
                </form>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
              <Button variant="outline" disabled={!quizCompleted}>Demander une Revue par les Pairs</Button>
              <Button disabled={!quizCompleted}>
                  <Check className="mr-2 h-4 w-4" />
                  Soumettre la Quête pour Évaluation
              </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
