import Link from "next/link";
import styles from "./PostCard.module.css";
import { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "../ui/Card";

interface PostCardProps {
    article: Article;
    variant?: 'horizontal' | 'vertical';
}

export function PostCard({ article, variant = 'vertical' }: PostCardProps) {
    return (
        <Link href={`/articles/${article.slug}`} className={styles.link}>
            <Card className={variant === 'horizontal' ? styles.horizontal : styles.vertical} hoverable>
                <div className={styles.imageContainer}>
                    {article.featuredImage ? (
                        <img src={article.featuredImage} alt={article.title} className={styles.image} />
                    ) : (
                        <div className={styles.imagePlaceholder} />
                    )}
                    <span className={styles.category}>{article.categoryId.toUpperCase()}</span>
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
