import * as SecureStore from 'expo-secure-store';

const HISTORY_KEY = 'nail_app_tryons_history';

export type IntentTag = 'Everyday' | 'Work' | 'Experiment' | 'Trend' | 'Event';

export interface HistoryItem {
    id: string;
    color: string;
    intent: IntentTag;
    date: string; // ISO string
    nailsCount: number;
}

/**
 * HistoryService: Manages persistence of nail try-on sessions.
 */
export const HistoryService = {
    /**
     * Saves a new try-on session to history.
     */
    async saveTryOn(item: Omit<HistoryItem, 'id' | 'date'>): Promise<void> {
        const history = await this.getHistory();
        const newItem: HistoryItem = {
            ...item,
            id: Math.random().toString(36).substring(7),
            date: new Date().toISOString(),
        };

        const updatedHistory = [newItem, ...history];
        await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(updatedHistory));
    },

    /**
     * Retrieves the list of saved try-on sessions.
     */
    async getHistory(): Promise<HistoryItem[]> {
        try {
            const data = await SecureStore.getItemAsync(HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error reading history:", e);
            return [];
        }
    },

    /**
     * Deletes a specific history item by ID.
     */
    async deleteItem(id: string): Promise<void> {
        const history = await this.getHistory();
        const updated = history.filter(item => item.id !== id);
        await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(updated));
    },

    /**
     * Clears all history.
     */
    async clearHistory(): Promise<void> {
        await SecureStore.deleteItemAsync(HISTORY_KEY);
    }
};
