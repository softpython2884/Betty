
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { changePassword } from "@/app/actions/users";
import { KeyRound, Loader2, ShieldCheck, User } from "lucide-react";
import { useEffect } from "react";
import type { User as UserType } from "@/lib/db/schema";

const formSchema = z.object({
    newPassword: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"]
});

export default function ChangePasswordPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);

    useEffect(() => {
        async function fetchUser() {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                router.push('/');
            }
        }
        fetchUser();
    }, [router]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { newPassword: "", confirmPassword: "" }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Utilisateur non trouvé.' });
            return;
        }
        setLoading(true);
        try {
            const result = await changePassword(user.id, values.newPassword);
            if (result.success) {
                toast({
                    title: "Mot de passe changé !",
                    description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
                });
                
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/');
                router.refresh();

            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur', description: error.message });
        } finally {
            setLoading(false);
        }
    }

    if (!user) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </main>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl">Définir un nouveau mot de passe</CardTitle>
                    <CardDescription>Pour des raisons de sécurité, veuillez choisir un nouveau mot de passe pour votre compte.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nouveau mot de passe</FormLabel>
                                         <div className="relative">
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <FormControl>
                                                <Input type="password" placeholder="Choisissez un mot de passe robuste" {...field} className="pl-10"/>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmez le nouveau mot de passe</FormLabel>
                                        <div className="relative">
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <FormControl>
                                                <Input type="password" placeholder="Confirmez votre mot de passe" {...field} className="pl-10"/>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Définir le nouveau mot de passe et se connecter
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    )
}
