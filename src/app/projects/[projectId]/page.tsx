
"use client";

import { useState, useEffect, useTransition, useRef } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Code, FileText, GitMerge, Megaphone, Milestone, MoreHorizontal, Pen, Plus, Settings, ShieldQuestion, Trash2, Users, Heading1, Heading2, Heading3, Bold, Italic, Strikethrough, List, ListOrdered, Code2, Link as LinkIcon, Image as ImageIcon, Archive, Clock, AlertTriangle, Loader2, Send, Server, PlayCircle, Terminal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DndContext, closestCenter, type DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InviteMemberDialog } from '@/components/projects/InviteMemberDialog';
import { useToast } from '@/hooks/use-toast';
import { getProjectMembers, getProjectById, addMemberToProject } from '@/app/actions/quests';
import { getTasksByProject, updateTaskStatusAndOrder, updateTaskUrgency, createTask } from '@/app/actions/tasks';
import { getDocumentsForProject, createDocument, updateDocument } from '@/app/actions/resources';
import { submitProjectForReview } from '@/app/actions/projects';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import type { Project, Task, Curriculum, Document } from '@/lib/db/schema';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export const dynamic = 'force-dynamic';

type TaskStatus = "backlog" | "sprint" | "review" | "completed";
type TaskUrgency = "normal" | "important" | "urgent";

type KanbanColumnData = {
  id: TaskStatus;
  title: string;
  color: string;
};

const KANBAN_COLUMNS: KanbanColumnData[] = [
    { id: "backlog", title: "Backlog", color: "bg-neutral-500/10" },
    { id: "sprint", title: "Current Sprint", color: "bg-blue-500/10" },
    { id: "review", title: "In Review", color: "bg-purple-500/10" },
    { id: "completed", title: "Completed", color: "bg-green-500/10" },
];

const urgencyStyles: { [key in TaskUrgency]: string } = {
    normal: "border-transparent",
    important: "border-orange-400",
    urgent: "border-red-500",
}

const SimulatedExecution = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string[]>([]);
    
    const handleRunCode = () => {
        setIsRunning(true);
        setOutput([
            '> node index.js',
            'Executing project code in a secure sandbox...',
        ]);
        
        setTimeout(() => {
            setOutput(prev => [...prev, 'Dependencies installed successfully.']);
        }, 1000);
        
        setTimeout(() => {
            setOutput(prev => [...prev, 'Server listening on port 3000.', '---', 'Hello from my project!', 'Test successful.']);
            setIsRunning(false);
        }, 2500);
    };

    return (
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-3"><Terminal className="h-8 w-8 text-primary"/>Exécution de Code (Simulation)</CardTitle>
                <CardDescription>Testez votre code dans un environnement sécurisé et isolé.</CardDescription>
            </CardHeader>
            <CardContent className="py-8 flex flex-col items-center gap-6">
               <div className='flex items-center gap-4 w-full max-w-lg mx-auto'>
                    <div className='flex-1 space-y-2 text-left'>
                        <Label>Langage</Label>
                        <Select defaultValue="node">
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir le langage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="node">Node.js</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="bash">Bash Script</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex-1 space-y-2 text-left'>
                         <Label>Fichier d'entrée</Label>
                         <Input defaultValue="index.js" />
                    </div>
               </div>

                <Button size="lg" onClick={handleRunCode} disabled={isRunning}>
                    {isRunning ? <Loader2 className="mr-2 animate-spin" /> : <PlayCircle className="mr-2"/>}
                    {isRunning ? "Exécution en cours..." : "Lancer l'Exécution"}
                </Button>

                <div className="w-full max-w-3xl mt-4 text-left font-code bg-gray-900 text-white rounded-lg p-4 h-64 overflow-y-auto">
                    <pre>
                        {output.map((line, i) => (
                           <p key={i} className='text-sm'>{line}</p>
                        ))}
                        {isRunning && <span className="animate-pulse">_</span>}
                    </pre>
                </div>
            </CardContent>
        </Card>
    )
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
                urgencyStyles[task.urgency!]
            )}
        >
            <div className='flex justify-between items-start'>
                <span className='pr-4 text-sm'>{task.title}</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuLabel>Changer l'Urgence</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => onSetUrgency(task.id, 'urgent')}>Urgent</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSetUrgency(task.id, 'important')}>Important</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSetUrgency(task.id, 'normal')}>Normal</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {task.deadline && (
                 <div className="flex items-center justify-end mt-4 pt-2 border-t border-dashed">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(task.deadline), 'dd/MM/yyyy')}</span>
                    </div>
                </div>
            )}
        </Card>
    );
};

