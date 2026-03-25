import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FirestoreTimestamp, ContentBlock } from "./types";

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
 * Converts any timestamp/date/string to a native Date object
 */
export function toDate(timestamp: FirestoreTimestamp | Date | string | null | undefined): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;

    const ts = timestamp as any;
    if (typeof ts.toDate === 'function') return ts.toDate();
    if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000);

    const date = new Date(timestamp as string);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a Firestore timestamp to a readable date
 */
export function formatDate(timestamp: FirestoreTimestamp | Date | string | null | undefined): string {
    const date = toDate(timestamp);
    if (!date) return "";

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

/**
 * Converts any timestamp/date to an ISO string
 */
export function toISODateString(timestamp: FirestoreTimestamp | Date | string | null | undefined): string | undefined {
    const date = toDate(timestamp);
    return date ? date.toISOString() : undefined;
}

/**
 * Estimates reading time for a block-based content
 */
export function estimateReadingTime(blocks: ContentBlock[] | null | undefined): number {
    if (!blocks) return 0;
    const words = blocks.reduce((acc, block) => {
        if (block.type === 'text') {
            const content = typeof block.data === 'string' ? block.data : (block.data as Record<string, unknown>)?.text as string;
            return acc + (content?.split(' ').length || 0);
        }
        return acc;
    }, 0);
    return Math.ceil(words / 200) || 1;
}

/**
 * Serializes Firestore data (converts Timestamps to ISO strings)
 * so it can be passed to Client Components.
 */
export function serializeFirestoreData(data: unknown): any {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(serializeFirestoreData);
    }

    if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, any>;
        // Handle Firestore Timestamp
        if (typeof obj.toDate === 'function') {
            return obj.toDate().toISOString();
        }

        // Handle simple object with seconds/nanoseconds (sometimes passed like this)
        if ('seconds' in obj && 'nanoseconds' in obj && Object.keys(obj).length <= 3) {
            return new Date(obj.seconds * 1000).toISOString();
        }

        const newData: Record<string, any> = {};
        for (const key in obj) {
            newData[key] = serializeFirestoreData(obj[key]);
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
