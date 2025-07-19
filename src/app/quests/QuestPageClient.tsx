
"use client";

import { useState, useEffect } from "react";
import { QuestTree, type QuestNodeProps, type Connection } from "@/components/quests/QuestTree";
import { ListTree, School } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQuestsByCurriculum, getQuestConnections } from "@/app/actions/quests";
import { useToast } from "@/hooks/use-toast";
import type { Curriculum, Quest } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface QuestPageClientProps {
  initialCurriculums: Curriculum[];
  initialQuests: Quest[];
  initialConnections: { from: string, to: string }[];
}

// Helper to determine quest status based on completion data and connections
function getQuestStatuses(quests: Quest[], connections: Connection[], completedQuests: Set<string>): Map<string, 'completed' | 'available' | 'locked'> {
    const statuses = new Map<string, 'completed' | 'available' | 'locked'>();
    
    // First pass: mark all completed quests
    quests.forEach(quest => {
        if (completedQuests.has(quest.id)) {
            statuses.set(quest.id, 'completed');
        }
    });

    // Second pass: determine available and locked quests
    // We might need to loop until no more changes are made, in case of long dependency chains
    let changed = true;
    while(changed) {
        changed = false;
        quests.forEach(quest => {
            if (statuses.get(quest.id)) return; // Already processed

            const prerequisites = connections.filter(c => c.to === quest.id).map(c => c.from);
            
            // If a quest has no prerequisites, it's available by default
            if (prerequisites.length === 0) {
                 statuses.set(quest.id, 'available');
                 changed = true;
                 return;
            }

            // Check if all prerequisites are completed
            const allPrerequisitesMet = prerequisites.every(prereqId => statuses.get(prereqId) === 'completed');

            if (allPrerequisitesMet) {
                statuses.set(quest.id, 'available');
                changed = true;
            }
        });
    }

    // Final pass: any remaining quests are locked
    quests.forEach(quest => {
        if (!statuses.has(quest.id)) {
            statuses.set(quest.id, 'locked');
        }
    });

    return statuses;
}


export function QuestPageClient({ initialCurriculums, initialQuests, initialConnections }: QuestPageClientProps) {
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(initialCurriculums[0]?.id || null);
  const [quests, setQuests] = useState<QuestNodeProps[]>([]);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This function will re-evaluate quest statuses
    const mapQuestsAndConnections = (questData: Quest[], connectionData: Connection[]) => {
      const publishedQuests = questData.filter(q => q.status === 'published');
      // In a real app, this would be fetched from the DB for the current user
      const completedQuests = new Set<string>(JSON.parse(localStorage.getItem('completedQuests') || '[]'));
      
      const questStatusMap = getQuestStatuses(publishedQuests, connectionData, completedQuests);
      
      setQuests(publishedQuests.map(q => ({
          id: q.id,
          title: q.title,
          category: q.category,
          xp: q.xp,
          status: questStatusMap.get(q.id) || 'locked', 
          position: { top: q.positionTop, left: q.positionLeft },
          rawQuest: q,
      })));

      setConnections(connectionData);
    }
    
    // Initial mapping
    mapQuestsAndConnections(initialQuests, initialConnections);

    // Re-check on storage change (e.g., from another tab)
    const handleStorageChange = () => {
        const currentQuests = initialQuests; // Use the most recent server data
        const currentConnections = initialConnections;
        mapQuestsAndConnections(currentQuests, currentConnections);
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also re-check when returning to the tab
    window.addEventListener('focus', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('focus', handleStorageChange);
    };

  }, [initialQuests, initialConnections]);

  const handleCurriculumChange = async (value: string) => {
    if (!value) return;

    setSelectedCurriculumId(value);
    setLoadingQuests(true);
    try {
        const [questData, connectionData] = await Promise.all([
            getQuestsByCurriculum(value),
            getQuestConnections(value)
        ]);

        const completedQuests = new Set<string>(JSON.parse(localStorage.getItem('completedQuests') || '[]'));
        const questStatusMap = getQuestStatuses(questData, connectionData, completedQuests);

        setQuests(questData.filter(q => q.status === 'published').map(q => ({
            id: q.id,
            title: q.title,
            category: q.category,
            xp: q.xp,
            status: questStatusMap.get(q.id) || 'locked',
            position: { top: q.positionTop, left: q.positionLeft },
            rawQuest: q
        })));
        setConnections(connectionData.map(c => ({ from: c.fromId, to: c.toId })));
        
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

      {initialCurriculums.length === 0 ? (
          <Card className="text-center py-12">
              <CardContent className="flex flex-col items-center gap-4">
                  <School className="h-16 w-16 text-muted-foreground/50" />
                  <h2 className="text-2xl font-semibold">Aucun cursus assigné</h2>
                  <p className="text-muted-foreground max-w-md">Il semble que vous ne soyez inscrit à aucun parcours d'apprentissage pour le moment. Veuillez contacter un professeur ou un administrateur pour être ajouté à un cursus.</p>
              </CardContent>
          </Card>
      ) : (
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
