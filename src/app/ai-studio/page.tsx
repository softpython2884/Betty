import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, BrainCircuit, Code, Sparkles, Wand2 } from "lucide-react";

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

export default function AiStudioPage() {
    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3"><Sparkles className="text-primary h-10 w-10" /> AI Studio</h1>
                    <p className="text-muted-foreground mt-2">Votre arsenal d'outils IA pour suralimenter votre apprentissage.</p>
                </div>

                 <Card className="shadow-md bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground border-0">
                    <CardHeader>
                        <CardTitle>Offre Premium FlowUp x Betty</CardTitle>
                        <CardDescription className="text-primary-foreground/80">En connectant votre compte FlowUp, vous débloquez encore plus d'outils IA et un accès premium gratuit pendant 1 mois !</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary">
                            En savoir plus
                            <ArrowRight className="ml-2" />
                        </Button>
                    </CardContent>
                </Card>

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
        </AppShell>
    );
}
