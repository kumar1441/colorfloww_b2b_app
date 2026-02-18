import { supabase } from '../lib/supabase';
import { AuthService } from './auth';
import { GamificationService } from './gamification';

export type IntentTag = 'Everyday' | 'Business' | 'Event' | 'Trend' | 'Trying New' | 'Work' | 'Experiment' | 'Like' | 'Cheer' | 'Celebrate' | 'Appreciate' | 'Smile';

export interface HistoryItem {
    id: string;
    color: string;
    intent: IntentTag;
    date: string; // ISO string
    nailsCount: number;
    processedImageUri?: string; // Virtual look photo
    color_details?: {
        name: string;
        rgb: string;
    };
}

/**
 * HistoryService: Manages persistence of nail try-on sessions via Supabase.
 */
export const HistoryService = {
    /**
     * Saves a new try-on session to history.
     */
    async saveTryOn(item: { colorHex: string, colorName: string, intent: IntentTag, nailsCount: number, processedImageUri?: string }): Promise<import('./gamification').AwardDefinition[]> {
        const user = await AuthService.getCurrentUser();
        if (!user) return [];

        try {
            // 1. Save session directly with color details
            const { data: sessionData, error: sessionError } = await supabase
                .from('paint_sessions')
                .insert({
                    user_id: user.id,
                    color_name: item.colorName,
                    color_hex: item.colorHex,
                    intent: item.intent,
                    processed_image_uri: item.processedImageUri,
                })
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 2. Log the intent tag
            await supabase
                .from('color_votes')
                .insert({
                    user_id: user.id,
                    color_hex: item.colorHex,
                    color_name: item.colorName,
                    intent_tag: item.intent
                });

            // 3. Update streaks and check awards — collect newly granted ones
            const streakResult = await GamificationService.updateStreak();
            const colorAwards = await GamificationService.checkAndGrantAwards();
            // Combine color milestone awards + any newly earned streak awards
            const allNewAwards = [...colorAwards, ...(streakResult.newAwards || [])];

            return allNewAwards;

        } catch (e) {
            console.error("Error saving to Supabase:", e);
            throw e;
        }
    },

    /**
     * Retrieves the list of saved try-on sessions joined with color details.
     */
    async getHistory(): Promise<HistoryItem[]> {
        const user = await AuthService.getCurrentUser();
        if (!user) return [];

        try {
            const { data, error } = await supabase
                .from('paint_sessions')
                .select(`
                    id,
                    intent,
                    created_at,
                    processed_image_uri,
                    color_name,
                    color_hex
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map((item: any) => ({
                id: item.id.toString(),
                color: item.color_hex || '#000000',
                intent: item.intent as IntentTag,
                date: item.created_at,
                nailsCount: 5, // Default
                processedImageUri: item.processed_image_uri,
                color_details: {
                    name: item.color_name || 'Custom Shade',
                    rgb: item.color_hex || '#000000'
                }
            }));
        } catch (e) {
            console.error("Error fetching history from Supabase:", e);
            return [];
        }
    },

    /**
     * Deletes a specific history item by ID.
     */
    async deleteItem(id: string): Promise<void> {
        await supabase
            .from('paint_sessions')
            .delete()
            .eq('id', id);
    },

    /**
     * Clears all history for the current user.
     */
    async clearHistory(): Promise<void> {
        const user = await AuthService.getCurrentUser();
        if (!user) return;

        await supabase
            .from('paint_sessions')
            .delete()
            .eq('user_id', user.id);
    }
};
