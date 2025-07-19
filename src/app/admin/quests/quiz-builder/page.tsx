
"use client"
import React, { useState, useEffect } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, GripVertical, FileCode, Type, Check, Wand2 } from "lucide-react";
import type { Quest } from '@/lib/db/schema';
import { getQuestsByCurriculum, getCurriculums } from '@/app/actions/quests';

type QuestionType = 'mcq' | 'true-false' | 'free-text' | 'code';

interface Option {
    id: number;
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: number;
    type: QuestionType;
    text: string;
    options: Option[];
}

const QuestionEditor = ({ question, updateQuestion, removeQuestion }: { question: Question, updateQuestion: (q: Question) => void, removeQuestion: () => void }) => {
    
    const handleOptionChange = (optionId: number, text: string) => {
        const newOptions = question.options.map(o => o.id === optionId ? { ...o, text } : o);
        updateQuestion({ ...question, options: newOptions });
    };

    const setCorrectAnswer = (optionId: number) => {
        const newOptions = question.options.map(o => ({ ...o, isCorrect: o.id === optionId }));
         updateQuestion({ ...question, options: newOptions });
    };

    const addOption = () => {
        const newOption: Option = { id: Date.now(), text: '', isCorrect: false };
        updateQuestion({ ...question, options: [...question.options, newOption] });
    };

    const removeOption = (optionId: number) => {
        const newOptions = question.options.filter(o => o.id !== optionId);
        updateQuestion({ ...question, options: newOptions });
    }

    const renderEditor = () => {
        switch (question.type) {
            case 'mcq':
                return (
                    <div className="space-y-4">
                        <Textarea 
                            placeholder="Quelle est la question ?" 
                            value={question.text} 
                            onChange={(e) => updateQuestion({ ...question, text: e.target.value })} 
                        />
                        <div className="space-y-2 pl-4">
                            {question.options.map(option => (
                                <div key={option.id} className="flex items-center gap-2">
                                    <Button variant={option.isCorrect ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setCorrectAnswer(option.id)}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Input 
                                        placeholder={`Option ${option.id}`} 
                                        value={option.text} 
                                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                        className={option.isCorrect ? "border-green-500" : ""}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(option.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={addOption}><PlusCircle className="mr-2" /> Ajouter une option</Button>
                    </div>
                );
            case 'true-false':
                 return (
                    <div className="space-y-4">
                        <Textarea 
                            placeholder="Énoncé de la question Vrai/Faux"
                            value={question.text}
                            onChange={(e) => updateQuestion({...question, text: e.target.value})}
                         />
                        <div className="flex items-center gap-4 pl-4">
                            <p className="text-sm font-medium">Bonne réponse:</p>
                            <div className="flex items-center gap-2">
                                <Button variant={question.options.find(o=>o.text === 'Vrai')?.isCorrect ? 'default' : 'outline'} onClick={() => updateQuestion({...question, options: [{id: 1, text: 'Vrai', isCorrect: true}, {id: 2, text: 'Faux', isCorrect: false}]})}>Vrai</Button>
                                <Button variant={question.options.find(o=>o.text === 'Faux')?.isCorrect ? 'default' : 'outline'} onClick={() => updateQuestion({...question, options: [{id: 1, text: 'Vrai', isCorrect: false}, {id: 2, text: 'Faux', isCorrect: true}]})}>Faux</Button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <p>Type de question non supporté.</p>;
        }
    }

    return (
        <Card className="p-4 bg-muted/30 relative group">
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="destructive" size="icon" className="h-7 w-7" onClick={removeQuestion}><Trash2 className="h-4 w-4"/></Button>
            </div>
            {renderEditor()}
        </Card>
    );
};


export default function QuizBuilderPage() {
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("");
    const [quests, setQuests] = useState<Quest[]>([]);
    const [selectedQuestId, setSelectedQuestId] = useState<string>("");

    const [quizTitle, setQuizTitle] = useState("");
    const [passingScore, setPassingScore] = useState(80);
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        getCurriculums().then(setCurriculums);
    }, []);

    useEffect(() => {
        if (selectedCurriculumId) {
            getQuestsByCurriculum(selectedCurriculumId).then(setQuests);
        } else {
            setQuests([]);
        }
        setSelectedQuestId("");
    }, [selectedCurriculumId]);

    const addQuestion = (type: QuestionType) => {
        let newQuestion: Question;
        const base = { id: Date.now(), text: '', type };

        if (type === 'mcq') {
            newQuestion = { ...base, options: [{id: 1, text: '', isCorrect: true}] };
        } else if (type === 'true-false') {
            newQuestion = { ...base, options: [{id: 1, text: 'Vrai', isCorrect: true}, {id: 2, text: 'Faux', isCorrect: false}] };
        } else {
            newQuestion = { ...base, options: [] };
        }
        setQuestions(prev => [...prev, newQuestion]);
    };

    const updateQuestion = (updatedQuestion: Question) => {
        setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    };

    const removeQuestion = (questionId: number) => {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
    };

    const handleSaveQuiz = async () => {
        // Here you would call an action to save the quiz, questions, and options to the database.
        console.log({
            questId: selectedQuestId,
            title: quizTitle,
            passingScore,
            questions
        });
        alert("Quiz sauvegardé ! (Vérifiez la console pour les données)");
    }

    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">Quiz Builder</h1>
                    <p className="text-muted-foreground mt-2">Créez et associez des quiz à vos quêtes.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Contenu du Quiz</CardTitle>
                                <CardDescription>Ajoutez et organisez les questions du quiz.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {questions.map(q => (
                                    <QuestionEditor 
                                        key={q.id} 
                                        question={q} 
                                        updateQuestion={updateQuestion}
                                        removeQuestion={() => removeQuestion(q.id)}
                                    />
                                ))}
                                <div className="flex gap-2">
                                    <Button variant="outline" className="w-full" onClick={() => addQuestion('mcq')}>
                                        <PlusCircle className="mr-2" /> Ajouter QCM
                                    </Button>
                                     <Button variant="outline" className="w-full" onClick={() => addQuestion('true-false')}>
                                        <PlusCircle className="mr-2" /> Ajouter Vrai/Faux
                                    </Button>
                                    <Button variant="secondary" className="w-full">
                                        <Wand2 className="mr-2" /> Générer avec l'IA
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                         <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Paramètres du Quiz</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quiz-title">Titre du Quiz</Label>
                                    <Input id="quiz-title" placeholder="Quiz de validation" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="curriculum">Cursus</Label>
                                    <Select onValueChange={setSelectedCurriculumId} value={selectedCurriculumId}>
                                        <SelectTrigger id="curriculum"><SelectValue placeholder="Sélectionner un cursus" /></SelectTrigger>
                                        <SelectContent>
                                            {curriculums.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linked-quest">Quête Associée</Label>
                                     <Select onValueChange={setSelectedQuestId} value={selectedQuestId} disabled={!selectedCurriculumId}>
                                        <SelectTrigger id="linked-quest"><SelectValue placeholder="Sélectionner une quête" /></SelectTrigger>
                                        <SelectContent>
                                            {quests.map(q => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="passing-score">Score de Réussite (%)</Label>
                                    <Input id="passing-score" type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} />
                                </div>
                                <Button className="w-full" onClick={handleSaveQuiz} disabled={!selectedQuestId || !quizTitle}>Enregistrer le Quiz</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
