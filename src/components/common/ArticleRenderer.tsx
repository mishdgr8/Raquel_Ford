"use client";

import { ContentBlock } from "@/lib/types";
import Image from "next/image";
import { useEffect } from "react";
import styles from "./ArticleRenderer.module.css";
import { GalleryBlock } from "./GalleryBlock";

interface ArticleRendererProps {
    blocks?: ContentBlock[];
    html?: string;
}

export function ArticleRenderer({ blocks, html }: ArticleRendererProps) {
    useEffect(() => {
        // Trigger Instagram embed processing when content loads/changes
        if (typeof window !== 'undefined' && (window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
        }
    }, [blocks, html]);

    // New format: render HTML directly
    if (html) {
        return (
            <div
                className={styles.container}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }

    // Legacy format: render blocks
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className={styles.container}>
            {blocks.map((block) => {
                switch (block.type) {
                    case 'text':
                        return (
                            <div
                                key={block.id}
                                className={styles.text}
                                dangerouslySetInnerHTML={{ __html: block.data.text || block.data.html }}
                                suppressHydrationWarning
                            />
                        );
                    case 'image':
                        return (
                            <figure key={block.id} className={styles.imageWrapper}>
                                <Image
                                    src={block.data.url}
                                    alt={block.data.caption || ""}
                                    width={800}
                                    height={500}
                                    sizes="(max-width: 768px) 100vw, 700px"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                                {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
                            </figure>
                        );
                    case 'gallery':
                        if (block.data.images && block.data.images.length > 0) {
                            return (
                                <div key={block.id} style={{ margin: '2rem 0' }}>
                                    <GalleryBlock
                                        images={block.data.images}
                                        columns={block.data.columns || 3}
                                    />
                                </div>
                            );
                        }
                        return null;
                    case 'divider':
                        return <hr key={block.id} className={styles.divider} />;
                    case 'embed':
                        if (block.data.embedType === 'youtube' && block.data.embedId) {
                            return (
                                <div key={block.id} style={{
                                    position: 'relative', paddingBottom: '56.25%',
                                    height: 0, overflow: 'hidden', maxWidth: '100%',
                                    margin: '2rem 0', borderRadius: '0.5rem',
                                }}>
                                    <iframe
                                        src={`https://www.youtube-nocookie.com/embed/${block.data.embedId}`}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        title="YouTube video"
                                    />
                                </div>
                            );
                        }
                        if (block.data.embedType === 'instagram' && block.data.embedId) {
                            // Helper to extract ID if a full URL is passed
                            const getInstagramId = (idOrUrl: string) => {
                                if (idOrUrl.includes('instagram.com/p/')) {
                                    const match = idOrUrl.match(/instagram\.com\/p\/([^/?#]+)/);
                                    return match ? match[1] : idOrUrl;
                                }
                                return idOrUrl;
                            };
                            const embedId = getInstagramId(block.data.embedId);

                            return (
                                <div key={block.id} style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
                                    <blockquote
                                        className="instagram-media"
                                        data-instgrm-permalink={`https://www.instagram.com/p/${embedId}/`}
                                        data-instgrm-version="14"
                                        style={{
                                            background: '#FFF',
                                            border: '0',
                                            borderRadius: '3px',
                                            boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                                            margin: '1px',
                                            maxWidth: '540px',
                                            minWidth: '326px',
                                            padding: '0',
                                            width: 'calc(100% - 2px)'
                                        }}
                                    >
                                        <div style={{ padding: '16px' }}>
                                            <a
                                                href={`https://www.instagram.com/p/${embedId}/`}
                                                style={{
                                                    background: '#FFFFFF',
                                                    lineHeight: '0',
                                                    padding: '0 0',
                                                    textAlign: 'center',
                                                    textDecoration: 'none',
                                                    width: '100%'
                                                }}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View this post on Instagram
                                            </a>
                                        </div>
                                    </blockquote>
                                </div>
                            );
                        }
                        return null;
                    default:
                        return null;
                }
            })}
        </div>
    );
}
