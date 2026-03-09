import Link from "next/link";
import Image from "next/image";
import styles from "./PostCard.module.css";
import { Article } from "@/lib/types";
import { formatDate, generateExcerpt, slugify } from "@/lib/utils";
import { Card, CardContent } from "../ui/Card";

interface PostCardProps {
    article: Article;
    variant?: 'horizontal' | 'vertical';
}

export function PostCard({ article, variant = 'vertical' }: PostCardProps) {
    // Guard: don't render a broken link if slug is missing
    if (!article.slug) return null;

    return (
        <div className={styles.cardContainer}>
            <Link href={`/articles/${article.slug}`} className={styles.link} aria-label={`Read more about ${article.title}`}>
                <Card className={variant === 'horizontal' ? styles.horizontal : styles.vertical} hoverable={true}>
                    <div className={styles.imageContainer}>
                        {article.featuredImage ? (
                            <Image src={article.featuredImage} alt={article.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className={styles.image} loading="lazy" />
                        ) : (
                            <div className={styles.imagePlaceholder} />
                        )}
                    </div>
                    <CardContent className={styles.content}>
                        <div className={styles.metaRow}>
                            <span className={styles.categoryText}>{(article.categoryId || 'Uncategorized').toUpperCase()}</span>
                            <span className={styles.dot}>•</span>
                            <p className={styles.date}>{formatDate(article.publishedAt || article.createdAt)}</p>
                        </div>
                        <h3
                            className={styles.title}
                            dangerouslySetInnerHTML={{ __html: article.title }}
                        />
                        <p className={styles.excerpt}>
                            {article.excerpt || generateExcerpt(article.contentHtml || '')}
                        </p>

                        <div className={styles.cardFooter}>
                            <span className={styles.readMore}>READ MORE</span>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            {article.tags && article.tags.length > 0 && (
                <div className={styles.tagsContainer}>
                    {article.tags.slice(0, 3).map((tag, index) => {
                        return (
                            <Link
                                key={tag}
                                href={`/search?q=${encodeURIComponent(tag.toLowerCase())}`}
                                className={styles.tagBadge}
                                onClick={(e) => e.stopPropagation()}
                            >
                                #{tag.toLowerCase()}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
