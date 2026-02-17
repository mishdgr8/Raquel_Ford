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

export function Sidebar() {
    const [latest, setLatest] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticlesByCategory = async () => {
            try {
                const categories = await categoryService.getCategories();
                // Fetch only first 6 categories to keep sidebar concise
                const selectedCategories = categories.slice(0, 6);

                const articlePromises = selectedCategories.map(cat =>
                    articleService.getPublishedArticles(cat.id, 1)
                );

                const results = await Promise.all(articlePromises);
                const articles = results.flatMap(res => res.articles).filter(Boolean);

                setLatest(articles);
            } catch (error) {
                console.error("Error fetching sidebar articles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticlesByCategory();
    }, []);

    return (
        <aside className={styles.sidebar}>
            {/* Best of Categories Section */}
            <div className={styles.section}>
                <h3 className={styles.title}>Explore the Mix</h3>
                <div className={styles.latestArticles}>
                    {latest.map((article) => (
                        <div key={article.id} className={styles.articleItem}>
                            {article.featuredImage && (
                                <Image
                                    src={article.featuredImage}
                                    alt={article.title}
                                    width={120}
                                    height={80}
                                    className={styles.image}
                                />
                            )}
                            <div className={styles.articleInfo}>
                                <Link href={`/articles/${article.slug}`} className={styles.articleTitle}>
                                    <span dangerouslySetInnerHTML={{ __html: article.title }} />
                                </Link>
                                <span className={styles.articleMeta}>{article.categoryId}</span>
                            </div>
                        </div>
                    ))}
                </div>
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
