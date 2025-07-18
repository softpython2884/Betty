
"use client"
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, GripVertical, FileCode, Type } from "lucide-react";

const McqEditor = () => (
    <div className="space-y-4">
        <Label>Question à Choix Multiples</Label>
        <Input placeholder="Quelle est la question ?" />
        <div className="space-y-2 pl-4">
            <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <Input placeholder="Option 1 (bonne réponse)" className="border-green-500" />
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
            </div>
             <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <Input placeholder="Option 2" />
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
            </div>
             <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <Input placeholder="Option 3" />
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
            </div>
        </div>
        <Button variant="outline" size="sm"><PlusCircle className="mr-2" /> Ajouter une option</Button>
    </div>
);

const TrueFalseEditor = () => (
    <div className="space-y-4">
        <Label>Question Vrai/Faux</Label>
        <Input placeholder="Énoncé de la question" />
        <div className="flex items-center gap-4 pl-4">
            <p className="text-sm font-medium">Bonne réponse:</p>
            <div className="flex items-center gap-2">
                <Button variant="outline" className="border-green-500">Vrai</Button>
                <Button variant="outline">Faux</Button>
            </div>
        </div>
    </div>
);

const CodeSnippetEditor = () => (
     <div className="space-y-4">
        <Label className="flex items-center gap-2"><FileCode/> Question de Code</Label>
        <Textarea placeholder="Décrivez le problème de codage ou la question..." />
        <Textarea placeholder="Optionnellement, fournissez un extrait de code de départ." className="font-code" />
        <Textarea placeholder="Décrivez les critères d'évaluation ou la solution attendue." />
    </div>
);

const FreeTextEditor = () => (
    <div className="space-y-4">
        <Label className="flex items-center gap-2"><Type/> Question à Réponse Libre</Label>
        <Textarea placeholder="Posez votre question ouverte ici..." />
    </div>
);


export default function QuizBuilderPage() {
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
                                <Card className="p-4 bg-muted/30">
                                    <McqEditor />
                                </Card>
                                <Card className="p-4 bg-muted/30">
                                    <TrueFalseEditor />
                                </Card>
                                <Card className="p-4 bg-muted/30">
                                    <CodeSnippetEditor />
                                </Card>
                                 <Card className="p-4 bg-muted/30">
                                    <FreeTextEditor />
                                </Card>
                                <Button variant="outline" className="w-full">
                                    <PlusCircle className="mr-2" />
                                    Ajouter une question
                                </Button>
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
                                    <Input id="quiz-title" defaultValue="Quiz: JavaScript Basics" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linked-quest">Quête Associée</Label>
                                     <Select>
                                        <SelectTrigger id="linked-quest">
                                            <SelectValue placeholder="Sélectionner une quête" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="js-intro">JavaScript Intro</SelectItem>
                                            <SelectItem value="css-fun">CSS Fundamentals</SelectItem>
                                            <SelectItem value="html-basics">HTML Basics</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="passing-score">Score de Réussite (%)</Label>
                                    <Input id="passing-score" type="number" defaultValue="80" />
                                </div>
                                <Button className="w-full">Enregistrer le Quiz</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