const NewTaskInput = ({ status, onAddTask }: { status: TaskStatus, onAddTask: (title: string, status: TaskStatus) => void }) => {
    const [title, setTitle] = useState('');
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && title.trim()) {
            onAddTask(title.trim(), status);
            setTitle('');
            e.preventDefault();
        }
    }
    return (
        <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setTitle('')}
            placeholder="Titre de la nouvelle tâche..."
            className="h-9"
        />
    )
}

const KanbanColumn = ({ column, tasks, onSetUrgency, onAddTask }: { column: KanbanColumnData, tasks: Task[], onSetUrgency: (taskId: string, urgency: TaskUrgency) => void, onAddTask: (title: string, status: TaskStatus) => void }) => {
    const { title, id, color } = column;
    const { setNodeRef } = useSortable({ id: column.id, data: { type: 'COLUMN' } });
    const [isAdding, setIsAdding] = useState(false);
    
    const handleAddTaskWrapper = (taskTitle: string, taskStatus: TaskStatus) => {
        onAddTask(taskTitle, taskStatus);
        setIsAdding(false);
    }
    
    return (
        <div ref={setNodeRef} className={cn("space-y-4 rounded-lg p-2 h-full min-w-72 flex-shrink-0 flex flex-col", color)}>
            <div className="flex justify-between items-center px-2">
                <h3 className="font-semibold">{title}</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsAdding(true)}><Plus className="h-4 w-4"/></Button>
            </div>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 p-1 flex-grow min-h-24">
                    {tasks.map(task => <SortableTaskItem key={task.id} task={task} onSetUrgency={onSetUrgency} />)}
                </div>
            </SortableContext>
            {isAdding && <NewTaskInput status={id} onAddTask={handleAddTaskWrapper} />}
        </div>
    );
};

interface FlowUpMember {
    uuid: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
}

type ProjectWithDetails = Project & { curriculum: { name: string } | null };


