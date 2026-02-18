import { supabase } from '../lib/supabase';
import { AnalyticsService } from './analytics';

export interface SpotlightSubmission {
    id: string;
    user_id: string;
    image_uri: string;
    processed_image_uri: string;
    color_hex: string;
    color_name: string;
    created_at: string;
    status: 'active' | 'archived';
    yes_votes: number;
    no_votes: number;
    total_votes: number;
    // Joined from profiles
    username?: string;
}

export interface SpotlightVote {
    id: string;
    submission_id: string;
    voter_id: string;
    vote_type: 'yes' | 'no';
    created_at: string;
}

/**
 * SpotlightService: Manages spotlight submissions and voting
 */
export class SpotlightService {

    /**
     * Submit a nail look to spotlight
     */
    static async submitToSpotlight(
        imageUri: string,
        processedImageUri: string,
        colorHex: string,
        colorName: string
    ): Promise<{ success: boolean; submissionId?: string; error?: string }> {
        const logPrefix = '[SpotlightService]';

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            // Submitting to spotlight

            const { data, error } = await supabase
                .from('spotlight_submissions')
                .insert({
                    user_id: user.id,
                    image_uri: imageUri,
                    processed_image_uri: processedImageUri,
                    color_hex: colorHex,
                    color_name: colorName,
                    status: 'active',
                })
                .select('id')
                .single();

            if (error) {
                console.error(`${logPrefix} Submission error:`, error);
                return { success: false, error: error.message };
            }

            // Submission created

            // Track analytics
            await AnalyticsService.track('spotlight_submission_created', {
                submission_id: data.id,
                color_hex: colorHex,
                color_name: colorName,
            });

            return { success: true, submissionId: data.id };
        } catch (error: any) {
            console.error(`${logPrefix} Unexpected error:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get spotlight submissions for voting
     * Excludes submissions the user has already voted on
     */
    static async getSpotlightSubmissions(
        limit: number = 20,
        excludeOwnSubmissions: boolean = true
    ): Promise<SpotlightSubmission[]> {
        const logPrefix = '[SpotlightService]';

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.warn(`${logPrefix} User not authenticated`);
                return [];
            }

            // Fetching submissions

            // Get submission IDs user has already voted on
            const { data: votedSubmissions } = await supabase
                .from('spotlight_votes')
                .select('submission_id')
                .eq('voter_id', user.id);

            const votedIds = votedSubmissions?.map(v => v.submission_id) || [];
            // User voted check

            // Build query with user_profile join to get real usernames
            let query = supabase
                .from('spotlight_submissions')
                .select('*, user_profile(username)')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(limit);

            // Exclude already voted submissions
            if (votedIds.length > 0) {
                query = query.not('id', 'in', `(${votedIds.join(',')})`);
            }

            // Exclude own submissions
            if (excludeOwnSubmissions) {
                query = query.neq('user_id', user.id);
            }

            const { data, error } = await query;

            if (error) {
                console.error(`${logPrefix} Fetch error:`, error);
                return [];
            }

            // Map results to include username from joined table
            const submissions: SpotlightSubmission[] = (data || []).map((item: any) => ({
                ...item,
                username: item.user_profile?.username || 'GlowUser',
            }));

            return submissions;
        } catch (error) {
            console.error(`${logPrefix} Unexpected error:`, error);
            return [];
        }
    }

    /**
     * Vote on a submission
     * Prevents duplicate voting with unique constraint
     */
    static async voteOnSubmission(
        submissionId: string,
        voteType: 'yes' | 'no'
    ): Promise<{ success: boolean; error?: string }> {
        const logPrefix = '[SpotlightService]';

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            // Voting recorded

            const { error } = await supabase
                .from('spotlight_votes')
                .insert({
                    submission_id: submissionId,
                    voter_id: user.id,
                    vote_type: voteType,
                });

            if (error) {
                // Check if it's a duplicate vote error
                if (error.code === '23505') {
                    console.warn(`${logPrefix} Duplicate vote prevented`);
                    return { success: false, error: 'Already voted on this submission' };
                }
                console.error(`${logPrefix} Vote error:`, error);
                return { success: false, error: error.message };
            }

            // Vote recorded successfully

            // Track analytics
            await AnalyticsService.track(`spotlight_vote_${voteType}`, {
                submission_id: submissionId,
            });

            return { success: true };
        } catch (error: any) {
            console.error(`${logPrefix} Unexpected error:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user's voted submission IDs
     */
    static async getUserVotedSubmissions(): Promise<string[]> {
        const logPrefix = '[SpotlightService]';

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return [];
            }

            const { data, error } = await supabase
                .from('spotlight_votes')
                .select('submission_id')
                .eq('voter_id', user.id);

            if (error) {
                console.error(`${logPrefix} Error fetching voted submissions:`, error);
                return [];
            }

            return (data || []).map(v => v.submission_id);
        } catch (error) {
            console.error(`${logPrefix} Unexpected error:`, error);
            return [];
        }
    }

    /**
     * Get submission statistics
     */
    static async getSubmissionStats(submissionId: string): Promise<{
        yes_votes: number;
        no_votes: number;
        total_votes: number;
    } | null> {
        const logPrefix = '[SpotlightService]';

        try {
            const { data, error } = await supabase
                .from('spotlight_submissions')
                .select('yes_votes, no_votes, total_votes')
                .eq('id', submissionId)
                .single();

            if (error) {
                console.error(`${logPrefix} Error fetching stats:`, error);
                return null;
            }

            return data;
        } catch (error) {
            console.error(`${logPrefix} Unexpected error:`, error);
            return null;
        }
    }

    /**
     * Get user's own submissions
     */
    static async getUserSubmissions(): Promise<SpotlightSubmission[]> {
        const logPrefix = '[SpotlightService]';

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return [];
            }

            const { data, error } = await supabase
                .from('spotlight_submissions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error(`${logPrefix} Error fetching user submissions:`, error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error(`${logPrefix} Unexpected error:`, error);
            return [];
        }
    }
}
