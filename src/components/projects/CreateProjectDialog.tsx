
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createPersonalProject } from "@/app/actions/quests";

const projectSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit faire au moins 3 caractères." }),
  description: z.string().optional(),
});

export function CreateProjectDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    setLoading(true);
    try {
      const newProject = await createPersonalProject(values.title, values.description || "");
      toast({
        title: "Projet créé !",
        description: `"${newProject.title}" a été créé avec succès.`,
      });
      setIsOpen(false);
      form.reset();
      router.push(`/projects/${newProject.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de création",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Nouveau Projet Personnel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
          <DialogDescription>
            Donnez un nom et une description à votre projet pour commencer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title">Titre du projet</Label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description (Optionnel)</Label>
                <Textarea id="description" {...form.register("description")} />
            </div>
             <DialogFooter>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer le projet
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

