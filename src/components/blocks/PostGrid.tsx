"use client";

import { useState, useEffect } from "react";
import styles from "./PostGrid.module.css";
import { articleService } from "@/lib/services/articles";
import { Article } from "@/lib/types";
import { PostCard } from "./PostCard";

interface PostGridProps {
    config: {
        title?: string;
        count?: number;
        columns?: number;
        categoryId?: string;
    };
}

export function PostGrid({ config }: PostGridProps) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const count = config.count || 12;

    useEffect(() => {
        loadArticles(true);
    }, [config.categoryId]);

    const loadArticles = async (isInitial: boolean = false) => {
        setLoading(true);
        try {
            let accumulatedArticles: Article[] = [];
            let currentLastDoc = isInitial ? null : lastDoc;
            let fetches = 0;
            const maxFetches = 5; // Safety break
            let hasMoreData = true;

            // Get current slugs to avoid duplicates
            const currentSlugs = new Set(
                isInitial ? [] : articles.map(a => a.slug)
            );

            while (accumulatedArticles.length < count && fetches < maxFetches && hasMoreData) {
                const result = await articleService.getPublishedArticles(
                    config.categoryId,
                    count, // Fetch batch size
                    currentLastDoc
                );

                if (result.articles.length === 0) {
                    hasMoreData = false;
                    break;
                }

                // Filter for new unique articles from this batch
                const newUnique = result.articles.filter(a => {
                    if (currentSlugs.has(a.slug)) return false;
                    currentSlugs.add(a.slug);
                    return true;
                });

                accumulatedArticles = [...accumulatedArticles, ...newUnique];
                currentLastDoc = result.lastDoc;

                // If we got fewer than requested from DB, we hit the end
                if (result.articles.length < count) {
                    hasMoreData = false;
                }

                fetches++;
            }

            if (isInitial) {
                setArticles(accumulatedArticles);
            } else {
                setArticles(prev => [...prev, ...accumulatedArticles]);
            }

            setLastDoc(currentLastDoc);
            setHasMore(hasMoreData && accumulatedArticles.length > 0);

            if (fetches >= maxFetches && accumulatedArticles.length < count) {
                console.warn("PostGrid: Max fetches reached, might have more duplicates hidden.");
            }

        } catch (error) {
            console.error("Failed to load articles", error);
        } finally {
            setLoading(false);
        }
    };

    if (articles.length === 0 && !loading) return null;

    return (
        <section className={styles.section}>
            <div className="container">
                {config.title && (
                    <div className={styles.header}>
                        <h2 className={styles.title}>{config.title}</h2>
                    </div>
                )}

                <div
                    className={styles.grid}
                    style={{ gridTemplateColumns: `repeat(${config.columns || 3}, 1fr)` }}
                >
                    {/* Deduplicate articles by slug to prevent duplicate entries */}
                    {Array.from(new Map(articles.map(item => [item.slug, item])).values()).map((article) => (
                        <PostCard key={article.id} article={article} variant="vertical" />
                    ))}
                </div>

                {hasMore && (
                    <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                        <button
                            onClick={() => loadArticles(false)}
                            disabled={loading}
                            style={{
                                padding: '1rem 3rem',
                                border: '1px solid currentColor',
                                background: 'transparent',
                                fontSize: '0.8rem',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
