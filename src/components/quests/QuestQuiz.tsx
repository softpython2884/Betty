
"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ShieldQuestion, Loader2, ThumbsUp, ThumbsDown } from "lucide-react"
import { getQuizByQuestId } from "@/app/actions/quizzes"

type QuizData = Awaited<ReturnType<typeof getQuizByQuestId>>;
type Answers = Record<string, string>;

interface QuestQuizProps {
  questId: string;
  onQuizComplete: (isSuccess: boolean) => void;
}

export function QuestQuiz({ questId, onQuizComplete }: QuestQuizProps) {
    const [quizData, setQuizData] = useState<QuizData>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Answers>({});
    const [score, setScore] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const isQuizAttempted = score !== null;
    const isQuizPassed = score !== null && quizData !== null && score >= quizData.passingScore;

    useEffect(() => {
        setLoading(true);
        getQuizByQuestId(questId).then(data => {
            setQuizData(data);
            setLoading(false);
            // If there's no quiz, it's considered "complete" for the sake of progression
            if (!data) {
                onQuizComplete(true);
            }
        });
    }, [questId, onQuizComplete]);

    const handleAnswerChange = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleQuizSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!quizData) return;

        let correctAnswers = 0;
        quizData.questions.forEach(question => {
            const correctAnswer = question.options.find(opt => opt.isCorrect);
            if (correctAnswer && answers[question.id] === correctAnswer.id) {
                correctAnswers++;
            }
        });
        
        const calculatedScore = (correctAnswers / quizData.questions.length) * 100;
        setScore(calculatedScore);
        setShowFeedback(true);
        
        const passed = calculatedScore >= quizData.passingScore;
        onQuizComplete(passed);
    };
    
    const resetQuiz = () => {
        setAnswers({});
        setScore(null);
        setShowFeedback(false);
        onQuizComplete(false);
    }

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
        return null; // No quiz for this quest
    }

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldQuestion className="text-primary"/> {quizData.title}</CardTitle>
                <CardDescription>Vous devez obtenir au moins {quizData.passingScore}% pour valider la quête.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleQuizSubmit} className="space-y-6">
                    {quizData.questions.map((question, index) => (
                        <div key={question.id} className="space-y-2">
                            <Label className="font-semibold">{index + 1}. {question.text}</Label>
                            <RadioGroup 
                                onValueChange={(value) => handleAnswerChange(question.id, value)} 
                                value={answers[question.id] || ""}
                                disabled={isQuizAttempted}
                            >
                                {question.options.map((opt) => (
                                    <div key={opt.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={opt.id} id={`${question.id}-${opt.id}`} />
                                        <Label htmlFor={`${question.id}-${opt.id}`}>{opt.text}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    ))}
                    
                    {showFeedback && score !== null && (
                        <div className={`p-4 rounded-md border ${isQuizPassed ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-red-500/10 text-red-700 border-red-500/20'}`}>
                            <div className="flex items-center gap-2">
                                {isQuizPassed ? <ThumbsUp/> : <ThumbsDown/>}
                                <h4 className="font-semibold">Résultat du Quiz</h4>
                            </div>
                            <p className="text-sm mt-1">Votre score est de {score.toFixed(0)}%.</p>
                            {!isQuizPassed && <p className="text-sm mt-1">Vous n'avez pas atteint le score requis. Réessayez !</p>}
                        </div>
                    )}

                    {!isQuizAttempted && <Button type="submit">Soumettre le Quiz</Button>}
                    {isQuizAttempted && !isQuizPassed && <Button type="button" onClick={resetQuiz}>Réessayer le Quiz</Button>}
                </form>
            </CardContent>
        </Card>
    )
}
