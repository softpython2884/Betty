import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle } from "lucide-react";

export default function AgendaPage() {
    return (
        <AppShell>
            <div className="space-y-8">
                 <div>
                    <h1 className="text-4xl font-headline tracking-tight">Agenda</h1>
                    <p className="text-muted-foreground mt-2">Organisez votre temps, vos projets et vos événements.</p>
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="shadow-md">
                           <CardContent className="p-0">
                                <Calendar
                                    mode="single"
                                    className="p-0 [&_td]:w-full [&_tr]:w-full"
                                />
                           </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Button className="w-full">
                            <PlusCircle className="mr-2"/>
                            Nouvel Événement
                        </Button>
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Événements du jour</CardTitle>
                                <CardDescription>Mercredi 15 Mai</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Aucun événement prévu aujourd'hui.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
