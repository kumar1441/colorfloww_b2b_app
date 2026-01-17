import * as SecureStore from 'expo-secure-store';

const STREAK_KEY = 'nail_app_streak';
const LAST_DATE_KEY = 'nail_app_last_activity_date';

/**
 * GamificationService: Tracks daily usage streaks.
 */
export const GamificationService = {
    /**
     * Updates the streak based on the current date.
     * Returns the updated streak and whether a milestone was reached.
     */
    async updateStreak(): Promise<{ streak: number, reachedMilestone: boolean }> {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const lastDate = await SecureStore.getItemAsync(LAST_DATE_KEY);
        const currentStreakStr = await SecureStore.getItemAsync(STREAK_KEY);
        let currentStreak = parseInt(currentStreakStr || '0', 10);

        if (lastDate === today) {
            // Already updated today
            return { streak: currentStreak, reachedMilestone: false };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
            // Consecutive day!
            currentStreak += 1;
        } else if (!lastDate) {
            // First day ever
            currentStreak = 1;
        } else {
            // Streak broken
            currentStreak = 1;
        }

        await SecureStore.setItemAsync(LAST_DATE_KEY, today);
        await SecureStore.setItemAsync(STREAK_KEY, currentStreak.toString());

        // Milestone example: 5 days
        const reachedMilestone = currentStreak === 5;

        return { streak: currentStreak, reachedMilestone };
    },

    /**
     * Get the current streak count.
     */
    async getStreak(): Promise<number> {
        const streak = await SecureStore.getItemAsync(STREAK_KEY);
        return parseInt(streak || '0', 10);
    }
};
