"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./LatestArticles.module.css";
import { articleService } from "@/lib/services/articles";
import { Article } from "@/lib/types";
import { deduplicateArticles } from "@/lib/utils";
import { PostCard } from "./PostCard";
import { Sidebar } from "../layout/Sidebar";

interface LatestArticlesProps {
    config: {
        count?: number;
        title?: string;
    };
    initialArticles?: Article[];
    initialSidebarArticles?: Article[];
}

export function LatestArticles({ config, initialArticles, initialSidebarArticles }: LatestArticlesProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles || []);
    const [loading, setLoading] = useState(!initialArticles || initialArticles.length === 0);

    useEffect(() => {
        if (initialArticles && initialArticles.length > 0) {
            setLoading(false);
            return;
        }

        setLoading(true);
        articleService.getPublishedArticles(undefined, config.count || 5)
            .then(res => {
                setArticles(res.articles);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [config.count, initialArticles]);

    // Same skeleton pattern as EditorsPick to prevent CLS
    if (loading) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.layoutGrid}>
                        <div>
                            <div className={styles.header}>
                                <div className={styles.skeletonTitle} />
                            </div>
                            <div className={styles.grid}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className={styles.skeletonCard} />
                                ))}
                            </div>
                        </div>
                        <Sidebar initialLatest={initialSidebarArticles} />
                    </div>
                </div>
            </section>
        );
    }

    if (articles.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.layoutGrid}>
                    <div>
                        <div className={styles.header}>
                            <h2 className={styles.title}>{config.title || "LATEST STORIES"}</h2>
                        </div>

                        <div className={styles.grid}>
                            {/* Deduplicate articles by slug to prevent duplicate entries */}
                            {deduplicateArticles(articles).slice(0, 5).map((article) => (
                                <PostCard key={article.id} article={article} variant="horizontal" />
                            ))}
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                            <Link href="/articles/all" aria-label="See all stories from Raquel Ford" style={{
                                display: 'inline-block',
                                padding: '1rem 2rem',
                                border: '1px solid currentColor',
                                textDecoration: 'none',
                                letterSpacing: '0.1em',
                                fontSize: '0.875rem'
                            }}>
                                SEE ALL STORIES
                            </Link>
                        </div>
                    </div>
                    <Sidebar initialLatest={initialSidebarArticles} />
                </div>
            </div>
        </section>
    );
}
