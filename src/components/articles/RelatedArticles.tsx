"use client";

import { useEffect, useState } from "react";
import { Article } from "@/lib/types";
import { articleService } from "@/lib/services/articles";
import { PostCard } from "../blocks/PostCard";
import styles from "./RelatedArticles.module.css";

interface RelatedArticlesProps {
    currentArticleId: string;
    categoryId: string;
}

export function RelatedArticles({ currentArticleId, categoryId }: RelatedArticlesProps) {
    const [related, setRelated] = useState<Article[]>([]);

    useEffect(() => {
        // Fetch articles from the same category
        articleService.getArticlesByCategory(categoryId).then(articles => {
            // Filter out the current article and ensure uniqueness
            const filtered = articles
                .filter(a => a.id !== currentArticleId && a.slug !== window.location.pathname.split('/').pop())
                .filter((v, i, arr) => arr.findIndex(t => t.slug === v.slug) === i)
                .slice(0, 3);
            setRelated(filtered);
        });
    }, [currentArticleId, categoryId]);

    if (related.length === 0) return null;

    return (
        <section className={styles.container}>
            <span className={styles.categoryLabel}>RECOMMENDED FOR YOU</span>
            <div className={styles.grid}>
                {related.map(article => (
                    <PostCard key={article.id} article={article} />
                ))}
            </div>
        </section>
    );
}
