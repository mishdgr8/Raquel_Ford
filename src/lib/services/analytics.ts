import { db } from "../firebase";
import {
    collection, doc, getDoc, setDoc, getDocs,
    query, where, orderBy, limit, increment, serverTimestamp, Timestamp
} from "firebase/firestore";

const ANALYTICS_COLLECTION = "analytics";

export interface DailyMetric {
    articleId: string;
    date: string; // YYYY-MM-DD
    views: number;
    shares: number;
    avgReadTime: number;
    updatedAt: any;
}

export const analyticsService = {
    // Track page view
    async trackView(articleId: string) {
        const today = new Date().toISOString().split('T')[0];
        const docId = `${articleId}_${today}`;
        const docRef = doc(db, ANALYTICS_COLLECTION, docId);

        try {
            const existing = await getDoc(docRef);
            if (existing.exists()) {
                await setDoc(docRef, {
                    views: increment(1),
                    updatedAt: serverTimestamp(),
                }, { merge: true });
            } else {
                await setDoc(docRef, {
                    articleId,
                    date: today,
                    views: 1,
                    shares: 0,
                    avgReadTime: 0,
                    updatedAt: serverTimestamp(),
                });
            }
        } catch (err) {
            console.error('Analytics tracking failed:', err);
        }
    },

    // Track share
    async trackShare(articleId: string) {
        const today = new Date().toISOString().split('T')[0];
        const docId = `${articleId}_${today}`;
        const docRef = doc(db, ANALYTICS_COLLECTION, docId);

        try {
            const existing = await getDoc(docRef);
            if (existing.exists()) {
                await setDoc(docRef, {
                    shares: increment(1),
                    updatedAt: serverTimestamp(),
                }, { merge: true });
            } else {
                await setDoc(docRef, {
                    articleId,
                    date: today,
                    views: 0,
                    shares: 1,
                    avgReadTime: 0,
                    updatedAt: serverTimestamp(),
                });
            }
        } catch (err) {
            console.error('Share tracking failed:', err);
        }
    },

    // Get metrics for an article
    async getArticleMetrics(articleId: string, days: number = 30): Promise<DailyMetric[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startStr = startDate.toISOString().split('T')[0];

        const q = query(
            collection(db, ANALYTICS_COLLECTION),
            where('articleId', '==', articleId),
            where('date', '>=', startStr),
            orderBy('date', 'desc')
        );

        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data() } as DailyMetric));
    },

    // Get total views across all articles (last N days)
    async getTotalMetrics(days: number = 30): Promise<{ totalViews: number; totalShares: number; topArticles: { articleId: string; views: number }[] }> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startStr = startDate.toISOString().split('T')[0];

        const q = query(
            collection(db, ANALYTICS_COLLECTION),
            where('date', '>=', startStr)
        );

        const snap = await getDocs(q);
        const byArticle: Record<string, number> = {};
        let totalViews = 0;
        let totalShares = 0;

        snap.docs.forEach(d => {
            const data = d.data() as DailyMetric;
            totalViews += data.views || 0;
            totalShares += data.shares || 0;
            byArticle[data.articleId] = (byArticle[data.articleId] || 0) + (data.views || 0);
        });

        const topArticles = Object.entries(byArticle)
            .map(([articleId, views]) => ({ articleId, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        return { totalViews, totalShares, topArticles };
    },
};
