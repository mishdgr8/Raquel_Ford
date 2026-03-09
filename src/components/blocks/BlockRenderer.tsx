import { BlockInstance, Category } from "@/lib/types";
import { HeroCarousel } from "./HeroCarousel";
import { LatestArticles } from "./LatestArticles";
import { NewsletterSignup } from "./NewsletterSignup";
import { PostGrid } from "./PostGrid";
import { IGReels } from "./IGReels";
import { MagazinePromo } from "./MagazinePromo";
import { BrandBanner } from "./BrandBanner";
import { SimpleBanner } from "./SimpleBanner";

interface BlockRendererProps {
    blocks: BlockInstance[];
    initialCategories?: Category[];
    initialLatestArticles?: any[];
    initialSidebarArticles?: any[];
    initialIGFeeds?: any[];
}

// RESTORED AS SERVER COMPONENT
// This ensures that all HTML for the blocks is sent immediately to the browser
// without waiting for JavaScript hydration, which significantly improves Speed Index and LCP.
export function BlockRenderer({ blocks, initialCategories, initialLatestArticles, initialSidebarArticles, initialIGFeeds }: BlockRendererProps) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <>
            {blocks.map((block) => {
                switch (block.blockType) {
                    case 'HeroCarousel':
                        return <HeroCarousel key={block.id} config={block.configJson || {}} initialCategories={initialCategories} />;
                    case 'LatestArticles':
                        return <LatestArticles key={block.id} config={block.configJson || {}} initialArticles={initialLatestArticles} initialSidebarArticles={initialSidebarArticles} />;
                    case 'NewsletterSignup':
                        return <NewsletterSignup key={block.id} config={block.configJson || {}} />;
                    case 'BrandBanner':
                        return <BrandBanner key={block.id} config={block.configJson || {}} />;
                    case 'SimpleBanner':
                        return <SimpleBanner key={block.id} config={block.configJson || {}} />;
                    case 'PostGrid':
                        return <PostGrid key={block.id} config={block.configJson || {}} />;
                    case 'IGReels':
                        return <IGReels key={block.id} config={block.configJson || {}} initialFeeds={initialIGFeeds} />;
                    case 'MagazinePromo':
                        return <MagazinePromo key={block.id} config={block.configJson || {}} />;
                    case 'EditorsPick':
                        return null; // Rendered explicitly in page.tsx
                    default:
                        return (
                            <div key={block.id} style={{ padding: '2rem', border: '1px dashed var(--border)', textAlign: 'center' }}>
                                Unsupported Block: {block.blockType}
                            </div>
                        );
                }
            })}
        </>
    );
}
