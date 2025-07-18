
"use client";

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Users, Globe, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type AgendaType = "personal" | "global" | "team";

const eventsData = {
    personal: [
        { id: "p1", title: "Travailler sur le projet portfolio", time: "14:00", color: "bg-primary/20 text-primary-foreground" },
        { id: "p2", title: "Session de révision React", time: "16:00", color: "bg-primary/20 text-primary-foreground" },
    ],
    global: [
        { id: "g1", title: "Hackathon de fin de semestre", time: "Toute la journée", color: "bg-accent/20 text-accent-foreground" },
    ],
    team: [
        { id: "t1", title: "Réunion de sprint - Projet 'App de Notes'", time: "10:00", color: "bg-secondary" },
    ]
};

const agendaTypes = [
    { value: "personal", label: "Personnel", icon: User },
    { value: "global", label: "Global (École)", icon: Globe },
    { value: "team", label: "Équipe", icon: Users },
];

export default function AgendaPage() {
    const [selectedAgenda, setSelectedAgenda] = useState<AgendaType>("personal");
    const today = new Date();
    const events = eventsData[selectedAgenda];

    return (
        <AppShell>
            <div className="space-y-8">
                 <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-headline tracking-tight">Agenda</h1>
                        <p className="text-muted-foreground mt-2">Organisez votre temps, vos projets et vos événements.</p>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2"/>
                        Nouvel Événement Personnel
                    </Button>
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="shadow-md">
                           <CardContent className="p-0">
                                <Calendar
                                    mode="single"
                                    selected={today}
                                    className="p-0 [&_td]:w-full [&_tr]:w-full"
                                />
                           </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <Select value={selectedAgenda} onValueChange={(value) => setSelectedAgenda(value as AgendaType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un agenda" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agendaTypes.map(agenda => (
                                        <SelectItem key={agenda.value} value={agenda.value}>
                                            <div className="flex items-center gap-2">
                                                <agenda.icon className="h-4 w-4" />
                                                <span>{agenda.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Événements du jour</CardTitle>
                                <CardDescription>{today.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {events.length > 0 ? (
                                    events.map(event => (
                                        <div key={event.id} className={`p-3 rounded-lg flex justify-between items-center ${event.color}`}>
                                            <span className="font-semibold">{event.title}</span>
                                            <Badge variant="outline">{event.time}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">Aucun événement prévu dans cet agenda aujourd'hui.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
