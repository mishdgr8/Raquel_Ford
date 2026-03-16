"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Sidebar.module.css";
import { Article } from "@/lib/types";
import { articleService } from "@/lib/services/articles";
import { formatDate } from "@/lib/utils";
import { NewsletterSignup } from "../blocks/NewsletterSignup";
import { RSSFeedWidget } from "../blocks/RSSFeedWidget";
import clsx from "clsx";
import { categoryService } from "@/lib/services/categories";

interface SidebarProps {
    initialLatest?: Article[];
}

export function Sidebar({ initialLatest }: SidebarProps) {
    const [latest, setLatest] = useState<Article[]>(initialLatest || []);
    const [loading, setLoading] = useState(!initialLatest || initialLatest.length === 0);

    useEffect(() => {
        if (initialLatest && initialLatest.length > 0) {
            setLoading(false);
            return;
        }

        const fetchArticlesByCategory = async () => {
            try {
                setLoading(true);
                const categories = await categoryService.getCategories();
                const selectedCategories = categories.slice(0, 6);

                // Fetch up to 3 articles per category to find one with a working featured image
                const articlePromises = selectedCategories.map(cat =>
                    articleService.getPublishedArticles(cat.id, 3)
                );
                const results = await Promise.all(articlePromises);

                // For each category, find the first article that has a non-empty featured image
                const articlesWithImages = [];
                for (const res of results) {
                    const found = res.articles.find(article =>
                        article.featuredImage &&
                        typeof article.featuredImage === 'string' &&
                        article.featuredImage.trim().length > 0 &&
                        !article.featuredImage.includes('undefined') &&
                        (article.featuredImage.startsWith('http') || article.featuredImage.startsWith('/'))
                    );
                    if (found) articlesWithImages.push(found);
                }

                setLatest(articlesWithImages);
            } catch (error) {
                console.error("Error fetching sidebar articles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticlesByCategory();
    }, [initialLatest]);

    return (
        <aside className={styles.sidebar}>
            {/* Best of Categories Section */}
            <div className={styles.section}>
                <h3 className={styles.title}>Explore the Mix</h3>

                {loading && (
                    <div className={styles.latestArticles}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className={styles.skeletonItem} />
                        ))}
                    </div>
                )}

                {!loading && (
                    <div className={styles.latestArticles}>
                        {latest.map((article) => (
                            <div key={article.id} className={styles.articleItem}>
                                {article.featuredImage && (
                                    <Image
                                        src={article.featuredImage}
                                        alt={article.title}
                                        width={160}
                                        height={90}
                                        className={styles.image}
                                        loading="lazy"
                                    />
                                )}
                                <div className={styles.articleInfo}>
                                    <Link
                                        href={`/articles/${article.slug}`}
                                        className={styles.articleTitle}
                                        aria-label={`Read ${article.title}`}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: article.title }} />
                                    </Link>
                                    <span className={styles.articleMeta}>{article.categoryId}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* External Feeds */}
            <div className={styles.section}>
                <RSSFeedWidget
                    title="Trending in Fashion"
                    url="https://www.vogue.com/feed/rss"
                    sourceName="Vogue"
                    limit={3}
                />
            </div>

            <div className={styles.section}>
                <RSSFeedWidget
                    title="World News"
                    url="http://rss.cnn.com/rss/cnn_topstories.rss"
                    sourceName="CNN"
                    limit={3}
                />
            </div>

            {/* Newsletter Section */}
            <div className={clsx(styles.section, styles.newsletterSection)}>
                <h3 className={clsx(styles.title)} style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>Newsletter</h3>
                <NewsletterSignup config={{}} />
            </div>

            {/* About/Blog Details Placeholder */}
            <div className={styles.section}>
                <h3 className={styles.title}>About Raquel Ford</h3>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--muted-foreground)' }}>
                    A curated digital destination for the modern individual, covering fashion, food, travel, and more with clinical precision and high-end editorial standards.
                </p>
            </div>
        </aside >
    );
}
