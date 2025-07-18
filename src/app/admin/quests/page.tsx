
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { QuestTree, type QuestNodeProps, type Connection } from "@/components/quests/QuestTree";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ListTree } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuestForm } from "@/components/quests/QuestForm";
import { createQuest, getQuestsByCurriculum, getQuestConnections } from "@/app/actions/quests";
import { useToast } from "@/hooks/use-toast";
import type { Quest } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

const curriculumData = {
    "web-dev": { name: "Web Development" },
    "data-science": { name: "Data Science" },
    "hackathon": { name: "Hackathon Prep" },
};

type CurriculumKey = keyof typeof curriculumData;

export default function AdminQuestsPage() {
    const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumKey>("web-dev");
    const [quests, setQuests] = useState<QuestNodeProps[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function loadQuests() {
            try {
                const questData = await getQuestsByCurriculum(selectedCurriculum);
                const connectionData = await getQuestConnections(selectedCurriculum);
                
                setQuests(questData.map(q => ({
                    id: q.id,
                    title: q.title,
                    category: q.category,
                    xp: q.xp,
                    status: q.status as "completed" | "available" | "locked", // This needs to be mapped from user progress later
                    position: { top: q.positionTop, left: q.positionLeft }
                })));

                setConnections(connectionData.map(c => ({
                    from: c.fromId,
                    to: c.toId
                })));

            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error loading quests",
                    description: "Could not fetch quest data from the database."
                });
            }
        }
        loadQuests();
    }, [selectedCurriculum, toast]);


    const handleCurriculumChange = (value: string) => {
        setSelectedCurriculum(value as CurriculumKey);
    };

    const handleQuestCreated = (newQuest: Quest) => {
        toast({
            title: "Quest Created!",
            description: `"${newQuest.title}" has been added to the curriculum.`
        });
        setIsDialogOpen(false);
        // Add the new quest to the local state to re-render the tree
        setQuests(prevQuests => [...prevQuests, {
            id: newQuest.id,
            title: newQuest.title,
            category: newQuest.category,
            xp: newQuest.xp,
            status: newQuest.status as "completed" | "available" | "locked",
            position: { top: newQuest.positionTop, left: newQuest.positionLeft }
        }]);
    }

    const { name } = curriculumData[selectedCurriculum];

    return (
        <AppShell>
            <div className="space-y-8">
                 <div>
                    <h1 className="text-4xl font-headline tracking-tight">Quest Editor</h1>
                    <p className="text-muted-foreground mt-2">Build and manage the main curriculum and dynamic side quests. Click and drag to pan, use scroll to zoom.</p>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="w-full max-w-xs">
                        <Select value={selectedCurriculum} onValueChange={handleCurriculumChange}>
                            <SelectTrigger>
                                <ListTree className="mr-2"/>
                                <SelectValue placeholder="Select a curriculum" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="web-dev">Curriculum: Web Development</SelectItem>
                                <SelectItem value="data-science">Curriculum: Data Science</SelectItem>
                                <SelectItem value="hackathon">Event: Hackathon Prep</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2" />
                                    New Main Quest
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Quest</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details for the new quest. You can adjust its position later by dragging it.
                                    </DialogDescription>
                                </DialogHeader>
                                <QuestForm 
                                    curriculum={selectedCurriculum} 
                                    onSuccess={handleQuestCreated}
                                    onError={(error) => toast({ variant: "destructive", title: "Failed to create quest", description: error })}
                                />
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline">
                            <PlusCircle className="mr-2" />
                            New Side Quest
                        </Button>
                    </div>
                </div>
                <QuestTree curriculumName={name} questNodes={quests} connections={connections} />
            </div>
        </AppShell>
    );
}
