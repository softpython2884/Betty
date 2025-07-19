
"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ShieldQuestion, Loader2 } from "lucide-react"

// Mocked action, replace with real one
const getQuizForQuest = async (questId: string) => {
    console.log("Fetching quiz for quest:", questId);
    // In a real app, this would fetch from the DB.
    // Returning mock data for now.
    const quizDataStore: { [key: string]: any } = {
        "default": {
            id: 'quiz1',
            title: "Quiz de Validation des Connaissances",
            questions: [
                {
                    id: 'q1',
                    text: 'Quel mot-clé est utilisé pour déclarer une variable en JavaScript qui ne peut PAS être réassignée ?',
                    options: [{id: 'opt1', text: 'let'}, {id: 'opt2', text: 'const'}, {id: 'opt3', text: 'var'}],
                    answerId: 'opt2'
                },
                {
                    id: 'q2',
                    text: '`const` est une abréviation pour "constant".',
                    options: [{id: 'opt4', text: 'Vrai'}, {id: 'opt5', text: 'Faux'}],
                    answerId: 'opt4'
                }
            ]
        }
    };
    return quizDataStore['default'];
};


export function QuestQuiz({ questId }: { questId: string }) {
    const [quizData, setQuizData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        getQuizForQuest(questId).then(data => {
            setQuizData(data);
            setLoading(false);
        });
    }, [questId]);


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
        return null; // or a placeholder saying no quiz for this quest
    }

    const handleQuizSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // In a real app, you would grade the quiz here.
        // For this prototype, we'll just mark it as completed.
        setShowFeedback(true);
        setQuizCompleted(true);
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
                        <RadioGroup>
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
