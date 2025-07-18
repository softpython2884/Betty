
"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { QuestTree, QuestNodeProps, Connection } from "@/components/quests/QuestTree";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ListTree } from "lucide-react";

const webDevQuests: QuestNodeProps[] = [
  { id: "1", title: "HTML Basics", category: "Frontend", xp: 100, status: "completed", position: { top: "15%", left: "50%" } },
  { id: "2", title: "CSS Fundamentals", category: "Frontend", xp: 150, status: "completed", position: { top: "35%", left: "50%" } },
  { id: "3", title: "JavaScript Intro", category: "Core", xp: 200, status: "available", position: { top: "55%", left: "50%" } },
  { id: "4", title: "DOM Manipulation", category: "Frontend", xp: 250, status: "locked", position: { top: "75%", left: "35%" } },
  { id: "5", title: "Async/Await", category: "Core", xp: 300, status: "locked", position: { top: "75%", left: "65%" } },
  { id: "6", title: "Intro to React", category: "Library", xp: 500, status: "locked", position: { top: "95%", left: "50%" } },
  { id: "opt-1", title: "Advanced Git", category: "Tools", xp: 150, status: "available", position: { top: "25%", left: "15%" } },
  { id: "opt-2", title: "CSS Animations", category: "Frontend", xp: 200, status: "locked", position: { top: "45%", left: "15%" } },
  { id: "week-1", title: "Flexbox Challenge", category: "Weekly", xp: 50, status: "available", position: { top: "25%", left: "85%" } },
];

const webDevConnections: Connection[] = [
  { from: "1", to: "2" },
  { from: "2", to: "3" },
  { from: "3", to: "4" },
  { from: "3", to: "5" },
  { from: "4", to: "6" },
  { from: "5", to: "6" },
  { from: "1", to: "opt-1" },
  { from: "2", to: "opt-2" },
];

const dataScienceQuests: QuestNodeProps[] = [
    { id: "ds-1", title: "Intro to Python", category: "Core", xp: 100, status: "completed", position: { top: "15%", left: "50%" } },
    { id: "ds-2", title: "Data Analysis with Pandas", category: "Library", xp: 250, status: "available", position: { top: "35%", left: "50%" } },
    { id: "ds-3", title: "Data Visualization with Matplotlib", category: "Library", xp: 300, status: "locked", position: { top: "55%", left: "50%" } },
    { id: "ds-opt-1", title: "Statistics Basics", category: "Math", xp: 150, status: "available", position: { top: "25%", left: "15%" } },
    { id: "ds-week-1", title: "Titanic Dataset Challenge", category: "Weekly", xp: 75, status: "available", position: { top: "25%", left: "85%" } },
];

const dataScienceConnections: Connection[] = [
    { from: "ds-1", to: "ds-2" },
    { from: "ds-2", to: "ds-3" },
    { from: "ds-1", to: "ds-opt-1" },
];

const curriculumData = {
    "web-dev": { name: "Web Development", quests: webDevQuests, connections: webDevConnections },
    "data-science": { name: "Data Science", quests: dataScienceQuests, connections: dataScienceConnections },
    "hackathon": { name: "Hackathon Prep", quests: [], connections: [] },
};

type CurriculumKey = keyof typeof curriculumData;

export default function AdminQuestsPage() {
    const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumKey>("web-dev");

    const handleCurriculumChange = (value: string) => {
        setSelectedCurriculum(value as CurriculumKey);
    };

    const { name, quests, connections } = curriculumData[selectedCurriculum];

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
                        <Button>
                            <PlusCircle className="mr-2" />
                            New Main Quest
                        </Button>
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
