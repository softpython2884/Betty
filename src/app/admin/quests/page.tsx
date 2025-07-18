
"use client";

import { useState, use, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { QuestTree, type QuestNodeProps, type Connection } from "@/components/quests/QuestTree";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ListTree, BrainCircuit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuestForm } from "@/components/quests/QuestForm";
import { createQuest, getQuestsByCurriculum, getQuestConnections, getCurriculums } from "@/app/actions/quests";
import { useToast } from "@/hooks/use-toast";
import type { Quest, Curriculum } from "@/lib/db/schema";
import { CreateCurriculumForm } from "@/components/quests/CreateCurriculumForm";


export default function AdminQuestsPage() {
    const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [quests, setQuests] = useState<QuestNodeProps[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isQuestDialogOpen, setIsQuestDialogOpen] = useState(false);
    const [isCurriculumDialogOpen, setIsCurriculumDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        async function loadCurriculums() {
            try {
                const curriculumData = await getCurriculums();
                setCurriculums(curriculumData);
                if (curriculumData.length > 0 && !selectedCurriculumId) {
                    setSelectedCurriculumId(curriculumData[0].id);
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error loading curriculums",
                    description: "Could not fetch curriculum data from the database."
                });
            }
        }
        loadCurriculums();
    }, [toast, selectedCurriculumId]);

    useEffect(() => {
        if (!selectedCurriculumId) {
            setQuests([]);
            setConnections([]);
            return;
        };

        async function loadQuests() {
            try {
                const questData = await getQuestsByCurriculum(selectedCurriculumId!);
                const connectionData = await getQuestConnections(selectedCurriculumId!);
                
                setQuests(questData.map(q => ({
                    id: q.id,
                    title: q.title,
                    category: q.category,
                    xp: q.xp,
                    status: q.status === 'published' ? 'available' : 'draft',
                    position: { top: q.positionTop, left: q.positionLeft }
                })));

                setConnections(connectionData.map(c => ({ from: c.fromId, to: c.toId })));

            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error loading quests",
                    description: "Could not fetch quest data for the selected curriculum."
                });
            }
        }
        loadQuests();
    }, [selectedCurriculumId, toast]);

    const handleCurriculumChange = (value: string) => {
        setSelectedCurriculumId(value);
    };

    const handleQuestCreated = (newQuest: Quest) => {
        toast({
            title: "Quest Created!",
            description: `"${newQuest.title}" has been added to the curriculum.`
        });
        setIsQuestDialogOpen(false);
        setQuests(prev => [...prev, {
            id: newQuest.id,
            title: newQuest.title,
            category: newQuest.category,
            xp: newQuest.xp,
            status: newQuest.status as "draft" | "available",
            position: { top: newQuest.positionTop, left: newQuest.positionLeft }
        }]);
    };
    
    const handleCurriculumCreated = (newCurriculum: Curriculum) => {
        toast({
            title: "Curriculum Created!",
            description: `"${newCurriculum.name}" is ready to be filled with quests.`
        });
        setIsCurriculumDialogOpen(false);
        setCurriculums(prev => [...prev, newCurriculum]);
        setSelectedCurriculumId(newCurriculum.id);
    };
    
    const selectedCurriculum = curriculums.find(c => c.id === selectedCurriculumId);

    return (
        <AppShell>
            <div className="space-y-8">
                 <div>
                    <h1 className="text-4xl font-headline tracking-tight">Quest Editor</h1>
                    <p className="text-muted-foreground mt-2">Build and manage the main curriculum and dynamic side quests. Click and drag to pan, use scroll to zoom.</p>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="w-full max-w-xs">
                        <Select value={selectedCurriculumId || ''} onValueChange={handleCurriculumChange}>
                            <SelectTrigger>
                                <ListTree className="mr-2"/>
                                <SelectValue placeholder="Select a curriculum" />
                            </SelectTrigger>
                            <SelectContent>
                                {curriculums.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isCurriculumDialogOpen} onOpenChange={setIsCurriculumDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <PlusCircle className="mr-2" />
                                    New Curriculum
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2"><BrainCircuit/> Create New Curriculum</DialogTitle>
                                    <DialogDescription>
                                        Define a new learning path. You can generate the initial quests using AI.
                                    </DialogDescription>
                                </DialogHeader>
                                <CreateCurriculumForm
                                    onSuccess={handleCurriculumCreated}
                                    onError={(error) => toast({ variant: "destructive", title: "Failed to create curriculum", description: error })}
                                />
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isQuestDialogOpen} onOpenChange={setIsQuestDialogOpen}>
                            <DialogTrigger asChild>
                                <Button disabled={!selectedCurriculumId}>
                                    <PlusCircle className="mr-2" />
                                    New Quest
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Quest</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details for the new quest in the "{selectedCurriculum?.name}" curriculum.
                                    </DialogDescription>
                                </DialogHeader>
                                {selectedCurriculumId && (
                                    <QuestForm 
                                        curriculumId={selectedCurriculumId} 
                                        onSuccess={handleQuestCreated}
                                        onError={(error) => toast({ variant: "destructive", title: "Failed to create quest", description: error })}
                                    />
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <QuestTree curriculumName={selectedCurriculum?.name || "No Curriculum Selected"} questNodes={quests} connections={connections} />
            </div>
        </AppShell>
    );
}
