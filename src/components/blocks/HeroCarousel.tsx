"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./HeroCarousel.module.css";
import Link from "next/link";
import { clsx } from "clsx";
import { Category } from "@/lib/types";
import { categoryService } from "@/lib/services/categories";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        if (categories.length === 0 || !isClient) return;

        const interval = setInterval(() => {
            setIndex((current) => (current + 1) % categories.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [categories.length, isClient]);

    const handleNext = () => setIndex((prev) => (prev + 1) % categories.length);
    const handlePrev = () => setIndex((prev) => (prev - 1 + categories.length) % categories.length);

    if (categories.length === 0) return null;

    const current = categories[index];
    const displayImage = HERO_IMAGES[current.name.toLowerCase()] || current.image;

    // Static SSR version for SEO and LCP
    const renderSlideContent = (isStatic: boolean = false) => (
        <div className={styles.slide}>
            <div className={styles.overlay} />
            {displayImage ? (
                <Image
                    src={displayImage}
                    alt={`Exploring the world of ${current.name}`}
                    fill
                    priority={isStatic || index === 0}
                    sizes="100vw"
                    quality={75}
                    className={styles.heroImage}
                    {...(isStatic ? { fetchPriority: "high" } : {})}
                />
            ) : (
                <div className={styles.imagePlaceholder} />
            )}
            <div className={clsx("container", styles.content)}>
                {isStatic ? (
                    <h1 className={styles.title}>{current.name}</h1>
                ) : (
                    <MotionH1
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                        className={styles.title}
                    >
                        {current.name}
                    </MotionH1>
                )}
                {isStatic ? (
                    <div>
                        <Link
                            href={`/category/${current.slug}`}
                            className={styles.cta}
                            aria-label={`View ${current.name} stories`}
                        >
                            VIEW STORIES
                        </Link>
                    </div>
                ) : (
                    <MotionDiv
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        <Link
                            href={`/category/${current.slug}`}
                            className={styles.cta}
                            aria-label={`View ${current.name} stories`}
                        >
                            VIEW STORIES
                        </Link>
                    </MotionDiv>
                )}
            </div>

            {/* Navigation buttons - Hidden on SSR, shown on client */}
            {!isStatic && (
                <div className={styles.navControls}>
                    <button onClick={handlePrev} className={styles.navButton} aria-label="Previous slide">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={handleNext} className={styles.navButton} aria-label="Next slide">
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
        </div>
    );

    if (!isClient) {
        return (
            <section className={styles.hero}>
                {renderSlideContent(true)}
            </section>
        );
    }

    return (
        <section className={styles.hero} aria-roledescription="carousel" aria-label="Main gallery">
            <AnimatePresenceWrapper mode="wait">
                <MotionDiv
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {renderSlideContent(false)}
                </MotionDiv>
            </AnimatePresenceWrapper>
        </section>
    );
}
