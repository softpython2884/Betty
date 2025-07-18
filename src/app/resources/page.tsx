
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import Link from "next/link";

const resources = [
    { id: 'res_1', title: 'Guide du Flexbox', description: 'Maîtrisez les alignements et la distribution d\'espace avec Flexbox.', quest: 'Flexbox Challenge' },
    { id: 'res_2', title: 'Comprendre `this` en JS', description: 'Une explication claire du mot-clé `this`, un concept clé en JavaScript.', quest: 'JavaScript Intro' },
    { id: 'res_3', title: 'Les bases de la sémantique HTML', description: 'Écrivez un code HTML plus propre, plus accessible et mieux référencé.', quest: 'HTML Basics' },
    { id: 'res_4', title: 'Introduction à Git', description: 'Apprenez les commandes de base pour la gestion de versions de vos projets.', quest: null },
    { id: 'res_5', title: 'Guide des Sélecteurs CSS', description: 'Ciblez n\'importe quel élément avec précision grâce à des sélecteurs CSS avancés.', quest: null },
];

export default function ResourcesPage() {
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
                                        <CardDescription>{resource.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-end">
                                {resource.quest && <p className="text-xs text-muted-foreground mb-4">Recommandé pour la quête : <span className="font-semibold">{resource.quest}</span></p>}
                                <Button variant="outline" className="w-full">
                                    Lire le document
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
