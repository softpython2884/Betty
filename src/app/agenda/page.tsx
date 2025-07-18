
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
import { format } from 'date-fns';

type AgendaType = "personal" | "global" | "team";

// Helper function to create dates for today and tomorrow
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

const eventsData = {
    personal: [
        { id: "p1", date: format(today, "yyyy-MM-dd"), title: "Travailler sur le projet portfolio", start: 14, duration: 2, color: "bg-primary/20 text-primary border-primary/50" },
        { id: "p2", date: format(today, "yyyy-MM-dd"), title: "Session de révision React", start: 16.5, duration: 1, color: "bg-primary/20 text-primary border-primary/50" },
        { id: "p3", date: format(tomorrow, "yyyy-MM-dd"), title: "Préparer la présentation", start: 11, duration: 2, color: "bg-primary/20 text-primary border-primary/50" },
    ],
    global: [
        { id: "g1", date: format(today, "yyyy-MM-dd"), title: "Hackathon de fin de semestre", start: 9, duration: 8, color: "bg-accent/20 text-accent-foreground border-accent/50" },
        { id: "g2", date: format(dayAfterTomorrow, "yyyy-MM-dd"), title: "Intervention d'un expert", start: 14, duration: 1.5, color: "bg-accent/20 text-accent-foreground border-accent/50" },
    ],
    team: [
        { id: "t1", date: format(today, "yyyy-MM-dd"), title: "Réunion de sprint - Projet 'App de Notes'", start: 10, duration: 1.5, color: "bg-secondary text-secondary-foreground border-border" },
        { id: "t2", date: format(tomorrow, "yyyy-MM-dd"), title: "Session de pair-programming", start: 14, duration: 3, color: "bg-secondary text-secondary-foreground border-border" },
    ]
};

const agendaTypes = [
    { value: "personal", label: "Personnel", icon: User },
    { value: "global", label: "Global (École)", icon: Globe },
    { value: "team", label: "Équipe", icon: Users },
];

const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const formatTime = (time: number) => {
    const h = Math.floor(time);
    const m = (time - h) * 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export default function AgendaPage() {
    const [selectedAgenda, setSelectedAgenda] = useState<AgendaType>("personal");
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    const selectedDateStr = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    
    // Filter events based on selected agenda and date
    const events = (eventsData[selectedAgenda] || []).filter(event => event.date === selectedDateStr);

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
                                    {date ? format(date, 'EEEE, d MMMM yyyy') : "Aujourd'hui"}
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
