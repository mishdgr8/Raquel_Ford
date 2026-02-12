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
            setArticles(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        if (confirm("Are you sure you want to delete this article?")) {
            try {
                await articleService.deleteArticle(id);
                setArticles(articles.filter(a => a.id !== id));
            } catch (err) {
                console.error(err);
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
