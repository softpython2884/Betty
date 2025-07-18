import { AppShell } from "@/components/layout/AppShell";
import { getQuestsByCurriculum, getQuestConnections } from "@/app/actions/quests";
import { getAssignedCurriculumsForUser } from "@/app/actions/curriculums";
import { QuestPageClient } from "./QuestPageClient";
import type { Quest, Curriculum } from "@/lib/db/schema";

export default async function QuestsPage() {
  const assignedCurriculums: Curriculum[] = await getAssignedCurriculumsForUser();
  let quests: Quest[] = [];
  let connections: { fromId: string, toId: string }[] = [];

  if (assignedCurriculums.length > 0) {
    const firstCurriculumId = assignedCurriculums[0].id;
    [quests, connections] = await Promise.all([
      getQuestsByCurriculum(firstCurriculumId),
      getQuestConnections(firstCurriculumId)
    ]);
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
