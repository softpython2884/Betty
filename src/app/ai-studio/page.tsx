
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, BrainCircuit, Code, FileJson, FileText, Rocket, Server, Sparkles, Wand2, Users } from "lucide-react";
import Link from "next/link";

const bettyAiTools = [
    {
        title: "AI Mentor (Codex)",
        description: "Obtenez des indices et des pistes de réflexion pour débloquer n'importe quelle quête.",
        icon: Bot,
        link: "/codex",
    },
     {
        title: "Expliqueur de Concept",
        description: "Demandez à l'IA de vous expliquer des concepts de programmation complexes en termes simples.",
        icon: BrainCircuit,
        link: "/ai-studio/concept-explainer",
    },
    {
        title: "Générateur de README",
        description: "Générez un README.md complet à partir d'une simple description de projet.",
        icon: FileJson,
        link: "/ai-studio/readme-generator",
    },
    {
        title: "Générateur de Serveur Discord (par FlowUp Teams)",
        description: "Créez automatiquement un serveur Discord complet et personnalisé pour votre projet d'équipe.",
        icon: Server,
        link: "#",
        disabled: true,
    },
];

const flowupAiTools = [
    {
        title: "Project Kick-starter",
        description: "Décrivez votre idée, et l'IA génère un nom, une description, un README, et crée le projet pour vous.",
        icon: Rocket,
        linkText: "Lancer le Générateur"
    },
    {
        title: "Project Idea Generator",
        description: "Coincé ? Obtenez des idées de projets et des listes de tâches initiales basées sur un concept ou une technologie.",
        icon: Wand2,
        linkText: "Lancer le Générateur"
    },
    {
        title: "Project Scaffolder",
        description: "Décrivez une application simple, et l'IA génère une structure de fichiers complète avec du code de départ.",
        icon: Code,
        linkText: "Lancer le Générateur"
    },
    {
        title: "Document Generator",
        description: "Automatisez votre documentation. L'IA génère des documents Markdown complets à partir d'un simple prompt.",
        icon: FileText,
        linkText: "Lancer le Générateur"
    },
    {
        title: "AI File Editor",
        description: "Modifiez vos fichiers avec le langage naturel directement dans le CodeSpace de FlowUp.",
        icon: Bot,
        linkText: "Aller au CodeSpace"
    }
]


export default function AiStudioPage() {
    const isFlowUpConnected = false; // Mock data

    return (
        <AppShell>
            <div className="space-y-12">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3"><Sparkles className="text-primary h-10 w-10" /> AI Studio</h1>
                    <p className="text-muted-foreground mt-2">Votre arsenal d'outils IA pour suralimenter votre apprentissage et vos créations.</p>
                </div>

                <Card className="shadow-md bg-secondary/50 border-primary/50">
                    <CardHeader>
                        <CardTitle>Débloquez la Puissance de FlowUp</CardTitle>
                        <CardDescription>
                            {isFlowUpConnected 
                                ? "Votre compte FlowUp est connecté. Accédez à la suite d'outils IA complète !"
                                : "Connectez votre compte FlowUp pour accéder à un écosystème complet d'outils IA et de gestion de projet."
                            }
                        </CardDescription>
                    </CardHeader>
                    {!isFlowUpConnected && (
                        <CardContent>
                            <Link href="/profile">
                                <Button size="lg">
                                    Lier mon compte FlowUp
                                    <ArrowRight className="ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    )}
                </Card>
                
                <div className="border-t pt-12 space-y-6">
                     <div className="text-center">
                        <h2 className="text-3xl font-headline">Outils IA de Betty</h2>
                        <p className="text-muted-foreground mt-1">Conçus spécialement pour les besoins de l'académie.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                                    <Link href={tool.link || "#"}>
                                        <Button variant="outline" className="w-full" disabled={tool.disabled}>Lancer l'outil</Button>
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
                                    <Button variant="outline" className="w-full" disabled={!isFlowUpConnected}>{tool.linkText}</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                
            </div>
        </AppShell>
    );
}
