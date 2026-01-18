import * as SecureStore from 'expo-secure-store';

import * as LocalAuthentication from 'expo-local-authentication';

const AUTH_KEY = 'user_session_token';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

/**
 * AuthService: Manages basic authentication state persistence locally.
 */
export const AuthService = {
    /**
     * Set the logged-in status (simulated session).
     */
    async login(userData: any) {
        // For now, we store a stringified placeholder. Later link to real DB/JWT.
        await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(userData));
    },

    /**
     * Remove the session token.
     */
    async logout() {
        await SecureStore.deleteItemAsync(AUTH_KEY);
    },

    /**
     * Check if a session exists.
     */
    async isLoggedIn(): Promise<boolean> {
        const session = await SecureStore.getItemAsync(AUTH_KEY);
        return !!session;
    },

    /**
     * Get the current user data.
     */
    async getCurrentUser(): Promise<any | null> {
        const session = await SecureStore.getItemAsync(AUTH_KEY);
        return session ? JSON.parse(session) : null;
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
