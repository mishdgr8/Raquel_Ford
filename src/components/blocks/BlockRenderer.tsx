import React from "react";
import { BlockInstance } from "@/lib/types";
import { HeroCarousel } from "./HeroCarousel";
import { LatestArticles } from "./LatestArticles";
import { NewsletterSignup } from "./NewsletterSignup";
import { PostGrid } from "./PostGrid";
import { IGReels } from "./IGReels";
import { MagazinePromo } from "./MagazinePromo";
import { EditorsPick } from "./EditorsPick";

interface BlockRendererProps {
    blocks: BlockInstance[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <>
            {blocks.map((block) => {
                switch (block.blockType) {
                    case 'HeroCarousel':
                        return <HeroCarousel key={block.id} config={block.configJson || {}} />;
                    case 'LatestArticles':
                        return <LatestArticles key={block.id} config={block.configJson || {}} />;
                    case 'NewsletterSignup':
                        return <NewsletterSignup key={block.id} config={block.configJson || {}} />;
                    case 'PostGrid':
                        return <PostGrid key={block.id} config={block.configJson || {}} />;
                    case 'IGReels':
                        return (
                            <React.Fragment key={block.id}>
                                <EditorsPick />
                                <IGReels config={block.configJson || {}} />
                            </React.Fragment>
                        );
                    case 'MagazinePromo':
                        return <MagazinePromo key={block.id} config={block.configJson || {}} />;
                    case 'EditorsPick':
                        return <EditorsPick key={block.id} />;
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
