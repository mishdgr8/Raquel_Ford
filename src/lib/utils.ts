import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names safely
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Generates a URL-friendly slug from a string
 */
export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
}

/**
 * Formats a Firestore timestamp to a readable date
 */
export function formatDate(timestamp: any): string {
    if (!timestamp) return "";
    const date = timestamp.toDate?.() || new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

/**
 * Estimates reading time for a block-based content
 */
export function estimateReadingTime(blocks: any[]): number {
    if (!blocks) return 0;
    const words = blocks.reduce((acc, block) => {
        if (block.type === 'paragraph' || block.type === 'heading') {
            return acc + (block.content?.split(' ').length || 0);
        }
        return acc;
    }, 0);
    return Math.ceil(words / 200) || 1;
}

/**
 * Serializes Firestore data (converts Timestamps to ISO strings)
 * so it can be passed to Client Components.
 */
export function serializeFirestoreData(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(serializeFirestoreData);
    }

    if (typeof data === 'object' && data !== null) {
        // Handle Firestore Timestamp
        if (typeof data.toDate === 'function') {
            return data.toDate().toISOString();
        }

        // Handle simple object with seconds/nanoseconds (sometimes passed like this)
        if ('seconds' in data && 'nanoseconds' in data && Object.keys(data).length <= 2) {
            return new Date(data.seconds * 1000).toISOString();
        }

        const newData: any = {};
        for (const key in data) {
            newData[key] = serializeFirestoreData(data[key]);
        }
        return newData;
    }

    return data;
}

/**
 * Generates a plain-text excerpt from HTML content
 */
export function generateExcerpt(html: string, length: number = 160): string {
    if (!html) return "";

    // Create a temporary element to strip HTML (works in browser)
    // For server-side, simple regex replace
    let text = html;
    if (typeof window !== 'undefined') {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        text = temp.textContent || temp.innerText || "";
    } else {
        // Basic fallback for server-side stripping
        text = html.replace(/<[^>]*>?/gm, '');
    }

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    if (text.length <= length) return text;

    // Truncate and add ellipsis, trying not to cut words in half
    const truncated = text.substring(0, length);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > 0) {
        return truncated.substring(0, lastSpaceIndex) + "...";
    }
    return truncated + "...";
}

/**
 * Deduplicates an array of items (like articles) based on their slug.
 * Prioritizes the first occurrence (i.e. the newest if the array is sorted newest-first).
 */
export function deduplicateArticles<T extends { slug?: string }>(items: T[]): T[] {
    const seen = new Set<string>();
    return items.filter(item => {
        if (!item.slug) return true;
        if (seen.has(item.slug)) return false;
        seen.add(item.slug);
        return true;
    });
}
