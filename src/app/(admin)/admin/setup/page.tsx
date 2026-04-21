"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { categoryService } from "@/lib/services/categories";
import { articleService } from "@/lib/services/articles";
import { templateService } from "@/lib/services/templates";
import styles from "./SetupPage.module.css";
import { supabase } from "@/lib/supabase";

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
                const { error } = await supabase
                    .from('categories')
                    .upsert({
                        ...cat,
                        created_at: new Date().toISOString(),
                    }, { onConflict: 'slug' });

                if (error) throw error;
                log(`✅ Category '${cat.name}' created.`);
            }

            // 2. Sample Articles
            log("Creating sample articles...");
            const articles = [
                {
                    title: "The Future of Sustainable Fashion",
                    slug: "sustainable-fashion-future",
                    excerpt: "How modern designers are embracing eco-friendly materials and ethical manufacturing processes.",
                    category_id: "fashion",
                    status: "published",
                    featured_image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80\u0026w=2070\u0026auto=format\u0026fit=crop",
                    content_json: { blocks: [{ id: "1", type: "text", data: { text: "Sustainable fashion is not just a trend..." } }] },
                    published_at: new Date().toISOString(),
                },
                {
                    title: "Gourmet Street Food: A Global Tour",
                    slug: "gourmet-street-food-tour",
                    excerpt: "From the night markets of Bangkok to the food trucks of NYC, street food is going upscale.",
                    category_id: "food",
                    status: "published",
                    featured_image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80\u0026w=2070\u0026auto=format\u0026fit=crop",
                    content_json: { blocks: [{ id: "1", type: "text", data: { text: "Discovering the best street food..." } }] },
                    published_at: new Date(Date.now() - 86400000).toISOString(),
                },
                {
                    title: "Oscars 2026: Predictions and Snubs",
                    slug: "oscars-2026-predictions",
                    excerpt: "Our experts weigh in on the frontrunners for next year's Academy Awards.",
                    category_id: "awards",
                    status: "published",
                    featured_image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7144c5?q=80\u0026w=2070\u0026auto=format\u0026fit=crop",
                    content_json: { blocks: [{ id: "1", type: "text", data: { text: "The awards season is heating up..." } }] },
                    published_at: new Date(Date.now() - 172800000).toISOString(),
                },
                {
                    title: "The Ultimate Guide to Minimalist Living",
                    slug: "minimalist-living-guide",
                    excerpt: "Declutter your mind and your home with these simple, effective lifestyle changes.",
                    category_id: "lifestyle",
                    status: "published",
                    featured_image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80\u0026w=2067\u0026auto=format\u0026fit=crop",
                    content_json: { blocks: [{ id: "1", type: "text", data: { text: "Less is more..." } }] },
                    published_at: new Date(Date.now() - 259200000).toISOString(),
                }
            ];

            for (const article of articles) {
                const { error } = await supabase
                    .from('articles')
                    .upsert({
                        ...article,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'slug' });

                if (error) throw error;
                log(`✅ Article '${article.title}' created.`);
            }

            // 3. Home Template
            log("Creating home page template...");
            const homeTemplate: any = {
                pageType: 'home',
                name: 'Default Home Layout',
                isActive: true,
                blocks: [
                    { blockType: 'HeroCarousel', configJson: { count: 3 } },
                    { blockType: 'LatestArticles', configJson: { title: "Latest Stories", count: 5 } },
                    { blockType: 'PostGrid', configJson: { title: "Editor's Pick", count: 4, category_id: "lifestyle" } },
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
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    id: 'instagram',
                    config: { accessToken: igToken },
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            log("✅ Instagram Access Token saved to Supabase.");
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
                    This utility will seed initial content (categories, sample posts, and home layout) to help you get started with Supabase.
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
