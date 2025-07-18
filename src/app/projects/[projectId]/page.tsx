
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Code, FileText, GitMerge, Megaphone, Milestone, MoreHorizontal, Pen, Plus, Settings, ShieldQuestion, Trash2, Users, Heading1, Heading2, Heading3, Bold, Italic, Strikethrough, List, ListOrdered, Code2, Link, Image as ImageIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock data, this would come from your backend
const projectData = {
    "proj-1": {
        title: "Projet: JavaScript Intro",
        isQuestProject: true,
        associatedQuest: {
            title: "The Forest of Functions",
            description: "Your task is to create a function that greets a fellow adventurer.",
            xp: 200,
            orbs: 10,
        },
    },
    "proj-3": {
        title: "Mon Portfolio",
        isQuestProject: false,
    }
};

const kanbanCols = {
    todo: [{ id: "task-1", title: "Setup project structure" }, { id: "task-2", title: "Write greeting function" }],
    inProgress: [{ id: "task-3", title: "Add comments to code" }],
    done: [{ id: "task-4", title: "Initial commit" }],
}

const documents = [
    { id: "doc-1", title: "Technical Specification" },
    { id: "doc-2", title: "User Manual" },
    { id: "doc-3", title: "Research Notes" },
]

const toolbarActions = [
    { icon: Heading1, tooltip: "Heading 1" },
    { icon: Heading2, tooltip: "Heading 2" },
    { icon: Heading3, tooltip: "Heading 3" },
    { icon: Bold, tooltip: "Bold" },
    { icon: Italic, tooltip: "Italic" },
    { icon: Strikethrough, tooltip: "Strikethrough" },
    { icon: List, tooltip: "Bulleted List" },
    { icon: ListOrdered, tooltip: "Numbered List" },
    { icon: Code2, tooltip: "Code Block" },
    { icon: Link, tooltip: "Insert Link" },
    { icon: ImageIcon, tooltip: "Insert Image" },
]

