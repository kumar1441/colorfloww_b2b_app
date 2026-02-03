import { supabase } from '../lib/supabase';
import { AuthService } from './auth';

export type FeedbackCategory = 'Feature Request' | 'Like Feature' | 'Dislike Feature' | 'Bug Report' | 'General';

/**
 * FeedbackService: Handles user feedback submissions.
 */
export const FeedbackService = {
    /**
     * Submit user feedback to Supabase.
     */
    async submitFeedback(category: FeedbackCategory, message: string): Promise<void> {
        const user = await AuthService.getCurrentUser();

        try {
            const { error } = await supabase
                .from('user_feedback')
                .insert({
                    user_id: user?.id || null, // Allow anonymous feedback if not logged in, though typically logged in in this app
                    category,
                    message,
                });

            if (error) throw error;
        } catch (e) {
            console.error("Error submitting feedback:", e);
            throw e;
        }
    }
};
