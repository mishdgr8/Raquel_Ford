import { Sidebar } from "@/components/layout/Sidebar";
import { PostGrid } from "@/components/blocks/PostGrid";
import type { Metadata } from "next";
import styles from "./TagPage.module.css";

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);

    return {
        title: `${decodedTag.toUpperCase()} | Raquel Ford`,
        description: `Explore articles tagged with ${decodedTag} on Raquel Ford.`,
        openGraph: {
            title: `${decodedTag.toUpperCase()} | Raquel Ford`,
            description: `Explore articles tagged with ${decodedTag} on Raquel Ford.`,
        },
    };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <span className={styles.label}>Tag</span>
                    <h1 className={styles.title}>#{decodedTag.toUpperCase()}</h1>
                </div>
            </header>

            <div className="container">
                <div className={styles.contentGrid}>
                    {/* Reusing PostGrid and passing the decoded tag name to fetch related articles */}
                    <PostGrid config={{ tag: decodedTag, count: 12, columns: 2 }} />
                    <Sidebar />
                </div>
            </div>
        </div>
    );
}
