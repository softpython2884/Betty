
"use client";

import { useState, useEffect } from "react";
import { QuestTree, type QuestNodeProps, type Connection } from "@/components/quests/QuestTree";
import { ListTree, School } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQuestsByCurriculum } from "@/app/actions/quests";
import { useToast } from "@/hooks/use-toast";
import type { Curriculum, Quest } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface QuestPageClientProps {
  initialCurriculums: Curriculum[];
  initialQuests: Quest[];
  initialConnections: { from: string, to: string }[];
}

export function QuestPageClient({ initialCurriculums, initialQuests, initialConnections }: QuestPageClientProps) {
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(initialCurriculums[0]?.id || null);
  const [quests, setQuests] = useState<QuestNodeProps[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const { toast } = useToast();

  const mapQuestsAndConnections = (questData: Quest[], connectionData: { from: string, to: string }[]) => {
    const publishedQuests = questData.filter(q => q.status === 'published');
            
    setQuests(publishedQuests.map(q => ({
        id: q.id,
        title: q.title,
        category: q.category,
        xp: q.xp,
        status: (["quest-1", "quest-2"].includes(q.id)) ? 'completed' : 'available', 
        position: { top: q.positionTop, left: q.positionLeft },
        rawQuest: q,
    })));

    setConnections(connectionData);
  }

  useEffect(() => {
    // Map initial data on first load
    mapQuestsAndConnections(initialQuests, initialConnections);
  }, [initialQuests, initialConnections]);

  const handleCurriculumChange = async (value: string) => {
    if (!value) return;

    setSelectedCurriculumId(value);
    setLoadingQuests(true);
    try {
        const questData = await getQuestsByCurriculum(value);
        // Temporarily empty connections
        const mappedConnections: Connection[] = [];
        mapQuestsAndConnections(questData, mappedConnections);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error loading quests",
            description: "Could not fetch quest data for the selected curriculum."
        });
    } finally {
        setLoadingQuests(false);
    }
  };

  const selectedCurriculum = initialCurriculums.find(c => c.id === selectedCurriculumId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Journal des Quêtes</h1>
        <p className="text-muted-foreground mt-2">Sélectionnez un cursus pour voir votre voyage épique. Cliquez et glissez pour vous déplacer, utilisez la molette pour zoomer.</p>
      </div>

      {initialCurriculums.length === 0 && (
          <Card className="text-center py-12">
              <CardContent className="flex flex-col items-center gap-4">
                  <School className="h-16 w-16 text-muted-foreground/50" />
                  <h2 className="text-2xl font-semibold">Aucun cursus assigné</h2>
                  <p className="text-muted-foreground max-w-md">Il semble que vous ne soyez inscrit à aucun parcours d'apprentissage pour le moment. Veuillez contacter un professeur ou un administrateur pour être ajouté à un cursus.</p>
              </CardContent>
          </Card>
      )}

      {initialCurriculums.length > 0 && (
          <>
              <div className="flex justify-start">
                  <div className="w-full max-w-xs">
                      <Select value={selectedCurriculumId || ''} onValueChange={handleCurriculumChange}>
                          <SelectTrigger>
                              <ListTree className="mr-2"/>
                              <SelectValue placeholder="Sélectionner un cursus" />
                          </SelectTrigger>
                          <SelectContent>
                              {initialCurriculums.map(c => (
                                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
              </div>

              {loadingQuests ? (
                <div className="flex justify-center items-center h-[600px]">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
              ) : (
                <QuestTree 
                    curriculumName={selectedCurriculum?.name || "Aucun Cursus Sélectionné"} 
                    curriculumSubtitle={selectedCurriculum?.subtitle || ""}
                    questNodes={quests} 
                    connections={connections} 
                />
              )}
          </>
      )}
    </div>
  );
}
