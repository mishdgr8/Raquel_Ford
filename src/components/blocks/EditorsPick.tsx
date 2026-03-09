"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./EditorsPick.module.css";
import { Article } from "@/lib/types";
import { articleService } from "@/lib/services/articles";

interface EditorsPickProps {
    initialArticles?: Article[];
}

export function EditorsPick({ initialArticles }: EditorsPickProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles || []);

    useEffect(() => {
        // Only fetch client-side if no initial articles were provided (fallback)
        if (initialArticles && initialArticles.length >= 4) return;

        const fetchArticles = async () => {
            try {
                let result = await articleService.getEditorsPicks();

                if (result.length < 4) {
                    const extra = await articleService.getPublishedArticles(undefined, 8);
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
    }, [initialArticles]);

    // Show skeleton while loading instead of returning null (prevents CLS)
    if (articles.length < 4) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.header}>
                        <h2 className={styles.title}>Editors Pick</h2>
                    </div>
                    <div className={styles.grid}>
                        {[0, 1, 2, 3].map((i) => {
                            const isInner = i === 1 || i === 2;
                            return (
                                <div key={i} className={`${styles.card} ${isInner ? styles.innerCard : styles.outerCard}`}>
                                    <div className={styles.imageWrapper}>
                                        <div className={styles.skeleton} />
                                    </div>
                                    {!isInner && (
                                        <div className={styles.content}>
                                            <div className={styles.skeletonTitle} />
                                            <div className={styles.skeletonText} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>Editors Pick</h2>
                </div>

                <div className={styles.grid}>
                    {articles.map((article, index) => {
                        const isInner = index === 1 || index === 2;
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
                                                loading="lazy"
                                            />
                                        )}
                                        <div className={styles.innerContent}>
                                            <h3 className={styles.overlayTitle}>{article.title}</h3>
                                            <div className={styles.subtext} dangerouslySetInnerHTML={{ __html: subtext }} />
                                        </div>
                                    </div>
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
                                                loading="lazy"
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
