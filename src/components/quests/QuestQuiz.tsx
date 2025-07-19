
"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ShieldQuestion } from "lucide-react"

// Mock quiz data for a given quest.
// In a real app, this would be fetched from the database based on the questId.
const quizDataStore: { [key: string]: any } = {
  "default": {
    title: "Quiz de Validation",
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
}


export function QuestQuiz({ questId }: { questId: string }) {
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    
    // In a real app, you would fetch the quiz for the questId.
    const quizData = quizDataStore["default"];

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
                {/* Question 1 */}
                <div className="space-y-2">
                    <Label className="font-semibold">1. {quizData.questions[0].text}</Label>
                    <RadioGroup>
                        {quizData.questions[0].options.map((opt: string) => (
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
    )
}
