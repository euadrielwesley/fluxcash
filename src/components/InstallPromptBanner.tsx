import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const InstallPromptBanner: React.FC = () => {
    const { isInstallable, promptInstall } = useInstallPrompt();
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if user previously dismissed
        const wasDismissed = localStorage.getItem('pwa-install-dismissed');
        if (wasDismissed) {
            setDismissed(true);
        }
    }, []);

    const handleInstall = async () => {
        const installed = await promptInstall();
        if (installed) {
            setDismissed(true);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!isInstallable || dismissed) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl shadow-2xl p-4"
            >
                <div className="flex items-start gap-3">
                    <div className="size-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-2xl">download</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">Instalar FluxCash</h3>
                        <p className="text-xs opacity-90 mb-3">
                            Instale o app para acesso rápido e funcionalidades offline
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleInstall}
                                className="flex-1 bg-white text-primary font-bold text-xs py-2 px-4 rounded-lg hover:bg-white/90 transition-colors"
                            >
                                Instalar
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 text-xs font-medium opacity-80 hover:opacity-100 transition-opacity"
                            >
                                Agora não
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="size-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors shrink-0"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallPromptBanner;
