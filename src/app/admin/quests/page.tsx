import { AppShell } from "@/components/layout/AppShell";
import { QuestTree } from "@/components/quests/QuestTree";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ListTree } from "lucide-react";

export default function AdminQuestsPage() {
    return (
        <AppShell>
            <div className="space-y-8">
                 <div>
                    <h1 className="text-4xl font-headline tracking-tight">Quest Editor</h1>
                    <p className="text-muted-foreground mt-2">Build and manage the main curriculum and dynamic side quests. Click and drag to pan, use scroll to zoom.</p>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="w-full max-w-xs">
                        <Select defaultValue="web-dev">
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
                <QuestTree />
            </div>
        </AppShell>
    );
}
