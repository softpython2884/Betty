'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2, Send, User, Sparkles, Briefcase, Play, CheckCircle } from "lucide-react";
import { simulateInterview, SimulateInterviewInput } from '@/ai/flows/interview-simulator-flow';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function InterviewSimulatorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [jobDescription, setJobDescription] = useState('Développeur Full-Stack React & Node.js');
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral'>('technical');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);
  const [loading, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo(0, scrollAreaRef.current.scrollHeight);
    }
  }, [messages]);

  const handleStartInterview = () => {
    setIsInterviewStarted(true);
    setMessages([]);
    setIsInterviewFinished(false);
    startTransition(async () => {
        try {
            const result = await simulateInterview({
                jobDescription,
                interviewType,
                history: [],
            });
            setMessages([{ role: 'model', content: result.response }]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de démarrer l'entretien." });
            setIsInterviewStarted(false);
        }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isInterviewStarted || isInterviewFinished) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      try {
        const result = await simulateInterview({
            jobDescription,
            interviewType,
            history: [...messages, userMessage],
        });
        const modelMessage: Message = { role: 'model', content: result.response };
        setMessages((prev) => [...prev, modelMessage]);
        if(result.isFinished) {
            setIsInterviewFinished(true);
        }
      } catch (error) {
        console.error('Error with interview simulator:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur du simulateur',
          description: 'Désolé, je ne parviens pas à répondre pour le moment.',
        });
      }
    });
  };
  
  const resetInterview = () => {
      setIsInterviewStarted(false);
      setMessages([]);
      setIsInterviewFinished(false);
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3"><Briefcase className="text-primary h-10 w-10" /> Simulateur d'Entretien</h1>
          <p className="text-muted-foreground mt-2">Entraînez-vous à passer des entretiens techniques ou comportementaux avec un recruteur IA.</p>
        </div>
        
        {!isInterviewStarted ? (
            <Card className="shadow-md max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Configurer la Simulation</CardTitle>
                    <CardDescription>Préparez votre session d'entraînement en définissant le contexte de l'entretien.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="job-description">Description du Poste</Label>
                        <Textarea id="job-description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={5} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="interview-type">Type d'Entretien</Label>
                        <Select onValueChange={(v) => setInterviewType(v as any)} defaultValue={interviewType}>
                            <SelectTrigger id="interview-type">
                                <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="technical">Technique</SelectItem>
                                <SelectItem value="behavioral">Comportemental</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleStartInterview} className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Play className="mr-2" />}
                        Commencer l'Entretien
                    </Button>
                </CardContent>
            </Card>
        ) : (
             <div className="flex h-[calc(100vh-16rem)] flex-col">
                <Card className="flex-1 flex flex-col shadow-md">
                    <CardHeader>
                        <CardTitle>Simulation en cours...</CardTitle>
                        <CardDescription>Poste : {jobDescription.substring(0, 50)}... | Type : {interviewType}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                        <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
                            <div className="space-y-6" ref={scrollAreaRef}>
                                {messages.map((message, index) => (
                                <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    {message.role === 'model' && (
                                        <Avatar className="border">
                                            <AvatarFallback><Bot /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        "max-w-md rounded-lg p-3", 
                                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    )}>
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <Avatar className="border">
                                            <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                                ))}
                                {loading && messages.length > 0 && (
                                    <div className="flex items-start gap-4">
                                        <Avatar className="border">
                                            <AvatarFallback><Bot /></AvatarFallback>
                                        </Avatar>
                                        <div className="bg-muted rounded-lg p-3">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        {isInterviewFinished ? (
                             <div className="flex flex-col sm:flex-row items-center gap-4 border-t pt-4">
                                 <div className='flex items-center gap-2 text-green-600 font-semibold p-2 rounded-md bg-green-500/10'>
                                     <CheckCircle />
                                     Entretien terminé !
                                 </div>
                                <Button onClick={resetInterview} className="w-full sm:w-auto">Recommencer un nouvel entretien</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t pt-4">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Votre réponse..."
                                    disabled={loading}
                                />
                                <Button type="submit" disabled={loading}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Envoyer
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </AppShell>
  );
}
