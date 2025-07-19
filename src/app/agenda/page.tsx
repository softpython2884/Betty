
"use client";

import { useState, useEffect, useTransition } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Users, Globe, User, Clock, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { format, getHours, getMinutes, startOfDay } from 'date-fns';
import type { Event } from '@/lib/db/schema';
import { getEvents } from '@/app/actions/agenda';
import { useToast } from '@/hooks/use-toast';
import { EventDialog } from '@/components/agenda/EventDialog';

export const dynamic = 'force-dynamic';

type AgendaType = "personal" | "global" | "team";

const agendaTypeConfig = {
    personal: { label: "Personnel", icon: User, color: "bg-blue-500/20 border-blue-500/50 text-blue-800 dark:text-blue-200" },
    global: { label: "Global (École)", icon: Globe, color: "bg-red-500/20 border-red-500/50 text-red-800 dark:text-red-200" },
    team: { label: "Équipe", icon: Users, color: "bg-green-500/20 border-green-500/50 text-green-800 dark:text-green-200" },
};

const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM (22h)

const formatTime = (time: Date) => format(time, "HH:mm");

export default function AgendaPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const [selectedAgendaTypes, setSelectedAgendaTypes] = useState<Set<AgendaType>>(new Set(['personal', 'global', 'team']));
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const fetchEvents = () => {
        setLoading(true);
        startTransition(async () => {
            try {
                const fetchedEvents = await getEvents();
                setEvents(fetchedEvents);
            } catch (error) {
                toast({ variant: 'destructive', title: "Erreur de chargement", description: "Impossible de charger les événements."});
            } finally {
                setLoading(false);
            }
        });
    }

    useEffect(() => {
        fetchEvents();
    }, []);
    
    const selectedDateStart = date ? startOfDay(date) : startOfDay(new Date());
    
    const filteredEvents = events.filter(event => {
        const eventDate = startOfDay(new Date(event.startTime));
        return eventDate.getTime() === selectedDateStart.getTime() && selectedAgendaTypes.has(event.type as AgendaType);
    });
    
    const handleOpenDialog = (event: Event | null = null) => {
        setSelectedEvent(event);
        setIsEventDialogOpen(true);
    };

    const handleToggleAgendaType = (type: AgendaType) => {
        setSelectedAgendaTypes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    return (
        <AppShell>
            <div className="space-y-8">
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-headline tracking-tight">Agenda</h1>
                        <p className="text-muted-foreground mt-2">Organisez votre temps, vos projets et vos événements.</p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
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
                                    fixedWeeks
                                />
                           </CardContent>
                        </Card>
                         <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle>Filtres d'Agenda</CardTitle>
                                <CardDescription>Sélectionnez les agendas à afficher.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {Object.entries(agendaTypeConfig).map(([type, config]) => (
                                    <Button key={type} variant={selectedAgendaTypes.has(type as AgendaType) ? 'default' : 'outline'} className="w-full justify-start" onClick={() => handleToggleAgendaType(type as AgendaType)}>
                                        <config.icon className="mr-2 h-4 w-4" />
                                        {config.label}
                                    </Button>
                                ))}
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
                                {loading ? (
                                     <div className="flex justify-center items-center h-[600px]"><Loader2 className="h-10 w-10 animate-spin"/></div>
                                ) : (
                                    <div className="relative h-[600px] overflow-y-auto">
                                        <div className="grid grid-cols-[auto_1fr] absolute inset-0">
                                            <div className="flex flex-col border-r">
                                                {hours.map(hour => (
                                                    <div key={hour} className="h-16 flex-shrink-0 text-right pr-2">
                                                        <span className="text-sm text-muted-foreground relative -top-2.5">{hour}:00</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="relative">
                                                {hours.map(hour => (
                                                    <div key={hour} className="h-16 border-t first:border-transparent"></div>
                                                ))}

                                                {filteredEvents.map(event => {
                                                    const config = agendaTypeConfig[event.type as AgendaType];
                                                    const startTime = new Date(event.startTime);
                                                    const endTime = new Date(event.endTime);
                                                    const top = (getHours(startTime) - 8 + getMinutes(startTime) / 60) * 4;
                                                    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                                                    const height = duration * 4;
                                                    
                                                    return (
                                                        <div 
                                                            key={event.id}
                                                            onClick={() => handleOpenDialog(event)}
                                                            className={cn("absolute w-full p-3 rounded-lg flex flex-col justify-center border cursor-pointer", config.color)}
                                                            style={{
                                                                top: `${top}rem`,
                                                                height: `${height}rem`,
                                                                left: '1rem',
                                                                width: 'calc(100% - 2rem)'
                                                            }}
                                                        >
                                                            <p className="font-semibold">{event.title}</p>
                                                            <p className="text-xs opacity-80 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatTime(startTime)} - {formatTime(endTime)}
                                                            </p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                         </Card>
                    </div>
                </div>
            </div>
            <EventDialog
                isOpen={isEventDialogOpen}
                setIsOpen={setIsEventDialogOpen}
                event={selectedEvent}
                selectedDate={date || new Date()}
                onSuccess={fetchEvents}
            />
        </AppShell>
    );
}
