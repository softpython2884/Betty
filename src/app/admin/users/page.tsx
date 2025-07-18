
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Search, Loader2, Edit, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InviteUserForm, type InviteUserResult } from "@/components/admin/InviteUserForm";
import { EditUserForm } from "@/components/admin/EditUserForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllUsers, resetUserPassword, type UserWithRole } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteOpen, setInviteOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
    const [isResultAlertOpen, setResultAlertOpen] = useState(false);
    const [inviteResult, setInviteResult] = useState<InviteUserResult | null>(null);
    const { toast } = useToast();

    async function fetchUsers() {
        setLoading(true);
        try {
            const userList = await getAllUsers();
            setUsers(userList);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error loading users",
                description: "Could not fetch the user list.",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [toast]);

    const handleInviteSuccess = (result: InviteUserResult) => {
        setInviteOpen(false);
        setInviteResult(result);
        setResultAlertOpen(true);
        fetchUsers(); 
    };

    const handleEditSuccess = () => {
        setEditOpen(false);
        setSelectedUser(null);
        toast({ title: "User Updated", description: "The user's information has been saved." });
        fetchUsers();
    }
    
    const handleResetPassword = async (userId: string) => {
        const result = await resetUserPassword(userId);
        if (result.success && result.result) {
            setInviteResult(result.result);
            setResultAlertOpen(true);
        } else {
            toast({ variant: "destructive", title: "Password Reset Failed", description: result.message });
        }
    };

    const handleResultAlertClose = () => {
        setResultAlertOpen(false);
        setInviteResult(null);
    };

    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">User Management</h1>
                    <p className="text-muted-foreground mt-2">Invite, manage, and oversee all users in the academy.</p>
                </div>

                <Card className="shadow-md">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>All Users</CardTitle>
                                <CardDescription>A list of all students and professors.</CardDescription>
                            </div>
                            <Dialog open={isInviteOpen} onOpenChange={setInviteOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2" />
                                        Invite User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Invite a New User</DialogTitle>
                                        <DialogDescription>
                                            An account will be created and a temporary password generated.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <InviteUserForm 
                                        onSuccess={handleInviteSuccess} 
                                        onError={(error) => toast({ variant: "destructive", title: "Invitation Failed", description: error })}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="relative pt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Search by name or email..." className="pl-10" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' || user.role === 'professor' ? "secondary" : "outline"}>{user.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.status === 'active' ? "default" : "destructive"} className={user.status === 'active' ? 'bg-green-500' : ''}>{user.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onSelect={() => { setSelectedUser(user); setEditOpen(true); }}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleResetPassword(user.id)}>
                                                            <KeyRound className="mr-2 h-4 w-4" />
                                                            Regenerate Password
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-500">Deactivate</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
                 <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Modify the details for {selectedUser?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <EditUserForm
                            user={selectedUser}
                            onSuccess={handleEditSuccess}
                            onError={(error) => toast({ variant: "destructive", title: "Update Failed", description: error })}
                        />
                    )}
                </DialogContent>
            </Dialog>

             <AlertDialog open={isResultAlertOpen} onOpenChange={setResultAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Credentials Ready!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide these credentials to the user. They will be required to change their password upon first login.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 bg-muted p-4 rounded-md">
                        <p><strong>Email:</strong> {inviteResult?.email}</p>
                        <p><strong>Temporary Password:</strong> <span className="font-mono bg-background p-1 rounded">{inviteResult?.password}</span></p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleResultAlertClose}>Got it</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppShell>
    )
}
