import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Search } from "lucide-react";

const users = [
    { id: 'usr_1', name: 'Alice', email: 'alice@school.com', role: 'Student', status: 'Active' },
    { id: 'usr_2', name: 'Bob', email: 'bob@school.com', role: 'Student', status: 'Active' },
    { id: 'usr_3', name: 'Charlie', email: 'charlie@school.com', role: 'Student', status: 'Invited' },
    { id: 'usr_4', name: 'Diana', email: 'diana.prof@school.com', role: 'Professor', status: 'Active' },
];

export default function AdminUsersPage() {
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
                            <Button>
                                <PlusCircle className="mr-2" />
                                Invite User
                            </Button>
                        </div>
                        <div className="relative pt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Search by name or email..." className="pl-10" />
                        </div>
                    </CardHeader>
                    <CardContent>
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
                                            <Badge variant={user.role === 'Professor' ? "secondary" : "outline"}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === 'Active' ? "default" : "destructive"} className={user.status === 'Active' ? 'bg-green-500' : ''}>{user.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500">Deactivate</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    )
}
