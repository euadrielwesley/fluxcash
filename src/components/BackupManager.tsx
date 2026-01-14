import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackupService, BackupMetadata } from '../services/BackupService';
import { useNotification } from './NotificationContext';

interface BackupManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onRestore: (data: any) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ isOpen, onClose, onRestore }) => {
    const [backups, setBackups] = useState<BackupMetadata[]>([]);
    const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        if (isOpen) {
            loadBackups();
        }
    }, [isOpen]);

    const loadBackups = () => {
        const allBackups = BackupService.getBackups();
        setBackups(allBackups);
    };

    const handleExport = (backupId?: string) => {
        try {
            BackupService.exportBackup(backupId);
            addNotification({
                title: 'Backup Exportado',
                message: 'Arquivo JSON baixado com sucesso',
                type: 'success',
                category: 'system'
            });
        } catch (error) {
            addNotification({
                title: 'Erro ao Exportar',
                message: 'Falha ao exportar backup',
                type: 'error',
                category: 'system'
            });
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await BackupService.importBackup(file);
            onRestore(data);
            addNotification({
                title: 'Backup Importado',
                message: 'Dados restaurados com sucesso',
                type: 'success',
                category: 'system'
            });
            onClose();
        } catch (error) {
            addNotification({
                title: 'Erro ao Importar',
                message: 'Arquivo de backup inválido',
                type: 'error',
                category: 'system'
            });
        }
    };

    const handleRestore = () => {
        if (!selectedBackup) return;

        const data = BackupService.restoreBackup(selectedBackup);
        if (data) {
            onRestore(data);
            addNotification({
                title: 'Backup Restaurado',
                message: 'Dados restaurados com sucesso',
                type: 'success',
                category: 'system'
            });
            setShowRestoreConfirm(false);
            onClose();
        }
    };

    const handleDelete = (backupId: string) => {
        BackupService.deleteBackup(backupId);
        loadBackups();
        addNotification({
            title: 'Backup Deletado',
            message: 'Backup removido com sucesso',
            type: 'info',
            category: 'system'
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">backup</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Gerenciar Backups</h2>
                                    <p className="text-sm text-zinc-500">Restaure ou exporte seus dados</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined text-zinc-600 dark:text-zinc-400">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex gap-3">
                        <button
                            onClick={() => handleExport()}
                            className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            Exportar Atual
                        </button>
                        <label className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-lg">upload</span>
                            Importar Backup
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Backups List */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {backups.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-6xl text-zinc-300 dark:text-zinc-700 mb-4">folder_off</span>
                                <p className="text-zinc-500">Nenhum backup disponível</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {backups.map((backup) => (
                                    <div
                                        key={backup.id}
                                        className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 flex items-center gap-4"
                                    >
                                        <div className="size-12 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary">save</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                                                {new Date(backup.timestamp).toLocaleString('pt-BR')}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {BackupService.formatSize(backup.size)} • Versão {backup.version}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedBackup(backup.id);
                                                    setShowRestoreConfirm(true);
                                                }}
                                                className="size-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors"
                                                title="Restaurar"
                                            >
                                                <span className="material-symbols-outlined text-lg">restore</span>
                                            </button>
                                            <button
                                                onClick={() => handleExport(backup.id)}
                                                className="size-9 bg-zinc-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 rounded-lg flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                                                title="Exportar"
                                            >
                                                <span className="material-symbols-outlined text-lg">download</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(backup.id)}
                                                className="size-9 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                title="Deletar"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Restore Confirmation */}
                    {showRestoreConfirm && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full"
                            >
                                <div className="text-center mb-6">
                                    <div className="size-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl text-warning">warning</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">Restaurar Backup?</h3>
                                    <p className="text-sm text-zinc-500">
                                        Todos os dados atuais serão substituídos. Esta ação não pode ser desfeita.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowRestoreConfirm(false)}
                                        className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 py-3 rounded-xl font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleRestore}
                                        className="flex-1 bg-warning text-white py-3 rounded-xl font-semibold hover:bg-warning/90 transition-colors"
                                    >
                                        Restaurar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BackupManager;
