'use client';

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2, Send, User, Sparkles } from "lucide-react";
import { chatWithCodex, ChatWithCodexInput } from '@/ai/flows/codex-chat';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function CodexPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const codexInput: ChatWithCodexInput = {
        query: input,
        context: 'Codex full page chat interface.',
        history: [...messages, userMessage],
      };
      const result = await chatWithCodex(codexInput);
      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error with Codex chat:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur du Codex',
        description: 'Désolé, je ne parviens pas à répondre pour le moment.',
      });
      // Do not remove the user message if AI fails, so they can retry.
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-10rem)] flex-col">
        <div className="mb-4">
            <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3"><Sparkles className="text-primary h-10 w-10" /> Codex</h1>
            <p className="text-muted-foreground mt-2">Votre mentor IA personnel. Posez des questions, demandez des éclaircissements et progressez.</p>
        </div>
        <Card className="flex-1 flex flex-col shadow-md">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>Votre historique de discussion avec Codex.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
              <div className="space-y-6">
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
                        <p className="text-sm">{message.content}</p>
                     </div>
                     {message.role === 'user' && (
                        <Avatar className="border">
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                     )}
                  </div>
                ))}
                {loading && (
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
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t pt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez une question à Codex..."
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
