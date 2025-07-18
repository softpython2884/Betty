import { AppShell } from "@/components/layout/AppShell";
import { QuestTree } from "@/components/quests/QuestTree";
import { ListTree } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function QuestsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight">Quest Log</h1>
          <p className="text-muted-foreground mt-2">Select a curriculum to view your epic journey. Click and drag to pan, use the scroll wheel to zoom.</p>
        </div>

        <div className="flex justify-start">
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
        </div>

        <QuestTree />
      </div>
    </AppShell>
  );
}
