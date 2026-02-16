
export interface RSSItem {
    title: string;
    link: string;
    pubDate?: string;
    imageUrl?: string;
}

export async function fetchRSS(url: string, limit: number = 5): Promise<RSSItem[]> {
    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);

        const xml = await response.text();

        // Simple regex-based parser
        const items: RSSItem[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
            const itemContent = match[1];

            const titleMatch = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/.exec(itemContent);
            const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);
            // const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemContent);

            // Try to find an image
            let imageUrl: string | undefined;
            const mediaMatch = /<media:content[^>]*url=["']([^"']+)["']/.exec(itemContent);
            const enclosureMatch = /<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/.exec(itemContent);
            const imgTagMatch = /<img[^>]+src=["']([^"']+)["']/.exec(itemContent);

            if (mediaMatch) imageUrl = mediaMatch[1];
            else if (enclosureMatch) imageUrl = enclosureMatch[1];
            else if (imgTagMatch) imageUrl = imgTagMatch[1];

            if (titleMatch && linkMatch) {
                items.push({
                    title: titleMatch[1].trim(),
                    link: linkMatch[1].trim(),
                    // pubDate: pubDateMatch ? pubDateMatch[1] : undefined
                    imageUrl
                });
            }
        }

        return items;
    } catch (error) {
        console.error("Error fetching RSS feed:", error);
        return [];
    }
}
