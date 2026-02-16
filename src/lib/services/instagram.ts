export interface InstagramMedia {
    id: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url: string;
    permalink: string;
    thumbnail_url?: string;
    caption?: string;
    timestamp: string;
}

export async function fetchInstagramMedia(limit: number = 10): Promise<InstagramMedia[]> {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
        console.warn("INSTAGRAM_ACCESS_TOKEN is not defined in environment variables.");
        return [];
    }

    try {
        const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,thumbnail_url,caption,timestamp&limit=${limit}&access_token=${accessToken}`;

        const response = await fetch(url, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Instagram API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Error fetching Instagram media:", error);
        return [];
    }
}
