import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, BrainCircuit, Code, Sparkles, Wand2, CheckCircle, Users, Database, Server, BookOpen } from "lucide-react";
import Link from "next/link";

const aiTools = [
    {
        title: "Code Checker & Fixer",
        description: "Analysez votre code, trouvez des erreurs et obtenez des suggestions de correction instantanées.",
        icon: Code,
        link: "#",
    },
    {
        title: "AI Project Generator",
        description: "À court d'idées ? Générez des concepts de projets uniques basés sur vos centres d'intérêt.",
        icon: Wand2,
        link: "#",
    },
    {
        title: "AI Mentor",
        description: "Obtenez des indices, des explications et des pistes de réflexion pour débloquer n'importe quelle quête.",
        icon: Bot,
        link: "#",
    },
     {
        title: "Concept Explainer",
        description: "Demandez à l'IA de vous expliquer des concepts de programmation complexes en termes simples.",
        icon: BrainCircuit,
        link: "#",
    },
];

const flowupBenefits = [
    "Projets haute performance et partage facile",
    "Wikis intégrés pour documenter vos projets",
    "Chat privé et de groupe",
    "Coffre-fort sécurisé pour vos données sensibles",
    "CodeSpace : un environnement de développement complet",
    "Page découverte pour explorer d'autres projets",
    "Flowy : votre assistant IA personnel",
]

const flowupTeamBenefits = [
    "Création de bases de données (2 offertes)",
    "Machines Virtuelles (VM) pour vos déploiements",
    "Création de 'Books' interactifs",
    "Offre Premium + Offre Collective incluses",
]

export default function AiStudioPage() {
    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3"><Sparkles className="text-primary h-10 w-10" /> AI Studio</h1>
                    <p className="text-muted-foreground mt-2">Votre arsenal d'outils IA pour suralimenter votre apprentissage.</p>
                </div>

                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-headline">Débloquez plus de puissance avec FlowUp</h2>
                        <p className="text-muted-foreground mt-1">Connectez votre compte FlowUp pour accéder à un écosystème complet d'outils.</p>
                    </div>
                     <div className="grid md:grid-cols-2 gap-8 items-start">
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Avantages FlowUp</CardTitle>
                                <CardDescription>Pour vos projets individuels et votre apprentissage.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {flowupBenefits.map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                         <Card className="shadow-md bg-secondary/50 border-primary/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Users/> Avantages FlowUp Team</CardTitle>
                                <CardDescription>Pour la collaboration et les projets d'équipe.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {flowupTeamBenefits.map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                     </div>
                     <div className="text-center">
                        <Link href="/profile">
                            <Button size="lg">
                                Lier mon compte FlowUp
                                <ArrowRight className="ml-2" />
                            </Button>
                        </Link>
                     </div>
                </div>

                <div className="border-t pt-8 space-y-4">
                     <div className="text-center">
                        <h2 className="text-3xl font-headline">Outils IA de Betty</h2>
                        <p className="text-muted-foreground mt-1">Intégrés directement dans votre académie.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {aiTools.map((tool, index) => (
                            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <div className="p-3 bg-muted rounded-full">
                                    <tool.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                                        <CardDescription>{tool.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full">Lancer l'outil</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
