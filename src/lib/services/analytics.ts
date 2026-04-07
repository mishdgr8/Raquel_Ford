import { supabase } from "../supabase";

const ANALYTICS_TABLE = "analytics_events";

const isTableMissing = (error: any) =>
    error?.code === 'PGRST205' || error?.code === '42P01';

export const analyticsService = {
    async trackEvent(type: string, entityType: string, entityId: string, metadata: any = {}) {
        const { error } = await supabase
            .from(ANALYTICS_TABLE)
            .insert([{
                type,
                entity_type: entityType,
                entity_id: entityId,
                metadata_json: metadata,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            // Silently fail — analytics should never crash the site
            console.warn("Analytics tracking skipped:", error.message);
        }
    },

    async getStats(days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from(ANALYTICS_TABLE)
            .select('*')
            .gte('created_at', startDate.toISOString());

        if (error) {
            if (isTableMissing(error)) return [];
            throw error;
        }
        return data || [];
    },

    async trackView(articleId: string) {
        return this.trackEvent('view', 'article', articleId);
    },

    async trackShare(articleId: string) {
        return this.trackEvent('share', 'article', articleId);
    }
};
