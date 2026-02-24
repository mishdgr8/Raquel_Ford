import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { EditorsPick } from "@/components/blocks/EditorsPick";
import { LatestArticles } from "@/components/blocks/LatestArticles";
import { templateService } from "@/lib/services/templates";
import { categoryService } from "@/lib/services/categories";
import { RSSFeedWidget } from "@/components/blocks/RSSFeedWidget";
import styles from "./HomePage.module.css";

// ISR: cache page and revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
    const [template, allCategories] = await Promise.all([
        templateService.getActiveTemplate('home'),
        categoryService.getCategories()
    ]);

    // Filter for specific main categories for the hero slider
    const targetNames = ['beauty', 'entertainment', 'events', 'fashion', 'food', 'living'];
    const initialCategories = allCategories
        .filter(cat => targetNames.includes(cat.name.toLowerCase()))
        .sort((a, b) => {
            const indexA = targetNames.indexOf(a.name.toLowerCase());
            const indexB = targetNames.indexOf(b.name.toLowerCase());
            return indexA - indexB;
        })
        .map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || undefined,
            image: cat.image || undefined,
            order: cat.order,
            isMain: cat.isMain || false
        }));

    if (!template || !template.blocks || template.blocks.length === 0) {
        return (
            <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', marginBottom: '1.5rem' }}>
                    Welcome to Raquel Ford
                </h1>
                <p style={{ color: 'var(--muted-foreground)', maxWidth: '600px', margin: '0 auto' }}>
                    We're currently setting up our digital magazine. Please check back soon or log in to the admin panel to configure the home page layout.
                </p>
            </div>
        );
    }

    const firstBannerIndex = template.blocks.findIndex(
        b => b.blockType === 'BrandBanner' || b.blockType === 'SimpleBanner'
    );

    let mainBlocks = template.blocks;
    let bannerBlocks: typeof template.blocks = [];

    if (firstBannerIndex !== -1) {
        mainBlocks = template.blocks.slice(0, firstBannerIndex);
        bannerBlocks = template.blocks.slice(firstBannerIndex);
    }

    return (
        <>
            {mainBlocks.length > 0 && (
                <BlockRenderer
                    blocks={[mainBlocks[0]]}
                    initialCategories={initialCategories}
                />
            )}

            {/* Guarantee Editors Pick always renders on homepage below Hero */}
            <EditorsPick />

            {mainBlocks.length > 1 && <BlockRenderer blocks={mainBlocks.slice(1)} />}

            {/* Mobile-only RSS Feeds matching Sidebar content */}
            <div className={styles.mobileRSS}>
                <div className={styles.rssSection}>
                    <RSSFeedWidget
                        title="Trending in Fashion"
                        url="https://www.vogue.com/feed/rss"
                        sourceName="Vogue"
                        limit={3}
                    />
                </div>
                <div className={styles.rssSection}>
                    <RSSFeedWidget
                        title="World News"
                        url="http://rss.cnn.com/rss/cnn_topstories.rss"
                        sourceName="CNN"
                        limit={3}
                    />
                </div>
            </div>

            <BlockRenderer blocks={bannerBlocks} />
        </>
    );
}
