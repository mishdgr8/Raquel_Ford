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
            const result = await articleService.getPublishedArticles(
                config.categoryId,
                count,
                isInitial ? null : lastDoc
            );

            if (isInitial) {
                setArticles(result.articles);
            } else {
                setArticles(prev => [...prev, ...result.articles]);
            }

            setLastDoc(result.lastDoc);
            setHasMore(result.articles.length === count);
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
                    {/* Deduplicate articles to prevent key errors */}
                    {Array.from(new Map(articles.map(item => [item.id, item])).values()).map((article) => (
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
