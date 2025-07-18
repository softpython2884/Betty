
"use client";

import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Users, Globe, User, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { format, addDays } from 'date-fns';

type AgendaType = "personal" | "global" | "team";

// Helper function to create dates for today and the next few days
const today = new Date();
const tomorrow = addDays(today, 1);
const dayAfterTomorrow = addDays(today, 2);
const inThreeDays = addDays(today, 3);
const inFourDays = addDays(today, 4);

const eventsData = {
    personal: [
        { id: "p1", date: format(today, "yyyy-MM-dd"), title: "Work on portfolio project", start: 14, duration: 2, color: "bg-primary/20 border-primary/50 text-primary" },
        { id: "p2", date: format(today, "yyyy-MM-dd"), title: "React review session", start: 16.5, duration: 1, color: "bg-primary/20 border-primary/50 text-primary" },
        { id: "p3", date: format(tomorrow, "yyyy-MM-dd"), title: "Prepare presentation", start: 11, duration: 2, color: "bg-primary/20 border-primary/50 text-primary" },
        { id: "p4", date: format(inThreeDays, "yyyy-MM-dd"), title: "Study for quiz", start: 18, duration: 1.5, color: "bg-primary/20 border-primary/50 text-primary" },
    ],
    global: [
        { id: "g1", date: format(tomorrow, "yyyy-MM-dd"), title: "End-of-semester Hackathon", start: 9, duration: 8, color: "bg-accent/20 border-accent/50 text-accent-foreground" },
        { id: "g2", date: format(dayAfterTomorrow, "yyyy-MM-dd"), title: "Expert talk: Advanced CSS", start: 14, duration: 1.5, color: "bg-accent/20 border-accent/50 text-accent-foreground" },
        { id: "g3", date: format(inFourDays, "yyyy-MM-dd"), title: "Career Fair", start: 10, duration: 4, color: "bg-accent/20 border-accent/50 text-accent-foreground" },
    ],
    team: [
        { id: "t1", date: format(today, "yyyy-MM-dd"), title: "Sprint meeting - 'Notes App' project", start: 10, duration: 1.5, color: "bg-secondary border-border text-secondary-foreground" },
        { id: "t2", date: format(tomorrow, "yyyy-MM-dd"), title: "Pair-programming session", start: 14, duration: 3, color: "bg-secondary border-border text-secondary-foreground" },
        { id: "t3", date: format(dayAfterTomorrow, "yyyy-MM-dd"), title: "Project brainstorming", start: 16, duration: 1, color: "bg-secondary border-border text-secondary-foreground" },
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
    const m = Math.round((time - h) * 60);
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
                                    <div className="grid grid-cols-[auto_1fr] absolute inset-0">
                                        <div className="flex flex-col text-right pr-4 border-r">
                                            {hours.map(hour => (
                                                <div key={hour} className="h-16 -mt-2.5">
                                                    <span className="text-sm text-muted-foreground">{hour}:00</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="relative">
                                            {hours.map(hour => (
                                                <div key={hour} className="h-16 border-t"></div>
                                            ))}

                                            {events.map(event => (
                                                <div 
                                                    key={event.id}
                                                    className={cn("absolute w-full p-3 rounded-lg flex flex-col justify-center border", event.color)}
                                                    style={{
                                                        top: `${(event.start - 8) * 4}rem`,
                                                        height: `${event.duration * 4}rem`,
                                                        left: '1rem',
                                                        width: 'calc(100% - 2rem)'
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
