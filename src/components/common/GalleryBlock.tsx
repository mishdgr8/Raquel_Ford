"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./GalleryBlock.module.css";

interface GalleryImage {
    url: string;
    alt?: string;
    caption?: string;
}

interface GalleryBlockProps {
    images: GalleryImage[];
    columns?: number;
}

export function GalleryBlock({ images, columns = 3 }: GalleryBlockProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (lightboxIndex === null) return;
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0));
        if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0));
    }, [lightboxIndex, images.length]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [lightboxIndex]);

    if (!images || images.length === 0) return null;

    return (
        <>
            <div
                className={styles.grid}
                style={{ '--gallery-cols': columns } as React.CSSProperties}
            >
                {images.map((img, i) => (
                    <button
                        key={i}
                        className={styles.item}
                        onClick={() => setLightboxIndex(i)}
                        aria-label={`View image ${i + 1}: ${img.caption || img.alt || ''}`}
                    >
                        <Image
                            src={img.url}
                            alt={img.alt || img.caption || `Gallery image ${i + 1}`}
                            width={0}
                            height={0}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                        {/* Render caption if it exists and is not just empty space */}
                        {(img.caption || img.alt) && (img.caption || img.alt)?.trim().length! > 0 && (
                            <div className={styles.caption}>{img.caption || img.alt}</div>
                        )}
                    </button>
                ))}
            </div>

            {lightboxIndex !== null && (
                <div
                    className={styles.lightbox}
                    onClick={() => setLightboxIndex(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image lightbox"
                >
                    <button
                        className={styles.lightboxClose}
                        onClick={() => setLightboxIndex(null)}
                        aria-label="Close lightbox"
                    >
                        ×
                    </button>

                    <button
                        className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0));
                        }}
                        aria-label="Previous image"
                    >
                        ‹
                    </button>

                    <div className={styles.lightboxImageContainer} onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={images[lightboxIndex].url}
                            alt={images[lightboxIndex].alt || images[lightboxIndex].caption || ''}
                            fill
                            className={styles.lightboxImage}
                            sizes="100vw"
                            priority
                        />
                        {(images[lightboxIndex].caption || images[lightboxIndex].alt) && (images[lightboxIndex].caption || images[lightboxIndex].alt)?.trim().length! > 0 && (
                            <div className={styles.lightboxCaption}>
                                {images[lightboxIndex].caption || images[lightboxIndex].alt}
                            </div>
                        )}
                    </div>

                    <button
                        className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((lightboxIndex + 1) % images.length);
                        }}
                        aria-label="Next image"
                    >
                        ›
                    </button>

                    <div className={styles.lightboxCounter}>
                        {lightboxIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    );
}
