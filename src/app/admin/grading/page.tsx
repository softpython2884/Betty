import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const submissions = [
    { id: 'sub_1', studentName: 'Alice', questTitle: 'JavaScript Intro', submittedAt: 'Il y a 2 heures', status: 'En attente' },
    { id: 'sub_2', studentName: 'Bob', questTitle: 'CSS Fundamentals', submittedAt: 'Il y a 1 jour', status: 'En attente' },
    { id: 'sub_3', studentName: 'Charlie', questTitle: 'HTML Basics', submittedAt: 'Il y a 3 jours', status: 'Évalué' },
];

export default function GradingQueuePage() {
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Étudiant</TableHead>
                                    <TableHead>Quête</TableHead>
                                    <TableHead>Date de Soumission</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((sub) => (
                                    <TableRow key={sub.id} className={sub.status === 'Évalué' ? 'bg-muted/50' : ''}>
                                        <TableCell className="font-medium">{sub.studentName}</TableCell>
                                        <TableCell>{sub.questTitle}</TableCell>
                                        <TableCell>{sub.submittedAt}</TableCell>
                                        <TableCell>
                                            <Badge variant={sub.status === 'Évalué' ? "secondary" : "default"}>{sub.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" disabled={sub.status === 'Évalué'}>
                                                Évaluer
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    )
}
