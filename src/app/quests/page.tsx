
import { AppShell } from "@/components/layout/AppShell";
import { getQuestsByCurriculum } from "@/app/actions/quests";
import { getAssignedCurriculumsForUser } from "@/app/actions/curriculums";
import { QuestPageClient } from "./QuestPageClient";
import type { Quest, Curriculum } from "@/lib/db/schema";

export default async function QuestsPage() {
  const assignedCurriculums: Curriculum[] = await getAssignedCurriculumsForUser();
  
  let quests: Quest[] = [];
  // Temporarily remove connections
  const connections: { from: string, to: string }[] = [];

  if (assignedCurriculums.length > 0) {
    const firstCurriculumId = assignedCurriculums[0].id;
    // Fetch only quests, not connections
    quests = await getQuestsByCurriculum(firstCurriculumId);
  }

  return (
    <AppShell>
        <QuestPageClient 
            initialCurriculums={assignedCurriculums}
            initialQuests={quests}
            initialConnections={connections}
        />
    </AppShell>
  );
}
