
"use client"
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, FileText, Trash2, List, Save } from "lucide-react";

// Mock data, in a real app this would come from the database.
const resources = [
    { id: 'res_1', title: 'Guide du Flexbox', quest: 'Flexbox Challenge' },
    { id: 'res_2', title: 'Comprendre `this` en JS', quest: 'JavaScript Intro' },
    { id: 'res_3', title: 'Les bases de la sémantique HTML', quest: 'HTML Basics' },
    { id: 'res_4', title: 'Introduction à Git', quest: null },
];

const quests = [
    { id: 'quest_1', title: 'Flexbox Challenge' },
    { id: 'quest_2', title: 'JavaScript Intro' },
    { id: 'quest_3', title: 'HTML Basics' },
    { id: 'quest_4', title: 'CSS Fundamentals' },
]

export default function AdminResourcesPage() {
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
                                    <CardTitle>Ressources Existantes</CardTitle>
                                    <Button variant="outline" size="sm">
                                        <PlusCircle className="mr-2 h-4 w-4"/>
                                        Nouveau
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {resources.map(res => (
                                    <div key={res.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                                        <div>
                                            <p className="font-semibold">{res.title}</p>
                                            <p className="text-xs text-muted-foreground">{res.quest ? `Lié à: ${res.quest}` : "Ressource générale"}</p>
                                        </div>
                                        <Button variant="ghost" size="icon">
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
                                    Éditeur de Ressource
                                </CardTitle>
                                <CardDescription>Rédigez votre document en Markdown. Il sera converti en HTML pour les étudiants.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="resource-title">Titre de la Ressource</Label>
                                    <Input id="resource-title" defaultValue="Guide du Flexbox" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="resource-content">Contenu (Markdown)</Label>
                                    <Textarea id="resource-content" rows={15} className="font-code" defaultValue={`# Guide du Flexbox\n\nFlexbox est un modèle de layout puissant en CSS...\n\n## Propriétés principales\n\n- \`display: flex\`;\n- \`flex-direction\`: row | column;\n- \`justify-content\`: center | space-between | ...`} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linked-quest">Lier à une quête (Optionnel)</Label>
                                     <Select defaultValue="quest_1">
                                        <SelectTrigger id="linked-quest">
                                            <SelectValue placeholder="Sélectionner une quête" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Aucune</SelectItem>
                                            {quests.map(q => (
                                                 <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end">
                                    <Button>
                                        <Save className="mr-2"/>
                                        Enregistrer la Ressource
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
