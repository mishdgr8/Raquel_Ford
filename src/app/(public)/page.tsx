import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { EditorsPick } from "@/components/blocks/EditorsPick";
import { templateService } from "@/lib/services/templates";
import { categoryService } from "@/lib/services/categories";
import { articleService } from "@/lib/services/articles";
import { RSSFeedWidget } from "@/components/blocks/RSSFeedWidget";
import { serializeFirestoreData } from "@/lib/utils";
import { getInstagramFeed } from "@/app/actions/instagram";
import styles from "./HomePage.module.css";

// ISR: cache page and revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
    const [template, allCategories, editorsPicks, latestArticlesResponse, igFeeds] = await Promise.all([
        templateService.getActiveTemplate('home'),
        categoryService.getCategories(),
        articleService.getEditorsPicks().then(async (picks) => {
            if (picks.length < 4) {
                const extra = await articleService.getPublishedArticles(undefined, 8);
                const existingIds = new Set(picks.map(a => a.id));
                const newArticles = extra.articles.filter(a => !existingIds.has(a.id));
                return [...picks, ...newArticles].slice(0, 4);
            }
            return picks;
        }),
        articleService.getPublishedArticles(undefined, 8),
        getInstagramFeed(6).catch(() => []) // Pre-fetch Instagram
    ]);

    const latestArticles = latestArticlesResponse.articles;

    // Fetch sidebar articles (Explore the Mix)
    const sidebarArticles = await articleService.getExploreTheMix();

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

    const serializedLatest = serializeFirestoreData(latestArticles);
    const serializedSidebar = serializeFirestoreData(sidebarArticles);

    return (
        <>
            {mainBlocks.length > 0 && (
                <BlockRenderer
                    blocks={[mainBlocks[0]]}
                    initialCategories={initialCategories}
                    initialLatestArticles={serializedLatest}
                    initialSidebarArticles={serializedSidebar}
                    initialIGFeeds={igFeeds}
                />
            )}

            <EditorsPick initialArticles={serializeFirestoreData(editorsPicks)} />

            {mainBlocks.length > 1 && (
                <BlockRenderer
                    blocks={mainBlocks.slice(1)}
                    initialLatestArticles={serializedLatest}
                    initialSidebarArticles={serializedSidebar}
                    initialIGFeeds={igFeeds}
                />
            )}

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

            <BlockRenderer
                blocks={bannerBlocks}
                initialLatestArticles={serializedLatest}
                initialSidebarArticles={serializedSidebar}
                initialIGFeeds={igFeeds}
            />
        </>
    );
}
