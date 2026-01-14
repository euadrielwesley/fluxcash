// Weekly Challenges Service - Manages weekly renewable challenges

import { WeeklyChallenge, Transaction, UserProfile } from '../types';

export const WeeklyChallengesService = {
    /**
     * Generate challenges for current week
     */
    generateWeeklyChallenges(): WeeklyChallenge[] {
        const weekNumber = this.getCurrentWeek();
        const expiresAt = this.getWeekEnd();

        const challenges: WeeklyChallenge[] = [
            {
                id: `${weekNumber}_save_200`,
                week: weekNumber,
                title: 'Economize R$ 200',
                description: 'Tenha um saldo positivo de R$ 200 esta semana',
                difficulty: 'medium',
                xpReward: 500,
                isCompleted: false,
                progress: { current: 0, total: 200 },
                expiresAt,
                icon: 'savings',
                color: 'emerald'
            },
            {
                id: `${weekNumber}_streak_7`,
                week: weekNumber,
                title: 'Consistência Total',
                description: 'Registre transações todos os dias da semana',
                difficulty: 'hard',
                xpReward: 700,
                isCompleted: false,
                progress: { current: 0, total: 7 },
                expiresAt,
                icon: 'local_fire_department',
                color: 'orange'
            },
            {
                id: `${weekNumber}_category_limit`,
                week: weekNumber,
                title: 'Controle de Lazer',
                description: 'Gaste menos de R$ 100 em Lazer',
                difficulty: 'easy',
                xpReward: 300,
                isCompleted: false,
                progress: { current: 0, total: 100 },
                expiresAt,
                icon: 'sports_esports',
                color: 'blue'
            },
            {
                id: `${weekNumber}_invest`,
                week: weekNumber,
                title: 'Investidor Semanal',
                description: 'Invista pelo menos R$ 100',
                difficulty: 'hard',
                xpReward: 600,
                isCompleted: false,
                progress: { current: 0, total: 100 },
                expiresAt,
                icon: 'trending_up',
                color: 'purple'
            },
            {
                id: `${weekNumber}_no_debt`,
                week: weekNumber,
                title: 'Sem Novas Dívidas',
                description: 'Não crie nenhuma dívida esta semana',
                difficulty: 'medium',
                xpReward: 400,
                isCompleted: false,
                progress: { current: 0, total: 1 },
                expiresAt,
                icon: 'block',
                color: 'red'
            }
        ];

        // Randomly select 3-4 challenges
        return this.shuffleArray(challenges).slice(0, 3 + Math.floor(Math.random() * 2));
    },

    /**
     * Update challenge progress
     */
    updateChallengeProgress(
        challenge: WeeklyChallenge,
        userProfile: UserProfile,
        transactions: Transaction[]
    ): WeeklyChallenge {
        const weekTransactions = this.getWeekTransactions(transactions);

        let progress = { ...challenge.progress };
        let isCompleted = challenge.isCompleted;

        switch (challenge.id.split('_').slice(1).join('_')) {
            case 'save_200':
                const savings = this.calculateWeeklySavings(weekTransactions);
                progress = { current: Math.max(0, savings), total: 200 };
                isCompleted = savings >= 200;
                break;

            case 'streak_7':
                const streakDays = this.getWeeklyStreakDays(weekTransactions);
                progress = { current: streakDays, total: 7 };
                isCompleted = streakDays >= 7;
                break;

            case 'category_limit':
                const lazerSpent = this.getCategorySpending(weekTransactions, 'Lazer');
                progress = { current: lazerSpent, total: 100 };
                isCompleted = lazerSpent <= 100;
                break;

            case 'invest':
                const invested = this.getCategorySpending(weekTransactions, 'Investimentos');
                progress = { current: invested, total: 100 };
                isCompleted = invested >= 100;
                break;

            case 'no_debt':
                const hasNewDebt = weekTransactions.some(t => t.category === 'Dívidas' && t.type === 'expense');
                progress = { current: hasNewDebt ? 0 : 1, total: 1 };
                isCompleted = !hasNewDebt;
                break;
        }

        return {
            ...challenge,
            progress,
            isCompleted
        };
    },

    /**
     * Get current ISO week number
     */
    getCurrentWeek(): string {
        const now = new Date();
        const year = now.getFullYear();
        const week = this.getWeekNumber(now);
        return `${year}-W${String(week).padStart(2, '0')}`;
    },

    /**
     * Get week number (ISO 8601)
     */
    getWeekNumber(date: Date): number {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    },

    /**
     * Get end of current week (Sunday 23:59:59)
     */
    getWeekEnd(): string {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        const sunday = new Date(now);
        sunday.setDate(now.getDate() + daysUntilSunday);
        sunday.setHours(23, 59, 59, 999);
        return sunday.toISOString();
    },

    /**
     * Get transactions from current week
     */
    getWeekTransactions(transactions: Transaction[]): Transaction[] {
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        monday.setHours(0, 0, 0, 0);

        return transactions.filter(t => {
            if (!t.dateIso) return false;
            const txDate = new Date(t.dateIso);
            return txDate >= monday;
        });
    },

    /**
     * Calculate weekly savings
     */
    calculateWeeklySavings(weekTransactions: Transaction[]): number {
        return weekTransactions.reduce((sum, t) => {
            return sum + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);
    },

    /**
     * Get number of days with transactions this week
     */
    getWeeklyStreakDays(weekTransactions: Transaction[]): number {
        const uniqueDays = new Set(
            weekTransactions
                .filter(t => t.dateIso)
                .map(t => t.dateIso!.split('T')[0])
        );
        return uniqueDays.size;
    },

    /**
     * Get spending in specific category
     */
    getCategorySpending(transactions: Transaction[], category: string): number {
        return transactions
            .filter(t => t.category === category)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    },

    /**
     * Shuffle array (Fisher-Yates)
     */
    shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Get difficulty stars
     */
    getDifficultyStars(difficulty: WeeklyChallenge['difficulty']): number {
        switch (difficulty) {
            case 'easy': return 1;
            case 'medium': return 2;
            case 'hard': return 3;
            case 'epic': return 4;
        }
    },

    /**
     * Get difficulty color
     */
    getDifficultyColor(difficulty: WeeklyChallenge['difficulty']): string {
        switch (difficulty) {
            case 'easy': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'hard': return 'text-orange-500';
            case 'epic': return 'text-red-500';
        }
    },

    /**
     * Check if challenges should be renewed
     */
    shouldRenewChallenges(currentChallenges: WeeklyChallenge[]): boolean {
        if (currentChallenges.length === 0) return true;

        const currentWeek = this.getCurrentWeek();
        return currentChallenges[0].week !== currentWeek;
    },

    /**
     * Get time until expiration
     */
    getTimeUntilExpiration(expiresAt: string): string {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires.getTime() - now.getTime();

        if (diff <= 0) return 'Expirado';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    }
};
