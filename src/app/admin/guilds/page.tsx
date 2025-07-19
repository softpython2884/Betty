
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGuild } from '@/app/actions/guilds';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Swords } from "lucide-react";
import * as Icons from "lucide-react";

export const dynamic = 'force-dynamic';

const guildSchema = z.object({
  name: z.string().min(3, "Le nom doit faire au moins 3 caractères."),
  description: z.string().min(10, "La description doit faire au moins 10 caractères."),
  crest: z.string().min(1, "Veuillez choisir un écusson."),
});

const availableIcons = [
    'Swords', 'Shield', 'Crown', 'Castle', 'Dragon', 'Anchor', 'Feather', 'FlaskConical', 'Heart', 'Sun', 'Moon', 'Star', 'Skull', 'Ghost'
] as (keyof typeof Icons)[];

export default function AdminGuildsPage() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof guildSchema>>({
        resolver: zodResolver(guildSchema),
        defaultValues: { name: "", description: "", crest: "" },
    });
    
    const selectedCrest = form.watch('crest');

    const onSubmit = async (values: z.infer<typeof guildSchema>) => {
        setLoading(true);
        try {
            await createGuild(values);
            toast({ title: "Guilde créée !", description: `La guilde "${values.name}" est prête à accueillir des membres.` });
            form.reset();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erreur de création", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell>
            <div className="space-y-8 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">Gestion des Guildes</h1>
                    <p className="text-muted-foreground mt-2">Créez et gérez les guildes de l'académie.</p>
                </div>
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Créer une nouvelle Guilde</CardTitle>
                        <CardDescription>Définissez une nouvelle faction pour les étudiants.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom de la Guilde</Label>
                                <Input id="name" {...form.register("name")} />
                                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" {...form.register("description")} />
                                {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Écusson de la Guilde</Label>
                                <div className="grid grid-cols-5 gap-2 p-4 border rounded-md">
                                    {availableIcons.map(iconName => {
                                        const Icon = Icons[iconName] as React.ElementType;
                                        if (!Icon) return null;
                                        return (
                                            <Button 
                                                key={iconName}
                                                type="button" 
                                                variant={selectedCrest === iconName ? 'default' : 'outline'}
                                                size="icon" 
                                                onClick={() => form.setValue('crest', iconName)}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </Button>
                                        );
                                    })}
                                </div>
                                {form.formState.errors.crest && <p className="text-sm text-destructive">{form.formState.errors.crest.message}</p>}
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2" />}
                                Créer la Guilde
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
