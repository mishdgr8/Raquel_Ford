"use client";

import { useEffect, useState } from "react";
import { getRSSFeed } from "@/app/actions/rss";
import { RSSItem } from "@/lib/services/rss";
import styles from "./RSSFeedWidget.module.css";

interface RSSFeedWidgetProps {
    url: string;
    title: string;
    sourceName?: string;
    limit?: number;
}

export function RSSFeedWidget({ url, title, sourceName, limit = 5 }: RSSFeedWidgetProps) {
    const [items, setItems] = useState<RSSItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRSSFeed(url, limit)
            .then(setItems)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [url, limit]);

    if (loading) return <div className={styles.container}>Loading {title}...</div>;
    if (items.length === 0) return null;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>{title}</h3>
            <ul className={styles.list}>
                {items.map((item, index) => (
                    <li key={index} className={styles.item}>
                        {item.imageUrl && (
                            <div className={styles.imageWrapper}>
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className={styles.image}
                                />
                            </div>
                        )}
                        <div className={styles.content}>
                            {sourceName && <span className={styles.source}>{sourceName}</span>}
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                            >
                                {item.title}
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
