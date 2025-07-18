
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { createQuest, updateQuest } from "@/app/actions/quests";
import type { Quest } from "@/lib/db/schema";

const formSchema = z.object({
    title: z.string().min(3, "Le titre doit comporter au moins 3 caractères."),
    description: z.string().optional(),
    category: z.string().min(1, "La catégorie est requise."),
    xp: z.coerce.number().min(1, "L'XP doit être un nombre positif."),
    orbs: z.coerce.number().min(0).optional(),
    status: z.enum(['draft', 'published']).default('draft'),
});

type QuestFormProps = {
    curriculumId: string;
    onSuccess: (quest: Quest) => void;
    onError: (error: string) => void;
    quest?: Quest; // Optional for editing
};

export function QuestForm({ curriculumId, onSuccess, onError, quest }: QuestFormProps) {
    const [loading, setLoading] = useState(false);
    const isEditing = !!quest;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: quest?.title || "",
            description: quest?.description || "",
            category: quest?.category || "Core",
            xp: quest?.xp || 100,
            orbs: quest?.orbs || 0,
            status: quest?.status as 'draft' | 'published' || 'draft',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            if (isEditing) {
                const updatedQuest = await updateQuest(quest.id, values);
                onSuccess(updatedQuest);
            } else {
                const newQuest = await createQuest({
                    ...values,
                    curriculumId: curriculumId,
                    positionTop: "50%",
                    positionLeft: "50%",
                });
                onSuccess(newQuest);
            }
        } catch (error) {
            onError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Titre</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Introduction à HTML" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Décrivez l'objectif de la quête..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Catégorie</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Core">Core</SelectItem>
                                        <SelectItem value="Frontend">Frontend</SelectItem>
                                        <SelectItem value="Backend">Backend</SelectItem>
                                        <SelectItem value="Tools">Tools</SelectItem>
                                        <SelectItem value="Library">Library</SelectItem>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Statut</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="draft">Brouillon</SelectItem>
                                        <SelectItem value="published">Publiée</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="xp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Récompense XP</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="100" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="orbs"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Orbes (Optionnel)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isEditing ? "Sauvegarder les modifications" : "Créer la quête"}
                </Button>
            </form>
        </Form>
    );
}
