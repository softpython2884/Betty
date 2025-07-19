
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { getResources } from "../actions/resources";

export default async function ResourcesPage() {
    const resources = await getResources();

    return (
        <AppShell>
            <div className="space-y-8">
                 <div>
                    <h1 className="text-4xl font-headline tracking-tight">Ressources</h1>
                    <p className="text-muted-foreground mt-2">Votre bibliothèque de connaissances. Explorez les guides et tutoriels rédigés par vos professeurs.</p>
                </div>

                <div className="relative w-full max-w-lg mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Rechercher une ressource (ex: 'CSS', 'JavaScript')..." className="pl-10" />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                        <Card key={resource.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-muted rounded-full">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>{resource.title}</CardTitle>
                                        <CardDescription>{resource.content.substring(0, 100)}...</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-end">
                                {resource.quests.length > 0 && <p className="text-xs text-muted-foreground mb-4">Recommandé pour : <span className="font-semibold">{resource.quests[0].quest.title}</span></p>}
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/resources/${resource.id}`}>
                                        Lire le document
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
