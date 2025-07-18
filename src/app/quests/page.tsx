
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { QuestTree, type QuestNodeProps, type Connection } from "@/components/quests/QuestTree";
import { ListTree } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQuestsByCurriculum, getQuestConnections } from "@/app/actions/quests";
import { useToast } from "@/hooks/use-toast";

const curriculumData = {
    "web-dev": { name: "Développement Web" },
    "data-science": { name: "Data Science" },
    "hackathon": { name: "Préparation Hackathon" },
};

type CurriculumKey = keyof typeof curriculumData;

export default function QuestsPage() {
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumKey>("web-dev");
  const [quests, setQuests] = useState<QuestNodeProps[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const { toast } = useToast();

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
                // TODO: Replace with real user quest progress
                status: (q.id === '1' || q.id === '2') ? 'completed' : 'available', 
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

  const { name } = curriculumData[selectedCurriculum];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight">Journal des Quêtes</h1>
          <p className="text-muted-foreground mt-2">Sélectionnez un cursus pour voir votre voyage épique. Cliquez et glissez pour vous déplacer, utilisez la molette pour zoomer.</p>
        </div>

        <div className="flex justify-start">
            <div className="w-full max-w-xs">
                <Select value={selectedCurriculum} onValueChange={handleCurriculumChange}>
                    <SelectTrigger>
                        <ListTree className="mr-2"/>
                        <SelectValue placeholder="Sélectionner un cursus" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="web-dev">Cursus: Développement Web</SelectItem>
                        <SelectItem value="data-science">Cursus: Data Science</SelectItem>
                        <SelectItem value="hackathon">Événement: Préparation Hackathon</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <QuestTree curriculumName={name} questNodes={quests} connections={connections} />
      </div>
    </AppShell>
  );
}
