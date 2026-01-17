import * as SecureStore from 'expo-secure-store';

const AUTH_KEY = 'user_session_token';

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
    }
};
