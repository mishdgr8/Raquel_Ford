"use client";

import { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.css";
import {
    FileText,
    FolderTree,
    Eye,
    TrendingUp,
    Star,
    Clock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { articleService } from "@/lib/services/articles";
import { Article } from "@/lib/types";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const all = await articleService.getAllArticles();
            setArticles(all);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const published = articles.filter(a => a.status === 'published');
    const drafts = articles.filter(a => a.status === 'draft');
    const editorsPicks = articles.filter(a => a.isEditorsPick);
    const recentArticles = [...articles]
        .sort((a, b) => {
            const aTime = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
            const bTime = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
            return bTime - aTime;
        })
        .slice(0, 5);

    const stats = [
        {
            label: "Total Articles",
            value: loading ? "..." : articles.length.toString(),
            icon: FileText,
            href: "/admin/articles",
            color: "#3b82f6",
            bg: "#eff6ff",
        },
        {
            label: "Published",
            value: loading ? "..." : published.length.toString(),
            icon: Eye,
            href: "/admin/articles",
            color: "#10b981",
            bg: "#ecfdf5",
        },
        {
            label: "Drafts",
            value: loading ? "..." : drafts.length.toString(),
            icon: Clock,
            href: "/admin/articles",
            color: "#f59e0b",
            bg: "#fffbeb",
        },
        {
            label: "Editor's Picks",
            value: loading ? "..." : editorsPicks.length.toString(),
            icon: Star,
            href: "/admin/articles",
            color: "#8b5cf6",
            bg: "#f5f3ff",
        },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
                    </h1>
                    <p className={styles.subtitle}>Here's what's happening with your magazine.</p>
                </div>
                <Link href="/admin/articles/new" className={styles.quickActionBtn}>
                    + New Article
                </Link>
            </header>

            {/* Stats Grid */}
            <div className={styles.grid}>
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={stat.label} href={stat.href} className={styles.card}>
                            <div className={styles.cardIcon} style={{ backgroundColor: stat.bg, color: stat.color }}>
                                <Icon size={22} />
                            </div>
                            <div className={styles.statInfo}>
                                <p className={styles.statLabel}>{stat.label}</p>
                                <h3 className={styles.statValue}>{stat.value}</h3>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className={styles.recentSection}>
                <div className={styles.recentHeader}>
                    <h2 className={styles.recentTitle}>Recent Activity</h2>
                    <Link href="/admin/articles" className={styles.viewAllLink}>View all →</Link>
                </div>
                <div className={styles.recentList}>
                    {recentArticles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/admin/articles/edit/${article.id}`}
                            className={styles.recentItem}
                        >
                            <div className={styles.recentItemInfo}>
                                <strong>{article.title || '(Untitled)'}</strong>
                                <span className={styles.recentMeta}>
                                    <span className={`${styles.statusDot} ${styles[article.status]}`} />
                                    {article.status}
                                </span>
                            </div>
                            <span className={styles.recentDate}>
                                {article.updatedAt?.seconds
                                    ? new Date(article.updatedAt.seconds * 1000).toLocaleDateString()
                                    : '—'}
                            </span>
                        </Link>
                    ))}
                    {recentArticles.length === 0 && !loading && (
                        <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            No articles yet. Start writing!
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Links */}
            <div className={styles.quickLinks}>
                <Link href="/admin/articles/new" className={styles.quickCard}>
                    <FileText size={20} />
                    <span>Write New Article</span>
                </Link>
                <Link href="/admin/media" className={styles.quickCard}>
                    <FolderTree size={20} />
                    <span>Media Library</span>
                </Link>
                <Link href="/admin/analytics" className={styles.quickCard}>
                    <TrendingUp size={20} />
                    <span>View Analytics</span>
                </Link>
            </div>
        </div>
    );
}
