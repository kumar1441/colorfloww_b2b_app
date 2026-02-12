import { supabase } from '../lib/supabase';

export interface Color {
    id: string;
    name: string;
    rgb: string;
}

export interface CategorizedColors {
    pastels: Color[];
    popular: Color[];
    bold: Color[];
}

export const ColorService = {
    async getCategorizedColors(): Promise<CategorizedColors> {
        try {
            const { data, error } = await supabase
                .from('colors')
                .select('id, pastel_name, pastel_rgb, popular_name, popular_rgb, bold_name, bold_rgb')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const categorized: CategorizedColors = {
                pastels: [],
                popular: [],
                bold: []
            };

            if (!data || data.length === 0) return categorized;

            data.forEach((row) => {
                if (row.pastel_name && row.pastel_rgb) {
                    categorized.pastels.push({ id: `${row.id}-p`, name: row.pastel_name, rgb: row.pastel_rgb });
                }
                if (row.popular_name && row.popular_rgb) {
                    categorized.popular.push({ id: `${row.id}-pop`, name: row.popular_name, rgb: row.popular_rgb });
                }
                if (row.bold_name && row.bold_rgb) {
                    categorized.bold.push({ id: `${row.id}-b`, name: row.bold_name, rgb: row.bold_rgb });
                }
            });

            return categorized;
        } catch (error) {
            console.error('Error fetching categorized colors:', error);
            return { pastels: [], popular: [], bold: [] };
        }
    },

    async getColors(limit: number = 20): Promise<Color[]> {
        try {
            // Keep this for backward compatibility if needed, but pointing to basic name/rgb if they still exist
            // or just flatten the categorized ones
            const categorized = await this.getCategorizedColors();
            return [...categorized.popular, ...categorized.bold, ...categorized.pastels].slice(0, limit);
        } catch (error) {
            console.error('Error fetching colors:', error);
            return [];
        }
    }
};
