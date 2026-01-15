
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    htmlContent: string;
    subject: string;
}

const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ isOpen, onClose, htmlContent, subject }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Mock Browser Header */}
                    <div className="bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="size-3 rounded-full bg-rose-500"></div>
                                <div className="size-3 rounded-full bg-amber-500"></div>
                                <div className="size-3 rounded-full bg-emerald-500"></div>
                            </div>
                            <div className="ml-4 px-3 py-1 bg-white dark:bg-zinc-800 rounded-md text-xs text-zinc-500 flex items-center gap-2 shadow-sm border border-zinc-200 dark:border-zinc-700 min-w-[200px]">
                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                fluxcash.ai <span className="text-zinc-300">/</span> inbox
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md">
                            <span className="material-symbols-outlined text-[20px] text-zinc-500">close</span>
                        </button>
                    </div>

                    {/* Email Info Bar */}
                    <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 p-4 shrink-0">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-100 mb-1">{subject}</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <div className="size-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">F</div>
                            <span className="font-semibold text-slate-700 dark:text-zinc-300">FluxCash Intelligence</span>
                            <span>&lt;no-reply@fluxcash.ai&gt;</span>
                            <span className="ml-auto">Agora</span>
                        </div>
                    </div>

                    {/* Content Iframe-ish */}
                    <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50 p-4 md:p-8">
                        <div
                            className="mx-auto bg-white shadow-sm rounded-lg overflow-hidden animate-fade-in transition-all"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 flex justify-between items-center">
                        <p className="text-xs text-zinc-400 italic">Pré-visualização do email enviado.</p>
                        <button onClick={onClose} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity">
                            Fechar
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EmailPreviewModal;
