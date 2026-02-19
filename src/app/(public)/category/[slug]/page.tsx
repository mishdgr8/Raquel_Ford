
import { articleService } from "@/lib/services/articles";
import { Article } from "@/lib/types";
import { PostCard } from "@/components/blocks/PostCard";
import styles from "./CategoryPage.module.css";

import { Sidebar } from "@/components/layout/Sidebar";
import { categoryService } from "@/lib/services/categories";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/blocks/PostGrid";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const category = await categoryService.getCategoryBySlug(slug);
    if (!category) return { title: "Category Not Found" };
    return {
        title: `${category.name} | Raquel Ford`,
        description: category.description || `Explore ${category.name} articles on Raquel Ford.`,
        openGraph: {
            title: `${category.name} | Raquel Ford`,
            description: category.description || "",
            images: category.image ? [{ url: category.image }] : [],
        },
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = await categoryService.getCategoryBySlug(slug);

    if (!category) return notFound();

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <span className={styles.label}>Category</span>
                    <h1 className={styles.title}>{category.name}</h1>
                    <p className={styles.description}>{category.description}</p>
                </div>
            </header>

            <div className="container">
                <div className={styles.contentGrid}>
                    <PostGrid config={{ categoryId: category.id, count: 12, columns: 2 }} />
                    <Sidebar />
                </div>
            </div>
        </div>
    );
}
