
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Code, FileText, GitMerge, Megaphone, Milestone, MoreHorizontal, Pen, Plus, Settings, ShieldQuestion, Trash2, Users } from "lucide-react";

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

export default function ProjectWorkspacePage({ params }: { params: { projectId: string } }) {
    const project = projectData[params.projectId as keyof typeof projectData] || projectData["proj-1"];

    return (
        <AppShell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground mt-2">Bienvenue dans votre atelier. C'est ici que la magie opère.</p>
                </div>

                <Tabs defaultValue="tasks">
                    <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
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
                            <div className="grid grid-cols-4 h-[700px]">
                                <div className="col-span-1 border-r bg-muted/30 p-4 space-y-2">
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
                                <div className="col-span-3 p-6 flex flex-col">
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
                                <CardTitle>CodeSpace</CardTitle>
                                <CardDescription>Connectez votre dépôt GitHub pour commencer à coder.</CardDescription>
                            </CardHeader>
                            <CardContent className="py-12">
                                <GitMerge className="h-24 w-24 mx-auto text-muted-foreground/30 mb-6"/>
                                <Button size="lg">
                                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 fill-current"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                                    Connecter avec GitHub
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </AppShell>
    );
}
