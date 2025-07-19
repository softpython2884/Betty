
"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ShieldQuestion, Loader2 } from "lucide-react"
import { getQuizByQuestId } from "@/app/actions/quizzes"

type QuizData = Awaited<ReturnType<typeof getQuizByQuestId>>;

interface QuestQuizProps {
  questId: string;
  onQuizComplete: (isSuccess: boolean) => void;
}

export function QuestQuiz({ questId, onQuizComplete }: QuestQuizProps) {
    const [quizData, setQuizData] = useState<QuizData>(null);
    const [loading, setLoading] = useState(true);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        getQuizByQuestId(questId).then(data => {
            setQuizData(data);
            setLoading(false);
        });
    }, [questId]);


    useEffect(() => {
        // If there's no quiz, or if it's already completed, notify the parent.
        if ((!loading && !quizData) || quizCompleted) {
            onQuizComplete(true);
        }
    }, [loading, quizData, quizCompleted, onQuizComplete]);

    if (loading) {
        return (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldQuestion className="text-primary"/> Chargement du Quiz...</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    if (!quizData) {
        return null;
    }

    const handleQuizSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // In a real app, you would grade the quiz here.
        // For this prototype, we'll just mark it as completed successfully.
        setShowFeedback(true);
        setQuizCompleted(true);
        onQuizComplete(true);
    }

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldQuestion className="text-primary"/> {quizData.title}</CardTitle>
                <CardDescription>Vous devez réussir ce quiz pour valider la quête.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleQuizSubmit} className="space-y-6">
                {quizData.questions.map((question: any, index: number) => (
                    <div key={question.id} className="space-y-2">
                        <Label className="font-semibold">{index + 1}. {question.text}</Label>
                        <RadioGroup disabled={quizCompleted}>
                            {question.options.map((opt: any) => (
                                <div key={opt.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={opt.id} id={`${question.id}-${opt.id}`} />
                                    <Label htmlFor={`${question.id}-${opt.id}`}>{opt.text}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                ))}
                
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
    )
}
