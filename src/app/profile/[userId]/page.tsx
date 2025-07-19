
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/profile/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Book, Gem, GitBranch, Link as LinkIcon, ShieldCheck, Star, Swords, Trophy, Construction, User as UserIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { db } from "@/lib/db";
import { users, questCompletions as qcSchema, userCosmetics } from "@/lib/db/schema";
import { eq, sql } from 'drizzle-orm';
import { notFound } from "next/navigation";
import GradientText from "@/components/ui/gradient-text";

// This is a simplified version of the main profile page, intended for public viewing.
// It fetches data directly based on the URL parameter.

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ params }: { params: { userId: string }}) {
  const student = await db.query.users.findFirst({
      where: eq(users.id, params.userId),
  });

  if (!student) {
      return notFound();
  }
  
  const [
    userBadgesData,
    questCompletionsCountResult,
  ] = await Promise.all([
     db.query.userBadges.findMany({
        where: eq(userBadges.userId, student.id),
        with: { badge: true }
     }),
     db.select({ count: sql<number>`count(*)` }).from(qcSchema).where(eq(qcSchema.userId, student.id)),
  ]);
  
  const questCompletionsCount = Number(questCompletionsCountResult[0].count);

  const xpToNextLevel = (student.level || 1) * 1000;
  const xpProgress = student.xp ? (student.xp / xpToNextLevel) * 100 : 0;
  
  const pinnedBadges = userBadgesData.filter(b => b.pinned).map(b => b.badge);
  const equippedTitleStyle = userBadgesData.find(b => b.badge.type === 'title_style' && b.equipped)?.badge;
  const titleColors = equippedTitleStyle ? JSON.parse(equippedTitleStyle.data).colors : undefined;

  return (
    <AppShell>
      <div className="space-y-8">
        <Card className="shadow-md overflow-hidden">
            <div className="bg-muted/30 p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                    <Image
                        src={`https://i.pravatar.cc/128?u=${student.id}`}
                        alt="Student Avatar"
                        width={128}
                        height={128}
                        className="rounded-full border-4 border-background shadow-lg"
                        data-ai-hint="user avatar"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg border-2 border-background">
                        {student.level}
                    </div>
                </div>
                <div className="flex-1">
                    <h1 className="text-4xl font-headline tracking-tight">{student.name}</h1>
                     {titleColors ? (
                         <GradientText colors={titleColors} className="text-xl">{student.title}</GradientText>
                     ) : (
                        <p className="text-xl text-muted-foreground">{student.title}</p>
                     )}
                    <div className="mt-4 w-full md:w-72">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{student.xp} / {xpToNextLevel} XP</span>
                        </div>
                        <Progress value={xpProgress} className="h-3" />
                    </div>
                </div>
                 <div className="flex gap-4">
                    {pinnedBadges.map(badge => (
                        <TooltipProvider key={badge.id}>
                            <Tooltip>
                                <TooltipTrigger>
                                     <div className="p-4 bg-accent/20 rounded-full hover:bg-accent/30 transition-colors">
                                        <Award className="h-10 w-10 text-accent-foreground" />
                                     </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">{badge.name}</p>
                                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                 </div>
            </div>
        </Card>
      </div>
    </AppShell>
  );
}
