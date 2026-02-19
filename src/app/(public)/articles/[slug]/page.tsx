import Image from "next/image";
import Link from "next/link";
import { articleService } from "@/lib/services/articles";
import { categoryService } from "@/lib/services/categories";
import { notFound } from "next/navigation";
import { formatDate, estimateReadingTime } from "@/lib/utils";
import { ArticleRenderer } from "@/components/common/ArticleRenderer";
import styles from "./ArticlePage.module.css";
import clsx from "clsx";

import { Sidebar } from "@/components/layout/Sidebar";
import { CommentSection } from "@/components/articles/CommentSection";
import { SocialShare } from "@/components/articles/SocialShare";
import { ViewTracker } from "@/components/articles/ViewTracker";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const article = await articleService.getArticleBySlug(slug);
    if (!article) return { title: "Article Not Found" };
    return {
        title: `${article.title} | Raquel Ford`,
        description: article.excerpt || `Read ${article.title} on Raquel Ford.`,
        openGraph: {
            title: article.title,
            description: article.excerpt || "",
            images: article.featuredImage ? [{ url: article.featuredImage }] : [],
        },
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch both article and categories to resolve names
    const [article, allCategories] = await Promise.all([
        articleService.getArticleBySlug(slug),
        categoryService.getCategories()
    ]);

    if (!article) return notFound();

    const category = allCategories.find(c => c.id === article.categoryId || c.slug === article.categoryId);
    const categoryName = category?.name || article.categoryId || 'Uncategorized';

    return (
        <article className={styles.article}>
            <ViewTracker articleId={article.id!} />
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.meta}>
                        <div className={styles.metaGroup}>
                            <Link href="/articles" className={styles.category}>STORIES</Link>
                            <span className={styles.dot}>/</span>
                            <Link href={`/category/${category?.slug || article.categoryId}`} className={styles.category}>
                                {categoryName.toUpperCase()}
                            </Link>
                        </div>
                        <span className={styles.mobileHidden}>•</span>
                        <div className={styles.metaGroup}>
                            <span className={styles.date}>{formatDate(article.publishedAt || article.createdAt)}</span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.readingTime}>{estimateReadingTime(article.contentJson?.blocks || [])} min read</span>
                        </div>
                    </div>
                    <h1
                        className={styles.title}
                        dangerouslySetInnerHTML={{ __html: article.title }}
                    />
                    <p className={styles.excerpt}>{article.excerpt}</p>
                </div>
            </header>

            <div>
                <div className={styles.layout}>
                    <div className={clsx("container", styles.contentContainer)}>
                        <div className={styles.content} data-heading-style={article.headingStyle || 'none'}>
                            {article.featuredImage && (
                                <div className={styles.heroImage}>
                                    <Image
                                        src={article.featuredImage}
                                        alt={article.title}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 800px"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            )}

                            <div className={styles.contentInner}>
                                <ArticleRenderer
                                    html={article.contentHtml}
                                    blocks={article.contentJson?.blocks || []}
                                />

                                {article.tags && article.tags.length > 0 && (
                                    <div className={styles.tags}>
                                        {article.tags.map(tag => (
                                            <span key={tag} className={styles.tag}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Social Share */}
                                <SocialShare
                                    articleId={article.id!}
                                    title={article.title}
                                    slug={article.slug}
                                    excerpt={article.excerpt}
                                />

                                {/* Comment Section */}
                                {article.id && <CommentSection articleId={article.id} />}

                                {/* Related Articles */}
                                <RelatedArticles
                                    currentArticleId={article.id!}
                                    categoryId={article.categoryId}
                                />
                            </div>
                        </div>
                    </div>
                    <Sidebar />
                </div>
            </div>
        </article>
    );
}
