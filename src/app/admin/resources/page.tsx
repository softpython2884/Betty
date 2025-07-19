
"use client"
import React, { useState, useEffect, useTransition } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, FileText, Trash2, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Quest, Resource as ResourceType, Curriculum } from "@/lib/db/schema";
import { getResources, createResource, updateResource, deleteResource, linkResourceToQuest } from "@/app/actions/resources";
import { getQuestsByCurriculum, getCurriculums } from "@/app/actions/quests";

export const dynamic = 'force-dynamic';

type ResourceWithQuestTitle = ResourceType & { quests: { quest: { id: string; title: string } }[] };

export default function AdminResourcesPage() {
    const [resources, setResources] = useState<ResourceWithQuestTitle[]>([]);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [selectedResource, setSelectedResource] = useState<ResourceWithQuestTitle | null>(null);
    const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, startSaving] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        async function loadInitialData() {
            setLoading(true);
            try {
                const [resourcesData, curriculumsData] = await Promise.all([
                    getResources(),
                    getCurriculums()
                ]);
                setResources(resourcesData as ResourceWithQuestTitle[]);
                setCurriculums(curriculumsData);
                if (curriculumsData.length > 0) {
                    const firstCurriculumId = curriculumsData[0].id;
                    setSelectedCurriculumId(firstCurriculumId);
                    const questsData = await getQuestsByCurriculum(firstCurriculumId);
                    setQuests(questsData);
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Erreur de chargement" });
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, [toast]);
    
    useEffect(() => {
        async function loadQuests() {
            if (selectedCurriculumId) {
                const questsData = await getQuestsByCurriculum(selectedCurriculumId);
                setQuests(questsData);
            }
        }
        loadQuests();
    }, [selectedCurriculumId]);

    const handleSelectResource = (resource: ResourceWithQuestTitle | null) => {
        setSelectedResource(resource);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startSaving(async () => {
            const formData = new FormData(event.currentTarget);
            const title = formData.get("title") as string;
            const content = formData.get("content") as string;
            const questId = formData.get("questId") as string;
            
            try {
                let savedResource;
                if (selectedResource) {
                    savedResource = await updateResource(selectedResource.id, { title, content });
                } else {
                    savedResource = await createResource({ title, content });
                }
                await linkResourceToQuest(savedResource.id, questId === "none" ? null : questId);

                toast({ title: "Succès", description: "Ressource sauvegardée." });
                const updatedResources = await getResources();
                setResources(updatedResources as ResourceWithQuestTitle[]);
                handleSelectResource(null);
            } catch (error) {
                toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder la ressource." });
            }
        });
    };
    
    const handleDelete = async (id: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) return;
        startSaving(async () => {
            try {
                await deleteResource(id);
                toast({ title: "Succès", description: "Ressource supprimée." });
                setResources(resources.filter(r => r.id !== id));
                if (selectedResource?.id === id) {
                    handleSelectResource(null);
                }
            } catch (error) {
                 toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la ressource." });
            }
        });
    }

    const currentLinkedQuestId = selectedResource?.quests[0]?.quest.id || "none";

    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">Gestion des Ressources</h1>
                    <p className="text-muted-foreground mt-2">Créez et gérez les documents d'aide pour les étudiants.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-md">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Ressources</CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => handleSelectResource(null)}>
                                        <PlusCircle className="mr-2 h-4 w-4"/>
                                        Nouveau
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {loading ? <p>Chargement...</p> : resources.map(res => (
                                    <div key={res.id} className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${selectedResource?.id === res.id ? 'bg-muted' : 'hover:bg-muted/50'}`} onClick={() => handleSelectResource(res)}>
                                        <div>
                                            <p className="font-semibold">{res.title}</p>
                                            <p className="text-xs text-muted-foreground">{res.quests.length > 0 ? `Lié à: ${res.quests[0].quest.title}` : "Ressource générale"}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(res.id)}}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText />
                                    {selectedResource ? "Éditer la Ressource" : "Nouvelle Ressource"}
                                </CardTitle>
                                <CardDescription>Rédigez votre document en Markdown. Il sera converti en HTML pour les étudiants.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleFormSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="resource-title">Titre</Label>
                                        <Input id="resource-title" name="title" defaultValue={selectedResource?.title || ""} required/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="resource-content">Contenu (Markdown)</Label>
                                        <Textarea id="resource-content" name="content" rows={15} className="font-code" defaultValue={selectedResource?.content || ""} required/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="curriculum">Cursus (pour filtrer les quêtes)</Label>
                                            <Select value={selectedCurriculumId || ""} onValueChange={setSelectedCurriculumId}>
                                                <SelectTrigger id="curriculum"><SelectValue placeholder="Sélectionner un cursus" /></SelectTrigger>
                                                <SelectContent>
                                                    {curriculums.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="linked-quest">Lier à une quête (Optionnel)</Label>
                                             <Select name="questId" defaultValue={currentLinkedQuestId}>
                                                <SelectTrigger id="linked-quest"><SelectValue placeholder="Sélectionner une quête" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Aucune</SelectItem>
                                                    {quests.map(q => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2"/>}
                                            Enregistrer
                                        </Button>
                                    </div>
                                </CardContent>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
