

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, BrainCircuit, Code, FileJson, FileText, Rocket, Server, Sparkles, Wand2, Users, Briefcase, GitCompareArrows, Route, Share2 } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

const bettyAiTools = [
    {
        title: "AI Mentor (Codex)",
        description: "Obtenez des indices et des pistes de réflexion pour débloquer n'importe quelle quête.",
        icon: Bot,
        link: "/codex",
        linkText: "Lancer l'outil"
    },
     {
        title: "Expliqueur de Concept",
        description: "Demandez à l'IA de vous expliquer des concepts de programmation complexes en termes simples.",
        icon: BrainCircuit,
        link: "/ai-studio/concept-explainer",
        linkText: "Lancer l'outil"
    },
    {
        title: "Optimiseur de Code",
        description: "L'IA analyse votre code et suggère des améliorations de performance ou de lisibilité.",
        icon: Wand2,
        link: "/ai-studio/code-optimizer",
        linkText: "Lancer l'outil"
    },
    {
        title: "Simulateur d'Entretien",
        description: "Préparez-vous aux entretiens techniques avec un simulateur IA qui vous posera des questions pertinentes.",
        icon: Briefcase,
        link: "/ai-studio/interview-simulator",
        linkText: "Lancer l'outil"
    },
];

const flowupAiTools = [
    {
        title: "Project Kick-starter",
        description: "Décrivez votre idée, et l'IA génère un nom, une description, un README, et crée le projet pour vous.",
        icon: Rocket,
        link: "/ai-studio/project-kickstarter",
        linkText: "Lancer le Générateur"
    },
     {
        title: "Générateur de README",
        description: "Générez un README.md complet à partir d'une simple description de projet.",
        icon: FileJson,
        link: "/ai-studio/readme-generator",
        linkText: "Lancer le Générateur"
    },
    {
        title: "Générateur de Parcours",
        description: "Sélectionnez des compétences et l'IA construit un arbre de quêtes personnalisé pour vous.",
        icon: Route,
        link: "/ai-studio/learning-path-generator",
        linkText: "Lancer le Générateur"
    },
    {
        title: "Générateur de Diagrammes",
        description: "Décrivez une application, et l'IA génère un diagramme d'architecture pour la visualiser.",
        icon: Share2,
        link: "/ai-studio/architecture-generator",
        linkText: "Lancer le Générateur"
    },
    {
        title: "Générateur de Boilerplate",
        description: "Décrivez une application (ex: 'API REST en Express'), et l'IA génère la structure de fichiers avec du code de départ.",
        icon: Code,
        link: "#",
        linkText: "Bientôt disponible"
    },
    {
        title: "Traducteur de Code",
        description: "Traduisez un morceau de code d'un langage à un autre (ex: Python vers JS) avec des explications.",
        icon: GitCompareArrows,
        link: "#",
        linkText: "Bientôt disponible"
    },
]


export default async function AiStudioPage() {
    const user = await getCurrentUser();
    const isFlowUpConnected = !!user?.flowUpUuid && !!user?.flowUpFpat;

    return (
        <AppShell>
            <div className="space-y-12">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3"><Sparkles className="text-primary h-10 w-10" /> AI Studio</h1>
                    <p className="text-muted-foreground mt-2">Votre arsenal d'outils IA pour suralimenter votre apprentissage et vos créations.</p>
                </div>

                 {isFlowUpConnected ? (
                    <Alert variant="default" className="bg-green-500/10 border-green-500/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Compte FlowUp Connecté</AlertTitle>
                        <AlertDescription className="text-green-700">
                           Vous avez accès à la suite complète d'outils d'IA de FlowUp.
                        </AlertDescription>
                    </Alert>
                 ) : (
                    <Card className="shadow-md bg-secondary/50 border-primary/50">
                        <CardHeader>
                            <CardTitle>Débloquez la Puissance de FlowUp</CardTitle>
                            <CardDescription>
                               Connectez votre compte FlowUp pour accéder à un écosystème complet d'outils IA et de gestion de projet.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/profile">
                                <Button size="lg">
                                    Lier mon compte FlowUp
                                    <ArrowRight className="ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                 )}
                
                <div className="border-t pt-12 space-y-6">
                     <div className="text-center">
                        <h2 className="text-3xl font-headline">Outils IA de Betty</h2>
                        <p className="text-muted-foreground mt-1">Conçus spécialement pour les besoins de l'académie.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {bettyAiTools.map((tool, index) => (
                             <Card key={index} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <div className="p-3 bg-muted rounded-full">
                                    <tool.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                                        <CardDescription>{tool.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                    <Link href={tool.link || "#"} passHref>
                                        <Button variant="outline" className="w-full" disabled={tool.link === "#"}>{tool.linkText}</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-12 space-y-6">
                     <div className="text-center">
                        <h2 className="text-3xl font-headline">Suite IA de FlowUp</h2>
                        <p className="text-muted-foreground mt-1">Intégrée à votre espace de travail pour révolutionner votre workflow.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {flowupAiTools.map((tool, index) => (
                            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <div className="p-3 bg-muted rounded-full">
                                        <tool.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                                        <CardDescription>{tool.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                    <Link href={tool.link} passHref>
                                        <Button variant="outline" className="w-full" disabled={!isFlowUpConnected || tool.link === "#"}>
                                            {tool.linkText}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                
            </div>
        </AppShell>
    );
}
