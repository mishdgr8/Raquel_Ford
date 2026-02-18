"use client";

import styles from "./BrandBanner.module.css";
import Image from "next/image";

interface BrandBannerProps {
    config?: {
        title?: string;
        imageUrl?: string;
    };
}

export function BrandBanner({ config }: BrandBannerProps) {
    const title = config?.title || "WE EMPOWER OUR,\nAUDIENCE TO LIVE\nTHEIR BEST LIVE";
    const imageUrl = config?.imageUrl || "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?q=80&w=2069&auto=format&fit=crop";

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <h2 className={styles.title}>
                        {title.split('\n').map((line, i) => (
                            <span key={i}>
                                {line}
                                {i < title.split('\n').length - 1 && <br />}
                            </span>
                        ))}
                    </h2>
                </div>
                <div className={styles.right}>
                    <div className={styles.imageWrapper}>
                        <Image
                            src={imageUrl}
                            alt="Vibrant youth culture"
                            fill
                            className={styles.image}
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
