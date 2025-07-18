import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
    return (
        <AppShell>
             <div className="space-y-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">Platform Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage school-wide settings and announcements.</p>
                </div>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure general settings for the academy.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="school-name">School Name</Label>
                            <Input id="school-name" defaultValue="Betty" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="new-registrations">Allow New Registrations</Label>
                                <p className="text-sm text-muted-foreground">
                                    When disabled, only invited users can register.
                                </p>
                            </div>
                            <Switch id="new-registrations" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>School-Wide Announcement</CardTitle>
                        <CardDescription>Post an announcement that will be visible to all users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="announcement-title">Title</Label>
                            <Input id="announcement-title" placeholder="E.g., Upcoming Maintenance" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="announcement-message">Message</Label>
                            <Textarea id="announcement-message" placeholder="Type your announcement here..." />
                        </div>
                        <div className="flex justify-end">
                            <Button>Post Announcement</Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
        </AppShell>
    )
}
