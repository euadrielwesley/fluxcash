// FluxCash Backup Service
// Automatic backup and restore system with versioning

export interface BackupData {
    version: string;
    timestamp: number;
    data: {
        transactions: any[];
        cards: any[];
        goals: any[];
        debts: any[];
        userProfile: any;
        aiRules: any[];
        customCategories: string[];
        budgets?: any[];
        accounts?: any[];
        recurrences?: any[];
    };
}

export interface BackupMetadata {
    id: string;
    timestamp: number;
    size: number;
    version: string;
}

const BACKUP_KEY_PREFIX = 'fluxcash_backup_';
const BACKUP_METADATA_KEY = 'fluxcash_backup_metadata';
const MAX_BACKUPS = 5;
const AUTO_BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const BackupService = {
    /**
     * Create a backup of current data
     */
    createBackup(data: BackupData['data']): BackupMetadata {
        const backup: BackupData = {
            version: '1.0.0',
            timestamp: Date.now(),
            data
        };

        const backupId = `${BACKUP_KEY_PREFIX}${backup.timestamp}`;
        const backupString = JSON.stringify(backup);

        try {
            // Save backup
            localStorage.setItem(backupId, backupString);

            // Update metadata
            const metadata: BackupMetadata = {
                id: backupId,
                timestamp: backup.timestamp,
                size: new Blob([backupString]).size,
                version: backup.version
            };

            this.updateMetadata(metadata);
            this.cleanOldBackups();


            return metadata;
        } catch (error) {
            console.error('[Backup] Failed to create backup:', error);
            throw error;
        }
    },

    /**
     * Get all available backups
     */
    getBackups(): BackupMetadata[] {
        try {
            const metadataString = localStorage.getItem(BACKUP_METADATA_KEY);
            if (!metadataString) return [];

            const metadata: BackupMetadata[] = JSON.parse(metadataString);
            return metadata.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('[Backup] Failed to get backups:', error);
            return [];
        }
    },

    /**
     * Restore a specific backup
     */
    restoreBackup(backupId: string): BackupData['data'] | null {
        try {
            const backupString = localStorage.getItem(backupId);
            if (!backupString) {
                throw new Error('Backup not found');
            }

            const backup: BackupData = JSON.parse(backupString);


            return backup.data;
        } catch (error) {
            console.error('[Backup] Failed to restore backup:', error);
            return null;
        }
    },

    /**
     * Delete a specific backup
     */
    deleteBackup(backupId: string): void {
        try {
            localStorage.removeItem(backupId);

            // Update metadata
            const backups = this.getBackups().filter(b => b.id !== backupId);
            localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(backups));


        } catch (error) {
            console.error('[Backup] Failed to delete backup:', error);
        }
    },

    /**
     * Export backup as JSON file
     */
    exportBackup(backupId?: string): void {
        try {
            let backup: BackupData;

            if (backupId) {
                const backupString = localStorage.getItem(backupId);
                if (!backupString) throw new Error('Backup not found');
                backup = JSON.parse(backupString);
            } else {
                // Export current data
                const currentData = this.getCurrentData();
                backup = {
                    version: '1.0.0',
                    timestamp: Date.now(),
                    data: currentData
                };
            }

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fluxcash-backup-${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);


        } catch (error) {
            console.error('[Backup] Failed to export backup:', error);
            throw error;
        }
    },

    /**
     * Import backup from JSON file
     */
    async importBackup(file: File): Promise<BackupData['data']> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const backup: BackupData = JSON.parse(content);

                    // Validate backup structure
                    if (!backup.version || !backup.timestamp || !backup.data) {
                        throw new Error('Invalid backup file format');
                    }


                    resolve(backup.data);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },

    /**
     * Get current data from localStorage
     */
    getCurrentData(): BackupData['data'] {
        const getItem = (key: string, defaultValue: any = []) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        };

        return {
            transactions: getItem('fluxcash_transactions', []),
            cards: getItem('fluxcash_cards', []),
            goals: getItem('fluxcash_goals', []),
            debts: getItem('fluxcash_debts', []),
            userProfile: getItem('fluxcash_user_profile', {}),
            aiRules: getItem('fluxcash_ai_rules', []),
            customCategories: getItem('fluxcash_custom_categories', []),
            budgets: getItem('fluxcash_budgets', []),
            accounts: getItem('fluxcash_accounts', []),
            recurrences: getItem('fluxcash_recurrences', [])
        };
    },

    /**
     * Update backup metadata
     */
    updateMetadata(newBackup: BackupMetadata): void {
        const backups = this.getBackups();
        backups.push(newBackup);
        localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(backups));
    },

    /**
     * Clean old backups (keep only MAX_BACKUPS)
     */
    cleanOldBackups(): void {
        const backups = this.getBackups();

        if (backups.length > MAX_BACKUPS) {
            const toDelete = backups.slice(MAX_BACKUPS);
            toDelete.forEach(backup => {
                localStorage.removeItem(backup.id);
            });

            const remaining = backups.slice(0, MAX_BACKUPS);
            localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(remaining));


        }
    },

    /**
     * Get last backup timestamp
     */
    getLastBackupTime(): number | null {
        const backups = this.getBackups();
        return backups.length > 0 ? backups[0].timestamp : null;
    },

    /**
     * Format backup size
     */
    formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    },

    /**
     * Start automatic backup interval
     */
    startAutoBackup(getData: () => BackupData['data']): () => void {
        const intervalId = setInterval(() => {
            try {
                const data = getData();
                this.createBackup(data);

            } catch (error) {
                console.error('[Backup] Auto-backup failed:', error);
            }
        }, AUTO_BACKUP_INTERVAL);

        // Return cleanup function
        return () => clearInterval(intervalId);
    }
};
