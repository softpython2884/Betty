
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, PlusCircle, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { getProjectsForCurrentUser } from "../actions/quests";

export default async function ProjectsPage() {
    const allProjects = await getProjectsForCurrentUser();

    const questProjects = allProjects.filter(p => p.isQuestProject);
    const personalProjects = allProjects.filter(p => !p.isQuestProject);

    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-headline tracking-tight">Mes Projets</h1>
                            <p className="text-muted-foreground mt-2">Votre atelier pour forger des solutions et accomplir des quêtes.</p>
                        </div>
                        <CreateProjectDialog />
                    </div>
                </div>

                <Tabs defaultValue="quests">
                    <div className="flex justify-between items-center mb-4">
                        <TabsList>
                            <TabsTrigger value="quests">Projets de Quêtes</TabsTrigger>
                            <TabsTrigger value="personal">Projets Personnels</TabsTrigger>
                        </TabsList>
                        <div className="w-full max-w-sm">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Rechercher un projet..." className="pl-10" />
                            </div>
                        </div>
                    </div>

                    <TabsContent value="quests">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {questProjects.map((project) => (
                                <Link href={`/projects/${project.id}`} key={project.id}>
                                    <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><FolderKanban className="text-primary"/> {project.title}</CardTitle>
                                            <CardDescription>Cursus: {project.curriculum?.name || 'N/A'}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm font-semibold text-muted-foreground">Statut: {project.status}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="personal">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                             {personalProjects.map((project) => (
                                 <Link href={`/projects/${project.id}`} key={project.id}>
                                    <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><FolderKanban className="text-secondary-foreground"/> {project.title}</CardTitle>
                                            <CardDescription>Projet personnel</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm font-semibold text-muted-foreground">Statut: {project.status}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
