"use server";

import { fetchInstagramMedia, InstagramMedia } from "@/lib/services/instagram";

export async function getInstagramFeed(limit: number = 10): Promise<InstagramMedia[]> {
    return fetchInstagramMedia(limit);
}
