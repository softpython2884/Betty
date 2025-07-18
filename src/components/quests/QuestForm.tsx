
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
import { Loader2 } from "lucide-react";
import { createQuest } from "@/app/actions/quests";
import type { Quest } from "@/lib/db/schema";

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long."),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required."),
    xp: z.coerce.number().min(1, "XP must be a positive number."),
});

type QuestFormProps = {
    curriculum: string;
    onSuccess: (quest: Quest) => void;
    onError: (error: string) => void;
    quest?: Quest; // Optional for editing
};

export function QuestForm({ curriculum, onSuccess, onError, quest }: QuestFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: quest?.title || "",
            description: quest?.description || "",
            category: quest?.category || "Core",
            xp: quest?.xp || 100,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const newQuest = await createQuest({
                ...values,
                curriculum,
                // Default position, will be updated by drag-and-drop
                positionTop: "50%",
                positionLeft: "50%",
                status: "draft",
            });
            onSuccess(newQuest);
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
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Introduction to HTML" {...field} />
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
                                <Textarea placeholder="Describe the quest's objective..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
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
                    name="xp"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>XP Reward</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="100" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {quest ? "Update Quest" : "Create Quest"}
                </Button>
            </form>
        </Form>
    );
}
