import { AppShell } from "@/components/layout/AppShell";
import { QuestTree } from "@/components/quests/QuestTree";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function AdminQuestsPage() {
    return (
        <AppShell>
            <div className="space-y-8">
                 <div>
                    <h1 className="text-4xl font-headline tracking-tight">Quest Editor</h1>
                    <p className="text-muted-foreground mt-2">Build and manage the main curriculum and dynamic side quests.</p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button>
                        <PlusCircle className="mr-2" />
                        New Main Quest
                    </Button>
                    <Button variant="outline">
                        <PlusCircle className="mr-2" />
                        New Side Quest
                    </Button>
                </div>
                <QuestTree />
            </div>
        </AppShell>
    );
}
