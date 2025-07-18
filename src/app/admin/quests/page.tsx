

"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { QuestTree, type QuestNodeProps, type Connection } from "@/components/quests/QuestTree";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ListTree, BrainCircuit, Edit, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuestForm } from "@/components/quests/QuestForm";
import { createQuest, getQuestsByCurriculum, getQuestConnections, getCurriculums, updateQuestPosition, createConnection, deleteConnection, updateCurriculum } from "@/app/actions/quests";
import { useToast } from "@/hooks/use-toast";
import type { Quest, Curriculum } from "@/lib/db/schema";
import { CreateCurriculumForm } from "@/components/quests/CreateCurriculumForm";


export default function AdminQuestsPage() {
    const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [quests, setQuests] = useState<QuestNodeProps[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isQuestDialogOpen, setIsQuestDialogOpen] = useState(false);
    const [isCurriculumDialogOpen, setIsCurriculumDialogOpen] = useState(false);
    const [isEditCurriculumDialogOpen, setIsEditCurriculumDialogOpen] = useState(false);

    const { toast } = useToast();

    async function loadCurriculums(selectId?: string) {
        try {
            const curriculumData = await getCurriculums();
            setCurriculums(curriculumData);
            if (selectId) {
                 setSelectedCurriculumId(selectId);
            } else if (curriculumData.length > 0 && !selectedCurriculumId) {
                setSelectedCurriculumId(curriculumData[0].id);
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erreur de chargement des cursus",
                description: "Impossible de récupérer les données des cursus."
            });
        }
    }

    useEffect(() => {
        loadCurriculums();
    }, []);

    useEffect(() => {
        if (!selectedCurriculumId) {
            setQuests([]);
            setConnections([]);
            return;
        };

        async function loadQuestsAndConnections() {
            try {
                const questData = await getQuestsByCurriculum(selectedCurriculumId!);
                const connectionData = await getQuestConnections(selectedCurriculumId!);
                
                setQuests(questData.map(q => ({
                    id: q.id,
                    title: q.title,
                    category: q.category,
                    xp: q.xp,
                    status: q.status as "draft" | "published",
                    position: { top: q.positionTop, left: q.positionLeft }
                })));

                setConnections(connectionData.map(c => ({ from: c.fromId, to: c.toId })));

            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Erreur de chargement des quêtes",
                    description: "Impossible de récupérer les données des quêtes pour le cursus sélectionné."
                });
            }
        }
        loadQuestsAndConnections();
    }, [selectedCurriculumId, toast]);

    const handleCurriculumChange = (value: string) => {
        setSelectedCurriculumId(value);
    };

    const handleQuestCreated = (newQuest: Quest) => {
        toast({
            title: "Quête Créée !",
            description: `"${newQuest.title}" a été ajoutée au cursus.`
        });
        setIsQuestDialogOpen(false);
        setQuests(prev => [...prev, {
            id: newQuest.id,
            title: newQuest.title,
            category: newQuest.category,
            xp: newQuest.xp,
            status: newQuest.status as "draft" | "published",
            position: { top: newQuest.positionTop, left: newQuest.positionLeft }
        }]);
    };
    
    const handleCurriculumCreated = (newCurriculum: Curriculum) => {
        toast({
            title: "Cursus Créé !",
            description: `"${newCurriculum.name}" est prêt à être rempli de quêtes.`
        });
        setIsCurriculumDialogOpen(false);
        loadCurriculums(newCurriculum.id);
    };
    
     const handleCurriculumUpdated = (updatedCurriculum: Curriculum) => {
        toast({
            title: "Cursus Mis à Jour !",
            description: `"${updatedCurriculum.name}" a été modifié avec succès.`
        });
        setIsEditCurriculumDialogOpen(false);
        loadCurriculums(updatedCurriculum.id);
    };

    const handleQuestMove = async (questId: string, newPosition: { top: string; left: string }) => {
        // Optimistic UI update
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, position: newPosition } : q));
        try {
            await updateQuestPosition(questId, newPosition);
        } catch (error) {
            toast({ variant: "destructive", title: "Erreur de déplacement", description: "La position de la quête n'a pas pu être sauvegardée." });
            // Optionally revert state here if save fails
        }
    };
    
    const handleNewConnection = async (from: string, to: string) => {
        try {
            await createConnection(from, to);
            setConnections(prev => [...prev, { from, to }]);
        } catch (error) {
             toast({ variant: "destructive", title: "Erreur de connexion", description: "Impossible de créer la dépendance." });
        }
    };
    
     const handleRemoveConnection = async (from: string, to: string) => {
        try {
            await deleteConnection(from, to);
            setConnections(prev => prev.filter(c => !(c.from === from && c.to === to)));
        } catch (error) {
             toast({ variant: "destructive", title: "Erreur de suppression", description: "Impossible de supprimer la dépendance." });
        }
    };
    
    const selectedCurriculum = curriculums.find(c => c.id === selectedCurriculumId);

    return (
        <AppShell>
            <div className="space-y-8">
                 <div>
                    <h1 className="text-4xl font-headline tracking-tight">Éditeur de Quêtes</h1>
                    <p className="text-muted-foreground mt-2">Construisez et gérez le cursus principal. Glissez-déposez les quêtes pour les réorganiser et les relier.</p>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2 w-full max-w-xs">
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
                         <Dialog open={isEditCurriculumDialogOpen} onOpenChange={setIsEditCurriculumDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" disabled={!selectedCurriculumId}>
                                    <Edit className="h-4 w-4"/>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2"><BrainCircuit/> Modifier le Cursus</DialogTitle>
                                    <DialogDescription>
                                       Mettez à jour les détails de ce cursus.
                                    </DialogDescription>
                                </DialogHeader>
                                {selectedCurriculum && (
                                     <CreateCurriculumForm
                                        onSuccess={handleCurriculumUpdated}
                                        onError={(error) => toast({ variant: "destructive", title: "Échec de la mise à jour", description: error })}
                                        existingCurriculum={selectedCurriculum}
                                    />
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="outline" disabled>
                            <Users className="mr-2" />
                            Gérer les Assignations
                        </Button>
                        <Dialog open={isCurriculumDialogOpen} onOpenChange={setIsCurriculumDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <PlusCircle className="mr-2" />
                                    Nouveau Cursus
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2"><BrainCircuit/> Créer un Nouveau Cursus</DialogTitle>
                                    <DialogDescription>
                                        Définissez un nouveau parcours d'apprentissage. Vous pouvez générer les quêtes initiales avec l'IA.
                                    </DialogDescription>
                                </DialogHeader>
                                <CreateCurriculumForm
                                    onSuccess={handleCurriculumCreated}
                                    onError={(error) => toast({ variant: "destructive", title: "Échec de la création", description: error })}
                                />
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isQuestDialogOpen} onOpenChange={setIsQuestDialogOpen}>
                            <DialogTrigger asChild>
                                <Button disabled={!selectedCurriculumId}>
                                    <PlusCircle className="mr-2" />
                                    Nouvelle Quête
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Créer une Nouvelle Quête</DialogTitle>
                                    <DialogDescription>
                                        Remplissez les détails pour la nouvelle quête dans le cursus "{selectedCurriculum?.name}".
                                    </DialogDescription>
                                </DialogHeader>
                                {selectedCurriculumId && (
                                    <QuestForm 
                                        curriculumId={selectedCurriculumId} 
                                        onSuccess={handleQuestCreated}
                                        onError={(error) => toast({ variant: "destructive", title: "Échec de la création", description: error })}
                                    />
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <QuestTree 
                    curriculumName={selectedCurriculum?.name || "Aucun Cursus Sélectionné"} 
                    curriculumSubtitle={selectedCurriculum?.subtitle || "Pas de sous-titre"}
                    questNodes={quests} 
                    connections={connections} 
                    onQuestMove={handleQuestMove}
                    onNewConnection={handleNewConnection}
                    onRemoveConnection={handleRemoveConnection}
                />
            </div>
        </AppShell>
    );
}
