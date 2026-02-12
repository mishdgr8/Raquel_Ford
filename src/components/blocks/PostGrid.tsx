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

    useEffect(() => {
        articleService.getPublishedArticles(config.categoryId, config.count || 4).then(setArticles);
    }, [config.categoryId, config.count]);

    if (articles.length === 0) return null;

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
                    style={{ gridTemplateColumns: `repeat(${config.columns || 4}, 1fr)` }}
                >
                    {articles.map((article) => (
                        <PostCard key={article.id} article={article} variant="vertical" />
                    ))}
                </div>
            </div>
        </section>
    );
}
