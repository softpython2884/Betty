
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Loader2, Wand2, Save } from "lucide-react";
import { createCurriculum, createQuest, updateCurriculum } from "@/app/actions/quests";
import { generateQuestline } from "@/ai/flows/generate-questline-flow";
import type { Curriculum, User } from "@/lib/db/schema";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "../ui/switch";

const formSchema = z.object({
    name: z.string().min(3, "Le nom doit comporter au moins 3 caractères."),
    subtitle: z.string().min(3, "Le sous-titre doit comporter au moins 3 caractères."),
    goal: z.string().min(10, "L'objectif doit comporter au moins 10 caractères."),
    useAI: z.boolean().default(false),
});

type CreateCurriculumFormProps = {
    onSuccess: (curriculum: Curriculum) => void;
    onError: (error: string) => void;
    existingCurriculum?: Curriculum;
};

export function CreateCurriculumForm({ onSuccess, onError, existingCurriculum }: CreateCurriculumFormProps) {
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const { toast } = useToast();
    const isEditing = !!existingCurriculum;

    useEffect(() => {
        async function fetchUser() {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data.user);
            }
        }
        fetchUser();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: existingCurriculum?.name || "",
            subtitle: existingCurriculum?.subtitle || "",
            goal: existingCurriculum?.goal || "",
            useAI: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            if (isEditing) {
                const updated = await updateCurriculum(existingCurriculum.id, {
                    name: values.name,
                    subtitle: values.subtitle,
                    goal: values.goal
                });
                onSuccess(updated);
            } else {
                if (!currentUser) {
                    onError("Vous devez être connecté pour créer un cursus.");
                    return;
                }
                const newCurriculum = await createCurriculum({ 
                    name: values.name, 
                    subtitle: values.subtitle, 
                    goal: values.goal, 
                    createdBy: currentUser.id 
                });

                if (values.useAI) {
                    toast({ title: "Génération des quêtes...", description: "L'IA prépare votre parcours. Cela peut prendre un instant." });
                    const questline = await generateQuestline({ curriculumGoal: values.goal });

                    for (const quest of questline.quests) {
                       await createQuest({
                           title: quest.title,
                           description: quest.description,
                           category: quest.category,
                           xp: quest.xp,
                           orbs: 0,
                           status: "draft",
                           positionTop: `${Math.random() * 80 + 10}%`,
                           positionLeft: `${Math.random() * 80 + 10}%`,
                           curriculumId: newCurriculum.id,
                       });
                    }
                }
                onSuccess(newCurriculum);
            }
        } catch (error) {
            onError(error instanceof Error ? error.message : "Une erreur inconnue est survenue.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom du Cursus</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Fondamentaux du Développement Web" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sous-titre</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Niveau 1 - Les Bases" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Objectif d'Apprentissage</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Décrivez l'objectif principal de ce cursus..." {...field} />
                            </FormControl>
                            <FormDescription>
                                {isEditing ? "Le but général de ce parcours." : "Sera utilisé par l'IA si vous activez la génération de quêtes."}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {!isEditing && (
                    <FormField
                        control={form.control}
                        name="useAI"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Générer les quêtes avec l'IA
                                    </FormLabel>
                                    <FormDescription>
                                        Laissez l'assistant IA créer les premières quêtes pour vous.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" disabled={loading || !currentUser} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? <><Save className="mr-2 h-4 w-4" /> Sauvegarder</> : <><Wand2 className="mr-2 h-4 w-4" /> Créer le Cursus</>}
                </Button>
            </form>
        </Form>
    );
}
