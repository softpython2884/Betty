"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PwaInstallCard() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show the install button if the app is not already installed
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                setIsVisible(true);
            }
        });
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Card className="shadow-md bg-accent/20 border-accent/50">
            <CardHeader>
                <CardTitle>Installer l'Application Betty</CardTitle>
                <CardDescription>Pour une expérience plus rapide et immersive, installez l'application sur votre appareil.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleInstallClick}>
                    <Download className="mr-2"/>
                    Installer l'application
                </Button>
            </CardContent>
        </Card>
    )
}
