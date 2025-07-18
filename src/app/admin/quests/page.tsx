

"use client";

import { useState, useEffect, useTransition } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { QuestTree, type QuestNodeProps, type Connection } from "@/components/quests/QuestTree";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ListTree, BrainCircuit, Edit, Users, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QuestForm } from "@/components/quests/QuestForm";
import { createQuest, getQuestsByCurriculum, getCurriculums, updateQuestPosition, updateCurriculum, updateQuest, setQuestStatus, getQuestConnections, createConnection, deleteConnection } from "@/app/actions/quests";
import { useToast } from "@/hooks/use-toast";
import type { Quest, Curriculum } from "@/lib/db/schema";
import { CreateCurriculumForm } from "@/components/quests/CreateCurriculumForm";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CurriculumAssignmentManager } from "@/components/admin/CurriculumAssignmentManager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function AdminQuestsPage() {
    const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [quests, setQuests] = useState<QuestNodeProps[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isQuestDialogOpen, setIsQuestDialogOpen] = useState(false);
    const [isCurriculumDialogOpen, setIsCurriculumDialogOpen] = useState(false);
    const [isEditCurriculumDialogOpen, setIsEditCurriculumDialogOpen] = useState(false);
    const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
    const [isPublishing, startPublishTransition] = useTransition();

    const { toast } = useToast();

    function mapQuestToNode(quest: Quest): QuestNodeProps {
        return {
            id: quest.id,
            title: quest.title,
            category: quest.category,
            xp: quest.xp,
            status: quest.status as "draft" | "published",
            position: { top: quest.positionTop, left: quest.positionLeft },
            rawQuest: quest,
        }
    }

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
                const [questData, connectionData] = await Promise.all([
                    getQuestsByCurriculum(selectedCurriculumId!),
                    getQuestConnections(selectedCurriculumId!)
                ]);
                
                setQuests(questData.map(mapQuestToNode));
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

    const handleQuestFormSuccess = (updatedQuest: Quest) => {
        const isEditing = !!editingQuest;
        toast({
            title: isEditing ? "Quête Mise à Jour !" : "Quête Créée !",
            description: `"${updatedQuest.title}" a été sauvegardée.`
        });
        
        setIsQuestDialogOpen(false);
        setEditingQuest(null);

        const newQuestNode = mapQuestToNode(updatedQuest);

        if (isEditing) {
            setQuests(prev => prev.map(q => q.id === updatedQuest.id ? newQuestNode : q));
        } else {
            setQuests(prev => [...prev, newQuestNode]);
        }
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
    
    const openEditQuestDialog = (quest: Quest) => {
        setEditingQuest(quest);
        setIsQuestDialogOpen(true);
    };

    const openCreateQuestDialog = () => {
        setEditingQuest(null);
        setIsQuestDialogOpen(true);
    }

    const handleSetQuestStatus = (questId: string, status: 'draft' | 'published') => {
        startPublishTransition(async () => {
            try {
                const updatedQuest = await setQuestStatus(questId, status);
                setQuests(prev => prev.map(q => q.id === questId ? mapQuestToNode(updatedQuest) : q));
                toast({
                    title: "Statut mis à jour",
                    description: `La quête a été ${status === 'published' ? 'publiée' : 'remise en brouillon'}.`
                });
            } catch (error) {
                 toast({ variant: "destructive", title: "Erreur de publication", description: "Le statut de la quête n'a pas pu être modifié." });
            }
        });
    }

    const handleNewConnection = async (fromId: string, toId: string) => {
        // Optimistic update
        setConnections(prev => [...prev, { from: fromId, to: toId }]);
        try {
            await createConnection(fromId, toId);
        } catch (error) {
            setConnections(prev => prev.filter(c => !(c.from === fromId && c.to === toId)));
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de créer la connexion." });
        }
    }
    
    const handleRemoveConnection = async (fromId: string, toId: string) => {
        // Optimistic update
        setConnections(prev => prev.filter(c => !(c.from === fromId && c.to === toId)));
         try {
            await deleteConnection(fromId, toId);
        } catch (error) {
            setConnections(prev => [...prev, { from: fromId, to: toId }]);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la connexion." });
        }
    }
    
    const selectedCurriculum = curriculums.find(c => c.id === selectedCurriculumId);

    return (
        <AppShell>
            <div className="space-y-8">
                 <div>
                    <h1 className="text-4xl font-headline tracking-tight">Éditeur de Quêtes</h1>
                    <p className="text-muted-foreground mt-2">Construisez et gérez le cursus principal. Glissez-déposez les quêtes pour les réorganiser.</p>
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
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" disabled={!selectedCurriculumId}>
                                    <Users className="mr-2" />
                                    Gérer les Assignations
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="sm:max-w-xl">
                                <SheetHeader>
                                    <SheetTitle>Assignations du Cursus</SheetTitle>
                                    <SheetDescription>
                                       Sélectionnez les utilisateurs qui auront accès à &quot;{selectedCurriculum?.name}&quot;.
                                    </SheetDescription>
                                </SheetHeader>
                                {selectedCurriculumId && (
                                    <CurriculumAssignmentManager curriculumId={selectedCurriculumId} />
                                )}
                            </SheetContent>
                        </Sheet>
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
                        <Dialog open={isQuestDialogOpen} onOpenChange={(isOpen) => { setIsQuestDialogOpen(isOpen); if (!isOpen) setEditingQuest(null); }}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreateQuestDialog} disabled={!selectedCurriculumId}>
                                    <PlusCircle className="mr-2" />
                                    Nouvelle Quête
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>{editingQuest ? "Modifier la Quête" : "Créer une Nouvelle Quête"}</DialogTitle>
                                    <DialogDescription>
                                        {editingQuest ? `Mettez à jour les détails de "${editingQuest.title}".` : `Remplissez les détails pour la nouvelle quête dans le cursus "${selectedCurriculum?.name}".`}
                                    </DialogDescription>
                                </DialogHeader>
                                {selectedCurriculumId && (
                                    <QuestForm 
                                        curriculumId={selectedCurriculumId} 
                                        onSuccess={handleQuestFormSuccess}
                                        onError={(error) => toast({ variant: "destructive", title: "Échec", description: error })}
                                        quest={editingQuest || undefined}
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
                    onEditQuest={(questId) => {
                        const questToEdit = quests.find(q => q.id === questId)?.rawQuest;
                        if (questToEdit) openEditQuestDialog(questToEdit);
                    }}
                    onSetQuestStatus={handleSetQuestStatus}
                    isPublishing={isPublishing}
                />
            </div>
        </AppShell>
    );
}
