import { supabase } from '../lib/supabase';
import { AuthService } from './auth';

/**
 * GamificationService: Tracks daily usage streaks and awards via Supabase.
 */
export const GamificationService = {
    /**
     * Updates the streak based on the current date in Supabase.
     */
    async updateStreak(): Promise<{ streak: number, reachedMilestone: boolean }> {
        const user = await AuthService.getCurrentUser();
        if (!user) return { streak: 0, reachedMilestone: false };

        const today = new Date().toISOString().split('T')[0];

        // 1. Get current streak data
        const { data: streakData, error } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single();

        let currentStreak = 0;
        let lastDate = null;

        if (streakData) {
            currentStreak = streakData.current_streak;
            lastDate = streakData.last_activity_date;
        }

        if (lastDate === today) {
            return { streak: currentStreak, reachedMilestone: false };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
            currentStreak += 1;
        } else {
            currentStreak = 1;
        }

        // 2. Upsert streak
        await supabase
            .from('user_streaks')
            .upsert({
                user_id: user.id,
                current_streak: currentStreak,
                last_activity_date: today,
                updated_at: new Date().toISOString()
            });

        // 3. Check for milestones / awards
        let reachedMilestone = false;
        if (currentStreak === 5) {
            reachedMilestone = true;
            await this.grantAward('streak_5');
        }

        return { streak: currentStreak, reachedMilestone };
    },

    /**
     * Get the current streak count.
     */
    async getStreak(): Promise<number> {
        const user = await AuthService.getCurrentUser();
        if (!user) return 0;

        const { data } = await supabase
            .from('user_streaks')
            .select('current_streak')
            .eq('user_id', user.id)
            .single();

        return data?.current_streak || 0;
    },

    /**
     * Check and grant automated awards.
     */
    async checkAndGrantAwards(): Promise<void> {
        const user = await AuthService.getCurrentUser();
        if (!user) return;

        const { count } = await supabase
            .from('paint_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const sessionCount = count || 0;

        if (sessionCount >= 1) {
            await this.grantAward('first_session');
        }
        if (sessionCount >= 5) {
            await this.grantAward('session_5');
        }

        // Streak award is handled in updateStreak
    },

    /**
     * Grant an award to the user.
     */
    async grantAward(awardType: string): Promise<void> {
        const user = await AuthService.getCurrentUser();
        if (!user) return;

        await supabase
            .from('user_awards')
            .upsert({ user_id: user.id, award_type: awardType }, { onConflict: 'user_id,award_type' });
    },

    /**
     * Get total session count for the user.
     */
    async getLooksCount(): Promise<number> {
        const user = await AuthService.getCurrentUser();
        if (!user) return 0;

        const { count } = await supabase
            .from('paint_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        return count || 0;
    },

    /**
     * Get total awards count for the user.
     */
    async getAwardsCount(): Promise<number> {
        const user = await AuthService.getCurrentUser();
        if (!user) return 0;

        const { count } = await supabase
            .from('user_awards')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        return count || 0;
    }
};
