
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createAnnouncement } from "@/app/actions/announcements";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

const announcementSchema = z.object({
    title: z.string().min(1, "Le titre est requis."),
    message: z.string().min(1, "Le message est requis."),
});

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof announcementSchema>>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: "",
            message: "",
        },
    });

    const onSubmit = (values: z.infer<typeof announcementSchema>) => {
        startTransition(async () => {
            try {
                await createAnnouncement(values);
                toast({
                    title: "Annonce publiée !",
                    description: "La nouvelle annonce est maintenant visible par tous les utilisateurs.",
                });
                form.reset();
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Erreur de publication",
                    description: "L'annonce n'a pas pu être publiée.",
                });
            }
        });
    }

    return (
        <AppShell>
             <div className="space-y-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">Paramètres de la Plateforme</h1>
                    <p className="text-muted-foreground mt-2">Gérez les paramètres globaux de l'école et les annonces.</p>
                </div>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Paramètres Généraux</CardTitle>
                        <CardDescription>Configurez les paramètres généraux de l'académie.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="school-name">Nom de l'École</Label>
                            <Input id="school-name" defaultValue="Betty" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="new-registrations">Autoriser les Nouvelles Inscriptions</Label>
                                <p className="text-sm text-muted-foreground">
                                    Lorsque cette option est désactivée, seuls les utilisateurs invités peuvent s'inscrire.
                                </p>
                            </div>
                            <Switch id="new-registrations" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Annonce Globale</CardTitle>
                        <CardDescription>Publiez une annonce qui sera visible par tous les utilisateurs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="announcement-title">Titre</Label>
                                <Input id="announcement-title" placeholder="Ex: Maintenance à venir" {...form.register("title")} />
                                {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="announcement-message">Message</Label>
                                <Textarea id="announcement-message" placeholder="Saisissez votre annonce ici..." {...form.register("message")} />
                                 {form.formState.errors.message && <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Publier l'Annonce
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
             </div>
        </AppShell>
    )
}
