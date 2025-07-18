
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { createCurriculum, createQuest } from "@/app/actions/quests";
import { generateQuestline } from "@/ai/flows/generate-questline-flow";
import type { Curriculum } from "@/lib/db/schema";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "../ui/switch";

const formSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long."),
    subtitle: z.string().min(3, "Subtitle must be at least 3 characters long."),
    goal: z.string().min(10, "Goal must be at least 10 characters long."),
    useAI: z.boolean().default(false),
});

type CreateCurriculumFormProps = {
    onSuccess: (curriculum: Curriculum) => void;
    onError: (error: string) => void;
};

export function CreateCurriculumForm({ onSuccess, onError }: CreateCurriculumFormProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            subtitle: "",
            goal: "",
            useAI: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            // In a real app, we'd get the logged-in user's ID
            const createdBy = "087edd83-cb16-4493-8706-c158aa063eee"; // Placeholder admin ID
            
            const newCurriculum = await createCurriculum({ name: values.name, subtitle: values.subtitle, goal: values.goal }, createdBy);

            if (values.useAI) {
                toast({ title: "Generating quests...", description: "The AI is crafting your questline. This may take a moment." });
                const questline = await generateQuestline({ curriculumGoal: values.goal });

                // Create all quests from the AI response
                for (const quest of questline.quests) {
                   await createQuest({
                       title: quest.title,
                       description: quest.description,
                       category: quest.category,
                       xp: quest.xp,
                       orbs: 0,
                       status: "draft",
                       positionTop: `${Math.random() * 80 + 10}%`, // Random position for now
                       positionLeft: `${Math.random() * 80 + 10}%`,
                       curriculumId: newCurriculum.id,
                   });
                }
            }

            onSuccess(newCurriculum);

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
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Curriculum Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Web Development Fundamentals" {...field} />
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
                            <FormLabel>Subtitle</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Level 1 - The Basics" {...field} />
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
                            <FormLabel>Learning Goal</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe the main objective of this curriculum..." {...field} />
                            </FormControl>
                            <FormDescription>
                                This will be used by the AI to generate quests if enabled.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="useAI"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Generate Quests with AI
                                </FormLabel>
                                <FormDescription>
                                    Let our AI assistant create the initial set of quests for you.
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

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Create Curriculum
                </Button>
            </form>
        </Form>
    );
}
