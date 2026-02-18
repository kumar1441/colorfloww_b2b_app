import { supabase } from '../lib/supabase';
import { GamificationService } from './gamification';
import { AuthService } from './auth';

export type Challenge = {
    id: string;
    title: string;
    description: string;
    theme_color_hex?: string;
    reward_xp: number;
    reward_gems: number;
    expires_at: string;
};

export const ChallengeService = {
    /**
     * Get the active challenge for today.
     */
    async getDailyChallenge(): Promise<Challenge | null> {
        const today = new Date().toISOString().split('T')[0];

        // In a real app, this would come from a 'challenges' table
        // For this demo, we'll return a calculated challenge based on the day
        const days = ['Sunday Sparkle', 'Monday Monochrome', 'Tropical Tuesday', 'Wild Wednesday', 'Texture Thursday', 'Neon Friday', 'Soft Saturday'];
        const dayOfWeek = new Date().getDay();

        return {
            id: `daily_${today}`,
            title: days[dayOfWeek],
            description: `Submit a look using ${dayOfWeek === 1 ? 'Grey/Black' : 'Bright Colors'} to win bonus rewards!`,
            reward_xp: 150,
            reward_gems: 5,
            expires_at: new Date(new Date().setHours(23, 59, 59)).toISOString()
        };
    },

    /**
     * Submit a look to a challenge.
     */
    async submitToChallenge(challengeId: string, tryOnId: string): Promise<void> {
        const user = await AuthService.getCurrentUser();
        if (!user) return;

        // Log participation
        const { error } = await supabase.from('challenge_participations').insert({
            user_id: user.id,
            challenge_id: challengeId,
            try_on_id: tryOnId
        });

        if (error) throw error;

        // Award rewards
        const challenge = await this.getDailyChallenge();
        if (challenge) {
            await GamificationService.awardKarma(challenge.reward_xp, `challenge_completion_${challenge.id}`);
            await GamificationService.awardGems(challenge.reward_gems, `challenge_completion_${challenge.id}`);
        }
    },

    /**
     * Check if a 'Special FX' color is unlocked for the user.
     */
    async isColorUnlocked(colorId: string): Promise<boolean> {
        const stats = await GamificationService.getPlayerStats();
        if (!stats) return false;

        // Premium colors unlock via Gems only
        if (!colorId.startsWith('fx_')) return true;

        const { data: purchase } = await supabase
            .from('user_unlocks')
            .select('*')
            .eq('item_id', colorId)
            .single();

        return !!purchase;
    }
};
