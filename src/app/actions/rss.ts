"use server";

import { fetchRSS, RSSItem } from "@/lib/services/rss";

export async function getRSSFeed(url: string, limit: number = 5): Promise<RSSItem[]> {
    return await fetchRSS(url, limit);
}
