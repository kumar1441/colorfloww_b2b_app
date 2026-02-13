import { supabase } from '../lib/supabase';
import { AuthService } from './auth';

/**
 * GamificationService: Tracks daily usage streaks, awards, XP, and currencies via Supabase.
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
        const { data: streakData } = await supabase
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

        // Case 1: User already painted today - don't increment again
        if (lastDate === today) {
            return { streak: currentStreak, reachedMilestone: false };
        }

        // Calculate yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Case 2: User painted yesterday - increment streak
        if (lastDate === yesterdayStr) {
            currentStreak += 1;
        }
        // Case 3: User missed one or more days - reset streak to 1
        else {
            currentStreak = 1;
        }

        // 2. Upsert streak with new values
        await supabase
            .from('user_streaks')
            .upsert({
                user_id: user.id,
                current_streak: currentStreak,
                last_activity_date: today,
                updated_at: new Date().toISOString()
            });

        // 3. Award XP for daily activity
        await this.awardXP(10, 'daily_streak');

        // 4. Check for milestones / awards
        let reachedMilestone = false;
        if (currentStreak === 5) {
            reachedMilestone = true;
            await this.grantAward('streak_5');
            await this.awardXP(100, 'milestone_streak_5');
        }

        return { streak: currentStreak, reachedMilestone };
    },

    /**
     * Award XP to the user and handle level-up logic.
     */
    async awardXP(amount: number, reason: string): Promise<{ newTotal: number, leveledUp: boolean }> {
        const user = await AuthService.getCurrentUser();
        if (!user) return { newTotal: 0, leveledUp: false };

        // 1. Get current stats
        const { data: profile } = await supabase
            .from('user_profile')
            .select('xp, level')
            .eq('id', user.id)
            .single();

        const currentXP = profile?.xp || 0;
        const currentLevel = profile?.level || 1;
        const newXP = currentXP + amount;

        // Simple leveling logic: Level = floor(sqrt(XP / 100)) + 1
        const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
        const leveledUp = newLevel > currentLevel;

        // 2. Update profile
        const { error: updateError } = await supabase
            .from('user_profile')
            .update({
                xp: newXP,
                level: newLevel,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('[GamificationService] awardXP error:', updateError);
            return { newTotal: currentXP, leveledUp: false };
        }

        // 3. Log transaction
        await supabase.from('xp_transactions').insert({
            user_id: user.id,
            amount,
            reason
        });

        return { newTotal: newXP, leveledUp };
    },

    /**
     * Award Gems (Premium Currency)
     */
    async awardGems(amount: number, reason: string): Promise<void> {
        const user = await AuthService.getCurrentUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('user_profile')
            .select('gems')
            .eq('id', user.id)
            .single();

        const newGems = (profile?.gems || 0) + amount;

        await supabase
            .from('user_profile')
            .update({ gems: newGems })
            .eq('id', user.id);

        await supabase.from('gem_transactions').insert({
            user_id: user.id,
            amount,
            reason
        });
    },

    /**
     * Award Karma (Social/Regional Currency)
     */
    async awardKarma(amount: number, city: string, reason: string): Promise<{ newTotal: number }> {
        const user = await AuthService.getCurrentUser();
        if (!user) return { newTotal: 0 };

        // 1. Get current karma
        const { data: profile } = await supabase
            .from('user_profile')
            .select('karma')
            .eq('id', user.id)
            .single();

        const currentKarma = profile?.karma || 0;
        const newKarma = currentKarma + amount;

        // 2. Update profile
        const { error: updateError } = await supabase
            .from('user_profile')
            .update({
                karma: newKarma,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('[GamificationService] awardKarma error:', updateError);
            return { newTotal: currentKarma };
        }

        // 3. Log transaction
        await supabase.from('karma_points').insert({
            user_id: user.id,
            amount,
            city,
            reason
        });

        return { newTotal: newKarma };
    },

    /**
     * Award Royalties (UGC Ownership)
     */
    async awardRoyalties(creatorId: string, colorId: number, consumerId: string): Promise<void> {
        if (creatorId === consumerId) return; // No royalties for self-use

        await supabase.from('color_royalties').insert({
            creator_id: creatorId,
            consumer_id: consumerId,
            color_id: colorId,
            points: 5 // Non-monetary points
        });

        // Also award some XP to the creator
        await this.awardXP(20, 'color_royalty_earned');
    },

    /**
     * Grant a special badge / award.
     */
    async grantAward(awardType: string): Promise<void> {
        const user = await AuthService.getCurrentUser();
        if (!user) return;

        await supabase
            .from('user_awards')
            .upsert({ user_id: user.id, award_type: awardType }, { onConflict: 'user_id,award_type' });
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

        if (sessionCount === 1) {
            await this.grantAward('first_session');
            await this.awardXP(50, 'first_try_on');
        }
        if (sessionCount === 5) {
            await this.grantAward('session_5');
            await this.awardXP(200, 'try_on_veteran');
        }
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
    },

    /**
     * Get user's activity for the current week (Sun-Sat).
     * Returns an array of 7 booleans.
     */
    async getActivityForWeek(): Promise<boolean[]> {
        const user = await AuthService.getCurrentUser();
        if (!user) return new Array(7).fill(false);

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const { data } = await supabase
            .from('paint_sessions')
            .select('created_at')
            .eq('user_id', user.id)
            .gte('created_at', startOfWeek.toISOString());

        const activity = new Array(7).fill(false);
        data?.forEach(session => {
            const date = new Date(session.created_at);
            activity[date.getDay()] = true;
        });

        return activity;
    },

    /**
     * Get user's current progress.
     */
    async getPlayerStats() {
        const user = await AuthService.getCurrentUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('user_profile')
            .select('id, xp, level, gems, karma, avatar_url')
            .eq('id', user.id)
            .single();

        return {
            id: profile?.id,
            xp: profile?.xp || 0,
            level: profile?.level || 1,
            gems: profile?.gems || 0,
            karma: profile?.karma || 0,
            avatarUrl: profile?.avatar_url,
            nextLevelXP: Math.pow(profile?.level || 1, 2) * 100
        };
    }
};

