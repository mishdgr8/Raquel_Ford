"use client";

import { ContentBlock } from "@/lib/types";
import Image from "next/image";
import { useEffect } from "react";
import styles from "./ArticleRenderer.module.css";
import { GalleryBlock } from "./GalleryBlock";
import { Tweet } from "react-tweet";

interface ArticleRendererProps {
    blocks?: ContentBlock[];
    html?: string;
}

export function ArticleRenderer({ blocks, html }: ArticleRendererProps) {
    useEffect(() => {
        // Trigger Instagram embed processing when content loads/changes
        if (typeof window !== 'undefined') {
            if ((window as any).instgrm) (window as any).instgrm.Embeds.process();
        }

        // Handle native embeds for non-Twitter content (Instagram, TikTok, Spotify)
        if (html) {
            const container = document.querySelector(`.${styles.container}`);
            if (container) {
                const paragraphs = container.querySelectorAll('p');
                let replacedTokens = { ig: false, tk: false, sp: false };

                paragraphs.forEach(p => {
                    const text = p.textContent?.trim();
                    if (!text) return;

                    // Instagram
                    if (text.startsWith('https://www.instagram.com/p/') || text.startsWith('https://instagram.com/p/')) {
                        const match = text.match(/instagram\.com\/p\/([^/?#]+)/);
                        if (match && match[1]) {
                            const embedId = match[1];
                            const quote = document.createElement('blockquote');
                            quote.className = 'instagram-media';
                            quote.setAttribute('data-instgrm-permalink', `https://www.instagram.com/p/${embedId}/`);
                            quote.setAttribute('data-instgrm-version', '14');
                            quote.style.background = '#FFF';
                            quote.style.border = '0';
                            quote.style.borderRadius = '3px';
                            quote.style.boxShadow = '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)';
                            quote.style.margin = '1px';
                            quote.style.maxWidth = '540px';
                            quote.style.minWidth = '326px';
                            quote.style.padding = '0';
                            quote.style.width = 'calc(100% - 2px)';

                            p.replaceWith(quote);
                            replacedTokens.ig = true;
                        }
                    }
                    // TikTok
                    else if (text.startsWith('https://www.tiktok.com/') || text.startsWith('https://tiktok.com/')) {
                        const match = text.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
                        if (match && match[1]) {
                            const quote = document.createElement('blockquote');
                            quote.className = 'tiktok-embed';
                            quote.setAttribute('cite', text);
                            quote.setAttribute('data-video-id', match[1]);
                            quote.style.maxWidth = '605px';
                            quote.style.minWidth = '325px';

                            const section = document.createElement('section');
                            const a = document.createElement('a');
                            a.target = '_blank';
                            a.title = 'TikTok';
                            a.href = text;
                            a.textContent = '@TikTok';

                            section.appendChild(a);
                            quote.appendChild(section);

                            p.replaceWith(quote);
                            replacedTokens.tk = true;
                        }
                    }
                    // Spotify
                    else if (text.startsWith('https://open.spotify.com/')) {
                        const match = text.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
                        if (match && match[1] && match[2]) {
                            const iframe = document.createElement('iframe');
                            iframe.src = `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
                            iframe.width = '100%';
                            iframe.height = '152';
                            iframe.frameBorder = '0';
                            iframe.allowFullscreen = true;
                            iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
                            iframe.loading = 'lazy';
                            iframe.style.borderRadius = '12px';

                            p.replaceWith(iframe);
                            replacedTokens.sp = true;
                        }
                    }
                });

                if (replacedTokens.ig && (window as any).instgrm) {
                    (window as any).instgrm.Embeds.process();
                }
            }
        }
    }, [blocks, html]);

    // Helper to render Instagram embed
    const renderInstagramEmbed = (urlOrId: string) => {
        let embedId = urlOrId;
        if (urlOrId.includes('instagram.com/p/')) {
            const match = urlOrId.match(/instagram\.com\/p\/([^/?#]+)/);
            embedId = match ? match[1] : urlOrId;
        }

        return (
            <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
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
    };

    // Render HTML directly, splitting out Twitter embeds
    if (html) {
        // Regex to find paragraphs that contain ONLY a twitter/x URL OR a WordPress-style twitter blockquote
        const twitterRegex = /<blockquote[^>]*class=["'][^"']*twitter-tweet[^"']*["'][^>]*>[\s\S]*?href=["']https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)[^"']*["'][\s\S]*?<\/blockquote>|<p>\s*(?:<a[^>]*href=["'])?https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)[^<"']*(?:["'][^>]*>.*?<\/a>)?\s*<\/p>/gi;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = twitterRegex.exec(html)) !== null) {
            // Push the HTML before the tweet
            if (match.index > lastIndex) {
                parts.push(
                    <div
                        key={`html-${lastIndex}`}
                        className={styles.container}
                        dangerouslySetInnerHTML={{ __html: html.substring(lastIndex, match.index) }}
                    />
                );
            }
            // Push the tweet component
            const tweetId = match[1] || match[2];
            if (tweetId) {
                parts.push(
                    <div key={`tweet-${tweetId}`} style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0', width: '100%' }}>
                        <div className="light" style={{ width: '100%', maxWidth: '550px' }}>
                            <Tweet id={tweetId} />
                        </div>
                    </div>
                );
            }
            lastIndex = twitterRegex.lastIndex;
        }

        // Push remaining HTML
        if (lastIndex < html.length) {
            parts.push(
                <div
                    key={`html-${lastIndex}`}
                    className={styles.container}
                    dangerouslySetInnerHTML={{ __html: html.substring(lastIndex) }}
                />
            );
        }

        return <>{parts}</>;
    }

    // Legacy format: render blocks
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className={styles.container}>
            {blocks.map((block) => {
                switch (block.type) {
                    case 'text':
                        const textContent = block.data.text || block.data.html || '';
                        const cleanText = textContent.replace(/<[^>]*>/g, '').trim();
                        if (cleanText.startsWith('https://www.instagram.com/p/') || cleanText.startsWith('https://instagram.com/p/')) {
                            return (
                                <div key={block.id}>
                                    {renderInstagramEmbed(cleanText)}
                                </div>
                            );
                        }

                        return (
                            <div
                                key={block.id}
                                className={styles.text}
                                dangerouslySetInnerHTML={{ __html: textContent }}
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
                            return (
                                <div key={block.id}>
                                    {renderInstagramEmbed(block.data.embedId)}
                                </div>
                            );
                        }
                        if (block.data.embedType === 'spotify' && block.data.embedId) {
                            return (
                                <div key={block.id} style={{ margin: '2rem 0' }}>
                                    <iframe
                                        src={`https://open.spotify.com/embed/${block.data.embedId}`}
                                        width="100%"
                                        height="152"
                                        frameBorder="0"
                                        allowFullScreen
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                        style={{ borderRadius: '12px' }}
                                    />
                                </div>
                            );
                        }
                        if (block.data.embedType === 'twitter' && block.data.embedId) {
                            return (
                                <div key={block.id} style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0', width: '100%' }}>
                                    <div className="light" style={{ width: '100%', maxWidth: '550px' }}>
                                        <Tweet id={block.data.embedId} />
                                    </div>
                                </div>
                            );
                        }
                        if (block.data.embedType === 'tiktok') {
                            return (
                                <div key={block.id} style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                                    <blockquote className="tiktok-embed" cite={block.data.originalUrl} data-video-id={block.data.embedId} style={{ maxWidth: '605px', minWidth: '325px' }}>
                                        <section><a target="_blank" title="TikTok" href={block.data.originalUrl}>@TikTok</a></section>
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
