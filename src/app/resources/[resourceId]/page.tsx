
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getResourceById } from "@/app/actions/resources";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function ResourceDetailPage({ params }: { params: { resourceId: string }}) {
    const resource = await getResourceById(params.resourceId);

    if (!resource) {
        return notFound();
    }

    const relatedQuest = resource.quests.length > 0 ? resource.quests[0].quest : null;

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
                                Rédigé par {resource.author.name} • Mis à jour {formatDistanceToNow(new Date(resource.updatedAt), { addSuffix: true, locale: fr })}
                            </p>
                        </div>
                    </div>
                </div>
                
                {relatedQuest && (
                    <Card className="bg-secondary/50">
                        <CardContent className="p-4">
                             <p className="text-sm text-secondary-foreground">
                                Cette ressource est particulièrement utile pour la quête : <Link href={`/quests/${relatedQuest.id}`} className="font-semibold text-primary hover:underline">{relatedQuest.title}</Link>
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-md">
                    <CardContent className="p-6">
                        <article className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resource.content}</ReactMarkdown>
                        </article>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
