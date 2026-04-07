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
    },

    async getTotalMetrics(days: number = 30) {
        const events = await this.getStats(days);

        const views = events.filter(e => e.type === 'view');
        const shares = events.filter(e => e.type === 'share');

        // Count views per article
        const viewCounts: Record<string, number> = {};
        views.forEach(v => {
            if (v.entity_id) {
                viewCounts[v.entity_id] = (viewCounts[v.entity_id] || 0) + 1;
            }
        });

        // Top articles sorted by views
        const topArticles = Object.entries(viewCounts)
            .map(([articleId, views]) => ({ articleId, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        return {
            totalViews: views.length,
            totalShares: shares.length,
            topArticles
        };
    }
};
