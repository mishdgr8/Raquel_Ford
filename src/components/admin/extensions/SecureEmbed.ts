"use client";

import { Node, mergeAttributes } from '@tiptap/core';

export interface SecureEmbedOptions {
    HTMLAttributes: Record<string, any>;
}

// URL parsers for supported platforms
function parseYouTubeUrl(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function parseInstagramUrl(url: string): string | null {
    const match = url.match(/instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/);
    return match ? `${match[1]}/${match[2]}` : null;
}

function parseTwitterUrl(url: string): string | null {
    const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    return match ? match[1] : null;
}

function parseTikTokUrl(url: string): string | null {
    const match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/) || url.match(/tiktok\.com\/v\/(\d+)/);
    return match ? match[1] : null;
}

function parseSpotifyUrl(url: string): string | null {
    const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
    return match ? `${match[1]}/${match[2]}` : null;
}

function detectEmbedType(url: string): { type: 'youtube' | 'instagram' | 'twitter' | 'tiktok' | 'spotify' | null; id: string | null } {
    const ytId = parseYouTubeUrl(url);
    if (ytId) return { type: 'youtube', id: ytId };

    const igId = parseInstagramUrl(url);
    if (igId) return { type: 'instagram', id: igId };

    const twId = parseTwitterUrl(url);
    if (twId) return { type: 'twitter', id: twId };

    const tkId = parseTikTokUrl(url);
    if (tkId) return { type: 'tiktok', id: tkId };

    const spId = parseSpotifyUrl(url);
    if (spId) return { type: 'spotify', id: spId };

    return { type: null, id: null };
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        secureEmbed: {
            setEmbed: (options: { url: string }) => ReturnType;
        };
    }
}