export default function ProjectWorkspacePage({ params }: { params: { projectId: string } }) {
    const project = projectData[params.projectId as keyof typeof projectData] || projectData["proj-1"];

    return (
        <AppShell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground mt-2">Bienvenue dans votre atelier. C'est ici que la magie opère.</p>
                </div>

                <Tabs defaultValue="documents">
                    <TabsList className="grid w-full grid-cols-4 md:grid-cols-6">
                        <TabsTrigger value="tasks"><Milestone className="mr-2" />Tâches</TabsTrigger>
                        <TabsTrigger value="documents"><FileText className="mr-2"/>Documents</TabsTrigger>
                        <TabsTrigger value="codespace"><Code className="mr-2"/>CodeSpace</TabsTrigger>
                        <TabsTrigger value="settings"><Settings className="mr-2"/>Équipe & Paramètres</TabsTrigger>
                        {project.isQuestProject && <TabsTrigger value="quest"><ShieldQuestion className="mr-2"/>Quête Associée</TabsTrigger>}
                        <TabsTrigger value="announcements"><Megaphone className="mr-2"/>Annonces</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="mt-6">
                        <Card>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                                <div className="space-y-4 rounded-lg bg-muted/30 p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">À Faire</h3>
                                        <Button variant="ghost" size="icon"><Plus/></Button>
                                    </div>
                                    {kanbanCols.todo.map(task => (
                                        <Card key={task.id} className="p-4 bg-card shadow-sm group">
                                            <span>{task.title}</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 float-right opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem>Modifier</DropdownMenuItem>
                                                    <DropdownMenuItem>Changer le statut</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </Card>
                                    ))}
                                </div>
                                <div className="space-y-4 rounded-lg bg-muted/30 p-4">
                                     <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">En Cours</h3>
                                        <Button variant="ghost" size="icon"><Plus/></Button>
                                    </div>
                                     {kanbanCols.inProgress.map(task => (
                                        <Card key={task.id} className="p-4 bg-card shadow-sm group">
                                            <span>{task.title}</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 float-right opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem>Modifier</DropdownMenuItem>
                                                    <DropdownMenuItem>Changer le statut</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </Card>
                                    ))}
                                </div>
                                <div className="space-y-4 rounded-lg bg-muted/30 p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">Terminé</h3>
                                        <Button variant="ghost" size="icon"><Plus/></Button>
                                    </div>
                                    {kanbanCols.done.map(task => (
                                        <Card key={task.id} className="p-4 bg-card/60 shadow-sm group flex items-center gap-2 opacity-70">
                                            <Check className="text-green-600 h-5 w-5"/>
                                            <span className="line-through">{task.title}</span>
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                                                    <DropdownMenuItem>Remettre à "En cours"</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="documents" className="mt-6">
                       <Card className="shadow-md">
                            <div className="grid grid-cols-12 h-[700px]">
                                <div className="col-span-3 lg:col-span-2 border-r bg-muted/30 p-4 space-y-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-lg">Documents</h3>
                                        <Button variant="outline" size="sm"><Plus className="mr-1 h-4 w-4" />Nouveau</Button>
                                    </div>
                                    {documents.map(doc => (
                                        <Button key={doc.id} variant="ghost" className="w-full justify-start">
                                            <FileText className="mr-2" />
                                            {doc.title}
                                        </Button>
                                    ))}
                                </div>
                                <div className="col-span-8 lg:col-span-9 p-6 flex flex-col">
                                    <div className="flex-shrink-0 border-b pb-4 mb-4">
                                        <Input defaultValue="Technical Specification" className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 p-0 h-auto" />
                                        <p className="text-sm text-muted-foreground">Last updated 2 hours ago by Alex.</p>
                                    </div>
                                    <div className="flex-grow prose prose-sm max-w-none">
                                        <p>This is a placeholder for the WYSIWYG editor content. Users will be able to format text, add headings, lists, images, and more right here.</p>
                                        <p>A floating toolbar would appear when you select text, offering options like <b>bold</b>, <i>italic</i>, and <u>underline</u>.</p>
                                        <p>A static toolbar would be available at the top for more complex actions.</p>
                                    </div>
                                </div>
                                <div className="col-span-1 border-l bg-muted/30 p-2">
                                    <TooltipProvider>
                                        <div className="flex flex-col items-center gap-1">
                                            {toolbarActions.map((action, index) => (
                                                <Tooltip key={index}>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <action.icon className="h-5 w-5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        <p>{action.tooltip}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </TooltipProvider>
                                </div>
                            </div>
                       </Card>
                    </TabsContent>

                    {project.isQuestProject && project.associatedQuest && (
                         <TabsContent value="quest" className="mt-6">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3"><ShieldQuestion className="text-primary h-8 w-8"/> {project.associatedQuest.title}</CardTitle>
                                    <div className="flex gap-4 pt-2">
                                        <Badge variant="secondary">{project.associatedQuest.xp} XP</Badge>
                                        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">{project.associatedQuest.orbs} Orbes</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Description de la quête</h3>
                                        <p className="text-muted-foreground">{project.associatedQuest.description}</p>
                                    </div>
                                    <Button size="lg">
                                        <Check className="mr-2"/>
                                        Soumettre le projet pour évaluation
                                    </Button>
                                </CardContent>
                            </Card>
                         </TabsContent>
                    )}

                    <TabsContent value="codespace" className="mt-6">
                        <Card className="text-center">
                            <CardHeader>
                                <CardTitle>FlowUp CodeSpace</CardTitle>
                                <CardDescription>Connectez-vous pour commencer à coder dans votre environnement FlowUp.</CardDescription>
                            </CardHeader>
                            <CardContent className="py-12">
                                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-muted-foreground/30 mb-6 fill-current"><title>FlowUp</title><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.286c-5.663 0-10.286-4.623-10.286-10.286S6.337 1.714 12 1.714 22.286 6.337 22.286 12 17.663 22.286 12 22.286zm-1.714-13.714h3.428v10.286h-3.428V8.572zm1.714-5.143a2.571 2.571 0 110-5.142 2.571 2.571 0 010 5.142z"/></svg>
                                <Button size="lg">
                                    Ouvrir FlowUp CodeSpace
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="mt-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Équipe & Paramètres</CardTitle>
                                <CardDescription>Gérez les collaborateurs et les paramètres de votre projet.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Membres de l'équipe</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img src="https://placehold.co/40x40" alt="Avatar" className="rounded-full" data-ai-hint="user avatar" />
                                                <div>
                                                    <p className="font-semibold">Alex (Vous)</p>
                                                    <p className="text-sm text-muted-foreground">Propriétaire</p>
                                                </div>
                                            </div>
                                            <Button variant="outline">Inviter un membre</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Zone de Danger</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                                        <div>
                                            <p className="font-semibold">Supprimer le projet</p>
                                            <p className="text-sm text-destructive/80">Cette action est irréversible.</p>
                                        </div>
                                        <Button variant="destructive">
                                            <Trash2 className="mr-2"/>
                                            Supprimer
                                        </Button>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="announcements" className="mt-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Annonces du Projet</CardTitle>
                                <CardDescription>Les dernières nouvelles et mises à jour importantes pour ce projet.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center py-12">
                                <Megaphone className="h-24 w-24 mx-auto text-muted-foreground/30 mb-6"/>
                                <p className="text-muted-foreground">Aucune annonce pour le moment.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </AppShell>
    );
}
