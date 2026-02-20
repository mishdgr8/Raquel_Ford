"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./EditorsPick.module.css";
import { Article } from "@/lib/types";
import { articleService } from "@/lib/services/articles";

export function EditorsPick() {
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        // Ideally we would have a specific "Editors Pick" flag or tag.
        // For now, valid placeholders mentioned by user:
        // "Woman of the Year" and "Cardi B Undisputable"
        // We will fetch 4 latest articles and try to map them to the layout.
        // In a real scenario, this would likely be a curated list from the CMS.

        const fetchArticles = async () => {
            try {
                // Fetch articles marked as Editor's Pick
                let result = await articleService.getEditorsPicks();

                // If we don't have enough picks, fallback to latest published to ensure 4 cards
                if (result.length < 4) {
                    const extra = await articleService.getPublishedArticles(undefined, 8); // fetch a bit more just in case
                    const existingIds = new Set(result.map(a => a.id));
                    const newArticles = extra.articles.filter(a => !existingIds.has(a.id));
                    result = [...result, ...newArticles].slice(0, 4);
                }

                setArticles(result);
            } catch (error) {
                console.error("Failed to load Editors Pick", error);
            }
        };

        fetchArticles();
    }, []);

    if (articles.length < 4) return null;

    // Layout: [Outer, Inner, Inner, Outer]
    // Index 0: Outer
    // Index 1: Inner
    // Index 2: Inner
    // Index 3: Outer

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>Editors Pick</h2>
                </div>

                <div className={styles.grid}>
                    {articles.map((article, index) => {
                        const isInner = index === 1 || index === 2;

                        // Use a fallback excerpt if subtext is missing
                        const subtext = article.excerpt || "Read more about this story...";

                        if (isInner) {
                            return (
                                <Link href={`/articles/${article.slug}`} key={article.id} className={`${styles.card} ${styles.innerCard}`}>
                                    <div className={styles.imageWrapper}>
                                        {article.featuredImage && (
                                            <Image
                                                src={article.featuredImage}
                                                alt={article.title}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                className={styles.image}
                                            />
                                        )}
                                        <div className={styles.innerContent}>
                                            <h3 className={styles.overlayTitle}>{article.title}</h3>
                                            <div className={styles.subtext} dangerouslySetInnerHTML={{ __html: subtext }} />
                                        </div>
                                    </div>
                                    {/* Content div removed as everything is overlay */}
                                </Link>
                            );
                        } else {
                            return (
                                <Link href={`/articles/${article.slug}`} key={article.id} className={`${styles.card} ${styles.outerCard}`}>
                                    <div className={styles.imageWrapper}>
                                        {article.featuredImage && (
                                            <Image
                                                src={article.featuredImage}
                                                alt={article.title}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                className={styles.image}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.content}>
                                        <h3 className={styles.cardTitle}>{article.title}</h3>
                                        <div className={styles.subtext} dangerouslySetInnerHTML={{ __html: subtext }} />
                                    </div>
                                </Link>
                            );
                        }
                    })}
                </div>
            </div>
        </section>
    );
}
