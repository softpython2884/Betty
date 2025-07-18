
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
// This is a simple markdown parser, in a real app you'd use a more robust library like react-markdown.
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

// Mock data, replace with actual fetching
const resourceData = {
    id: 'res_2',
    title: 'Comprendre `this` en JS',
    author: 'Diana Prof',
    updatedAt: 'Il y a 3 heures',
    relatedQuest: { id: 'quest-js-intro', title: 'JavaScript Intro' },
    content: `
# Comprendre \`this\` en JavaScript

Le mot-clé \`this\` est l'un des concepts les plus fondamentaux mais aussi les plus déroutants en JavaScript. Sa valeur est déterminée par la manière dont une fonction est appelée (son "contexte d'appel").

## Les 4 règles principales

Il y a quatre règles principales pour déterminer la valeur de \`this\`:

1.  **Appel Global :** Lorsqu'une fonction est appelée dans la portée globale (pas à l'intérieur d'un autre objet), \`this\` fait référence à l'objet global (\`window\` dans les navigateurs).

    \`\`\`javascript
    function showThis() {
      console.log(this);
    }

    showThis(); // Affiche l'objet 'window'
    \`\`\`

2.  **Appel de Méthode :** Lorsqu'une fonction est appelée comme une méthode d'un objet, \`this\` fait référence à l'objet lui-même.

    \`\`\`javascript
    const user = {
      name: 'Alex',
      greet: function() {
        console.log('Bonjour, je suis ' + this.name);
      }
    };

    user.greet(); // Affiche "Bonjour, je suis Alex"
    \`\`\`

3.  **Appel de Constructeur :** Lorsqu'une fonction est utilisée comme constructeur avec le mot-clé \`new\`, \`this\` fait référence à la nouvelle instance de l'objet qui est en train d'être créée.

    \`\`\`javascript
    function Adventurer(name) {
      this.name = name;
      this.level = 1;
    }

    const player1 = new Adventurer('Bob');
    console.log(player1.name); // Affiche "Bob"
    \`\`\`

4.  **Appel Explicite avec \`.call()\` ou \`.apply()\` :** Vous pouvez explicitement définir la valeur de \`this\` en utilisant ces méthodes.

    \`\`\`javascript
    function showPet(petType) {
      console.log(\`Mon nom est \${this.name} et j'ai un \${petType}\`);
    }

    const owner = { name: 'Charlie' };

    showPet.call(owner, 'chien'); // Affiche "Mon nom est Charlie et j'ai un chien"
    \`\`\`

## La fonction fléchée

Les fonctions fléchées (\`=>\`) ont un comportement différent. Elles n'ont pas leur propre contexte \`this\`. À la place, elles héritent de la valeur de \`this\` de leur portée parente.

---
Comprendre ces règles est essentiel pour écrire un code JavaScript robuste et prévisible.
`
};

export default function ResourceDetailPage({ params }: { params: { resourceId: string }}) {
    // In a real app, you would fetch the resource based on params.resourceId
    const resource = resourceData;

    return (
        <AppShell>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                     <Button variant="outline" asChild className="mb-6">
                        <Link href="/resources">
                            <ArrowLeft className="mr-2"/>
                            Retour à toutes les ressources
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-muted rounded-full">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-headline tracking-tight">{resource.title}</h1>
                            <p className="text-muted-foreground mt-1">
                                Rédigé par {resource.author} • Mis à jour {resource.updatedAt}
                            </p>
                        </div>
                    </div>
                </div>
                
                {resource.relatedQuest && (
                    <Card className="bg-secondary/50">
                        <CardContent className="p-4">
                             <p className="text-sm text-secondary-foreground">
                                Cette ressource est particulièrement utile pour la quête : <Link href={`/quests/${resource.relatedQuest.id}`} className="font-semibold text-primary hover:underline">{resource.relatedQuest.title}</Link>
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-md">
                    <CardContent className="p-6">
                        <article className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{resource.content}</ReactMarkdown>
                        </article>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}

