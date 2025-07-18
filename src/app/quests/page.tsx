
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { QuestTree, type QuestNodeProps, type Connection } from "@/components/quests/QuestTree";
import { ListTree, School } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQuestsByCurriculum, getQuestConnections } from "@/app/actions/quests";
import { getAssignedCurriculumsForUser } from "@/app/actions/curriculums";
import { useToast } from "@/hooks/use-toast";
import type { Curriculum } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";

export default function QuestsPage() {
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [quests, setQuests] = useState<QuestNodeProps[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

   useEffect(() => {
        async function loadAssignedCurriculums() {
            setLoading(true);
            try {
                const curriculumData = await getAssignedCurriculumsForUser();
                setCurriculums(curriculumData);
                if (curriculumData.length > 0 && !selectedCurriculumId) {
                    setSelectedCurriculumId(curriculumData[0].id);
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error loading your curriculums",
                    description: "Could not fetch your assigned curriculums."
                });
            } finally {
                setLoading(false);
            }
        }
        loadAssignedCurriculums();
    }, [toast]);

  useEffect(() => {
    if (!selectedCurriculumId) {
        setQuests([]);
        setConnections([]);
        return;
    };

    async function loadQuests() {
        try {
            const questData = await getQuestsByCurriculum(selectedCurriculumId!);
            const connectionData = await getQuestConnections(selectedCurriculumId!);
            
            const publishedQuests = questData.filter(q => q.status === 'published');
            
            setQuests(publishedQuests.map(q => ({
                id: q.id,
                title: q.title,
                category: q.category,
                xp: q.xp,
                // TODO: Replace with real user quest progress
                status: (["quest-1", "quest-2"].includes(q.id)) ? 'completed' : 'available', 
                position: { top: q.positionTop, left: q.positionLeft },
                rawQuest: q,
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

        {!loading && curriculums.length === 0 && (
            <Card className="text-center py-12">
                <CardContent className="flex flex-col items-center gap-4">
                    <School className="h-16 w-16 text-muted-foreground/50" />
                    <h2 className="text-2xl font-semibold">Aucun cursus assigné</h2>
                    <p className="text-muted-foreground max-w-md">Il semble que vous ne soyez inscrit à aucun parcours d'apprentissage pour le moment. Veuillez contacter un professeur ou un administrateur pour être ajouté à un cursus.</p>
                </CardContent>
            </Card>
        )}

        {curriculums.length > 0 && (
            <>
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
            </>
        )}
      </div>
    </AppShell>
  );
}
