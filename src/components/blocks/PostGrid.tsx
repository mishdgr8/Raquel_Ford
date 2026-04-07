"use client";

import { useState, useEffect } from "react";
import styles from "./PostGrid.module.css";
import { articleService } from "@/lib/services/articles";
import { Article } from "@/lib/types";
import { PostCard } from "./PostCard";
import { deduplicateArticles } from "@/lib/utils";

interface PostGridProps {
    config: {
        title?: string;
        count?: number;
        columns?: number;
        categoryId?: string;
        tag?: string;
    };
}

export function PostGrid({ config }: PostGridProps) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [offset, setOffset] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const count = config.count || 12;

    useEffect(() => {
        loadArticles(true);
    }, [config.categoryId]);

    const loadArticles = async (isInitial: boolean = false) => {
        setLoading(true);
        try {
            const currentOffset = isInitial ? 0 : offset;

            const result = await articleService.getPublishedArticles(
                config.categoryId,
                count,
                currentOffset,
                config.tag
            );

            if (result.articles.length === 0) {
                setHasMore(false);
            } else {
                // If we got fewer than requested, we hit the end
                if (result.articles.length < count) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (isInitial) {
                    setArticles(result.articles);
                } else {
                    setArticles(prev => [...prev, ...result.articles]);
                }

                setOffset(currentOffset + result.articles.length);
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
                    style={{ gridTemplateColumns: `repeat(${config.columns || 3}, minmax(0, 1fr))` }}
                >
                    {/* Deduplicate articles by slug to prevent duplicate entries */}
                    {deduplicateArticles(articles).map((article) => (
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
