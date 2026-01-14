import React from 'react';
import { useInstallPrompt } from '../src/hooks/useInstallPrompt';

const InstallPromptBanner: React.FC = () => {
    const { isInstallable, promptInstall, dismissPrompt } = useInstallPrompt();

    if (!isInstallable) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-primary to-primary-dark text-white p-4 rounded-lg shadow-2xl z-50 animate-slide-up">
            <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-3xl">install_mobile</span>
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Instalar FluxCash</h3>
                    <p className="text-sm text-white/90 mb-3">
                        Instale o app para acesso rápido e use offline!
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={promptInstall}
                            className="px-4 py-2 bg-white text-primary rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors"
                        >
                            Instalar
                        </button>
                        <button
                            onClick={dismissPrompt}
                            className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors"
                        >
                            Agora não
                        </button>
                    </div>
                </div>
                <button
                    onClick={dismissPrompt}
                    className="text-white/80 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>
        </div>
    );
};

export default InstallPromptBanner;