export const SecureEmbed = Node.create<SecureEmbedOptions>({
    name: 'secureEmbed',
    group: 'block',
    atom: true,
    draggable: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            embedType: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute('data-embed-type'),
                renderHTML: (attributes: Record<string, any>) => ({
                    'data-embed-type': attributes.embedType,
                }),
            },
            embedId: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute('data-embed-id'),
                renderHTML: (attributes: Record<string, any>) => ({
                    'data-embed-id': attributes.embedId,
                }),
            },
            originalUrl: {
                default: '',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-original-url') || '',
                renderHTML: (attributes: Record<string, any>) => ({
                    'data-original-url': attributes.originalUrl,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'tiptap-embed',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const { embedType, embedId, originalUrl } = node.attrs;
        let embedContent: any[] = [];

        if (embedType === 'youtube' && embedId) {
            embedContent = [
                ['iframe', {
                    src: `https://www.youtube-nocookie.com/embed/${embedId}`,
                    width: '100%',
                    height: '100%',
                    frameborder: '0',
                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                    allowfullscreen: 'true',
                    loading: 'lazy',
                    title: 'Embedded YouTube video',
                    style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;',
                }],
            ];
        } else if (embedType === 'instagram' && embedId) {
            embedContent = [
                ['iframe', {
                    src: `https://www.instagram.com/${embedId}/embed`,
                    width: '100%',
                    height: '500',
                    frameborder: '0',
                    scrolling: 'no',
                    loading: 'lazy',
                    title: 'Embedded Instagram post',
                    style: 'border: 0; max-width: 540px; margin: 0 auto; display: block;',
                }],
            ];
        } else if (embedType === 'twitter' && embedId) {
            embedContent = [
                ['div', {
                    class: 'twitter-embed-placeholder',
                    'data-tweet-id': embedId,
                    style: 'padding: 2rem; text-align: center; border: 1px solid #e2e8f0; border-radius: 8px;'
                }, 'Twitter/X Post Placeholder']
            ];
        } else if (embedType === 'tiktok' && embedId) {
            embedContent = [
                ['blockquote', {
                    class: 'tiktok-embed',
                    'data-video-id': embedId,
                    style: 'width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;'
                }, ['section', {}, ['a', { href: `https://www.tiktok.com/video/${embedId}` }, 'TikTok Video']]]
            ];
        } else if (embedType === 'spotify' && embedId) {
            embedContent = [
                ['iframe', {
                    src: `https://open.spotify.com/embed/${embedId}`,
                    width: '100%',
                    height: '152',
                    frameborder: '0',
                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
                    allowfullscreen: 'true',
                    style: 'border-radius: 12px;',
                }],
            ];
        }

        return [
            'tiptap-embed',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-type': 'secure-embed',
                'data-embed-type': embedType,
                'data-embed-id': embedId,
                'data-original-url': originalUrl,
                style: embedType === 'youtube'
                    ? 'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 2rem 0; border-radius: 0.5rem;'
                    : 'margin: 2rem 0; text-align: center;',
            }),
            ...embedContent,
        ];
    },

    // NodeView renders a live iframe preview inside the TipTap editor
    addNodeView() {
        return ({ node }) => {
            const { embedType, embedId, originalUrl } = node.attrs;

            // Outer wrapper
            const dom = document.createElement('div');
            dom.setAttribute('data-type', 'secure-embed');
            dom.style.margin = '1.5rem 0';
            dom.style.borderRadius = '8px';
            dom.style.overflow = 'hidden';
            dom.style.border = '1px solid #e2e8f0';
            dom.style.background = '#f8fafc';

            // Label bar
            const label = document.createElement('div');
            label.style.padding = '6px 12px';
            label.style.fontSize = '0.7rem';
            label.style.fontWeight = '700';
            label.style.textTransform = 'uppercase';
            label.style.letterSpacing = '0.05em';
            label.style.color = '#64748b';
            label.style.background = '#f1f5f9';
            label.style.borderBottom = '1px solid #e2e8f0';
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.gap = '6px';

            if (embedType === 'youtube') {
                label.textContent = '▶ YouTube Embed';

                const iframeWrapper = document.createElement('div');
                iframeWrapper.style.position = 'relative';
                iframeWrapper.style.paddingBottom = '56.25%';
                iframeWrapper.style.height = '0';
                iframeWrapper.style.overflow = 'hidden';

                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube-nocookie.com/embed/${embedId}`;
                iframe.style.position = 'absolute';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = '0';
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.setAttribute('loading', 'lazy');
                iframe.title = 'Embedded YouTube video';

                iframeWrapper.appendChild(iframe);
                dom.appendChild(label);
                dom.appendChild(iframeWrapper);
            } else if (embedType === 'instagram') {
                label.textContent = '📷 Instagram Embed';

                const iframe = document.createElement('iframe');
                iframe.src = `https://www.instagram.com/${embedId}/embed`;
                iframe.style.width = '100%';
                iframe.style.maxWidth = '540px';
                iframe.style.height = '600px';
                iframe.style.border = '0';
                iframe.style.display = 'block';
                iframe.style.margin = '0 auto';
                iframe.setAttribute('scrolling', 'no');
                iframe.setAttribute('loading', 'lazy');
                iframe.title = 'Embedded Instagram post';

                dom.appendChild(label);
                dom.appendChild(iframe);
            } else if (embedType === 'twitter') {
                label.textContent = '𝕏 Twitter Embed';
                const placeholder = document.createElement('div');
                placeholder.style.padding = '2rem';
                placeholder.style.textAlign = 'center';
                placeholder.style.color = '#64748b';
                placeholder.innerHTML = `<strong>Tweet ID: ${embedId}</strong><br/><span style="font-size: 0.8rem">${originalUrl}</span>`;
                dom.appendChild(label);
                dom.appendChild(placeholder);
            } else if (embedType === 'tiktok') {
                label.textContent = '🎵 TikTok Embed';
                const placeholder = document.createElement('div');
                placeholder.style.padding = '2rem';
                placeholder.style.textAlign = 'center';
                placeholder.style.color = '#64748b';
                placeholder.innerHTML = `<strong>TikTok Video: ${embedId}</strong><br/><span style="font-size: 0.8rem">${originalUrl}</span>`;
                dom.appendChild(label);
                dom.appendChild(placeholder);
            } else if (embedType === 'spotify') {
                label.textContent = '🎧 Spotify Embed';
                const iframe = document.createElement('iframe');
                iframe.src = `https://open.spotify.com/embed/${embedId}`;
                iframe.style.width = '100%';
                iframe.style.height = '152px';
                iframe.style.border = '0';
                iframe.style.borderRadius = '12px';
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
                iframe.setAttribute('loading', 'lazy');
                iframe.title = 'Embedded Spotify content';
                dom.appendChild(label);
                dom.appendChild(iframe);
            } else {
                // Fallback — unsupported embed
                label.textContent = '🔗 Embed';
                const fallback = document.createElement('div');
                fallback.style.padding = '2rem';
                fallback.style.textAlign = 'center';
                fallback.style.color = '#94a3b8';
                fallback.textContent = originalUrl || 'Unknown embed';

                dom.appendChild(label);
                dom.appendChild(fallback);
            }

            return { dom };
        };
    },

    addCommands() {
        return {
            setEmbed: (options: { url: string }) => ({ commands, chain }) => {
                const { type, id } = detectEmbedType(options.url);
                if (!type || !id) return false;

                return chain()
                    .insertContent({
                        type: this.name,
                        attrs: {
                            embedType: type,
                            embedId: id,
                            originalUrl: options.url,
                        },
                    })
                    .run();
            },
        };
    },
});

export { detectEmbedType };
