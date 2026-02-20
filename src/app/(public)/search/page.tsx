"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { deduplicateArticles } from "@/lib/utils";
import { useEffect, useState } from "react";
import { articleService } from "@/lib/services/articles";
import { Article } from "@/lib/types";
import { PostCard } from "@/components/blocks/PostCard";
import styles from "./SearchPage.module.css";
import { Suspense } from "react";

export const revalidate = 60;

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        const performSearch = async () => {
            setLoading(true);
            try {
                // Since Firestore lacks full-text search, we fetch all published articles
                // and filter client-side. This is acceptable for small-medium datasets.
                // For larger datasets, we'd need Algolia or similar.
                const allArticles = await articleService.getAllPublishedArticles(); // Need to implement this or use existing with high limit

                const lowerQuery = query.toLowerCase();
                const filtered = allArticles.filter(article =>
                    article.title.toLowerCase().includes(lowerQuery) ||
                    article.excerpt?.toLowerCase().includes(lowerQuery)
                );

                // Sort by date (newest first) and keep only unique slugs (first occurrence = newest)
                const uniqueArticles = deduplicateArticles(filtered).sort((a, b) => {
                    const timeA = a.publishedAt?.toMillis ? a.publishedAt.toMillis() : new Date(a.publishedAt || 0).getTime();
                    const timeB = b.publishedAt?.toMillis ? b.publishedAt.toMillis() : new Date(b.publishedAt || 0).getTime();
                    return timeB - timeA;
                });

                setArticles(uniqueArticles);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    return (
        <div className={`container ${styles.container}`}>
            <div className={styles.heading}>
                <h1 className={styles.title}>
                    {query ? `Search Results for "${query}"` : "Search"}
                </h1>
                <div className={styles.underline} />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
            ) : articles.length > 0 ? (
                <div className={styles.grid}>
                    {articles.map(article => (
                        <PostCard key={article.id} article={article} variant="vertical" />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
                    {query ? "No stories found matching your search." : "Enter a search term to find stories."}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '8rem 0' }}>Loading search...</div>}>
            <SearchResults />
        </Suspense>
    );
}
