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

declare global {
    interface Window {
        instgrm?: {
            Embeds: {
                process: () => void;
            };
        };
    }
}

export function ArticleRenderer({ blocks, html }: ArticleRendererProps) {
    useEffect(() => {
        // Trigger Instagram embed processing when content loads/changes
        if (typeof window !== 'undefined') {
            if (window.instgrm) window.instgrm.Embeds.process();
        }

        // Handle native embeds for non-Twitter content (Instagram, TikTok, Spotify)
        if (html) {
            const container = document.querySelector(`.${styles.container}`);
            if (container) {
                const paragraphs = container.querySelectorAll('p');
                const replacedTokens = { ig: false, tk: false, sp: false };

                paragraphs.forEach(p => {
                    const text = p.textContent?.trim();
                    if (!text) return;

                    // Instagram (posts and reels)
                    if (text.match(/instagram\.com\/(p|reel)\//)) {
                        const match = text.match(/instagram\.com\/(p|reel)\/([^/?#]+)/);
                        if (match && match[1] && match[2]) {
                            const pathType = match[1]; // 'p' or 'reel'
                            const embedId = match[2];
                            const quote = document.createElement('blockquote');
                            quote.className = 'instagram-media';
                            quote.setAttribute('data-instgrm-permalink', `https://www.instagram.com/${pathType}/${embedId}/`);
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

    // Helper to render Instagram embed — handles both posts (/p/) and reels (/reel/)
    const renderInstagramEmbed = (urlOrId: string) => {
        // The embedId may be in format "reel/CODE" or "p/CODE" (from new storage),
        // or a full URL, or just a shortcode (legacy)
        let embedPath = urlOrId; // default: use as-is

        if (urlOrId.includes('instagram.com/')) {
            const match = urlOrId.match(/instagram\.com\/(p|reel)\/([^/?#]+)/);
            if (match) {
                embedPath = `${match[1]}/${match[2]}`;
            }
        } else if (!urlOrId.includes('/')) {
            // Legacy: plain shortcode without path type — default to /p/
            embedPath = `p/${urlOrId}`;
        }
        // else: already in "reel/CODE" or "p/CODE" format

        return (
            <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
                <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={`https://www.instagram.com/${embedPath}/`}
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
                            href={`https://www.instagram.com/${embedPath}/`}
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

    // Render HTML directly if it exists and is not just an empty paragraph, splitting out Twitter and Gallery embeds
    const isHtmlMeaningful = html && html.trim() !== '' && html.trim() !== '<p></p>';
    if (isHtmlMeaningful) {
        // Helper to extract attributes from a tag string accurately
        const getAttr = (tagStr: string, attrName: string) => {
            // Match the attribute name, then either " or ' as the delimiter, then capturing until the same delimiter
            const regex = new RegExp(`${attrName}=(['"])([\\s\\S]*?)\\1`, 'i');
            const match = tagStr.match(regex);
            return match ? match[2] : null;
        };

        // Helper to decode HTML entities
        const decodeHtmlEntities = (text: string) => {
            if (!text) return '';
            // Simple replace for common ones, plus a more robust way if window is available
            const basicDecoded = text
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');

            if (typeof window === 'undefined') return basicDecoded;

            try {
                const doc = new DOMParser().parseFromString(text, 'text/html');
                return doc.documentElement.textContent || basicDecoded;
            } catch (e) {
                return basicDecoded;
            }
        };

        // Regexes for our custom components - improved to handle self-closing tags
        const twitterRegex = /<blockquote[^>]*class=["'][^"']*twitter-tweet[^"']*["'][^>]*>[\s\S]*?href=["']https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)[^"']*["'][\s\S]*?<\/blockquote>|<p>\s*(?:<a[^>]*href=["'])?https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)[^<"']*(?:["'][^>]*>.*?<\/a>)?\s*<\/p>/gi;
        const galleryRegex = /<tiptap-gallery[^>]*?(?:\/>|>[\s\S]*?<\/tiptap-gallery>)/gi;
        const embedRegex = /<tiptap-embed[^>]*?(?:\/>|>[\s\S]*?<\/tiptap-embed>)/gi;

        // Splitting strategy: Find all occurrences and sort them by index
        const matches: { index: number; length: number; content: React.ReactNode; type: string }[] = [];

        // 1. Find Twitter embeds
        let m;
        while ((m = twitterRegex.exec(html)) !== null) {
            const tweetId = m[1] || m[2];
            if (tweetId) {
                matches.push({
                    index: m.index,
                    length: m[0].length,
                    type: 'twitter',
                    content: (
                        <div key={`tweet-${m.index}`} style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0', width: '100%' }}>
                            <div className="light" style={{ width: '100%', maxWidth: '550px' }}>
                                <Tweet id={tweetId} />
                            </div>
                        </div>
                    )
                });
            }
        }

        // 2. Find Galleries
        galleryRegex.lastIndex = 0; // Reset
        while ((m = galleryRegex.exec(html)) !== null) {
            const tagStr = m[0];
            const imagesAttr = getAttr(tagStr, 'data-images');
            const columnsAttr = getAttr(tagStr, 'data-columns');

            if (imagesAttr) {
                try {
                    const decodedImagesString = decodeHtmlEntities(imagesAttr);
                    const images = JSON.parse(decodedImagesString);
                    const columns = columnsAttr ? parseInt(columnsAttr, 10) : 3;

                    matches.push({
                        index: m.index,
                        length: m[0].length,
                        type: 'gallery',
                        content: (
                            <div key={`gallery-${m.index}`} style={{ margin: '2rem 0', width: '100%' }}>
                                <GalleryBlock images={images} columns={columns} />
                            </div>
                        )
                    });
                } catch (e) {
                    console.error("ArticleRenderer: Failed to parse gallery images", e, { imagesAttr });
                }
            }
        }

        // 3. Find Secure Embeds
        embedRegex.lastIndex = 0; // Reset
        while ((m = embedRegex.exec(html)) !== null) {
            const tagStr = m[0];
            const embedType = getAttr(tagStr, 'data-embed-type');
            const embedId = getAttr(tagStr, 'data-embed-id');

            if (embedType && embedId) {
                matches.push({
                    index: m.index,
                    length: m[0].length,
                    type: 'embed',
                    content: (
                        <div key={`embed-${m.index}`} style={{ margin: '2rem 0', width: '100%' }}>
                            {embedType === 'youtube' ? (
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.5rem' }}>
                                    <iframe
                                        src={`https://www.youtube-nocookie.com/embed/${embedId}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    />
                                </div>
                            ) : embedType === 'twitter' ? (
                                <div className="light" style={{ width: '100%', maxWidth: '550px', margin: '0 auto' }}>
                                    <Tweet id={embedId} />
                                </div>
                            ) : embedType === 'tiktok' ? (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <blockquote className="tiktok-embed" data-video-id={embedId} style={{ maxWidth: '605px', minWidth: '325px' }}>
                                        <section><a target="_blank" title="TikTok" href={`https://www.tiktok.com/video/${embedId}`}>@TikTok</a></section>
                                    </blockquote>
                                </div>
                            ) : embedType === 'spotify' ? (
                                <div style={{ width: '100%', maxWidth: '100%' }}>
                                    <iframe
                                        src={`https://open.spotify.com/embed/${embedId}`}
                                        width="100%"
                                        height="152"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        allowFullScreen
                                        style={{ borderRadius: '12px' }}
                                    />
                                </div>
                            ) : embedType === 'instagram' ? (
                                renderInstagramEmbed(embedId)
                            ) : (
                                <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '0.5rem', textAlign: 'center', color: '#666' }}>
                                    External content from {embedType} is showing here.
                                </div>
                            )}
                        </div>
                    )
                });
            }
        }

        // Sort matches by index
        matches.sort((a, b) => a.index - b.index);

        const parts = [];
        let lastIndex = 0;

        for (const match of matches) {
            // Check if this match overlaps with previous one (rare but possible with overlapping regexes)
            if (match.index < lastIndex) continue;

            // Push the HTML before the match
            if (match.index > lastIndex) {
                parts.push(
                    <div
                        key={`html-${lastIndex}`}
                        className={styles.container}
                        dangerouslySetInnerHTML={{ __html: html.substring(lastIndex, match.index) }}
                    />
                );
            }

            // Push the React component
            parts.push(match.content);
            lastIndex = match.index + match.length;
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
                        if (cleanText.match(/instagram\.com\/(p|reel)\//)) {
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
