// Achievements Service - Manages user achievements and badges

import { Achievement, UserProfile, Transaction } from '../types';

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
    // Economic
    {
        id: 'first_transaction',
        name: 'Primeiro Milhão (de centavos)',
        description: 'Registre sua primeira transação',
        icon: 'rocket_launch',
        category: 'economic',
        rarity: 'common',
        xpReward: 50
    },
    {
        id: 'saver_beginner',
        name: 'Poupador Iniciante',
        description: 'Economize R$ 100',
        icon: 'savings',
        category: 'economic',
        rarity: 'common',
        xpReward: 100
    },
    {
        id: 'saver_intermediate',
        name: 'Poupador Intermediário',
        description: 'Economize R$ 1.000',
        icon: 'account_balance',
        category: 'economic',
        rarity: 'rare',
        xpReward: 300
    },
    {
        id: 'saver_advanced',
        name: 'Poupador Avançado',
        description: 'Economize R$ 10.000',
        icon: 'trending_up',
        category: 'economic',
        rarity: 'epic',
        xpReward: 1000
    },
    {
        id: 'investor',
        name: 'Investidor',
        description: 'Faça sua primeira aplicação',
        icon: 'show_chart',
        category: 'economic',
        rarity: 'rare',
        xpReward: 500
    },
    {
        id: 'debt_free',
        name: 'Sem Dívidas',
        description: 'Quite todas as suas dívidas',
        icon: 'verified',
        category: 'economic',
        rarity: 'epic',
        xpReward: 800
    },

    // Consistency
    {
        id: 'streak_7',
        name: 'Streak de Fogo',
        description: '7 dias seguidos registrando transações',
        icon: 'local_fire_department',
        category: 'consistency',
        rarity: 'common',
        xpReward: 150
    },
    {
        id: 'streak_30',
        name: 'Maratonista',
        description: '30 dias seguidos registrando',
        icon: 'emoji_events',
        category: 'consistency',
        rarity: 'rare',
        xpReward: 500
    },
    {
        id: 'streak_100',
        name: 'Inabalável',
        description: '100 dias seguidos registrando',
        icon: 'military_tech',
        category: 'consistency',
        rarity: 'legendary',
        xpReward: 2000
    },
    {
        id: 'punctual',
        name: 'Pontualidade',
        description: 'Registre no mesmo dia por 7 dias',
        icon: 'schedule',
        category: 'consistency',
        rarity: 'common',
        xpReward: 100
    },

    // Goals
    {
        id: 'dreamer',
        name: 'Sonhador',
        description: 'Crie sua primeira meta',
        icon: 'star',
        category: 'goals',
        rarity: 'common',
        xpReward: 50
    },
    {
        id: 'achiever',
        name: 'Realizador',
        description: 'Complete sua primeira meta',
        icon: 'check_circle',
        category: 'goals',
        rarity: 'rare',
        xpReward: 300
    },
    {
        id: 'ambitious',
        name: 'Ambicioso',
        description: 'Tenha 5 metas ativas simultaneamente',
        icon: 'workspace_premium',
        category: 'goals',
        rarity: 'rare',
        xpReward: 250
    },
    {
        id: 'conqueror',
        name: 'Conquistador',
        description: 'Complete 10 metas',
        icon: 'emoji_events',
        category: 'goals',
        rarity: 'epic',
        xpReward: 1000
    },

    // Progress
    {
        id: 'level_up',
        name: 'Subindo de Nível',
        description: 'Alcance a Faixa Amarela',
        icon: 'trending_up',
        category: 'progress',
        rarity: 'common',
        xpReward: 200
    },
    {
        id: 'financial_master',
        name: 'Mestre Financeiro',
        description: 'Alcance a Faixa Preta',
        icon: 'military_tech',
        category: 'progress',
        rarity: 'legendary',
        xpReward: 5000
    },
    {
        id: 'xp_master',
        name: 'XP Master',
        description: 'Acumule 10.000 XP',
        icon: 'stars',
        category: 'progress',
        rarity: 'epic',
        xpReward: 500
    },
    {
        id: 'legend',
        name: 'Lenda',
        description: 'Acumule 50.000 XP',
        icon: 'auto_awesome',
        category: 'progress',
        rarity: 'legendary',
        xpReward: 2000
    },

    // Special
    {
        id: 'early_adopter',
        name: 'Early Adopter',
        description: 'Use o app nos primeiros 30 dias',
        icon: 'new_releases',
        category: 'special',
        rarity: 'rare',
        xpReward: 300
    },
    {
        id: 'evangelist',
        name: 'Evangelista',
        description: 'Indique 5 amigos',
        icon: 'share',
        category: 'special',
        rarity: 'epic',
        xpReward: 1500
    },
    {
        id: 'perfectionist',
        name: 'Perfeccionista',
        description: 'Complete 100% das missões de um mês',
        icon: 'grade',
        category: 'special',
        rarity: 'epic',
        xpReward: 1000
    },
    {
        id: 'workaholic',
        name: 'Workaholic',
        description: 'Registre 100 transações em um mês',
        icon: 'work',
        category: 'special',
        rarity: 'rare',
        xpReward: 400
    }
];

