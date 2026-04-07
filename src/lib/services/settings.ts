import { supabase } from "../supabase";
import { SiteSettings } from "../types";

const SETTINGS_TABLE = "site_settings";

const isTableMissing = (error: any) =>
    error?.code === 'PGRST205' || error?.code === '42P01';

const DEFAULT_SETTINGS: SiteSettings = {
    general: { siteName: "Raquel Ford", tagline: "Editorial Magazine" },
    seo: { defaultTitle: "Raquel Ford", defaultDescription: "Browse the latest in lifestyle, fashion, beauty, and more." },
    social: {},
    footer: {},
};

export const settingsService = {
    async getSettings() {
        const { data, error } = await supabase
            .from(SETTINGS_TABLE)
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (isTableMissing(error) || error.code === 'PGRST116') return DEFAULT_SETTINGS;
            throw error;
        }

        if (!data) return DEFAULT_SETTINGS;
        return data.config as SiteSettings;
    },

    async updateSettings(data: Partial<SiteSettings>) {
        const current = await this.getSettings();
        const updated = { ...current, ...data };

        const { error } = await supabase
            .from(SETTINGS_TABLE)
            .upsert({
                id: 'default',
                config: updated,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
    }
};
