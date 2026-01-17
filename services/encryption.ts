import CryptoJS from 'crypto-js';

// Native Encryption Service
// Uses crypto-js for broad compatibility with Expo Go

export const generateSessionKey = async (): Promise<string> => {
    // Simple random key generation
    // In production, use expo-crypto's getRandomBytes
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const encryptPayload = async (data: object, key: string) => {
    try {
        const json = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(json, key).toString();
        // CryptoJS format includes IV/Salt in the string
        return { ciphertext: encrypted };
    } catch (e) {
        console.error("Encryption failed", e);
        return { ciphertext: "" };
    }
};
