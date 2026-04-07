import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ContentBlock } from "./types";

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
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

/**
 * Converts any timestamp/date/string to a native Date object
 */
export function toDate(timestamp: Date | string | null | undefined): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;

    const ts = timestamp as any;
    // Legacy Firestore support (just in case old data slips through)
    if (typeof ts.toDate === 'function') return ts.toDate();
    if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000);

    const date = new Date(timestamp as string);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a timestamp to a readable date
 */
export function formatDate(timestamp: Date | string | null | undefined): string {
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
export function toISODateString(timestamp: Date | string | null | undefined): string | undefined {
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
 * Serializes data for safe passing to Client Components.
 * Now that we're on Supabase (no Firestore Timestamps), this is mostly a passthrough,
 * but still handles any edge cases with Date objects.
 */
export function serializeFirestoreData(data: unknown): any {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(serializeFirestoreData);
    }

    if (data instanceof Date) {
        return data.toISOString();
    }

    if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, any>;
        // Legacy Firestore Timestamp support
        if (typeof obj.toDate === 'function') {
            return obj.toDate().toISOString();
        }
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

    let text = html;
    if (typeof window !== 'undefined') {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        text = temp.textContent || temp.innerText || "";
    } else {
        text = html.replace(/<[^>]*>?/gm, '');
    }

    text = text.replace(/\s+/g, ' ').trim();

    if (text.length <= length) return text;

    const truncated = text.substring(0, length);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > 0) {
        return truncated.substring(0, lastSpaceIndex) + "...";
    }
    return truncated + "...";
}

/**
 * Deduplicates an array of items (like articles) based on their slug.
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
