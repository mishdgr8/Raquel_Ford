"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./MagazinePromo.module.css";
import { Button } from "../ui/Button";

interface MagazinePromoProps {
    config: {
        title?: string;
        description?: string;
        downloadUrl?: string;
        coverImage?: string;
        previewImages?: string[];
    };
}

export function MagazinePromo({ config }: MagazinePromoProps) {
    const [activeImage, setActiveImage] = useState<string | null>(config.coverImage || null);

    // Update active image if the config prop changes (e.g., in admin)
    useEffect(() => {
        if (config.coverImage) {
            setActiveImage(config.coverImage);
        }
    }, [config.coverImage]);

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.card}>
                    <div className={styles.content}>
                        <span className={styles.tag}>NEW RELEASE</span>
                        <h2 className={styles.title}>{config.title || "THE RAQUEL FORD MAGAZINE"}</h2>
                        <p className={styles.description}>
                            {config.description || "Download our latest digital issue featuring exclusive interviews, fashion trends, and culinary secrets."}
                        </p>
                        {config.downloadUrl ? (
                            <a href={config.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Button className={styles.button}>DOWNLOAD NOW</Button>
                            </a>
                        ) : (
                            <Button className={styles.button}>DOWNLOAD NOW</Button>
                        )}
                    </div>
                    <div className={styles.visual}>
                        <div
                            className={`${styles.mainCover} ${activeImage !== config.coverImage ? styles.canReset : ""}`}
                            onClick={() => {
                                if (activeImage !== config.coverImage) {
                                    setActiveImage(config.coverImage || null);
                                }
                            }}
                            title={activeImage !== config.coverImage ? "Return to main cover" : ""}
                        >
                            {activeImage ? (
                                <Image
                                    src={activeImage}
                                    alt={config.title || "Magazine cover"}
                                    fill
                                    className={styles.coverImage}
                                    priority
                                />
                            ) : (
                                <div className={styles.magazinePlaceholder}>
                                    <span>COVER</span>
                                </div>
                            )}

                            {activeImage !== config.coverImage && (
                                <div className={styles.resetOverlay}>
                                    <span>RETURN TO COVER</span>
                                </div>
                            )}
                        </div>

                        {(config.previewImages && config.previewImages.length > 0) && (
                            <div className={styles.previewStack}>
                                {config.previewImages.slice(0, 3).map((img: string, i: number) => (
                                    <div
                                        key={i}
                                        className={`${styles.previewItem} ${activeImage === img ? styles.activePreview : ""}`}
                                        onClick={() => {
                                            // Toggle: If clicking the already active preview, reset to main cover
                                            setActiveImage(activeImage === img ? config.coverImage || null : img);
                                        }}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Preview ${i + 1}`}
                                            fill
                                            className={styles.previewImage}
                                        />
                                    </div>
                                ))}
                                {/* Fill slots if less than 3 */}
                                {config.previewImages.length < 3 && Array.from({ length: 3 - config.previewImages.length }).map((_, i) => (
                                    <div key={`empty-${i}`} className={styles.previewPlaceholder}>
                                        <span>PREVIEW</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
