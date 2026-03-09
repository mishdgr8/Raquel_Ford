"use client";

import { useEffect, useState } from "react";
import { getInstagramFeed } from "@/app/actions/instagram";
import { InstagramMedia } from "@/lib/services/instagram";
import Image from "next/image";
import styles from "./IGReels.module.css";

interface IGReelsProps {
    config: {
        title?: string;
        reelUrls?: string[];
    };
    initialFeeds?: InstagramMedia[];
}

export function IGReels({ config, initialFeeds }: IGReelsProps) {
    const [feeds, setFeeds] = useState<InstagramMedia[]>(initialFeeds || []);
    const [loading, setLoading] = useState(!initialFeeds || initialFeeds.length === 0);

    useEffect(() => {
        // If initial data is provided, don't fetch on mount
        if (initialFeeds && initialFeeds.length > 0) {
            setLoading(false);
            return;
        }

        // If manual URLs are provided in config, don't fetch from API
        if (config.reelUrls && config.reelUrls.length > 0) {
            setLoading(false);
            return;
        }

        getInstagramFeed(6)
            .then(setFeeds)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [config.reelUrls, initialFeeds]);

    const title = config.title || "FOLLOW THE VIBE";
    const manualReels = config.reelUrls || [];

    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.title}>{title}</h2>
            </div>
            <div className={styles.reelScroll}>
                {loading ? (
                    // Skeleton Loaders
                    [1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={styles.reelPlaceholder}>
                            <div className={styles.skeleton} />
                        </div>
                    ))
                ) : manualReels.length > 0 ? (
                    manualReels.map((url, i) => (
                        <div key={i} className={styles.reelPlaceholder}>
                            <div className={styles.iframeWrapper}>
                                <iframe
                                    src={`${url.split('?')[0]}embed`}
                                    className={styles.reelIframe}
                                    frameBorder="0"
                                    scrolling="no"
                                    allowTransparency={true}
                                    allow="autoplay"
                                    title={`Instagram Reel ${i + 1}`}
                                />
                            </div>
                        </div>
                    ))
                ) : feeds.length > 0 ? (
                    feeds.map((feed) => (
                        <a
                            key={feed.id}
                            href={feed.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.reelPlaceholder}
                            aria-label={`View Instagram post: ${feed.caption || 'Raquel Ford Media'}`}
                        >
                            {feed.media_type === 'VIDEO' ? (
                                <video
                                    src={feed.media_url}
                                    poster={feed.thumbnail_url}
                                    className={styles.reelVideo}
                                    muted
                                    loop
                                    onMouseOver={(e) => e.currentTarget.play()}
                                    onMouseOut={(e) => e.currentTarget.pause()}
                                />
                            ) : (
                                <Image
                                    src={feed.media_url}
                                    alt={feed.caption || "Instagram post"}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 16vw"
                                    className={styles.reelImage}
                                />
                            )}
                        </a>
                    ))
                ) : (
                    // Fallback if no config and no API success
                    [1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={styles.reelPlaceholder}>
                            {/* Empty placeholders look cleaner than text fallback */}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
