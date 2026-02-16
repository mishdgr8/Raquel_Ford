"use client";

import styles from "./IGReels.module.css";

interface IGReelsProps {
    config: {
        title?: string;
        reelUrls?: string[];
    };
}

export function IGReels({ config }: IGReelsProps) {
    const reels = config.reelUrls || [];

    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.title}>{config.title || "FOLLOW THE VIBE"}</h2>
                <div className={styles.reelScroll}>
                    {reels.length > 0 ? (
                        reels.map((url, i) => (
                            <div key={i} className={styles.reelPlaceholder}>
                                <p>REEL EMBED</p>
                                <span className={styles.url}>{url}</span>
                            </div>
                        ))
                    ) : (
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={styles.reelPlaceholder}>
                                <p>INSTAGRAM REEL</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
