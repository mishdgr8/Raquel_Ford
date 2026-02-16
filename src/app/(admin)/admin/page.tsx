"use client";

import styles from "./AdminDashboard.module.css";
import {
    FileText,
    FolderTree,
    Palette,
    Settings as SettingsIcon,
    LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function AdminDashboard() {
    const { user } = useAuth();

    const stats = [
        { label: "Articles", value: "0", icon: FileText, href: "/admin/articles", color: "#3b82f6" },
        { label: "Categories", value: "0", icon: FolderTree, href: "/admin/categories", color: "#10b981" },
        { label: "Templates", value: "0", icon: Palette, href: "/admin/templates", color: "#f59e0b" },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Welcome back, Raquel</h1>
                <p className={styles.subtitle}>Manage your digital magazine from here.</p>
            </header>

            <div className={styles.grid}>
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={stat.label} href={stat.href} className={styles.card}>
                            <div className={styles.iconWrapper} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                <Icon size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <h3 className={styles.statLabel}>{stat.label}</h3>
                                <p className={styles.statValue}>{stat.value}</p>
                            </div>
                        </Link>
                    )
                })}
            </div>

            <div className={styles.setupCard}>
                <div className={styles.setupInfo}>
                    <h2 className={styles.setupTitle}>Ready to get started?</h2>
                    <p className={styles.setupDesc}>
                        Run the system setup to seed your database with initial categories, sample articles, and the default home page layout.
                    </p>
                </div>
                <Link href="/admin/setup" className={styles.setupBtn}>
                    <LayoutDashboard size={20} />
                    <span>Go to System Setup</span>
                </Link>
            </div>
        </div>
    );
}
