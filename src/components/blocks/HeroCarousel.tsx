"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./HeroCarousel.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/lib/types";
import { categoryService } from "@/lib/services/categories";

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

    useEffect(() => {
        if (initialCategories && initialCategories.length > 0) return;

        categoryService.getCategories().then((data) => {
            // Filter for specific main categories in the requested order
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
        }, 4000); // 4 seconds interval

        return () => clearInterval(interval);
    }, [categories.length]);

    if (categories.length === 0) return null;

    const next = () => setIndex((i) => (i + 1) % categories.length);
    const prev = () => setIndex((i) => (i - 1 + categories.length) % categories.length);

    const current = categories[index];
    const displayImage = HERO_IMAGES[current.name.toLowerCase()] || current.image;

    return (
        <section className={styles.hero}>
            <AnimatePresence>
                <motion.div
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
                            priority
                            unoptimized
                            sizes="100vw"
                            className={styles.heroImage}
                        />
                    ) : (
                        <div className={styles.imagePlaceholder} />
                    )}

                    <div className={clsx("container", styles.content)}>
                        <motion.h1
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                            className={styles.title}
                        >
                            {current.name}
                        </motion.h1>
                        <motion.div
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            <Link href={`/category/${current.slug}`} className={styles.cta}>
                                VIEW STORIES
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
