"use client";

import { useState, useEffect } from "react";
import { analyticsService, DailyMetric } from "@/lib/services/analytics";
import { articleService } from "@/lib/services/articles";
import { Article } from "@/lib/types";
import styles from "./Analytics.module.css";
import { BarChart3, Eye, Share2, TrendingUp } from "lucide-react";

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);
    const [totalViews, setTotalViews] = useState(0);
    const [totalShares, setTotalShares] = useState(0);
    const [topArticles, setTopArticles] = useState<{ articleId: string; views: number; title?: string }[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [metrics, allArticles] = await Promise.all([
                analyticsService.getTotalMetrics(period),
                articleService.getAllArticles(),
            ]);

            setArticles(allArticles);
            setTotalViews(metrics.totalViews);
            setTotalShares(metrics.totalShares);

            // Enrich top articles with titles
            const enriched = metrics.topArticles.map(ta => {
                const article = allArticles.find(a => a.id === ta.articleId);
                return { ...ta, title: article?.title || ta.articleId };
            });
            setTopArticles(enriched);
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <BarChart3 size={24} />
                    Analytics
                </h1>
                <div className={styles.periodSelector}>
                    {[7, 30, 90].map(d => (
                        <button
                            key={d}
                            className={`${styles.periodBtn} ${period === d ? styles.periodActive : ''}`}
                            onClick={() => setPeriod(d)}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </header>

            {/* Summary Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#3b82f6', backgroundColor: '#eff6ff' }}>
                        <Eye size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Page Views</p>
                        <p className={styles.statValue}>{loading ? '...' : totalViews.toLocaleString()}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>
                        <Share2 size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Shares</p>
                        <p className={styles.statValue}>{loading ? '...' : totalShares.toLocaleString()}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#8b5cf6', backgroundColor: '#f5f3ff' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Avg Views/Day</p>
                        <p className={styles.statValue}>
                            {loading ? '...' : period > 0 ? Math.round(totalViews / period).toLocaleString() : '0'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Top Articles */}
            <div className={styles.topSection}>
                <h2 className={styles.sectionTitle}>Top Articles</h2>
                {loading ? (
                    <p style={{ padding: '2rem', color: '#94a3b8' }}>Loading...</p>
                ) : topArticles.length === 0 ? (
                    <p style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>
                        No analytics data yet. Views and shares will appear here as readers visit your articles.
                    </p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Article</th>
                                <th>Views</th>
                                <th>% of Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topArticles.map((ta, i) => (
                                <tr key={ta.articleId}>
                                    <td className={styles.rankCell}>{i + 1}</td>
                                    <td className={styles.articleCell}>{ta.title}</td>
                                    <td>{ta.views.toLocaleString()}</td>
                                    <td>
                                        <div className={styles.percentBar}>
                                            <div
                                                className={styles.percentFill}
                                                style={{ width: `${totalViews > 0 ? (ta.views / totalViews * 100) : 0}%` }}
                                            />
                                            <span>{totalViews > 0 ? Math.round(ta.views / totalViews * 100) : 0}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
