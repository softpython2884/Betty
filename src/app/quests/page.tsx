
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { QuestTree, type QuestNodeProps, type Connection } from "@/components/quests/QuestTree";
import { ListTree } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQuestsByCurriculum, getQuestConnections, getCurriculums } from "@/app/actions/quests";
import { useToast } from "@/hooks/use-toast";
import type { Curriculum } from "@/lib/db/schema";

export default function QuestsPage() {
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [quests, setQuests] = useState<QuestNodeProps[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const { toast } = useToast();

   useEffect(() => {
        async function loadCurriculums() {
            try {
                const curriculumData = await getCurriculums();
                setCurriculums(curriculumData);
                if (curriculumData.length > 0 && !selectedCurriculumId) {
                    setSelectedCurriculumId(curriculumData[0].id);
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error loading curriculums",
                    description: "Could not fetch curriculum data from the database."
                });
            }
        }
        loadCurriculums();
    }, [toast, selectedCurriculumId]);

  useEffect(() => {
    if (!selectedCurriculumId) {
        setQuests([]);
        setConnections([]);
        return;
    };

    async function loadQuests() {
        try {
            const questData = await getQuestsByCurriculum(selectedCurriculumId);
            const connectionData = await getQuestConnections(selectedCurriculumId);
            
            // Filter only published quests for students
            const publishedQuests = questData.filter(q => q.status === 'published');
            
            setQuests(publishedQuests.map(q => ({
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
  }, [selectedCurriculumId, toast]);

  const handleCurriculumChange = (value: string) => {
      setSelectedCurriculumId(value);
  };

  const selectedCurriculum = curriculums.find(c => c.id === selectedCurriculumId);

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight">Journal des Quêtes</h1>
          <p className="text-muted-foreground mt-2">Sélectionnez un cursus pour voir votre voyage épique. Cliquez et glissez pour vous déplacer, utilisez la molette pour zoomer.</p>
        </div>

        <div className="flex justify-start">
            <div className="w-full max-w-xs">
                <Select value={selectedCurriculumId || ''} onValueChange={handleCurriculumChange}>
                    <SelectTrigger>
                        <ListTree className="mr-2"/>
                        <SelectValue placeholder="Sélectionner un cursus" />
                    </SelectTrigger>
                    <SelectContent>
                        {curriculums.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <QuestTree 
            curriculumName={selectedCurriculum?.name || "Aucun Cursus Sélectionné"} 
            curriculumSubtitle={selectedCurriculum?.subtitle || ""}
            questNodes={quests} 
            connections={connections} 
        />
      </div>
    </AppShell>
  );
}
