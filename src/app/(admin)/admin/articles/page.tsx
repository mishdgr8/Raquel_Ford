"use client";

import { useEffect, useState } from "react";
import { articleService } from "@/lib/services/articles";
import { Article } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import styles from "./ArticleList.module.css";
import { formatDate } from "@/lib/utils";

export default function ArticleListPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const data = await articleService.getAllArticles();
            // Deduplicate to ensure no UI glitches
            const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
            setArticles(uniqueData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) {
            console.error("Attempted to delete article with no ID");
            return;
        }
        if (confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
            try {
                console.log("Deleting article:", id);
                await articleService.deleteArticle(id);
                setArticles(articles.filter(a => a.id !== id));
            } catch (err: any) {
                console.error("Delete failed:", err);
                alert(`Failed to delete article: ${err.message || 'Unknown error'}`);
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Articles</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/admin/articles/import">
                        <Button variant="outline" className={styles.addBtn}>
                            <ExternalLink size={18} />
                            <span>Import from WordPress</span>
                        </Button>
                    </Link>
                    <Link href="/admin/articles/new">
                        <Button className={styles.addBtn}>
                            <Plus size={18} />
                            <span>New Article</span>
                        </Button>
                    </Link>
                </div>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article.id}>
                                <td className={styles.titleCell}>
                                    <strong>{article.title}</strong>
                                    <span className={styles.slug}>{article.slug}</span>
                                </td>
                                <td>{article.categoryId}</td>
                                <td>
                                    <span className={clsx(styles.badge, styles[article.status])}>
                                        {article.status}
                                    </span>
                                </td>
                                <td>{formatDate(article.createdAt)}</td>
                                <td className={styles.actions}>
                                    <Link href={`/admin/articles/edit/${article.id}`} title="Edit">
                                        <Edit size={16} />
                                    </Link>
                                    <Link href={`/articles/${article.slug}`} target="_blank" title="View">
                                        <ExternalLink size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(article.id)} title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                    {article.status === 'draft' && (
                                        <button
                                            onClick={async () => {
                                                if (confirm("Publish this article immediately?")) {
                                                    await articleService.updateArticle(article.id!, {
                                                        status: 'published',
                                                        publishedAt: new Date()
                                                    });
                                                    setArticles(articles.map(a => a.id === article.id ? { ...a, status: 'published', publishedAt: new Date() } : a));
                                                }
                                            }}
                                            title="Quick Publish"
                                            style={{ color: '#16a34a' }}
                                        >
                                            <ExternalLink size={16} style={{ transform: 'rotate(180deg)' }} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
