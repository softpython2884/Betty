
"use client";

import { useEffect, useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllUsers, type UserWithRole } from "@/app/actions/users";
import { getCurriculumAssignments, updateCurriculumAssignment } from "@/app/actions/curriculums";
import type { CurriculumAssignment } from "@/lib/db/schema";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

type CurriculumAssignmentManagerProps = {
    curriculumId: string;
};

export function CurriculumAssignmentManager({ curriculumId }: CurriculumAssignmentManagerProps) {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [assignments, setAssignments] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [usersData, assignmentsData] = await Promise.all([
                    getAllUsers(),
                    getCurriculumAssignments(curriculumId),
                ]);
                setUsers(usersData);
                setAssignments(new Set(assignmentsData.map(a => a.userId)));
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Erreur de chargement",
                    description: "Impossible de récupérer les utilisateurs et les assignations.",
                });
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [curriculumId, toast]);

    const handleAssignmentChange = (userId: string, isAssigned: boolean) => {
        startTransition(async () => {
            const result = await updateCurriculumAssignment(curriculumId, userId, isAssigned);
            if (result.success) {
                setAssignments(prev => {
                    const newSet = new Set(prev);
                    if (isAssigned) {
                        newSet.add(userId);
                    } else {
                        newSet.delete(userId);
                    }
                    return newSet;
                });
                toast({
                    title: "Assignation mise à jour",
                    description: `L'utilisateur a été ${isAssigned ? 'ajouté' : 'retiré'} du cursus.`,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: result.message,
                });
            }
        });
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="py-4 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Rechercher par nom ou email..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                           <div key={i} className="flex items-center space-x-4 p-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))
                    ) : (
                        filteredUsers.map(user => (
                            <div key={user.id} className="flex items-center space-x-4 p-2 rounded-md hover:bg-muted/50">
                                <Avatar>
                                    <AvatarImage src={`https://i.pravatar.cc/40?u=${user.id}`} alt={user.name} data-ai-hint="user avatar"/>
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Label htmlFor={`assign-${user.id}`} className="font-semibold">{user.name}</Label>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <Checkbox
                                    id={`assign-${user.id}`}
                                    checked={assignments.has(user.id)}
                                    onCheckedChange={(checked) => handleAssignmentChange(user.id, !!checked)}
                                    disabled={isPending}
                                />
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

