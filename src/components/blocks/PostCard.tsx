import Link from "next/link";
import Image from "next/image";
import styles from "./PostCard.module.css";
import { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "../ui/Card";

interface PostCardProps {
    article: Article;
    variant?: 'horizontal' | 'vertical';
}

export function PostCard({ article, variant = 'vertical' }: PostCardProps) {
    // Guard: don't render a broken link if slug is missing
    if (!article.slug) return null;

    return (
        <Link href={`/articles/${article.slug}`} className={styles.link}>
            <Card className={variant === 'horizontal' ? styles.horizontal : styles.vertical} hoverable>
                <div className={styles.imageContainer}>
                    {article.featuredImage ? (
                        <Image src={article.featuredImage} alt={article.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className={styles.image} />
                    ) : (
                        <div className={styles.imagePlaceholder} />
                    )}
                    <span className={styles.category}>{(article.categoryId || 'Uncategorized').toUpperCase()}</span>
                </div>

                <CardContent className={styles.content}>
                    <p className={styles.date}>{formatDate(article.publishedAt)}</p>
                    <h3
                        className={styles.title}
                        dangerouslySetInnerHTML={{ __html: article.title }}
                    />    <p className={styles.excerpt}>{article.excerpt}</p>
                    <span className={styles.readMore}>READ MORE</span>
                </CardContent>
            </Card>
        </Link>
    );
}
