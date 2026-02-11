import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../lib/supabase';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const NUDGE_COUNT_KEY = 'pn_c';
const SESSION_DATA_KEY = 'sh_v1';

/**
 * AuthService: Manages authentication using Supabase.
 */
export const AuthService = {
    /**
     * Sign up a new user.
     */
    async signUp(email: string, password: string, fullName: string) {
        // Create auth user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });
        if (error) {
            console.error(`[AuthService] signUp error:`, error);
            throw error;
        }
        return data.user;
    },

    /**
     * Log in an existing user.
     */
    async login(email: string, password: string) {
        // Sign in user
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error(`[AuthService] login error:`, error);
            throw error;
        }
        return data.user;
    },

    /**
     * Remove the session token.
     */
    async logout() {
        // Sign out user
        await supabase.auth.signOut();
    },

    /**
     * Send a password reset email.
     */
    async resetPassword(email: string) {
        // Password reset
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'colorfloww://reset-password',
        });
        if (error) {
            console.error(`[AuthService] resetPassword error:`, error);
            throw error;
        }
    },

    /**
     * Check if a session exists.
     */
    async isLoggedIn(): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    },

    /**
     * Get the current user data.
     */
    async getCurrentUser(): Promise<any | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    /**
     * Save user profile details to Supabase.
     */
    async saveUserProfile(details: { email: string, fullName?: string, gender?: string, age_range?: string, zipcode?: string, city?: string, data_consent?: boolean, referral_code?: string, location_permission?: boolean }, userId?: string) {
        const { data: { session } } = await supabase.auth.getSession();

        let finalUserId = userId;
        if (!finalUserId) {
            const user = await this.getCurrentUser();
            if (!user) {
                console.error(`[AuthService] saveUserProfile failed: No authenticated user found`);
                throw new Error("No authenticated user found");
            }
            finalUserId = user.id;
        }

        // 1. Update Auth Metadata if fullName provided
        if (details.fullName) {
            await supabase.auth.updateUser({
                data: { full_name: details.fullName }
            });
        }

        // 2. Upsert Profile
        const { error } = await supabase
            .from('user_profile')
            .upsert({
                id: finalUserId,
                email: details.email,
                gender: details.gender,
                age_range: details.age_range,
                zipcode: details.zipcode,
                data_consent: details.data_consent,
                location_permission: details.location_permission,
                referral_code: details.referral_code,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error(`[AuthService] Error upserting user_profile:`, error);
            throw error;
        }

        if (details.city) {
            // Save location data separately
            const { error: locError } = await supabase
                .from('user_location')
                .upsert({
                    user_id: finalUserId,
                    city: details.city,
                    source: 'signup'
                });

            if (locError) {
                console.error(`[AuthService] Error upserting user_location:`, locError);
                throw locError;
            }
        }
    },

    /**
     * Check if user profile is considered "complete".
     */
    async isProfileComplete(): Promise<boolean> {
        const user = await this.getCurrentUser();
        if (!user) return true; // Don't nudge if not logged in

        const { data: profile } = await supabase
            .from('user_profile')
            .select('gender, zipcode, data_consent')
            .eq('id', user.id)
            .single();

        const hasName = !!user.user_metadata?.full_name;
        const hasGender = !!profile?.gender;
        const hasZip = !!profile?.zipcode;
        const hasConsent = profile?.data_consent === true;

        return !!(hasName && hasGender && hasZip && hasConsent);
    },

    /**
     * Nudge tracking (Persistent)
     */
    async getNudgeCount(): Promise<number> {
        try {
            const val = await SecureStore.getItemAsync(NUDGE_COUNT_KEY);
            return val ? parseInt(val, 10) : 0;
        } catch (e) {
            return 0;
        }
    },

    async incrementNudgeCount(): Promise<number> {
        const current = await this.getNudgeCount();
        const next = current + 1;
        await SecureStore.setItemAsync(NUDGE_COUNT_KEY, next.toString());
        return next;
    },

    async resetNudgeCount(): Promise<void> {
        await SecureStore.deleteItemAsync(NUDGE_COUNT_KEY);
    },

    /**
     * Session tracking for usage limits.
     */
    async recordSession(): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const data = await SecureStore.getItemAsync(SESSION_DATA_KEY);
        let history: any = {};

        if (data) {
            try {
                history = JSON.parse(data);
            } catch (e) { }
        }

        history[today] = (history[today] || 0) + 1;

        // Keep only last 5 days to save even more space
        const dates = Object.keys(history).sort().reverse();
        if (dates.length > 5) {
            const trimmedHistory: any = {};
            dates.slice(0, 5).forEach(d => trimmedHistory[d] = history[d]);
            history = trimmedHistory;
        }

        await SecureStore.setItemAsync(SESSION_DATA_KEY, JSON.stringify(history));
    },

    async getSessionsToday(): Promise<number> {
        const today = new Date().toISOString().split('T')[0];
        try {
            const data = await SecureStore.getItemAsync(SESSION_DATA_KEY);
            if (!data) return 0;
            const history = JSON.parse(data);
            return history[today] || 0;
        } catch (e) {
            return 0;
        }
    },

    /**
     * Enforcement: Can the user perform a paint session?
     */
    async canPaint(): Promise<{ allowed: boolean, reason?: 'limit' | 'unauthorized' }> {
        const user = await this.getCurrentUser();
        if (!user) return { allowed: false, reason: 'unauthorized' };

        const isComplete = await this.isProfileComplete();
        if (isComplete) return { allowed: true };

        const nudgeCount = await this.getNudgeCount();
        const sessionsToday = await this.getSessionsToday();

        // If declined 5+ times, limit to 1 session per day
        if (nudgeCount >= 5 && sessionsToday >= 1) {
            return { allowed: false, reason: 'limit' };
        }

        return { allowed: true };
    },

    /**
     * Get full user details for profile page.
     */
    async getFullUserProfile() {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('user_profile')
            .select('*')
            .eq('id', user.id)
            .single();

        return {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || 'Nail Enthusiast',
            avatarUrl: profile?.avatar_url,
            gender: profile?.gender,
            ageRange: profile?.age_range,
            referralCode: profile?.referral_code,
            karma: profile?.karma || 0,
            xp: profile?.xp || 0,
            level: profile?.level || 1,
            gems: profile?.gems || 0,
        };
    },

    /**
     * Update user avatar in Supabase.
     */
    async updateAvatar(base64Image: string) {
        const user = await this.getCurrentUser();
        if (!user) return;

        // Convert base64 to Blob/ArrayBuffer for upload
        const fileName = `${user.id}/${Date.now()}.png`;
        const filePath = `avatars/${fileName}`;

        // Use a simpler approach for base64 to buffer if needed, 
        // but Supabase storage can handle it with decode
        const { decode } = require('base64-arraybuffer');

        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, decode(base64Image), {
                contentType: 'image/png',
                upsert: true
            });

        if (error) {
            console.error('[AuthService] Avatar upload error:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        const { error: updateError } = await supabase
            .from('user_profile')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

        if (updateError) throw updateError;

        return publicUrl;
    },

    /**
     * Update user profile fields.
     */
    async updateUserProfile(details: { fullName?: string, gender?: string }) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error("No authenticated user found");

        // 1. Update Auth Metadata (for fullName)
        if (details.fullName) {
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: details.fullName }
            });
            if (authError) throw authError;
        }

        // 2. Update public.user_profile (for gender)
        if (details.gender) {
            const { error: profileError } = await supabase
                .from('user_profile')
                .update({ gender: details.gender })
                .eq('id', user.id);
            if (profileError) throw profileError;
        }
    },

    /**
     * Biometrics: Check if device supports local authentication.
     */
    async isBiometricsSupported(): Promise<boolean> {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    },

    /**
     * Perform biometric authentication.
     */
    async authenticateBiometric(): Promise<boolean> {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Login with Biometrics',
            fallbackLabel: 'Use Passcode',
        });
        return result.success;
    },

    /**
     * Enable/Disable biometric login preference.
     */
    async setBiometricPreference(enabled: boolean) {
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled.toString());
    },

    /**
     * Get biometric login preference.
     */
    async getBiometricPreference(): Promise<boolean> {
        const pref = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        return pref === 'true';
    },

    async deleteAccount() {
        // Account deletion and cleanup successful
        const user = await this.getCurrentUser();
        if (!user) throw new Error("No authenticated user found");

        // Call the RPC to delete user data
        const { error } = await supabase.rpc('delete_user_data');
        if (error) {
            console.error('[AuthService] Error calling delete_user_data RPC:', error);
            throw error;
        }

        // Final sign out
        await this.logout();
        return { success: true };
    },

    /**
     * Generate a unique referral code.
     */
    generateReferralCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
};
