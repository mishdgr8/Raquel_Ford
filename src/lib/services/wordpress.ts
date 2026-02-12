import { ContentBlock, Article } from "../types";

export interface WordPressPost {
    id: number;
    title: { rendered: string };
    slug: string;
    excerpt: { rendered: string };
    content: { rendered: string };
    date: string;
    status: string;
    jetpack_featured_media_url?: string;
    _embedded?: {
        "wp:featuredmedia"?: Array<{ source_url?: string }>;
    };
}

export const wordPressService = {
    /**
     * Fetches posts from a WordPress site using the REST API.
     * Uses a CORS proxy by default since browser requests to external
     * WordPress sites are typically blocked by CORS.
     */
    async fetchPosts(
        siteUrl: string,
        page: number = 1,
        perPage: number = 10,
        useProxy: boolean = true
    ): Promise<WordPressPost[]> {
        const cleanUrl = siteUrl.replace(/\/+$/, "");

        let wpApiUrl: string;
        let isWordPressCom = false;

        try {
            const urlObj = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`);
            if (urlObj.hostname.endsWith(".wordpress.com")) {
                isWordPressCom = true;
                wpApiUrl = `https://public-api.wordpress.com/wp/v2/sites/${urlObj.hostname}/posts?page=${page}&per_page=${perPage}&_embed`;
            } else {
                wpApiUrl = `${cleanUrl}/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}&_embed`;
            }
        } catch {
            // Fallback if URL parsing fails
            wpApiUrl = `${cleanUrl}/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}&_embed`;
        }

        let fetchUrl: string;
        // WordPress.com public API supports CORS, so we don't need the proxy.
        // Using proxy for it was causing 408 timeouts.
        if (useProxy && !isWordPressCom) {
            // Use our own server-side proxy
            fetchUrl = `/api/wordpress/proxy?url=${encodeURIComponent(wpApiUrl)}`;
        } else {
            fetchUrl = wpApiUrl;
        }

        let response: Response;
        try {
            response = await fetch(fetchUrl);
        } catch (networkErr: any) {
            throw new Error(
                `Network error — could not reach ${useProxy ? "the proxy" : "the WordPress site"}. ` +
                `Check your internet connection and the URL. (${networkErr.message})`
            );
        }

        if (!response.ok) {
            // Try to extract error message from proxy response
            let errorMsg = `HTTP ${response.status} from ${useProxy ? "proxy" : "WordPress"}.`;
            try {
                const errorJson = await response.json();
                if (errorJson.error) {
                    errorMsg += ` ${errorJson.error}`;
                }
            } catch {
                // Ignore parsing error for error response
            }
            throw new Error(errorMsg);
        }

        // ---------- Parse the response ----------
        let posts: unknown;

        // Both direct fetch and our proxy return standard JSON
        try {
            posts = await response.json();
        } catch {
            const text = await response.text();
            if (text.trim().startsWith("<!") || text.trim().startsWith("<html")) {
                throw new Error(
                    "The " + (useProxy ? "proxy" : "WordPress site") + " returned HTML instead of JSON. " +
                    "This usually means the REST API is disabled or the URL is wrong."
                );
            }
            throw new Error("The response is not valid JSON.");
        }

        if (!Array.isArray(posts)) {
            throw new Error(
                "The WordPress API did not return a list of posts. " +
                "Make sure the URL points to a site with published posts."
            );
        }

        return posts as WordPressPost[];
    },

    /**
     * Converts WordPress HTML content to our block-based format.
     */
    parseContent(html: string): ContentBlock[] {
        const blocks: ContentBlock[] = [];

        if (typeof window === "undefined" || !html?.trim()) {
            if (html?.trim()) {
                blocks.push({
                    id: `block-${Date.now()}`,
                    type: "text",
                    data: { html },
                });
            }
            return blocks;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const children = Array.from(doc.body.children);

        if (children.length === 0) {
            blocks.push({
                id: `block-${Date.now()}`,
                type: "text",
                data: { html },
            });
            return blocks;
        }

        children.forEach((child, index) => {
            const id = `block-${Date.now()}-${index}`;

            if (
                child.tagName === "P" ||
                child.tagName === "BLOCKQUOTE" ||
                child.tagName.startsWith("H")
            ) {
                blocks.push({ id, type: "text", data: { html: child.outerHTML || "" } });
            } else if (child.tagName === "FIGURE" && child.querySelector("img")) {
                const img = child.querySelector("img")!;
                blocks.push({
                    id,
                    type: "image",
                    data: {
                        url: img.src || "",
                        alt: img.alt || "",
                        caption: child.querySelector("figcaption")?.textContent || null,
                    },
                });
            } else if (child.tagName === "IMG") {
                const img = child as HTMLImageElement;
                blocks.push({
                    id,
                    type: "image",
                    data: { url: img.src || "", alt: img.alt || "" },
                });
            } else if (child.tagName === "FIGURE" && child.querySelector("video")) {
                const video = child.querySelector("video") as HTMLVideoElement;
                blocks.push({
                    id,
                    type: "video",
                    data: { url: video?.src || "" },
                });
            } else {
                blocks.push({ id, type: "text", data: { html: child.outerHTML || "" } });
            }
        });

        return blocks;
    },

    /**
     * Maps a WordPress post to our Article structure.
     */
    mapPostToArticle(
        post: WordPressPost,
        categoryId: string
    ): Omit<Article, "id" | "createdAt" | "updatedAt"> {
        const contentBlocks = this.parseContent(post.content.rendered);

        // Try to get featured image from _embedded or jetpack field
        const featuredImage =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            post.jetpack_featured_media_url ||
            "";

        const plainExcerpt = post.excerpt.rendered
            .replace(/<[^>]*>/g, "")
            .trim()
            .slice(0, 160);

        return {
            title: post.title.rendered.replace(/&#8217;/g, "'").replace(/&amp;/g, "&"),
            slug: post.slug,
            excerpt: plainExcerpt,
            contentJson: { blocks: contentBlocks },
            featuredImage,
            categoryId,
            status: "draft",
            publishedAt: new Date(post.date),
            seoTitle: post.title.rendered,
            seoDescription: plainExcerpt,
        };
    },
};
