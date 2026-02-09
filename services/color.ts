import { supabase } from '../lib/supabase';

export interface Color {
    id: string;
    name: string;
    rgb: string;
}

export const ColorService = {
    async getColors(limit: number = 20): Promise<Color[]> {
        try {
            const { data, error } = await supabase
                .from('colors')
                .select('id, name, rgb')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching colors:', error);
            return [];
        }
    }
};
