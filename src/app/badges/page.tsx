// This is a new file
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvailableBadges, getUserBadges } from "../actions/badges";
import { getCurrentUser } from "@/lib/session";
import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const dynamic = 'force-dynamic';

export default async function BadgesPage() {
    const user = await getCurrentUser();
    if (!user) {
        return <AppShell><div>Loading...</div></AppShell>;
    }
    
    const [allBadges, myBadgesData] = await Promise.all([
        getAvailableBadges(),
        getUserBadges()
    ]);

    const myBadgeIds = new Set(myBadgesData.map(b => b.badgeId));
    
    const renderBadgeList = (type: string, title: string) => {
        const filteredBadges = allBadges.filter(b => b.type === type);
        return (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredBadges.map(badge => {
                        const isOwned = myBadgeIds.has(badge.id);
                        return (
                            <TooltipProvider key={badge.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={cn(
                                            "flex flex-col items-center justify-center p-4 gap-2 rounded-lg border aspect-square transition-all text-center", 
                                            isOwned ? 'bg-muted/50' : 'bg-muted/20 opacity-60'
                                        )}>
                                            {isOwned ? <Award className="h-10 w-10 text-primary" /> : <Lock className="h-10 w-10 text-muted-foreground" />}
                                            <p className="text-sm font-semibold">{badge.name}</p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-semibold">{badge.name}</p>
                                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                                        {!isOwned && <p className="text-xs text-destructive">(Verrouillé)</p>}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </CardContent>
            </Card>
        )
    };

    return (
        <AppShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-headline tracking-tight">Badges & Compétences</h1>
                    <p className="text-muted-foreground mt-2">Visualisez tous les badges que vous avez débloqués et ceux qu'il vous reste à conquérir.</p>
                </div>
                
                {renderBadgeList('skill', 'Compétences Techniques')}
                {renderBadgeList('milestone', 'Jalons de Progression')}
                {renderBadgeList('achievement', 'Hauts Faits & Succès Cachés')}
                
            </div>
        </AppShell>
    );
}
