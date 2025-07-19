
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createEvent, updateEvent, deleteEvent } from "@/app/actions/agenda";
import type { Event, User } from "@/lib/db/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format, setHours, setMinutes } from "date-fns";

const eventSchema = z.object({
  title: z.string().min(3, "Le titre est requis."),
  description: z.string().optional(),
  type: z.enum(["personal", "team", "global"]),
  startTime: z.string(), // Format "HH:mm"
  endTime: z.string(),   // Format "HH:mm"
}).refine(data => data.endTime > data.startTime, {
    message: "L'heure de fin doit être après l'heure de début.",
    path: ["endTime"],
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  event: Event | null;
  selectedDate: Date;
  onSuccess: () => void;
}

export function EventDialog({ isOpen, setIsOpen, event, selectedDate, onSuccess }: EventDialogProps) {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const isEditing = !!event;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    async function fetchUser() {
        const res = await fetch('/api/auth/me');
        if(res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
        }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description || "",
        type: event.type as "personal" | "team" | "global",
        startTime: format(new Date(event.startTime), "HH:mm"),
        endTime: format(new Date(event.endTime), "HH:mm"),
      });
    } else {
      form.reset({
        title: "",
        description: "",
        type: "personal",
        startTime: "09:00",
        endTime: "10:00",
      });
    }
  }, [event, form]);

  const onSubmit = async (values: EventFormValues) => {
    if (!currentUser) return;
    setLoading(true);

    const [startHour, startMinute] = values.startTime.split(':').map(Number);
    const [endHour, endMinute] = values.endTime.split(':').map(Number);

    const startTime = setMinutes(setHours(selectedDate, startHour), startMinute);
    const endTime = setMinutes(setHours(selectedDate, endHour), endMinute);

    try {
      if (isEditing) {
        await updateEvent(event.id, { 
            ...values,
            startTime,
            endTime
        });
        toast({ title: "Événement mis à jour !" });
      } else {
        await createEvent({
            ...values,
            startTime,
            endTime,
            userId: values.type === 'personal' ? currentUser.id : null,
            projectId: null, // TODO: Implement project selection for team events
        });
        toast({ title: "Événement créé !" });
      }
      onSuccess();
      setIsOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setLoading(true);
    try {
        await deleteEvent(event.id);
        toast({ title: "Événement supprimé."});
        onSuccess();
        setIsOpen(false);
    } catch (error: any) {
         toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
        setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'événement" : "Créer un événement"}</DialogTitle>
          <DialogDescription>
            Organisez votre journée en ajoutant un événement à votre agenda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="description">Description (Optionnel)</Label>
                <Textarea id="description" {...form.register("description")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Heure de début</Label>
                    <Input type="time" {...form.register('startTime')} />
                    {form.formState.errors.startTime && <p className="text-sm text-destructive">{form.formState.errors.startTime.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Heure de fin</Label>
                    <Input type="time" {...form.register('endTime')} />
                    {form.formState.errors.endTime && <p className="text-sm text-destructive">{form.formState.errors.endTime.message}</p>}
                </div>
            </div>

             <div className="space-y-2">
                <Label>Type d'événement</Label>
                 <Controller
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditing && currentUser?.role !== 'admin'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="personal">Personnel</SelectItem>
                                 {(currentUser?.role === 'professor' || currentUser?.role === 'admin') && <SelectItem value="team">Équipe</SelectItem>}
                                 {currentUser?.role === 'admin' && <SelectItem value="global">Global (École)</SelectItem>}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <DialogFooter className="sm:justify-between pt-4">
                {isEditing ? (
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                        Supprimer
                    </Button>
                ) : <div></div>}
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Sauvegarder" : "Créer"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
