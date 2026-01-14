// Streaks Service - Manages user streaks and multipliers

import { Streak, Transaction } from '../types';

export const StreaksService = {
    /**
     * Update streak based on activity
     */
    updateStreak(
        streak: Streak,
        hasActivityToday: boolean
    ): Streak {
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = streak.lastActivityDate;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // If activity today, update streak
        if (hasActivityToday && lastActivity !== today) {
            const isConsecutive = lastActivity === yesterdayStr;

            return {
                ...streak,
                currentDays: isConsecutive ? streak.currentDays + 1 : 1,
                longestDays: Math.max(streak.longestDays, isConsecutive ? streak.currentDays + 1 : 1),
                multiplier: this.calculateMultiplier(isConsecutive ? streak.currentDays + 1 : 1),
                lastActivityDate: today
            };
        }

        // Check if streak is broken (no activity yesterday or today)
        if (lastActivity !== today && lastActivity !== yesterdayStr) {
            // Check if user has freezes
            if (streak.freezesAvailable > 0) {
                return {
                    ...streak,
                    freezesAvailable: streak.freezesAvailable - 1
                };
            }

            // Streak broken
            return {
                ...streak,
                currentDays: 0,
                multiplier: 1,
                lastActivityDate: today
            };
        }

        return streak;
    },

    /**
     * Calculate XP multiplier based on streak days
     */
    calculateMultiplier(days: number): number {
        if (days >= 100) return 5;
        if (days >= 60) return 3;
        if (days >= 30) return 2.5;
        if (days >= 14) return 2;
        if (days >= 7) return 1.5;
        return 1;
    },

    /**
     * Check if user has activity today
     */
    hasActivityToday(transactions: Transaction[]): boolean {
        const today = new Date().toISOString().split('T')[0];
        return transactions.some(t => t.dateIso?.startsWith(today));
    },

    /**
     * Get streak status color
     */
    getStreakColor(days: number): string {
        if (days >= 100) return 'text-amber-500';
        if (days >= 30) return 'text-purple-500';
        if (days >= 7) return 'text-orange-500';
        return 'text-zinc-400';
    },

    /**
     * Get streak flame intensity
     */
    getFlameIntensity(days: number): 'low' | 'medium' | 'high' | 'max' {
        if (days >= 100) return 'max';
        if (days >= 30) return 'high';
        if (days >= 7) return 'medium';
        return 'low';
    },

    /**
     * Get days until next milestone
     */
    getDaysToNextMilestone(currentDays: number): { days: number; milestone: number; multiplier: number } {
        const milestones = [
            { days: 7, multiplier: 1.5 },
            { days: 14, multiplier: 2 },
            { days: 30, multiplier: 2.5 },
            { days: 60, multiplier: 3 },
            { days: 100, multiplier: 5 }
        ];

        const nextMilestone = milestones.find(m => m.days > currentDays);

        if (!nextMilestone) {
            return { days: 0, milestone: 100, multiplier: 5 };
        }

        return {
            days: nextMilestone.days - currentDays,
            milestone: nextMilestone.days,
            multiplier: nextMilestone.multiplier
        };
    },

    /**
     * Award freeze (monthly or purchased)
     */
    awardFreeze(streak: Streak): Streak {
        return {
            ...streak,
            freezesAvailable: streak.freezesAvailable + 1
        };
    },

    /**
     * Check if streak is at risk
     */
    isStreakAtRisk(streak: Streak): boolean {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        return streak.lastActivityDate === yesterdayStr && streak.currentDays > 0;
    },

    /**
     * Get streak emoji
     */
    getStreakEmoji(days: number): string {
        if (days >= 100) return '🔥💎';
        if (days >= 60) return '🔥🔥🔥';
        if (days >= 30) return '🔥🔥';
        if (days >= 7) return '🔥';
        return '✨';
    }
};
