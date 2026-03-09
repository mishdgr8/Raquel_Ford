import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

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
    let accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken || accessToken === 'your_token_here') {
        try {
            const settingsDoc = await getDoc(doc(db, "settings", "instagram"));
            if (settingsDoc.exists()) {
                accessToken = settingsDoc.data().accessToken;
            }
        } catch (error) {
            console.error("Error fetching Instagram token from Firestore:", error);
        }
    }

    if (!accessToken || accessToken === 'your_token_here') {
        console.warn("INSTAGRAM_ACCESS_TOKEN is not defined in environment variables or Firestore.");
        return [];
    }

    try {
        const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,thumbnail_url,caption,timestamp&limit=${limit}&access_token=${accessToken}`;

        const response = await fetch(url, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = response.statusText;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
                // Not JSON, fallback to text
                errorMessage = `${errorMessage} (Non-JSON response)`;
            }
            throw new Error(`Instagram API error: ${errorMessage}`);
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Error fetching Instagram media:", error);
        return [];
    }
}
