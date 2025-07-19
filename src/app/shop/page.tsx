
import { AppShell } from '@/components/layout/AppShell';
import { getCosmetics, getMyCosmetics } from '../actions/shop';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gem, Check, Sparkles } from 'lucide-react';
import GradientText from '@/components/ui/gradient-text';
import { PurchaseButton } from './PurchaseButton';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/');
    }

    const [cosmetics, myCosmetics] = await Promise.all([
        getCosmetics(),
        getMyCosmetics()
    ]);
    const myCosmeticIds = new Set(myCosmetics.map(c => c.cosmeticId));

    return (
        <AppShell>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-headline tracking-tight flex items-center gap-3"><Sparkles className="text-primary h-10 w-10" /> Boutique</h1>
                        <p className="text-muted-foreground mt-2">Dépensez vos orbes durement gagnées pour personnaliser votre profil.</p>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-bold p-3 rounded-lg bg-muted border">
                        <Gem className="text-blue-500" />
                        <span>{user.orbs || 0} Orbes</span>
                    </div>
                </div>
                
                <section>
                    <h2 className="text-2xl font-bold mb-4">Styles de Titre</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {cosmetics.filter(c => c.type === 'title_style').map(cosmetic => (
                            <Card key={cosmetic.id} className="shadow-md flex flex-col">
                                <CardHeader>
                                    <CardTitle>{cosmetic.name}</CardTitle>
                                    <CardDescription>{cosmetic.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow flex items-center justify-center">
                                    <GradientText colors={(cosmetic.data as any).colors} className="text-4xl">
                                        Votre Titre
                                    </GradientText>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 font-bold text-lg">
                                        <Gem className="text-blue-500" />
                                        {cosmetic.price}
                                    </div>
                                    <PurchaseButton 
                                        cosmeticId={cosmetic.id} 
                                        isOwned={myCosmeticIds.has(cosmetic.id)}
                                    />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
