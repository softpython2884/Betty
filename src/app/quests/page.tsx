

import { AppShell } from "@/components/layout/AppShell";
import { getQuestsByCurriculum, getQuestConnections } from "@/app/actions/quests";
import { getAssignedCurriculumsForUser, getCompletedQuestsForCurrentUser } from "@/app/actions/curriculums";
import { QuestPageClient } from "./QuestPageClient";
import type { Quest, Curriculum } from "@/lib/db/schema";

export const dynamic = 'force-dynamic';

export default async function QuestsPage() {
  const assignedCurriculums: Curriculum[] = await getAssignedCurriculumsForUser();
  
  let quests: Quest[] = [];
  let connections: { from: string, to: string }[] = [];
  let completedQuests: Set<string> = new Set();

  if (assignedCurriculums.length > 0) {
    const firstCurriculumId = assignedCurriculums[0].id;
    const [questData, connectionData, completedData] = await Promise.all([
      getQuestsByCurriculum(firstCurriculumId),
      getQuestConnections(firstCurriculumId),
      getCompletedQuestsForCurrentUser()
    ]);
    quests = questData;
    connections = connectionData.map(c => ({ from: c.fromId, to: c.toId }));
    completedQuests = completedData;
  }

  return (
    <AppShell>
        <QuestPageClient 
            initialCurriculums={assignedCurriculums}
            initialQuests={quests}
            initialConnections={connections}
            initialCompletedQuests={completedQuests}
        />
    </AppShell>
  );
}
