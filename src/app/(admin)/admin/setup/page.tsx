"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { categoryService } from "@/lib/services/categories";
import { articleService } from "@/lib/services/articles";
import { templateService } from "@/lib/services/templates";
import styles from "./SetupPage.module.css";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SetupPage() {
    const [status, setStatus] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [igToken, setIgToken] = useState("");

    const log = (msg: string) => setStatus(prev => [...prev, msg]);

    const seedData = async () => {
        setLoading(true);
        setStatus([]);
        try {
            log("🚀 Starting seeding process...");

            // 1. Categories
            log("Creating categories...");
            const cats = [
                { name: "Food", slug: "food", order: 1 },
                { name: "Fashion", slug: "fashion", order: 2 },
                { name: "Entertainment", slug: "entertainment", order: 3 },
                { name: "Awards", slug: "awards", order: 4 },
                { name: "Lifestyle", slug: "lifestyle", order: 5 },
                { name: "Travel", slug: "travel", order: 6 },
            ];

            for (const cat of cats) {
                await setDoc(doc(db, "categories", cat.slug), {
                    ...cat,
                    createdAt: serverTimestamp(),
                });
                log(`✅ Category '${cat.name}' created.`);
            }

            // 2. Sample Articles
            log("Creating sample articles...");
            const articles = [
                {
                    title: "The Future of Sustainable Fashion",
                    slug: "sustainable-fashion-future",
                    excerpt: "How modern designers are embracing eco-friendly materials and ethical manufacturing processes.",
                    categoryId: "fashion",
                    status: "published",
                    featuredImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80\u0026w=2070\u0026auto=format\u0026fit=crop",
                    contentJson: { blocks: [{ id: "1", type: "text", data: { text: "Sustainable fashion is not just a trend..." } }] },
                    publishedAt: new Date(),
                },
                {
                    title: "Gourmet Street Food: A Global Tour",
                    slug: "gourmet-street-food-tour",
                    excerpt: "From the night markets of Bangkok to the food trucks of NYC, street food is going upscale.",
                    categoryId: "food",
                    status: "published",
                    featuredImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80\u0026w=2070\u0026auto=format\u0026fit=crop",
                    contentJson: { blocks: [{ id: "1", type: "text", data: { text: "Discovering the best street food..." } }] },
                    publishedAt: new Date(Date.now() - 86400000),
                },
                {
                    title: "Oscars 2026: Predictions and Snubs",
                    slug: "oscars-2026-predictions",
                    excerpt: "Our experts weigh in on the frontrunners for next year's Academy Awards.",
                    categoryId: "awards",
                    status: "published",
                    featuredImage: "https://images.unsplash.com/photo-1524712245354-2c4e5e7144c5?q=80\u0026w=2070\u0026auto=format\u0026fit=crop",
                    contentJson: { blocks: [{ id: "1", type: "text", data: { text: "The awards season is heating up..." } }] },
                    publishedAt: new Date(Date.now() - 172800000),
                },
                {
                    title: "The Ultimate Guide to Minimalist Living",
                    slug: "minimalist-living-guide",
                    excerpt: "Declutter your mind and your home with these simple, effective lifestyle changes.",
                    categoryId: "lifestyle",
                    status: "published",
                    featuredImage: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80\u0026w=2067\u0026auto=format\u0026fit=crop",
                    contentJson: { blocks: [{ id: "1", type: "text", data: { text: "Less is more..." } }] },
                    publishedAt: new Date(Date.now() - 259200000),
                }
            ];

            for (const article of articles) {
                await setDoc(doc(db, "articles", article.slug), {
                    ...article,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                log(`✅ Article '${article.title}' created.`);
            }

            // 3. Home Template
            log("Creating home page template...");
            const homeTemplate = {
                pageType: 'home',
                name: 'Default Home Layout',
                isActive: true,
                blocks: [
                    { blockType: 'HeroCarousel', configJson: { count: 3 } },
                    { blockType: 'LatestArticles', configJson: { title: "Latest Stories", count: 5 } },
                    { blockType: 'PostGrid', configJson: { title: "Editor's Pick", count: 4, categoryId: "lifestyle" } },
                    { blockType: 'IGReels', configJson: { title: "Follow us @raquelford" } },
                    { blockType: 'MagazinePromo', configJson: { title: "The Summer Issue", description: "Download our latest digital magazine." } },
                    { blockType: 'BrandBanner', configJson: { title: "WE EMPOWER OUR,\nAUDIENCE TO LIVE\nTHEIR BEST LIVE" } }
                ]
            };

            await templateService.createTemplate(homeTemplate as any);
            log("✅ Home template created and activated.");

            log("✨ Seeding completed successfully!");
        } catch (err: any) {
            log(`❌ Error: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const saveIgToken = async () => {
        if (!igToken) {
            log("❌ Please enter a token.");
            return;
        }
        setLoading(true);
        try {
            await setDoc(doc(db, "settings", "instagram"), {
                accessToken: igToken,
                updatedAt: serverTimestamp(),
            });
            log("✅ Instagram Access Token saved to Firestore.");
        } catch (err: any) {
            log(`❌ Error saving token: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>System Setup</h1>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Content Seeding</h2>
                <p className={styles.description}>
                    This utility will seed initial content (categories, sample posts, and home layout) to help you get started.
                </p>
                <Button onClick={seedData} disabled={loading} className={styles.button}>
                    {loading ? "Seeding..." : "Seed Initial Content"}
                </Button>
            </section>

            <section className={styles.section} style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
                <h2 className={styles.sectionTitle}>Instagram Integration</h2>
                <p className={styles.description}>
                    Paste your Instagram Long-Lived Access Token here to connect the Reels section.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                        type="password"
                        value={igToken}
                        onChange={(e) => setIgToken(e.target.value)}
                        placeholder="Paste IG Access Token"
                        className={styles.input}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <Button onClick={saveIgToken} disabled={loading || !igToken}>
                        Save Token
                    </Button>
                </div>
            </section>

            <div className={styles.console}>
                {status.map((line, i) => (
                    <div key={i} className={styles.line}>{line}</div>
                ))}
            </div>
        </div>
    );
}
