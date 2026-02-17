import { articleService } from "@/lib/services/articles";
import { notFound } from "next/navigation";
import { formatDate, estimateReadingTime } from "@/lib/utils";
import { ArticleRenderer } from "@/components/common/ArticleRenderer";
import styles from "./ArticlePage.module.css";
import clsx from "clsx";

import { Sidebar } from "@/components/layout/Sidebar";
import { CommentSection } from "@/components/articles/CommentSection";
import { SocialShare } from "@/components/articles/SocialShare";
import { ViewTracker } from "@/components/articles/ViewTracker";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await articleService.getArticleBySlug(slug);

    if (!article) return notFound();

    return (
        <article className={styles.article}>
            <ViewTracker articleId={article.id!} />
            <header className={styles.header}>
                <div className="container">
                    <div className={styles.meta}>
                        <span className={styles.category}>{article.categoryId}</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.date}>{formatDate(article.createdAt)}</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.readingTime}>{estimateReadingTime(article.contentJson?.blocks || [])} min read</span>
                    </div>
                    <h1
                        className={styles.title}
                        dangerouslySetInnerHTML={{ __html: article.title }}
                    />
                    <p className={styles.excerpt}>{article.excerpt}</p>
                </div>
            </header>

            <div className="container">
                <div className={styles.layout}>
                    <div className={styles.content} data-heading-style={article.headingStyle || 'none'}>
                        {article.featuredImage && (
                            <div className={styles.heroImage}>
                                <img src={article.featuredImage} alt={article.title} />
                            </div>
                        )}
                        <ArticleRenderer
                            html={article.contentHtml}
                            blocks={article.contentJson?.blocks || []}
                        />

                        {/* Social Share */}
                        <SocialShare
                            articleId={article.id!}
                            title={article.title}
                            slug={article.slug}
                            excerpt={article.excerpt}
                        />

                        {/* Comment Section */}
                        {article.id && <CommentSection articleId={article.id} />}
                    </div>
                    <Sidebar />
                </div>
            </div>
        </article>
    );
}
