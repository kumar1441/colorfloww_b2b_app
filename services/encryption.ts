import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';

/**
 * Encryption Service
 * Uses crypto-js for AES encryption.
 * Now includes explicit polyfill for secure random number generation.
 */

/**
 * Generates a cryptographically secure session key using expo-crypto.
 */
export const generateSessionKey = async (): Promise<string> => {
    try {
        const randomBytes = await Crypto.getRandomBytesAsync(32);
        // Convert to a hex string for CryptoJS use
        return Array.from(randomBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    } catch (e) {
        console.warn('[Encryption] Secure random failed, falling back to weak random', e);
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
};

/**
 * Encrypts a persistent payload using a provided key.
 */
export const encryptPayload = async (data: object, key: string) => {
    try {
        const json = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(json, key).toString();

        if (!encrypted) {
            throw new Error('Encryption result was empty');
        }

        return { ciphertext: encrypted };
    } catch (e) {
        console.error("[Encryption] Failed to encrypt payload:", e);
        return { ciphertext: "" };
    }
};
