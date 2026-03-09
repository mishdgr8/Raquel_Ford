"use client";

import dynamic from 'next/dynamic';
import { BlockInstance, Category } from "@/lib/types";
import { HeroCarousel } from "./HeroCarousel";

// Dynamically import all below-the-fold components to reduce initial JS payload
// Using ssr: true (default) is better for SEO and allowed in Client Components
const LatestArticles = dynamic(() => import("./LatestArticles").then(mod => mod.LatestArticles), { ssr: true });
const NewsletterSignup = dynamic(() => import("./NewsletterSignup").then(mod => mod.NewsletterSignup), { ssr: true });
const PostGrid = dynamic(() => import("./PostGrid").then(mod => mod.PostGrid), { ssr: true });
const IGReels = dynamic(() => import("./IGReels").then(mod => mod.IGReels), { ssr: true });
const MagazinePromo = dynamic(() => import("./MagazinePromo").then(mod => mod.MagazinePromo), { ssr: true });
const BrandBanner = dynamic(() => import("./BrandBanner").then(mod => mod.BrandBanner), { ssr: true });
const SimpleBanner = dynamic(() => import("./SimpleBanner").then(mod => mod.SimpleBanner), { ssr: true });

interface BlockRendererProps {
    blocks: BlockInstance[];
    initialCategories?: Category[];
    initialLatestArticles?: any[];
    initialSidebarArticles?: any[];
    initialIGFeeds?: any[];
}

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
                        return null; // Now rendered explicitly in page.tsx to guarantee visibility
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
