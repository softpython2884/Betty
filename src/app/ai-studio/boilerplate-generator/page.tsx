'use client';

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Construction } from "lucide-react";

export default function BoilerplateGeneratorPage() {
    return (
        <AppShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3">
                    <Code className="text-primary h-10 w-10" /> Générateur de Boilerplate
                </h1>
                <p className="text-muted-foreground mt-2">
                    Cette fonctionnalité est en cours de développement.
                </p>
                </div>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Bientôt disponible !</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                        <Construction className="h-24 w-24 mb-4" />
                        <p>Nous travaillons dur pour vous permettre de générer des structures de projet complètes avec l'IA.</p>
                        <p>Revenez bientôt pour découvrir cet outil puissant.</p>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
