// This is a new file
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { purchaseCosmetic } from '../actions/shop';
import { Check, Gem, Loader2 } from 'lucide-react';

interface PurchaseButtonProps {
    cosmeticId: string;
    isOwned: boolean;
}

export function PurchaseButton({ cosmeticId, isOwned }: PurchaseButtonProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handlePurchase = () => {
        startTransition(async () => {
            const result = await purchaseCosmetic(cosmeticId);
            if (result.success) {
                toast({
                    title: 'Achat réussi !',
                    description: 'Le cosmétique a été ajouté à votre collection.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: "Échec de l'achat",
                    description: result.message,
                });
            }
        });
    };

    if (isOwned) {
        return (
            <Button disabled variant="outline">
                <Check className="mr-2" /> Possédé
            </Button>
        );
    }
    
    return (
        <Button onClick={handlePurchase} disabled={isPending}>
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Gem className="mr-2" />
            )}
            Acheter
        </Button>
    );
}