export default function ProjectWorkspacePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    
    const [project, setProject] = useState<ProjectWithDetails | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [members, setMembers] = useState<FlowUpMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const loadProjectData = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [projectData, tasksData, membersData, documentsData] = await Promise.all([
                getProjectById(projectId),
                getTasksByProject(projectId),
                getProjectMembers(projectId),
                getDocumentsForProject(projectId)
            ]);

            if (!projectData) {
                toast({ variant: 'destructive', title: 'Projet non trouvé' });
                router.push('/projects');
                return;
            }

            setProject(projectData as ProjectWithDetails);
            setTasks(tasksData);
            setMembers(membersData || []);
            setDocuments(documentsData);
            if (documentsData.length > 0 && !selectedDocument) {
                setSelectedDocument(documentsData[0]);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur de chargement', description: error.message });
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        loadProjectData();
    }, [projectId, toast, router]);


    const findTaskColumnId = (taskId: string) => {
        return tasks.find(task => task.id === taskId)?.status as TaskStatus | undefined;
    };
    
    const handleSetUrgency = (taskId: string, urgency: TaskUrgency) => {
        setTasks(prevTasks => prevTasks.map(task => 
            task.id === taskId ? { ...task, urgency } : task
        ));
        startTransition(() => {
            updateTaskUrgency(taskId, projectId, urgency);
        });
    };
    
    const handleAddTask = async (title: string, status: TaskStatus) => {
        startTransition(async () => {
            const newTask = await createTask(projectId, title);
            setTasks(prev => [...prev, newTask]);
        });
    };

     const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        setTasks((currentTasks) => {
            const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
            const overIndex = currentTasks.findIndex((t) => t.id === overId);
            
            // If dragging a task
            if (active.data.current?.type !== 'COLUMN' && over) {
                // If dropping on a column
                if (over.data.current?.type === 'COLUMN') {
                    const newStatus = overId as TaskStatus;
                    const updatedTasks = currentTasks.map(t => 
                        t.id === activeId ? { ...t, status: newStatus } : t
                    );
                    
                    // Recalculate order for the new column
                    const tasksInNewColumn = updatedTasks.filter(t => t.status === newStatus);
                    tasksInNewColumn.forEach((task, index) => {
                        updateTaskStatusAndOrder(task.id, projectId, newStatus, index);
                    });
                    
                    return updatedTasks;

                } 
                // If dropping on another task
                else if (over.data.current?.type !== 'COLUMN') {
                    if (activeIndex === overIndex) return currentTasks;

                    const newTasks = arrayMove(currentTasks, activeIndex, overIndex);
                    const newStatus = newTasks[overIndex].status;

                    // Update status if it changed
                    if (newTasks[overIndex].status !== currentTasks[activeIndex].status) {
                       newTasks[overIndex].status = newStatus;
                    }
                    
                    // Recalculate order for the affected columns
                    const affectedStatuses = new Set([currentTasks[activeIndex].status, newStatus]);
                    affectedStatuses.forEach(status => {
                        const tasksInColumn = newTasks.filter(t => t.status === status);
                        tasksInColumn.forEach((task, index) => {
                             updateTaskStatusAndOrder(task.id, projectId, status, index);
                        });
                    });

                    return newTasks;
                }
            }
            return currentTasks;
        });
    };
    
    const handleCreateDocument = async () => {
        startTransition(async () => {
            const newDoc = await createDocument(projectId, "Nouveau Document", "# Nouveau Document\n\nCommencez à écrire...");
            setDocuments(prev => [...prev, newDoc]);
            setSelectedDocument(newDoc);
        })
    };

    const handleDocumentContentChange = (content: string) => {
        if (!selectedDocument) return;
        
        const updatedDoc = { ...selectedDocument, content, updatedAt: new Date() };
        setSelectedDocument(updatedDoc);
        
        setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
        
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        debounceTimeout.current = setTimeout(() => {
            startTransition(async () => {
                await updateDocument(updatedDoc.id, { content, projectId });
                toast({ title: 'Document sauvegardé' });
            });
        }, 1500); // Debounce time: 1.5 seconds
    };
    
    const handleDocumentTitleChange = (title: string) => {
        if (!selectedDocument) return;

        const updatedDoc = { ...selectedDocument, title, updatedAt: new Date() };
        setSelectedDocument(updatedDoc);

        setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));

         if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        debounceTimeout.current = setTimeout(() => {
            startTransition(async () => {
                await updateDocument(updatedDoc.id, { title, projectId });
                toast({ title: 'Titre sauvegardé' });
            });
        }, 1500);
    }
    
    const handleAddMember = async (email: string) => {
        startTransition(async () => {
            try {
                const result = await addMemberToProject(projectId, email);
                if (result.success) {
                    toast({ title: 'Membre invité', description: `L'invitation pour ${email} a été envoyée.` });
                    await loadProjectData(); // Refresh members list
                } else {
                    throw new Error(result.message);
                }
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Erreur d'invitation", description: error.message });
            }
        });
    }

    const handleSubmitForReview = () => {
        startTransition(async () => {
            const result = await submitProjectForReview(projectId);
            if (result.success) {
                toast({ title: "Projet Soumis !", description: result.message });
                loadProjectData(); // Refresh project data to update status
            } else {
                toast({ variant: 'destructive', title: "Échec de la soumission", description: result.message });
            }
        });
    };

    if (loading) {
        return (
            <AppShell>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            </AppShell>
        );
    }
    
    if (!project) {
        // This case is handled in useEffect, but as a fallback:
        return (
            <AppShell>
                <Card>
                    <CardHeader>
                        <CardTitle>Projet non trouvé</CardTitle>
                        <CardDescription>Redirection vers la liste des projets...</CardDescription>
                    </CardHeader>
                </Card>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground mt-2">Créé le {format(new Date(project.createdAt), 'dd MMMM yyyy')} - Dernière modification le {format(new Date(project.updatedAt || project.createdAt), 'dd MMMM yyyy')}</p>
                </div>

                <Tabs defaultValue="tasks">
                    <TabsList className="grid w-full grid-cols-5 md:grid-cols-7">
                        <TabsTrigger value="tasks"><Milestone className="mr-2" />Tâches</TabsTrigger>
                        <TabsTrigger value="documents"><FileText className="mr-2"/>Documents</TabsTrigger>
                        <TabsTrigger value="execution"><Terminal className="mr-2"/>Exécution</TabsTrigger>
                        <TabsTrigger value="codespace"><Code className="mr-2"/>CodeSpace</TabsTrigger>
                        <TabsTrigger value="settings"><Settings className="mr-2"/>Équipe & Paramètres</TabsTrigger>
                        {project.isQuestProject && <TabsTrigger value="quest"><ShieldQuestion className="mr-2"/>Cursus</TabsTrigger>}
                        <TabsTrigger value="announcements"><Megaphone className="mr-2"/>Annonces</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="mt-6">
                        <Card>
                             <CardContent className="p-4">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <div className="flex gap-4 items-start overflow-x-auto pb-4 w-full">
                                        {KANBAN_COLUMNS.map(col => (
                                            <KanbanColumn
                                                key={col.id}
                                                column={col}
                                                tasks={tasks.filter(t => t.status === col.id).sort((a, b) => a.order - b.order)}
                                                onSetUrgency={handleSetUrgency}
                                                onAddTask={handleAddTask}
                                            />
                                        ))}
                                    </div>
                                </DndContext>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="documents" className="mt-6">
                       <Card className="shadow-md">
                           <div className="grid grid-cols-[240px,1fr] h-[700px] border rounded-lg">
                               <div className="border-r bg-muted/30 p-4 space-y-2 flex flex-col">
                                   <div className="flex justify-between items-center mb-2">
                                       <h3 className="font-semibold text-lg">Documents</h3>
                                       <Button variant="ghost" size="sm" onClick={handleCreateDocument} disabled={isPending}><Plus className="mr-1 h-4 w-4" />Nouveau</Button>
                                   </div>
                                   <ScrollArea className="flex-1">
                                       {documents.map(doc => (
                                           <Button key={doc.id} variant={selectedDocument?.id === doc.id ? "secondary" : "ghost"} className="w-full justify-start mb-1" onClick={() => setSelectedDocument(doc)}>
                                               <FileText className="mr-2 h-4 w-4" />
                                               <span className="truncate">{doc.title}</span>
                                           </Button>
                                       ))}
                                   </ScrollArea>
                                   {documents.length === 0 && (
                                       <p className="text-sm text-muted-foreground text-center pt-4">Aucun document pour ce projet.</p>
                                   )}
                               </div>
                               <div className="flex flex-col">
                                   {selectedDocument ? (
                                       <>
                                           <div className="border-b p-4">
                                               <Input 
                                                   value={selectedDocument.title} 
                                                   onChange={(e) => handleDocumentTitleChange(e.target.value)}
                                                   className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 p-0 h-auto" />
                                               <p className="text-sm text-muted-foreground">Dernière mise à jour {format(new Date(selectedDocument.updatedAt), 'dd/MM/yy HH:mm')}</p>
                                           </div>
                                           <div className="grid grid-cols-2 flex-grow min-h-0">
                                                <div className="p-4 border-r">
                                                    <Textarea
                                                        value={selectedDocument.content || ""}
                                                        onChange={(e) => handleDocumentContentChange(e.target.value)}
                                                        className="h-full w-full resize-none border-0 shadow-none focus-visible:ring-0 p-0 font-code"
                                                        placeholder='Commencez à écrire votre document en Markdown...'
                                                    />
                                                </div>
                                                <ScrollArea className="h-full">
                                                    <article className="prose prose-sm dark:prose-invert max-w-none p-4">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedDocument.content || "Aperçu du Markdown..."}</ReactMarkdown>
                                                    </article>
                                                </ScrollArea>
                                           </div>
                                       </>
                                   ): (
                                       <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                           <FileText className="h-24 w-24 mb-4" />
                                           <p>Sélectionnez un document ou créez-en un nouveau.</p>
                                       </div>
                                   )}
                               </div>
                           </div>
                       </Card>
                   </TabsContent>
                   
                   <TabsContent value="execution" className="mt-6">
                       <SimulatedExecution />
                   </TabsContent>

                    {project.isQuestProject && (
                         <TabsContent value="quest" className="mt-6">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3"><ShieldQuestion className="text-primary h-8 w-8"/> Projet de Cursus</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                     <p className="text-muted-foreground">Ce projet est votre espace de travail central pour toutes les quêtes du cursus "{project.curriculum?.name}". Une fois que vous estimez avoir terminé, soumettez-le à un professeur pour évaluation.</p>
                                    <Button size="lg" onClick={handleSubmitForReview} disabled={isPending || project.status === 'Submitted'}>
                                        {isPending ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        ) : project.status === 'Submitted' ? (
                                            <Check className="mr-2"/>
                                        ) : (
                                            <Send className="mr-2"/>
                                        )}
                                        {project.status === 'Submitted' ? "Soumis pour Évaluation" : "Soumettre pour Évaluation"}
                                    </Button>
                                </CardContent>
                            </Card>
                         </TabsContent>
                    )}

                   <TabsContent value="codespace" className="mt-6">
                        <Card className="text-center">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-3"><Server className="h-8 w-8 text-primary"/>FlowUp Code & Execution</CardTitle>
                                <CardDescription>Votre environnement de développement et d'exécution sécurisé dans le cloud.</CardDescription>
                            </CardHeader>
                            <CardContent className="py-12 flex flex-col items-center gap-6">
                               <p className="max-w-prose">
                                   Le CodeSpace de FlowUp est l'endroit où vous écrirez, testerez et exécuterez votre code. C'est un environnement sécurisé et isolé, parfait pour les projets de l'académie.
                               </p>
                                <Button size="lg" asChild>
                                    <Link href={`https://flowup.nationquest.fr/project/${projectId}`} target="_blank" rel="noopener noreferrer">
                                        <PlayCircle className="mr-2"/>
                                        Lancer le CodeSpace
                                    </Link>
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
                                        {members.length > 0 ? members.map((member) => (
                                             <div key={member.uuid} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={member.avatar || `https://placehold.co/40x40.png?text=${member.name.charAt(0)}`} alt="Avatar" data-ai-hint="user avatar" />
                                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{member.name}</p>
                                                        <p className="text-sm text-muted-foreground">{member.role}</p>
                                                    </div>
                                                </div>
                                                {member.role !== "owner" && (
                                                    <Button variant="ghost" size="sm">Retirer</Button>
                                                )}
                                            </div>
                                        )) : (
                                            <p className="text-sm text-muted-foreground">Aucun membre dans ce projet pour le moment.</p>
                                        )}

                                        <div className="pt-4">
                                            <InviteMemberDialog projectId={projectId} onInvite={handleAddMember}/>
                                        </div>
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

    