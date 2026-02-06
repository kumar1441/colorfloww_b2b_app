import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import * as Random from 'expo-crypto';
import PostHog from 'posthog-react-native';
import { encryptPayload, generateSessionKey } from './encryption';
import { AuthService } from './auth';

/**
 * AnalyticsService: Manages event tracking using PostHog and Native Analytics.
 * Expo Insights works automatically on cold start after installation.
 */

const ANONYMOUS_ID_KEY = 'nail_app_anon_id';
const SESSION_COUNT_KEY = 'nail_app_session_count';

// PostHog Configuration
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

let posthog: PostHog | null = null;

export const getAnonymousId = async () => {
    let id = await SecureStore.getItemAsync(ANONYMOUS_ID_KEY);
    if (!id) {
        id = Random.randomUUID();
        await SecureStore.setItemAsync(ANONYMOUS_ID_KEY, id);
    }
    return id;
};

export const incrementSessionCount = async () => {
    const countStr = await SecureStore.getItemAsync(SESSION_COUNT_KEY);
    const count = parseInt(countStr || '0', 10) + 1;
    await SecureStore.setItemAsync(SESSION_COUNT_KEY, count.toString());
    return count;
};

/**
 * Dual tracking: Sends events to PostHog and logs encrypted native payloads.
 */
export const trackEvent = async (eventType: string, data: any = {}) => {
    // --- 1. PostHog Tracking ---
    if (posthog) {
        posthog.capture(eventType, data);
        console.log(`[PostHog] Tracked: ${eventType}`, data);
    }

    // --- 2. Native Analytics Logic ---
    try {
        const id = await getAnonymousId();
        const sessionCount = await SecureStore.getItemAsync(SESSION_COUNT_KEY);

        let location = null;
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({});
            location = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        }

        const payload = {
            anonymousId: id,
            eventType,
            timestamp: Date.now(),
            location,
            device: {
                os: Device.osName,
                model: Device.modelName,
            },
            sessionCount: parseInt(sessionCount || '1'),
            data
        };

        const key = await generateSessionKey();
        const encrypted = await encryptPayload(payload, key);
        console.log(`[Native Analytics] ${eventType}`, encrypted);
    } catch (error) {
        console.error('[Analytics] Native tracking error:', error);
    }
};

export const AnalyticsService = {
    /**
     * Initialize PostHog client.
     */
    init() {
        if (!POSTHOG_API_KEY) {
            console.warn('[Analytics] Missing PostHog API Key. PostHog will be disabled.');
            return;
        }

        posthog = new PostHog(POSTHOG_API_KEY, {
            host: POSTHOG_HOST,
        });

        console.log('[Analytics] Initialized PostHog');
    },

    /**
     * Identify the user in PostHog.
     */
    async identify() {
        if (!posthog) return;

        const user = await AuthService.getCurrentUser();
        if (user) {
            posthog.identify(user.id, {
                email: user.email,
                name: user.user_metadata?.full_name,
            });
            console.log(`[Analytics] Identified user: ${user.id}`);
        }
    },

    /**
     * Reset analytics state (on logout).
     */
    reset() {
        if (posthog) {
            posthog.reset();
        }
    },

    // Include standard functions for easier access
    track: trackEvent,
    incrementSessionCount
};
