"use client";

import { useState, useEffect } from "react";
import styles from "./LatestArticles.module.css";
import { articleService } from "@/lib/services/articles";
import { Article } from "@/lib/types";
import { PostCard } from "./PostCard";

interface LatestArticlesProps {
    config: {
        count?: number;
        title?: string;
    };
}

import { Sidebar } from "../layout/Sidebar";

export function LatestArticles({ config }: LatestArticlesProps) {
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        articleService.getPublishedArticles(undefined, config.count || 5).then(res => setArticles(res.articles));
    }, [config.count]);

    if (articles.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '4rem' }}>
                    <div>
                        <div className={styles.header}>
                            <h2 className={styles.title}>{config.title || "LATEST STORIES"}</h2>
                            <div className={styles.line} />
                        </div>

                        <div className={styles.grid}>
                            {/* Deduplicate articles by slug to prevent duplicate entries */}
                            {Array.from(new Map(articles.map(item => [item.slug, item])).values()).slice(0, 5).map((article) => (
                                <PostCard key={article.id} article={article} variant="horizontal" />
                            ))}
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                            <a href="/articles" style={{
                                display: 'inline-block',
                                padding: '1rem 2rem',
                                border: '1px solid currentColor',
                                textDecoration: 'none',
                                letterSpacing: '0.1em',
                                fontSize: '0.875rem'
                            }}>
                                SEE ALL STORIES
                            </a>
                        </div>
                    </div>
                    <Sidebar />
                </div>
            </div>
        </section>
    );
}