export const AchievementsService = {
    /**
     * Check which achievements should be unlocked
     */
    checkAchievements(
        userProfile: UserProfile,
        transactions: Transaction[],
        unlockedAchievements: Achievement[]
    ): Achievement[] {
        const newlyUnlocked: Achievement[] = [];
        const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

        ACHIEVEMENTS.forEach(achievement => {
            if (unlockedIds.has(achievement.id)) return; // Already unlocked

            const shouldUnlock = this.checkCondition(achievement.id, userProfile, transactions);

            if (shouldUnlock) {
                newlyUnlocked.push({
                    ...achievement,
                    unlockedAt: new Date().toISOString()
                });
            }
        });

        return newlyUnlocked;
    },

    /**
     * Check if achievement condition is met
     */
    checkCondition(
        achievementId: string,
        userProfile: UserProfile,
        transactions: Transaction[]
    ): boolean {
        switch (achievementId) {
            case 'first_transaction':
                return transactions.length >= 1;

            case 'saver_beginner':
                return this.getTotalSavings(transactions) >= 100;

            case 'saver_intermediate':
                return this.getTotalSavings(transactions) >= 1000;

            case 'saver_advanced':
                return this.getTotalSavings(transactions) >= 10000;

            case 'investor':
                return transactions.some(t => t.category === 'Investimentos');

            case 'debt_free':
                // Would need debts data
                return false;

            case 'streak_7':
            case 'streak_30':
            case 'streak_100':
                // Handled by StreaksService
                return false;

            case 'punctual':
                return this.checkPunctuality(transactions);

            case 'dreamer':
                // Would need goals data
                return false;

            case 'achiever':
            case 'ambitious':
            case 'conqueror':
                // Would need goals data
                return false;

            case 'level_up':
                return userProfile.xp >= 1000;

            case 'financial_master':
                return userProfile.xp >= 15000;

            case 'xp_master':
                return userProfile.xp >= 10000;

            case 'legend':
                return userProfile.xp >= 50000;

            case 'early_adopter':
                // Would need account creation date
                return false;

            case 'evangelist':
                // Would need referral data
                return false;

            case 'perfectionist':
                // Would need missions completion data
                return false;

            case 'workaholic':
                return this.getMonthlyTransactionCount(transactions) >= 100;

            default:
                return false;
        }
    },

    /**
     * Calculate total savings (income - expenses)
     */
    getTotalSavings(transactions: Transaction[]): number {
        return transactions.reduce((sum, t) => {
            return sum + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);
    },

    /**
     * Check if user is punctual (same time of day)
     */
    checkPunctuality(transactions: Transaction[]): boolean {
        const last7Days = transactions
            .filter(t => t.dateIso)
            .slice(-7)
            .map(t => new Date(t.dateIso!).getHours());

        if (last7Days.length < 7) return false;

        const avgHour = last7Days.reduce((a, b) => a + b, 0) / 7;
        return last7Days.every(h => Math.abs(h - avgHour) <= 2);
    },

    /**
     * Get transaction count for current month
     */
    getMonthlyTransactionCount(transactions: Transaction[]): number {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions.filter(t => {
            if (!t.dateIso) return false;
            const date = new Date(t.dateIso);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;
    },

    /**
     * Get achievement progress
     */
    getProgress(
        achievementId: string,
        userProfile: UserProfile,
        transactions: Transaction[]
    ): { current: number; total: number } | undefined {
        switch (achievementId) {
            case 'saver_beginner':
                return { current: Math.min(100, this.getTotalSavings(transactions)), total: 100 };
            case 'saver_intermediate':
                return { current: Math.min(1000, this.getTotalSavings(transactions)), total: 1000 };
            case 'saver_advanced':
                return { current: Math.min(10000, this.getTotalSavings(transactions)), total: 10000 };
            case 'xp_master':
                return { current: Math.min(10000, userProfile.xp), total: 10000 };
            case 'legend':
                return { current: Math.min(50000, userProfile.xp), total: 50000 };
            case 'workaholic':
                return { current: Math.min(100, this.getMonthlyTransactionCount(transactions)), total: 100 };
            default:
                return undefined;
        }
    },

    /**
     * Get rarity color
     */
    getRarityColor(rarity: Achievement['rarity']): string {
        switch (rarity) {
            case 'common':
                return 'text-zinc-500';
            case 'rare':
                return 'text-blue-500';
            case 'epic':
                return 'text-purple-500';
            case 'legendary':
                return 'text-amber-500';
        }
    },

    /**
     * Get rarity gradient
     */
    getRarityGradient(rarity: Achievement['rarity']): string {
        switch (rarity) {
            case 'common':
                return 'from-zinc-400 to-zinc-600';
            case 'rare':
                return 'from-blue-400 to-blue-600';
            case 'epic':
                return 'from-purple-400 to-purple-600';
            case 'legendary':
                return 'from-amber-400 to-amber-600';
        }
    }
};
