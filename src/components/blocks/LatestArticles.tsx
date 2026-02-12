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
        articleService.getPublishedArticles(undefined, config.count || 5).then(setArticles);
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
                            {articles.map((article) => (
                                <PostCard key={article.id} article={article} variant="horizontal" />
                            ))}
                        </div>
                    </div>
                    <Sidebar />
                </div>
            </div>
        </section>
    );
}
