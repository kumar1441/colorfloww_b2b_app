import { supabase } from '../lib/supabase';
import { AuthService } from './auth';
import { GamificationService } from './gamification';

export type IntentTag = 'Everyday' | 'Work' | 'Experiment' | 'Trend' | 'Event';

export interface HistoryItem {
    id: string;
    color: string;
    intent: IntentTag;
    date: string; // ISO string
    nailsCount: number;
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
    async saveTryOn(item: { colorHex: string, colorName: string, intent: IntentTag, nailsCount: number }): Promise<void> {
        const user = await AuthService.getCurrentUser();
        if (!user) return;

        try {
            // 1. Ensure color exists in colors table or get its ID
            const { data: colorData, error: colorError } = await supabase
                .from('colors')
                .upsert({
                    name: item.colorName,
                    rgb: item.colorHex
                }, { onConflict: 'rgb' })
                .select()
                .single();

            if (colorError) throw colorError;

            // 2. Save session
            const { error: sessionError } = await supabase
                .from('paint_sessions')
                .insert({
                    user_id: user.id,
                    color_id: colorData.id,
                    intent: item.intent,
                });

            if (sessionError) throw sessionError;

            // 3. Log the intent tag
            await supabase
                .from('color_votes')
                .insert({
                    user_id: user.id,
                    color_id: colorData.id,
                    intent_tag: item.intent
                });

            // 4. Update streaks and check awards
            await GamificationService.updateStreak();
            await GamificationService.checkAndGrantAwards();

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
                    colors (
                        name,
                        rgb
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map((item: any) => ({
                id: item.id.toString(),
                color: (item.colors as any)?.rgb || '#000000',
                intent: item.intent as IntentTag,
                date: item.created_at,
                nailsCount: 5, // Default
                color_details: item.colors as any
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
