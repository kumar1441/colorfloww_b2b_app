import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import * as Random from 'expo-crypto';
import { encryptPayload, generateSessionKey } from './encryption';

const ANONYMOUS_ID_KEY = 'nail_app_anon_id';
const SESSION_COUNT_KEY = 'nail_app_session_count';

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

export const trackEvent = async (eventType: string, data: any = {}) => {
    // 1. Context
    const id = await getAnonymousId();
    const sessionCount = await SecureStore.getItemAsync(SESSION_COUNT_KEY);

    // 2. Metadata
    let location = null;
    const { status } = await Location.getForegroundPermissionsAsync();
    // Only ask if already granted or we want to trigger? For passive, simpler to check status
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

    // 3. Encrypt
    const key = await generateSessionKey();
    const encrypted = await encryptPayload(payload, key);

    console.log(`[Native Analytics] ${eventType}`, encrypted);
};
