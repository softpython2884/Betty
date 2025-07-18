
"use client";

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Code, FileText, GitMerge, Megaphone, Milestone, MoreHorizontal, Pen, Plus, Settings, ShieldQuestion, Trash2, Users, Heading1, Heading2, Heading3, Bold, Italic, Strikethrough, List, ListOrdered, Code2, Link, Image as ImageIcon, Archive, Clock, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DndContext, closestCenter, type DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

// Mock data, this would come from your backend
const projectData = {
    "proj-1": {
        title: "Projet: JavaScript Intro",
        isQuestProject: true,
        associatedQuest: {
            title: "The Forest of Functions",
            description: "Your task is to create a function that greets a fellow adventurer. You must define a function named `greet` that accepts a single parameter `name` and returns a string.",
            xp: 200,
            orbs: 10,
            difficulty: "Facile",
            requirements: "Un fichier `index.js` contenant la fonction `greet`."
        },
    },
    "proj-3": {
        title: "Mon Portfolio",
        isQuestProject: false,
    }
};

type TaskStatus = "todo" | "inProgress" | "done" | "archived";
type TaskUrgency = "normal" | "important" | "urgent";

type Task = { 
  id: string; 
  title: string;
  status: TaskStatus;
  urgency: TaskUrgency;
  deadline?: string;
};

type KanbanColumnData = {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

const initialKanbanCols: KanbanColumnData[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "bg-neutral-500/10",
    tasks: [
      { id: "task-1", title: "Setup project structure", status: 'todo', urgency: 'normal' },
      { id: "task-2", title: "Write greeting function", status: 'todo', urgency: 'important', deadline: "2024-08-15" },
    ]
  },
  {
    id: "sprint",
    title: "Current Sprint",
    color: "bg-blue-500/10",
    tasks: [
        { id: "task-3", title: "Add comments to code", status: 'inProgress', urgency: 'normal' },
    ]
  },
  {
    id: "review",
    title: "In Review",
    color: "bg-purple-500/10",
    tasks: []
  },
   {
    id: "completed",
    title: "Completed",
    color: "bg-green-500/10",
    tasks: [
        { id: "task-4", title: "Initial commit", status: 'done', urgency: 'urgent', deadline: "2024-08-10" },
    ]
  }
]

const urgencyStyles: { [key in TaskUrgency]: string } = {
    normal: "border-transparent",
    important: "border-orange-400",
    urgent: "border-red-500",
}

const statusBadge: { [key in TaskStatus]: { label: string, color: string} } = {
    todo: { label: "À Faire", color: "bg-muted text-muted-foreground" },
    inProgress: { label: "En Cours", color: "bg-blue-500/20 text-blue-700" },
    done: { label: "Terminé", color: "bg-green-500/20 text-green-700" },
    archived: { label: "Archivé", color: "bg-neutral-500/20 text-neutral-600" },
}

