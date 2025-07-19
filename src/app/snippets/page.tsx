
"use client";

import { useEffect, useState, useTransition } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getSnippets, createSnippet, voteSnippet, type SnippetWithAuthorAndVotes } from '../actions/snippets';
import { Loader2, PlusCircle, ThumbsUp, ThumbsDown, Code2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

function CreateSnippetForm({ onSnippetCreated }: { onSnippetCreated: () => void }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            language: formData.get('language') as string,
            code: formData.get('code') as string,
        };

        if (!data.title || !data.language || !data.code) {
            toast({ variant: 'destructive', title: 'Champs requis manquants.' });
            return;
        }

        startTransition(async () => {
            try {
                await createSnippet(data);
                toast({ title: 'Snippet partagé !' });
                onSnippetCreated();
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Erreur', description: error.message });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" placeholder="Ex: Fonction de debounce en JavaScript" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="À quoi sert ce snippet ? Comment l'utiliser ?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="language">Langage</Label>
                    <Input id="language" name="language" placeholder="javascript" required />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Textarea id="code" name="code" rows={10} className="font-mono" required />
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Partager le Snippet
                </Button>
            </DialogFooter>
        </form>
    );
}

function SnippetCard({ snippet, onVote }: { snippet: SnippetWithAuthorAndVotes, onVote: (snippetId: string, vote: 1 | -1) => void }) {
    const [isVoting, startVoting] = useTransition();
    
    const handleVote = (vote: 1 | -1) => {
        startVoting(() => {
            onVote(snippet.id, vote);
        });
    };

    return (
        <Card className="shadow-md flex flex-col">
            <CardHeader>
                <CardTitle>{snippet.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={snippet.author.avatar || `https://i.pravatar.cc/32?u=${snippet.author.name}`} />
                        <AvatarFallback>{snippet.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>Par {snippet.author.name} • {formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true, locale: fr })}</span>
                </div>
                 <CardDescription className="pt-2">{snippet.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow bg-gray-900/90 rounded-md m-6 mt-0 p-0 overflow-hidden">
                <SyntaxHighlighter language={snippet.language.toLowerCase()} style={atomDark} customStyle={{ margin: 0, height: '100%' }}>
                    {snippet.code}
                </SyntaxHighlighter>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <Badge variant="outline">{snippet.language}</Badge>
                <div className="flex items-center gap-2">
                    <Button variant={snippet.userVote === 1 ? 'default' : 'outline'} size="icon" onClick={() => handleVote(1)} disabled={isVoting}>
                        <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <span className="font-bold w-6 text-center">{snippet.score}</span>
                    <Button variant={snippet.userVote === -1 ? 'destructive' : 'outline'} size="icon" onClick={() => handleVote(-1)} disabled={isVoting}>
                        <ThumbsDown className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

export default function SnippetsPage() {
    const [snippets, setSnippets] = useState<SnippetWithAuthorAndVotes[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { toast } = useToast();

    const fetchSnippets = async () => {
        setLoading(true);
        try {
            const data = await getSnippets();
            setSnippets(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les snippets.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSnippets();
    }, []);

    const handleVote = async (snippetId: string, vote: 1 | -1) => {
        try {
            const { newScore, newUserVote } = await voteSnippet(snippetId, vote);
            setSnippets(prev => prev.map(s => 
                s.id === snippetId ? { ...s, score: newScore, userVote: newUserVote } : s
            ));
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur', description: error.message });
        }
    };
    
    const handleSnippetCreated = () => {
        setIsCreateOpen(false);
        fetchSnippets();
    }

    return (
        <AppShell>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3"><Code2 className="text-primary h-10 w-10"/> Bibliothèque de Snippets</h1>
                        <p className="text-muted-foreground mt-2">Partagez vos morceaux de code utiles et découvrez ceux de la communauté.</p>
                    </div>
                     <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg"><PlusCircle className="mr-2" />Partager un Snippet</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Nouveau Snippet</DialogTitle>
                                <DialogDescription>Partagez un morceau de code utile avec la communauté.</DialogDescription>
                            </DialogHeader>
                            <CreateSnippetForm onSnippetCreated={handleSnippetCreated} />
                        </DialogContent>
                    </Dialog>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                        {snippets.length === 0 ? (
                            <p className="text-center text-muted-foreground col-span-full py-16">
                                La bibliothèque est vide. Soyez le premier à partager un snippet !
                            </p>
                        ) : (
                            snippets.map(snippet => <SnippetCard key={snippet.id} snippet={snippet} onVote={handleVote} />)
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
