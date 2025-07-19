
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
    const questMap = new Map(quests.map(q => [q.id, q]));

    // First pass: mark all completed quests from storage
    quests.forEach(quest => {
        if (completedQuests.has(quest.id)) {
            statuses.set(quest.id, 'completed');
        }
    });

    // Second pass: determine available and locked quests
    // We might need to loop until no more changes are made, in case of long dependency chains
    let changedInLoop = true;
    while(changedInLoop) {
        changedInLoop = false;
        quests.forEach(quest => {
            if (statuses.has(quest.id)) return; // Already processed

            // Find all quests that are prerequisites for the current quest.
            const prerequisites = connections.filter(c => c.to === quest.id).map(c => c.from);
            
            // If a quest has no prerequisites, it's available by default (it's a starting quest).
            if (prerequisites.length === 0) {
                 statuses.set(quest.id, 'available');
                 changedInLoop = true;
                 return;
            }

            // Check if all prerequisite quests exist and are completed.
            const allPrerequisitesMet = prerequisites.every(prereqId => {
                // Ensure the prerequisite quest exists and is marked as completed.
                return questMap.has(prereqId) && statuses.get(prereqId) === 'completed';
            });

            if (allPrerequisitesMet) {
                statuses.set(quest.id, 'available');
                changedInLoop = true;
            }
        });
    }

    // Final pass: any remaining quests that haven't been assigned a status are locked.
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
        // Refetch the data for the current curriculum to apply new statuses
        if(selectedCurriculumId) handleCurriculumChange(selectedCurriculumId, false);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also re-check when returning to the tab
    window.addEventListener('focus', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('focus', handleStorageChange);
    };

  }, [initialQuests, initialConnections, selectedCurriculumId]);

  const handleCurriculumChange = async (value: string, showLoading = true) => {
    if (!value) return;

    setSelectedCurriculumId(value);
    if(showLoading) setLoadingQuests(true);

    try {
        const [questData, connectionData] = await Promise.all([
            getQuestsByCurriculum(value),
            getQuestConnections(value)
        ]);

        const completedQuests = new Set<string>(JSON.parse(localStorage.getItem('completedQuests') || '[]'));
        const publishedQuests = questData.filter(q => q.status === 'published');
        const questStatusMap = getQuestStatuses(publishedQuests, connectionData, completedQuests);

        setQuests(publishedQuests.map(q => ({
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
        if(showLoading) setLoadingQuests(false);
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
                      <Select value={selectedCurriculumId || ''} onValueChange={(val) => handleCurriculumChange(val)}>
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
