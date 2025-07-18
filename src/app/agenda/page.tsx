
"use client";

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Users, Globe, User, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type AgendaType = "personal" | "global" | "team";

const eventsData = {
    personal: [
        { id: "p1", title: "Travailler sur le projet portfolio", start: 14, duration: 2, color: "bg-primary/20 text-primary border-primary/50" },
        { id: "p2", title: "Session de révision React", start: 16.5, duration: 1, color: "bg-primary/20 text-primary border-primary/50" },
    ],
    global: [
        { id: "g1", title: "Hackathon de fin de semestre", start: 9, duration: 8, color: "bg-accent/20 text-accent-foreground border-accent/50" },
    ],
    team: [
        { id: "t1", title: "Réunion de sprint - Projet 'App de Notes'", start: 10, duration: 1.5, color: "bg-secondary text-secondary-foreground border-border" },
    ]
};

const agendaTypes = [
    { value: "personal", label: "Personnel", icon: User },
    { value: "global", label: "Global (École)", icon: Globe },
    { value: "team", label: "Équipe", icon: Users },
];

const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
};

export default function AgendaPage() {
    const [selectedAgenda, setSelectedAgenda] = useState<AgendaType>("personal");
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    // Note: In a real app, you'd filter events based on the selected `date`
    const events = eventsData[selectedAgenda] || [];

    return (
        <AppShell>
            <div className="space-y-8">
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-headline tracking-tight">Agenda</h1>
                        <p className="text-muted-foreground mt-2">Organisez votre temps, vos projets et vos événements.</p>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2"/>
                        Nouvel Événement
                    </Button>
                </div>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-md">
                           <CardContent className="p-2">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="p-0"
                                />
                           </CardContent>
                        </Card>
                         <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Mes Agendas</CardTitle>
                                <CardDescription>Sélectionnez un agenda à afficher.</CardDescription>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                         <Card className="shadow-md">
                             <CardHeader>
                                <CardTitle>
                                    {date ? date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : "Aujourd'hui"}
                                </CardTitle>
                                <CardDescription>Vue d'ensemble de votre journée.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative h-[600px] overflow-y-auto">
                                    {/* Hourly grid */}
                                    <div className="grid grid-cols-[auto,1fr] gap-x-4">
                                        {hours.map(hour => (
                                            <div key={hour} className="col-start-1 col-end-3 grid grid-cols-[auto,1fr] items-start">
                                                <div className="text-right pr-4 text-sm text-muted-foreground -mt-2">
                                                    {hour}:00
                                                </div>
                                                <Separator className="mt-0.5" />
                                                 <div className="col-start-2 h-16"/>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Events */}
                                    <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-[auto,1fr] gap-x-4">
                                        <div className="w-16"/>
                                        <div className="relative">
                                            {events.map(event => (
                                                <div 
                                                    key={event.id}
                                                    className={cn("absolute w-full p-3 rounded-lg flex flex-col justify-center border", event.color)}
                                                    style={{
                                                        top: `${(event.start - 8) * 4}rem`, // 4rem = 1 hour (64px)
                                                        height: `${event.duration * 4}rem`
                                                    }}
                                                >
                                                    <p className="font-semibold">{event.title}</p>
                                                    <p className="text-xs opacity-80 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(event.start)} - {formatTime(event.start + event.duration)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                         </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
