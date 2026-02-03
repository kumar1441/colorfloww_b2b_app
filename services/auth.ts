import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../lib/supabase';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

/**
 * AuthService: Manages authentication using Supabase.
 */
export const AuthService = {
    /**
     * Sign up a new user.
     */
    async signUp(email: string, password: string, fullName: string) {
        console.log(`[AuthService] Attempting signUp for: ${email}`);
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
        console.log(`[AuthService] signUp success for user: ${data.user?.id}`);
        return data.user;
    },

    /**
     * Log in an existing user.
     */
    async login(email: string, password: string) {
        console.log(`[AuthService] Attempting login for: ${email}`);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error(`[AuthService] login error:`, error);
            throw error;
        }
        console.log(`[AuthService] login success for user: ${data.user?.id}`);
        return data.user;
    },

    /**
     * Remove the session token.
     */
    async logout() {
        console.log(`[AuthService] Logging out...`);
        await supabase.auth.signOut();
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
    async saveUserProfile(details: { gender: string, age_range: string, zipcode: string, city: string }, userId?: string) {
        console.log(`[AuthService] Saving user profile for: ${userId || 'current user'}`);

        const { data: { session } } = await supabase.auth.getSession();
        console.log(`[AuthService] Current session status: ${session ? 'Authenticated' : 'UNAUTHENTICATED'}`);
        if (session) {
            console.log(`[AuthService] Session User ID: ${session.user.id}`);
        }

        let finalUserId = userId;
        if (!finalUserId) {
            const user = await this.getCurrentUser();
            if (!user) {
                console.error(`[AuthService] saveUserProfile failed: No authenticated user found`);
                throw new Error("No authenticated user found");
            }
            finalUserId = user.id;
        }

        const { error } = await supabase
            .from('user_profile')
            .upsert({
                id: finalUserId,
                gender: details.gender,
                age_range: details.age_range,
                zipcode: details.zipcode,
            });

        if (error) {
            console.error(`[AuthService] Error upserting user_profile:`, error);
            throw error;
        }

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
        console.log(`[AuthService] Profile and location saved successfully`);
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
    }
};
