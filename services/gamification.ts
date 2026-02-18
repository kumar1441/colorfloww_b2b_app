import { supabase } from '../lib/supabase';
import { AuthService } from './auth';

// ─── Award Catalog ────────────────────────────────────────────────────────────

export interface AwardDefinition {
    id: string;
    name: string;
    description: string;
    emoji: string;
    requirement: string;
    karmaReward: number;
    category: 'colors' | 'streaks' | 'social' | 'profile' | 'special';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const AWARD_CATALOG: AwardDefinition[] = [
    // ── Color Milestones ──
    {
        id: 'first_look',
        name: 'First Stroke',
        description: "You tried your very first color. The journey begins!",
        emoji: '🌸',
        requirement: 'Try on 1 color',
        karmaReward: 50,
        category: 'colors',
        rarity: 'common',
    },
    {
        id: 'look_5',
        name: 'Color Curious',
        description: "Five colors in and you're just getting started.",
        emoji: '💅',
        requirement: 'Try on 5 colors',
        karmaReward: 100,
        category: 'colors',
        rarity: 'common',
    },
    {
        id: 'look_10',
        name: 'Palette Explorer',
        description: "Double digits! You're building a real eye for color.",
        emoji: '✨',
        requirement: 'Try on 10 colors',
        karmaReward: 150,
        category: 'colors',
        rarity: 'common',
    },
    {
        id: 'look_25',
        name: 'Shade Seeker',
        description: "A quarter century of colors. You know what you like.",
        emoji: '🎨',
        requirement: 'Try on 25 colors',
        karmaReward: 250,
        category: 'colors',
        rarity: 'rare',
    },
    {
        id: 'look_50',
        name: 'Color Connoisseur',
        description: "Fifty looks! You've got serious taste.",
        emoji: '🏆',
        requirement: 'Try on 50 colors',
        karmaReward: 500,
        category: 'colors',
        rarity: 'rare',
    },
    {
        id: 'look_100',
        name: 'Nail Royalty',
        description: "One hundred colors. You are the undisputed queen of the palette.",
        emoji: '👑',
        requirement: 'Try on 100 colors',
        karmaReward: 1000,
        category: 'colors',
        rarity: 'legendary',
    },
    // ── Streak Awards ──
    {
        id: 'streak_3',
        name: 'On a Roll',
        description: "Three days in a row. The habit is forming!",
        emoji: '🔥',
        requirement: 'Maintain a 3-day streak',
        karmaReward: 75,
        category: 'streaks',
        rarity: 'common',
    },
    {
        id: 'streak_5',
        name: 'Streak Starter',
        description: "Five days straight. You're committed!",
        emoji: '⚡',
        requirement: 'Maintain a 5-day streak',
        karmaReward: 150,
        category: 'streaks',
        rarity: 'common',
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        description: "A full week without missing a day. Legendary dedication.",
        emoji: '🌟',
        requirement: 'Maintain a 7-day streak',
        karmaReward: 200,
        category: 'streaks',
        rarity: 'rare',
    },
    {
        id: 'streak_14',
        name: 'Fortnight Fanatic',
        description: "Two weeks of daily color exploration. You're unstoppable.",
        emoji: '💫',
        requirement: 'Maintain a 14-day streak',
        karmaReward: 400,
        category: 'streaks',
        rarity: 'epic',
    },
    {
        id: 'streak_30',
        name: 'Monthly Maven',
        description: "A full month. You are a ColorFloww legend.",
        emoji: '💎',
        requirement: 'Maintain a 30-day streak',
        karmaReward: 1000,
        category: 'streaks',
        rarity: 'legendary',
    },
    // ── Social Awards ──
    {
        id: 'first_spotlight',
        name: 'In the Spotlight',
        description: "You shared your first look with the community!",
        emoji: '📸',
        requirement: 'Post your first spotlight',
        karmaReward: 100,
        category: 'social',
        rarity: 'common',
    },
    {
        id: 'spotlight_5',
        name: 'Content Creator',
        description: "Five spotlights! The community loves your style.",
        emoji: '🌈',
        requirement: 'Post 5 spotlights',
        karmaReward: 300,
        category: 'social',
        rarity: 'rare',
    },
    {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: "You shared a look outside the app. Spread the love!",
        emoji: '🦋',
        requirement: 'Share a look externally',
        karmaReward: 50,
        category: 'social',
        rarity: 'common',
    },
    {
        id: 'referral_1',
        name: 'Trendsetter',
        description: "You brought a friend to ColorFloww. Welcome them!",
        emoji: '🤝',
        requirement: 'Refer 1 friend',
        karmaReward: 200,
        category: 'social',
        rarity: 'rare',
    },
    // ── Profile Awards ──
    {
        id: 'first_username',
        name: 'Identity Claimed',
        description: "You've claimed your unique handle. You're official!",
        emoji: '🎭',
        requirement: 'Set a unique @username',
        karmaReward: 25,
        category: 'profile',
        rarity: 'common',
    },
    {
        id: 'profile_complete',
        name: 'Fully Loaded',
        description: "Your profile is complete. Looking good!",
        emoji: '⭐',
        requirement: 'Complete your full profile (name, gender, username)',
        karmaReward: 100,
        category: 'profile',
        rarity: 'common',
    },
    {
        id: 'feedback_giver',
        name: 'Voice of the Community',
        description: "You helped make ColorFloww better. Thank you!",
        emoji: '💬',
        requirement: 'Submit feedback',
        karmaReward: 25,
        category: 'profile',
        rarity: 'common',
    },
    // ── Special Awards ──
    {
        id: 'early_adopter',
        name: 'Pioneer',
        description: "You were here before it was cool. A true original.",
        emoji: '🚀',
        requirement: 'Join as an early tester',
        karmaReward: 500,
        category: 'special',
        rarity: 'legendary',
    },
    {
        id: 'color_mixer',
        name: 'Alchemist',
        description: "You created your own custom color. Pure artistry.",
        emoji: '⚗️',
        requirement: 'Create a custom color mix',
        karmaReward: 75,
        category: 'special',
        rarity: 'rare',
    },
];

export const RARITY_COLORS: Record<string, string> = {
    common: '#8A8A8A',
    rare: '#307b75',
    epic: '#7C3AED',
    legendary: '#D97706',
};

export const RARITY_BG: Record<string, string> = {
    common: 'rgba(138,138,138,0.1)',
    rare: 'rgba(48,123,117,0.1)',
    epic: 'rgba(124,58,237,0.1)',
    legendary: 'rgba(217,119,6,0.1)',
};

// ─── GamificationService ──────────────────────────────────────────────────────

/**
 * GamificationService: Tracks daily usage streaks, awards, XP, and currencies via Supabase.
 */
export const GamificationService = {
    /**
     * Updates the streak based on the current date in Supabase.
     */
    async updateStreak(): Promise<{ streak: number, reachedMilestone: boolean, newAwards: AwardDefinition[] }> {
        const user = await AuthService.getCurrentUser();
        if (!user) return { streak: 0, reachedMilestone: false, newAwards: [] };

        const today = new Date().toISOString().split('T')[0];

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

        if (lastDate === today) {
            return { streak: currentStreak, reachedMilestone: false, newAwards: [] };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
            currentStreak += 1;
        } else {
            currentStreak = 1;
        }

        await supabase
            .from('user_streaks')
            .upsert({
                user_id: user.id,
                current_streak: currentStreak,
                last_activity_date: today,
                updated_at: new Date().toISOString()
            });

        await this.awardKarma(10, 'daily_streak');

        const newStreakAwards = await this.checkAndGrantStreakAwards(currentStreak);
        const reachedMilestone = newStreakAwards.length > 0;

        return { streak: currentStreak, reachedMilestone, newAwards: newStreakAwards };
    },

    /**
     * Award Karma to the user (unified currency — replaces XP).
     */
    async awardKarma(amount: number, reason: string): Promise<{ newTotal: number }> {
        const user = await AuthService.getCurrentUser();
        if (!user) return { newTotal: 0 };

        const { data: profile } = await supabase
            .from('user_profile')
            .select('karma')
            .eq('id', user.id)
            .single();

        const currentKarma = profile?.karma || 0;
        const newKarma = currentKarma + amount;

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

        return { newTotal: newKarma };
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
    },

    /**
     * Award Royalties (UGC Ownership)
     */
    async awardRoyalties(creatorId: string, colorId: number, consumerId: string): Promise<void> {
        if (creatorId === consumerId) return;

        await supabase.from('color_royalties').insert({
            creator_id: creatorId,
            consumer_id: consumerId,
            color_id: colorId,
            points: 5
        });

        await this.awardKarma(20, 'color_royalty_earned');
    },

    /**
     * Grant a special badge / award (upsert - safe to call multiple times).
     */
    async grantAward(awardType: string): Promise<void> {
        const user = await AuthService.getCurrentUser();
        if (!user) return;

        await supabase
            .from('user_awards')
            .upsert({ user_id: user.id, award_type: awardType }, { onConflict: 'user_id,award_type' });
    },

    /**
     * Grant an award only if the user hasn't earned it yet.
     * Returns true if newly granted.
     */
    async grantAwardIfNew(awardType: string): Promise<boolean> {
        const user = await AuthService.getCurrentUser();
        if (!user) return false;

        try {
            // Check if already earned
            const { data: existing, error: checkError } = await supabase
                .from('user_awards')
                .select('id')
                .eq('user_id', user.id)
                .eq('award_type', awardType)
                .limit(1);

            if (checkError) {
                console.error(`[GamificationService] grantAwardIfNew check error for ${awardType}:`, checkError);
                return false;
            }

            if (existing && existing.length > 0) return false; // Already earned

            // Grant the award
            const { error: insertError } = await supabase
                .from('user_awards')
                .insert({ user_id: user.id, award_type: awardType });

            if (insertError) {
                // If it's a unique constraint violation, it means another process already granted it
                if (insertError.code === '23505') return false;
                console.error(`[GamificationService] grantAwardIfNew insert error for ${awardType}:`, insertError);
                return false;
            }

            // Award Karma for the badge
            const def = AWARD_CATALOG.find(a => a.id === awardType);
            if (def?.karmaReward) {
                await this.awardKarma(def.karmaReward, `award_${awardType}`);
            }

            return true;
        } catch (e) {
            console.error(`[GamificationService] grantAwardIfNew exception for ${awardType}:`, e);
            return false;
        }
    },

    /**
     * Get all award IDs the current user has earned.
     */
    async getUserAwards(): Promise<string[]> {
        const user = await AuthService.getCurrentUser();
        if (!user) return [];

        const { data } = await supabase
            .from('user_awards')
            .select('award_type')
            .eq('user_id', user.id);

        return (data || []).map(row => row.award_type);
    },

    /**
     * Get the full award catalog merged with the user's earned status.
     */
    async getAwardsWithStatus(): Promise<(AwardDefinition & { earned: boolean; earnedAt?: string })[]> {
        const user = await AuthService.getCurrentUser();
        if (!user) return AWARD_CATALOG.map(a => ({ ...a, earned: false }));

        const { data, error } = await supabase
            .from('user_awards')
            .select('award_type')
            .eq('user_id', user.id);

        if (error) {
            console.error('[GamificationService] getAwardsWithStatus error:', JSON.stringify(error));
        }

        const earnedSet = new Set<string>((data || []).map(row => row.award_type));

        return AWARD_CATALOG.map(award => ({
            ...award,
            earned: earnedSet.has(award.id),
        }));
    },

    /**
     * Check and grant awards based on color try-on count.
     * Returns array of newly granted award definitions.
     */
    async checkAndGrantAwards(): Promise<AwardDefinition[]> {
        const user = await AuthService.getCurrentUser();
        if (!user) return [];

        const { count } = await supabase
            .from('paint_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const sessionCount = count || 0;
        const milestones: Record<number, string> = {
            1: 'first_look',
            5: 'look_5',
            10: 'look_10',
            25: 'look_25',
            50: 'look_50',
            100: 'look_100',
        };

        const newlyGranted: AwardDefinition[] = [];
        for (const [threshold, awardId] of Object.entries(milestones)) {
            if (sessionCount >= Number(threshold)) {
                const granted = await this.grantAwardIfNew(awardId);
                if (granted) {
                    const def = AWARD_CATALOG.find(a => a.id === awardId);
                    if (def) newlyGranted.push(def);
                }
            }
        }
        return newlyGranted;
    },

    /**
     * Check and grant streak-based awards.
     * Returns array of newly granted award definitions.
     */
    async checkAndGrantStreakAwards(currentStreak: number): Promise<AwardDefinition[]> {
        const milestones: Record<number, string> = {
            3: 'streak_3',
            5: 'streak_5',
            7: 'streak_7',
            14: 'streak_14',
            30: 'streak_30',
        };

        const newlyGranted: AwardDefinition[] = [];
        for (const [threshold, awardId] of Object.entries(milestones)) {
            if (currentStreak >= Number(threshold)) {
                const granted = await this.grantAwardIfNew(awardId);
                if (granted) {
                    const def = AWARD_CATALOG.find(a => a.id === awardId);
                    if (def) newlyGranted.push(def);
                }
            }
        }
        return newlyGranted;
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
            .select('id, gems, karma, avatar_url')
            .eq('id', user.id)
            .single();

        return {
            id: profile?.id,
            gems: profile?.gems || 0,
            karma: profile?.karma || 0,
            avatarUrl: profile?.avatar_url,
        };
    }
};
