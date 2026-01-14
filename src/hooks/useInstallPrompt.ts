import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useInstallPrompt = () => {
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const promptInstall = async () => {
        if (!installPromptEvent) return;

        installPromptEvent.prompt();
        const { outcome } = await installPromptEvent.userChoice;

        if (outcome === 'accepted') {
            setIsInstallable(false);
        }

        setInstallPromptEvent(null);
    };

    const dismissPrompt = () => {
        setIsInstallable(false);
        setInstallPromptEvent(null);
    };

    return {
        isInstallable,
        promptInstall,
        dismissPrompt,
    };
};
