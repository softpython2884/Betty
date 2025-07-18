import { AppShell } from "@/components/layout/AppShell";
import { QuestTree } from "@/components/quests/QuestTree";

export default function QuestsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight">Quest Log</h1>
          <p className="text-muted-foreground mt-2">An overview of your epic journey. Completed quests are green, available quests are red. Click and drag to pan, use the scroll wheel to zoom.</p>
        </div>
        <QuestTree />
      </div>
    </AppShell>
  );
}
