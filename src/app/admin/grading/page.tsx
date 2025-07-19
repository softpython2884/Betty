
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2 } from "lucide-react";
import { getPendingSubmissions, type PendingSubmission } from "@/app/actions/projects";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default function GradingQueuePage() {
    const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
    const [loading, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const data = await getPendingSubmissions();
            setSubmissions(data);
        });
    }, []);

    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">File d'attente d'évaluation</h1>
                    <p className="text-muted-foreground mt-2">Examinez et notez les soumissions des étudiants.</p>
                </div>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Soumissions en Attente</CardTitle>
                        <CardDescription>Les projets qui attendent votre expertise.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </div>
                        ) : submissions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-16">
                                La file d'attente est vide. Beau travail !
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Étudiant</TableHead>
                                        <TableHead>Projet</TableHead>
                                        <TableHead>Date de Soumission</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/profile/${sub.user.id}`} className="hover:underline">{sub.user.name}</Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/projects/${sub.project.id}`} className="hover:underline">{sub.project.title}</Link>
                                            </TableCell>
                                            <TableCell>{formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true, locale: fr })}</TableCell>
                                            <TableCell>
                                                <Badge variant={sub.status === 'graded' ? "secondary" : "default"}>{sub.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/grading/${sub.id}`}>
                                                        Évaluer
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
