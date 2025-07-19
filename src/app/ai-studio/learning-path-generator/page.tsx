
"use client";

import { useState, useTransition, useEffect } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { QuestTree, QuestNodeProps, Connection } from "@/components/quests/QuestTree";
import { Route, Wand2, Loader2, Sparkles } from "lucide-react";

const availableSkills = [
  "JavaScript", "HTML", "CSS", "React", "Next.js", "Node.js", "Express", "SQL", "Drizzle ORM", "TypeScript", "Git", "Docker"
];

const simulatedQuests: QuestNodeProps[] = [
    { id: '1', title: 'Bases de JavaScript', category: 'Core', xp: 100, status: 'available', position: { top: '10%', left: '50%' }, rawQuest: {} as any },
    { id: '2', title: 'Variables et Types', category: 'Core', xp: 150, status: 'locked', position: { top: '25%', left: '30%' }, rawQuest: {} as any },
    { id: '3', title: 'Fonctions et Portée', category: 'Core', xp: 150, status: 'locked', position: { top: '25%', left: '70%' }, rawQuest: {} as any },
    { id: '4', title: 'Introduction à React', category: 'Frontend', xp: 200, status: 'locked', position: { top: '45%', left: '30%' }, rawQuest: {} as any },
    { id: '5', title: 'Serveur avec Node.js', category: 'Backend', xp: 200, status: 'locked', position: { top: '45%', left: '70%' }, rawQuest: {} as any },
    { id: '6', title: 'Projet Full-Stack', category: 'Project', xp: 500, status: 'locked', position: { top: '65%', left: '50%' }, rawQuest: {} as any },
];

const simulatedConnections: Connection[] = [
    { from: '1', to: '2' },
    { from: '1', to: '3' },
    { from: '2', to: '4' },
    { from: '3', to: '5' },
    { from: '4', to: '6' },
    { from: '5', to: '6' },
];

const simulationLogs = [
    "Analyzing selected skills...",
    "Identifying core concepts...",
    "Querying quest database for relevant content...",
    "Generating prerequisite dependencies...",
    "Assembling questline...",
    "Finalizing learning path...",
];


const SimulatedProgress = ({ onDone }: { onDone: () => void }) => {
    const [currentLog, setCurrentLog] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLog(prev => {
                if (prev >= simulationLogs.length - 1) {
                    clearInterval(interval);
                    onDone();
                    return prev;
                }
                return prev + 1;
            });
        }, 600);
        return () => clearInterval(interval);
    }, [onDone]);

    return (
        <div className="flex flex-col items-center justify-center h-[600px] text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <p className="text-xl font-semibold text-muted-foreground">{simulationLogs[currentLog]}</p>
        </div>
    );
}

export default function LearningPathGeneratorPage() {
    const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set(["JavaScript", "React", "Node.js"]));
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPathReady, setIsPathReady] = useState(false);

    const handleSkillToggle = (skill: string) => {
        setSelectedSkills(prev => {
            const newSet = new Set(prev);
            if (newSet.has(skill)) {
                newSet.delete(skill);
            } else {
                newSet.add(skill);
            }
            return newSet;
        });
    };

    const handleGenerate = () => {
        if (selectedSkills.size === 0) return;
        setIsGenerating(true);
        setIsPathReady(false);
    };

    const handleGenerationDone = () => {
        setIsPathReady(true);
    };

    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3">
                        <Route className="text-primary h-10 w-10" /> Générateur de Parcours d'Apprentissage
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Choisissez vos compétences, et laissez l'IA construire votre chemin vers la maîtrise.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Sélectionnez vos Compétences</CardTitle>
                                <CardDescription>Choisissez les technologies que vous souhaitez apprendre.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {availableSkills.map(skill => (
                                    <div key={skill} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={skill}
                                            checked={selectedSkills.has(skill)}
                                            onCheckedChange={() => handleSkillToggle(skill)}
                                            disabled={isGenerating}
                                        />
                                        <Label htmlFor={skill}>{skill}</Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                         <Button onClick={handleGenerate} className="w-full" size="lg" disabled={isGenerating || selectedSkills.size === 0}>
                            <Wand2 className="mr-2" /> Générer mon Parcours
                        </Button>
                    </div>

                    <div className="lg:col-span-2">
                         {isGenerating ? (
                             <SimulatedProgress onDone={handleGenerationDone} />
                         ) : (
                            <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-muted/20 text-center">
                                <Sparkles className="h-24 w-24 text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-bold">Votre parcours personnalisé apparaîtra ici.</h3>
                                <p className="text-muted-foreground">Prêt à commencer votre aventure ?</p>
                            </div>
                         )}

                         {isPathReady && (
                            <QuestTree
                                curriculumName="Parcours Personnalisé"
                                curriculumSubtitle={`Basé sur : ${Array.from(selectedSkills).join(', ')}`}
                                questNodes={simulatedQuests}
                                connections={simulatedConnections}
                            />
                         )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
