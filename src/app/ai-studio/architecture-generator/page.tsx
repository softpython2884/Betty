
"use client";

import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, Share2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const blogDiagram = `
graph TD
    subgraph "Frontend (Next.js)"
        A[Page: /] --> B{Posts List}
        A --> C[Page: /posts/:slug]
        C --> D{Post View}
    end
    subgraph "Backend (API Route)"
        E[GET /api/posts] --> F[(Database)]
        G[GET /api/posts/:slug] --> F
        H[POST /api/comments] --> F
    end
    subgraph "Database (SQLite)"
        F -- "posts" --> I(id, title, content)
        F -- "comments" --> J(id, text, postId)
        F -- "users" --> K(id, name)
    end
    B --> E
    D --> G
    D -- "submits" --> H
`;

const ecommerceDiagram = `
graph LR
    subgraph "Client Browser"
        A[Homepage] -->|views| B(Product Grid)
        B -->|clicks| C{Product Page}
        C -->|add to cart| D[Cart Service]
    end
    subgraph "Microservices"
        D -- "adds item" --> E[Cart API]
        E -- "updates" --> F[(Cart DB)]
        C -- "requests" --> G[Product API]
        G -- "reads" --> H[(Product DB)]
        I[Checkout Page] --> J[Order API]
        J -- "creates order" --> K[(Order DB)]
        J -- "charges card" --> L{Payment Gateway}
    end
    A -- "fetches" --> G
`;

const defaultDiagram = `
graph TD
    A[Start] --> B{Is it working?};
    B -->|Yes| C[Great!];
    B -->|No| D[Check the console.];
    D --> B;
`;

mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

const SimulatedConsole = ({ logs, onDone }: { logs: string[], onDone: () => void }) => {
    const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);

    useEffect(() => {
        setDisplayedLogs([]);
        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setDisplayedLogs(prev => [...prev, logs[i]]);
                i++;
            } else {
                clearInterval(interval);
                onDone();
            }
        }, 500);
        return () => clearInterval(interval);
    }, [logs, onDone]);

    return (
        <div className="p-4 bg-gray-900 text-white font-mono text-xs rounded-md h-32 overflow-y-auto">
            {displayedLogs.map((log, index) => (
                <p key={index} className="whitespace-pre-wrap">{log}</p>
            ))}
            <div className="h-4 w-2 bg-white animate-pulse"></div>
        </div>
    );
};

export default function ArchitectureGeneratorPage() {
    const [description, setDescription] = useState('Décris une application de blog simple avec des utilisateurs, des articles et des commentaires.');
    const [diagram, setDiagram] = useState('');
    const [isGenerating, setIsGenerating] =useState(false);
    const [isDiagramReady, setIsDiagramReady] = useState(false);
    const { toast } = useToast();
    const mermaidRef = useRef<HTMLDivElement>(null);

    const simulationLogs = [
        "Analyzing user request...",
        "Identifying key entities: 'blog', 'users', 'articles', 'comments'...",
        "Establishing relationships between entities...",
        "Generating frontend subgraph...",
        "Generating backend API routes...",
        "Defining database schema...",
        "Rendering diagram...",
    ];

    useEffect(() => {
        if (diagram && mermaidRef.current) {
            mermaidRef.current.innerHTML = diagram;
            mermaid.run({ nodes: [mermaidRef.current] });
        }
    }, [diagram]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            toast({ variant: 'destructive', title: 'Description requise' });
            return;
        }

        setIsGenerating(true);
        setIsDiagramReady(false);
        setDiagram('');

        // The simulation logic
        setTimeout(() => {
            const lowerDesc = description.toLowerCase();
            if (lowerDesc.includes('blog')) {
                setDiagram(blogDiagram);
            } else if (lowerDesc.includes('commerce') || lowerDesc.includes('shop')) {
                setDiagram(ecommerceDiagram);
            } else {
                setDiagram(defaultDiagram);
            }
        }, (simulationLogs.length + 1) * 500);
    };

    return (
        <AppShell>
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3">
                        <Share2 className="text-primary h-10 w-10" /> Générateur de Diagrammes d'Architecture
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Décrivez votre application, et laissez l'IA visualiser son architecture.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Description de l'Application</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleGenerate} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="app-description">Décrivez le concept</Label>
                                    <Textarea
                                        id="app-description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Ex: Une application de e-commerce avec des produits, un panier et des commandes..."
                                        rows={8}
                                        disabled={isGenerating}
                                    />
                                </div>
                                <Button type="submit" disabled={isGenerating} className="w-full">
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Générer le Diagramme
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className={cn("shadow-md sticky top-24 transition-all duration-500", isGenerating && !isDiagramReady && "min-h-[400px]")}>
                        <CardHeader>
                            <CardTitle>Résultat de la Génération</CardTitle>
                            <CardDescription>Visualisation de l'architecture de votre application.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isGenerating && !isDiagramReady && (
                                <SimulatedConsole logs={simulationLogs} onDone={() => setIsDiagramReady(true)} />
                            )}
                            {isDiagramReady && diagram ? (
                                <div ref={mermaidRef} className="mermaid-diagram-container">
                                    {diagram}
                                </div>
                            ) : !isGenerating && (
                                <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground py-16">
                                    <Share2 className="h-16 w-16 mb-4" />
                                    <p>Le diagramme généré apparaîtra ici.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