const SortableTaskItem = ({ task, onSetUrgency }: { task: Task, onSetUrgency: (taskId: string, urgency: TaskUrgency) => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "p-4 bg-card shadow-sm group touch-none border-l-4",
                urgencyStyles[task.urgency]
            )}
        >
            <div className='flex justify-between items-start'>
                <span className='pr-4'>{task.title}</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuLabel>Change Urgency</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => onSetUrgency(task.id, 'urgent')}>Urgent</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSetUrgency(task.id, 'important')}>Important</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSetUrgency(task.id, 'normal')}>Normal</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex items-center justify-between mt-4 pt-2 border-t border-dashed">
                <Badge variant="secondary" className={cn("text-xs", statusBadge[task.status].color)}>
                    {statusBadge[task.status].label}
                </Badge>
                {task.deadline && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{task.deadline}</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

const KanbanColumn = ({ column, tasks, onSetUrgency }: { column: KanbanColumnData, tasks: Task[], onSetUrgency: (taskId: string, urgency: TaskUrgency) => void }) => {
    const { title, id, color } = column;
    const {
        setNodeRef,
    } = useSortable({ id: column.id, data: { type: 'COLUMN' } });
    
    return (
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div ref={setNodeRef} className={cn("space-y-4 rounded-lg p-4 h-full min-w-72 flex-shrink-0", color)}>
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <Button variant="ghost" size="icon"><Plus/></Button>
                </div>
                <div className="space-y-4 min-h-24">
                    {tasks.map(task => <SortableTaskItem key={task.id} task={task} onSetUrgency={onSetUrgency} />)}
                </div>
            </div>
        </SortableContext>
    );
};


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
    const [kanbanCols, setKanbanCols] = useState<KanbanColumnData[]>(initialKanbanCols);
    
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      })
    );

    const findTaskColumnId = (taskId: string) => {
        return kanbanCols.find(col => col.tasks.some(task => task.id === taskId))?.id;
    };
    
    const handleSetUrgency = (taskId: string, urgency: TaskUrgency) => {
        setKanbanCols(prevCols => {
            return prevCols.map(col => ({
                ...col,
                tasks: col.tasks.map(task => 
                    task.id === taskId ? { ...task, urgency } : task
                )
            }));
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        const activeColumnId = findTaskColumnId(activeId);
        const overIsColumn = over.data.current?.type === 'COLUMN';
        const overColumnId = overIsColumn ? over.id.toString() : findTaskColumnId(overId);

        if (!activeColumnId || !overColumnId) return;
        
        setKanbanCols(prev => {
            const activeColumnIndex = prev.findIndex(col => col.id === activeColumnId);
            const overColumnIndex = prev.findIndex(col => col.id === overColumnId);
            const activeTaskIndex = prev[activeColumnIndex].tasks.findIndex(t => t.id === activeId);

            let newCols = JSON.parse(JSON.stringify(prev));

            if (activeColumnId === overColumnId) {
                // Moving within the same column
                const overTaskIndex = prev[activeColumnIndex].tasks.findIndex(t => t.id === overId);
                newCols[activeColumnIndex].tasks = arrayMove(newCols[activeColumnIndex].tasks, activeTaskIndex, overTaskIndex);
            } else {
                // Moving to a different column
                const [movedTask] = newCols[activeColumnIndex].tasks.splice(activeTaskIndex, 1);
                
                if (overIsColumn) {
                    // Dropping on the column itself
                    newCols[overColumnIndex].tasks.push(movedTask);
                } else {
                    // Dropping on another task
                    const overTaskIndex = prev[overColumnIndex].tasks.findIndex(t => t.id === overId);
                    newCols[overColumnIndex].tasks.splice(overTaskIndex, 0, movedTask);
                }
            }
            
            return newCols;
        });
    };

    return (
        <AppShell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground mt-2">Bienvenue dans votre atelier. C'est ici que la magie opère.</p>
                </div>

                <Tabs defaultValue="tasks">
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
                             <CardContent className="p-6">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <div className="flex flex-col items-center">
                                        <div className="flex gap-6 items-start overflow-x-auto pb-4 w-full">
                                            <SortableContext items={kanbanCols.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                                                {kanbanCols.map(col => <KanbanColumn key={col.id} column={col} tasks={col.tasks} onSetUrgency={handleSetUrgency} />)}
                                            </SortableContext>
                                        </div>
                                        <div className="mt-4">
                                            <Button variant="outline">
                                                <Plus className="mr-2" />
                                                Nouvelle Colonne
                                            </Button>
                                        </div>
                                    </div>
                                </DndContext>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="documents" className="mt-6">
                       <Card className="shadow-md">
                            <div className="grid grid-cols-[auto,1fr,auto] h-[700px]">
                                <div className="border-r bg-muted/30 p-4 space-y-2 min-w-56">
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
                                <div className="p-6 flex flex-col">
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
                                <div className="border-l bg-muted/30 p-2 w-14">
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
                                        <Badge variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">{project.associatedQuest.orbs} Orbes</Badge>
                                        <Badge variant="outline">Difficulté: {project.associatedQuest.difficulty}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">Description de la quête</h3>
                                        <p className="text-muted-foreground">{project.associatedQuest.description}</p>
                                    </div>
                                     <div>
                                        <h3 className="font-semibold mb-2">Conditions de réussite</h3>
                                        <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md border">{project.associatedQuest.requirements}</p>
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
                                            <Button variant="outline" disabled={project.isQuestProject}>
                                                <Users className="mr-2" />
                                                Inviter un membre
                                            </Button>
                                        </div>
                                         {project.isQuestProject && (
                                            <p className="text-sm text-muted-foreground p-3 bg-secondary/30 rounded-md border">Les membres sont gérés automatiquement pour les projets de quête.</p>
                                        )}
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Zone de Danger</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                                        {project.isQuestProject ? (
                                            <>
                                                <div>
                                                    <p className="font-semibold">Archiver le projet</p>
                                                    <p className="text-sm text-destructive/80">Le projet sera masqué mais pas supprimé.</p>
                                                </div>
                                                <Button variant="destructive">
                                                    <Archive className="mr-2"/>
                                                    Archiver
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <p className="font-semibold">Supprimer le projet</p>
                                                    <p className="text-sm text-destructive/80">Cette action est irréversible.</p>
                                                </div>
                                                <Button variant="destructive">
                                                    <Trash2 className="mr-2"/>
                                                    Supprimer
                                                </Button>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="announcements" className="mt-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Annonces du Projet</CardTitle>
                                <CardDescription>Les dernières nouvelles et mises à jour importantes publiées par les professeurs.</CardDescription>
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
