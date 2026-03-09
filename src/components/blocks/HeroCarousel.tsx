"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./HeroCarousel.module.css";
import Link from "next/link";
import { clsx } from "clsx";
import { Category } from "@/lib/types";
import { categoryService } from "@/lib/services/categories";

// Dynamically import framer-motion to reduce initial JS bundle
import dynamic from "next/dynamic";

const MotionDiv = dynamic(
    () => import("framer-motion").then((mod) => {
        const { motion } = mod;
        return { default: motion.div };
    }),
    { ssr: false }
);

const MotionH1 = dynamic(
    () => import("framer-motion").then((mod) => {
        const { motion } = mod;
        return { default: motion.h1 };
    }),
    { ssr: false }
);

const AnimatePresenceWrapper = dynamic(
    () => import("framer-motion").then((mod) => {
        return { default: mod.AnimatePresence };
    }),
    { ssr: false }
);

interface HeroCarouselProps {
    config: {
        manualPostIds?: string[];
        count?: number;
        autoplay?: boolean;
    };
    initialCategories?: Category[];
}

const HERO_IMAGES: Record<string, string> = {
    'beauty': '/images/hero/beauty.jpg',
    'fashion': '/images/hero/fashion.png',
    'food': '/images/hero/food.png',
    'living': '/images/hero/living.jpg',
    'entertainment': '/images/hero/entertainment.jpg',
    'events': '/images/hero/events.jpg'
};

export function HeroCarousel({ config, initialCategories }: HeroCarouselProps) {
    const [categories, setCategories] = useState<Category[]>(initialCategories || []);
    const [index, setIndex] = useState(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (initialCategories && initialCategories.length > 0) return;

        categoryService.getCategories().then((data) => {
            const targetNames = ['beauty', 'entertainment', 'events', 'fashion', 'food', 'living'];

            const main = data
                .filter(cat => targetNames.includes(cat.name.toLowerCase()))
                .sort((a, b) => {
                    const indexA = targetNames.indexOf(a.name.toLowerCase());
                    const indexB = targetNames.indexOf(b.name.toLowerCase());
                    return indexA - indexB;
                });
            setCategories(main);
        });
    }, [initialCategories]);

    // Auto-scroll logic
    useEffect(() => {
        if (categories.length === 0) return;

        const interval = setInterval(() => {
            setIndex((current) => (current + 1) % categories.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [categories.length]);

    if (categories.length === 0) return null;

    const current = categories[index];
    const displayImage = HERO_IMAGES[current.name.toLowerCase()] || current.image;

    // SSR/initial render: static hero without framer-motion
    if (!isClient) {
        return (
            <section className={styles.hero}>
                <div className={styles.slide}>
                    <div className={styles.overlay} />
                    {displayImage ? (
                        <Image
                            src={displayImage}
                            alt={current.name}
                            fill
                            priority
                            sizes="100vw"
                            quality={75}
                            className={styles.heroImage}
                        />
                    ) : (
                        <div className={styles.imagePlaceholder} />
                    )}
                    <div className={clsx("container", styles.content)}>
                        <h1 className={styles.title}>{current.name}</h1>
                        <div>
                            <Link href={`/category/${current.slug}`} className={styles.cta}>
                                VIEW STORIES
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.hero}>
            <AnimatePresenceWrapper>
                <MotionDiv
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={styles.slide}
                >
                    <div className={styles.overlay} />
                    {displayImage ? (
                        <Image
                            src={displayImage}
                            alt={current.name}
                            fill
                            priority={index === 0}
                            sizes="100vw"
                            quality={75}
                            className={styles.heroImage}
                        />
                    ) : (
                        <div className={styles.imagePlaceholder} />
                    )}

                    <div className={clsx("container", styles.content)}>
                        <MotionH1
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                            className={styles.title}
                        >
                            {current.name}
                        </MotionH1>
                        <MotionDiv
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            <Link href={`/category/${current.slug}`} className={styles.cta}>
                                VIEW STORIES
                            </Link>
                        </MotionDiv>
                    </div>
                </MotionDiv>
            </AnimatePresenceWrapper>
        </section>
    );
}
